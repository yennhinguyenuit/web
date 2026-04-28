import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { checkoutAPI, orderAPI } from '../services/api';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const items = cart?.items || [];
  const getCartItemKey = (item) =>
    `${item.productId}:${item.color || ''}:${item.size || ''}`;

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    ward: '',
    district: '',
    city: '',
    shipping: 'standard',
    payment: 'cod'
  });

  const [loading, setLoading] = useState(false);

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);

  const SUPPORTED_PAYMENT_CODES = new Set(['cod', 'payos', 'bank_transfer']);

  // COUPON
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  useEffect(() => {
    let ignore = false;

    const loadPaymentMethods = async () => {
      setLoadingPaymentMethods(true);
      try {
        const res = await checkoutAPI.getPaymentMethods();
        const methods = Array.isArray(res?.data) ? res.data : [];
        const enabledAndSupported = methods.filter((m) => (
          m?.isEnabled &&
          SUPPORTED_PAYMENT_CODES.has(m.code) &&
          // if provider needs env config (PayOS / bank transfer), only show when configured
          (m.isOnline ? Boolean(m.isConfigured) : true)
        ));

        if (ignore) return;
        setPaymentMethods(enabledAndSupported);

        if (
          !enabledAndSupported.some((m) => m.code === form.payment) &&
          enabledAndSupported.length > 0
        ) {
          setForm((prev) => ({ ...prev, payment: enabledAndSupported[0].code }));
        }
      } catch (err) {
        console.error(err);
        if (!ignore) setPaymentMethods([]);
      } finally {
        if (!ignore) setLoadingPaymentMethods(false);
      }
    };

    loadPaymentMethods();

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const subtotal = items.reduce((t, i) => t + i.price * i.quantity, 0);
  const shippingFee = form.shipping === 'express' ? 50000 : 0;
  const total = subtotal + shippingFee - discount;

  // APPLY COUPON
  const applyCoupon = async () => {
    if (!coupon) return;

    setLoadingCoupon(true);
    try {
      const res = await checkoutAPI.validateCoupon(coupon, subtotal);
      const value = res?.data?.discount ?? 0;
      setDiscount(value);
      setCouponMsg(`✔ Giảm ${Number(value).toLocaleString()}đ`);
    } catch {
      setDiscount(0);
      setCouponMsg('Lỗi server');
    } finally {
      setLoadingCoupon(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.phone || !form.address) {
      alert('Nhập đầy đủ thông tin!');
      return;
    }

    if (items.length === 0) {
      alert('Giỏ hàng trống!');
      return;
    }

    setLoading(true);

    try {
      const result = await orderAPI.createOrder({
        shippingAddress: {
          name: `${form.firstName} ${form.lastName}`,
          phone: form.phone,
          address: form.address,
          ward: form.ward,
          district: form.district,
          city: form.city
        },
        shippingMethodCode: form.shipping,
        paymentMethodCode: form.payment,
        couponCode: coupon || null,
        items: items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          color: i.color || null,
          size: i.size || null
        }))
      });

      const orderId = result?.data?.id;
      const orderCode = result?.data?.code;

      clearCart();
      // If user chose online payment, send them to order details (where payment UX can live).
      // Otherwise show the generic success screen.
      if (form.payment === 'payos' && orderId) {
        navigate(`/orders/${orderId}`);
        return;
      }

      navigate('/order-success', {
        state: {
          orderId,
          orderCode
        }
      });

    } catch (err) {
      console.error(err);
      alert(err?.message || 'Lỗi server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-6 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">

          {/* CONTACT */}
          <Section title="Thông tin liên hệ" step={1}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input name="firstName" placeholder="Họ" onChange={handleChange}/>
              <Input name="lastName" placeholder="Tên" onChange={handleChange}/>
              <Input name="email" placeholder="Email" onChange={handleChange}/>
              <Input name="phone" placeholder="SĐT" onChange={handleChange}/>
            </div>
          </Section>

          {/* ADDRESS */}
          <Section title="Địa chỉ giao hàng" step={2}>
            <Input name="address" placeholder="Địa chỉ" onChange={handleChange}/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Input name="ward" placeholder="Phường/Xã" onChange={handleChange}/>
              <Input name="district" placeholder="Quận/Huyện" onChange={handleChange}/>
            </div>
            <Input name="city" placeholder="Tỉnh/TP" onChange={handleChange} className="mt-4"/>
          </Section>

          {/* SHIPPING */}
          <Section title="Phương thức vận chuyển" step={3}>
            <Option
              label="Giao hàng tiêu chuẩn"
              price="Miễn phí"
              checked={form.shipping === 'standard'}
              onChange={() => setForm({ ...form, shipping: 'standard' })}
            />
            <Option
              label="Giao hàng nhanh"
              price="50.000đ"
              checked={form.shipping === 'express'}
              onChange={() => setForm({ ...form, shipping: 'express' })}
            />
          </Section>

          {/* PAYMENT */}
          <Section title="Phương thức thanh toán" step={4}>
            {loadingPaymentMethods ? (
              <p className="text-sm text-gray-500">Đang tải phương thức thanh toán...</p>
            ) : paymentMethods.length === 0 ? (
              <p className="text-sm text-red-600">
                Không có phương thức thanh toán khả dụng. Vui lòng thử lại sau.
              </p>
            ) : (
              paymentMethods.map((method) => (
                <Option
                  key={method.id || method.code}
                  label={method.name}
                  checked={form.payment === method.code}
                  onChange={() => setForm({ ...form, payment: method.code })}
                />
              ))
            )}
          </Section>

        </div>

        {/* RIGHT */}
        <div className="lg:col-span-1">
          <div className="bg-white p-5 rounded shadow lg:sticky lg:top-6">

            <h2 className="font-bold text-lg mb-4 text-red-600">Đơn hàng</h2>

            {items.map(i => (
              <div key={getCartItemKey(i)} className="flex gap-3 mb-3">
                <img
                  src={i.image || i.thumbnail || 'https://via.placeholder.com/100'}
                  alt={i.name}
                  className="w-14 h-14 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="text-sm">{i.name}</p>
                  {(i.color || i.size) && (
                    <p className="text-xs text-gray-500">
                      {[i.color && `Màu: ${i.color}`, i.size && `Size: ${i.size}`]
                        .filter(Boolean)
                        .join(' / ')}
                    </p>
                  )}
                  <p className="text-xs">SL: {i.quantity}</p>
                </div>
                <p className="text-sm">{(i.price * i.quantity).toLocaleString()}đ</p>
              </div>
            ))}

            {/* COUPON */}
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <input
                value={coupon}
                onChange={(e)=>setCoupon(e.target.value)}
                placeholder="Nhập mã giảm giá"
                className="border px-3 py-2 flex-1 rounded"
              />
              <button
                onClick={applyCoupon}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                {loadingCoupon ? '...' : 'Áp dụng'}
              </button>
            </div>

            {couponMsg && (
              <p className={`text-sm mb-2 ${
                discount > 0 ? "text-green-600" : "text-red-500"
              }`}>
                {couponMsg}
              </p>
            )}

            <Row label="Tạm tính" value={subtotal}/>
            <Row label="Ship" value={shippingFee}/>
            <Row label="Giảm" value={`- ${discount}`}/>

            <div className="flex justify-between font-bold mt-2">
              <span>Tổng</span>
              <span className="text-red-600">{total.toLocaleString()}đ</span>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-red-600 text-white py-3 mt-4 rounded"
            >
              {loading ? 'Đang xử lý...' : 'Đặt hàng'}
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}

// COMPONENT
function Section({ title, step, children }) {
  return (
    <div className="bg-white p-5 rounded shadow">
      <div className="flex gap-2 mb-3">
        <div className="bg-red-600 text-white w-7 h-7 flex items-center justify-center rounded-full">
          {step}
        </div>
        <h2 className="font-medium">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Input(props) {
  return <input {...props} className="border p-2 w-full rounded text-sm"/>;
}

function Option({ label, checked, onChange, price }) {
  return (
    <label className="flex justify-between border p-3 rounded mb-2 cursor-pointer">
      <div className="flex gap-2">
        <input type="radio" checked={checked} onChange={onChange}/>
        <p>{label}</p>
      </div>
      {price && <span>{price}</span>}
    </label>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span>{label}</span>
      <span>{typeof value === 'number' ? value.toLocaleString() + 'đ' : value}</span>
    </div>
  );
}
