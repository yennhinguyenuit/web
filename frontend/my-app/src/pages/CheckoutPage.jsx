import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { checkoutAPI, orderAPI } from '../services/api';

const SUPPORTED_PAYMENT_CODES = new Set(['cod', 'payos', 'bank_transfer']);

const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const items = useMemo(() => cart?.items || [], [cart?.items]);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    ward: '',
    district: '',
    city: '',
    shipping: '',
    payment: '',
  });

  const [loading, setLoading] = useState(false);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingShippingMethods, setLoadingShippingMethods] = useState(false);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);

  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  useEffect(() => {
    let ignore = false;

    const loadShippingMethods = async () => {
      setLoadingShippingMethods(true);
      try {
        const res = await checkoutAPI.getShippingMethods();
        const methods = Array.isArray(res?.data) ? res.data : [];

        if (ignore) return;
        setShippingMethods(methods);
        setForm((prev) => ({
          ...prev,
          shipping: prev.shipping || methods[0]?.code || '',
        }));
      } catch (err) {
        console.error(err);
        if (!ignore) setShippingMethods([]);
      } finally {
        if (!ignore) setLoadingShippingMethods(false);
      }
    };

    loadShippingMethods();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadPaymentMethods = async () => {
      setLoadingPaymentMethods(true);
      try {
        const res = await checkoutAPI.getPaymentMethods();
        const methods = Array.isArray(res?.data) ? res.data : [];
        const enabledAndSupported = methods.filter((method) => (
          method?.isEnabled &&
          SUPPORTED_PAYMENT_CODES.has(method.code) &&
          (method.isOnline ? Boolean(method.isConfigured) : true)
        ));

        if (ignore) return;
        setPaymentMethods(enabledAndSupported);
        setForm((prev) => ({
          ...prev,
          payment: enabledAndSupported.some((method) => method.code === prev.payment)
            ? prev.payment
            : enabledAndSupported[0]?.code || '',
        }));
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
  }, []);

  const selectedShippingMethod = useMemo(
    () => shippingMethods.find((method) => method.code === form.shipping) || null,
    [form.shipping, shippingMethods]
  );

  const selectedPaymentMethod = useMemo(
    () => paymentMethods.find((method) => method.code === form.payment) || null,
    [form.payment, paymentMethods]
  );

  const subtotal = useMemo(
    () => items.reduce((total, item) => (
      total + Number(item.price || item.unitPrice || 0) * Number(item.quantity || 0)
    ), 0),
    [items]
  );

  const shippingFee = Number(selectedShippingMethod?.price || 0);
  const total = Math.max(subtotal + shippingFee - discount, 0);

  const getCartItemKey = (item) =>
    `${item.productId}:${item.color || ''}:${item.size || ''}`;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const applyCoupon = async () => {
    const code = coupon.trim();
    if (!code) {
      setDiscount(0);
      setCouponMsg('Vui lòng nhập mã giảm giá');
      return;
    }

    setLoadingCoupon(true);
    try {
      const res = await checkoutAPI.validateCoupon(code, subtotal);
      const value = Number(res?.data?.discount || 0);
      setDiscount(value);
      setCouponMsg(value > 0 ? `Đã giảm ${formatCurrency(value)}` : 'Mã hợp lệ nhưng chưa có giảm giá');
    } catch (err) {
      setDiscount(0);
      setCouponMsg(err?.message || 'Không thể áp dụng mã giảm giá');
    } finally {
      setLoadingCoupon(false);
    }
  };

  const validateForm = () => {
    const requiredFields = [
      ['firstName', 'họ'],
      ['lastName', 'tên'],
      ['phone', 'số điện thoại'],
      ['address', 'địa chỉ'],
      ['ward', 'phường/xã'],
      ['district', 'quận/huyện'],
      ['city', 'tỉnh/thành phố'],
    ];

    const missing = requiredFields.find(([key]) => !String(form[key] || '').trim());
    if (missing) {
      alert(`Vui lòng nhập ${missing[1]}`);
      return false;
    }

    if (!selectedShippingMethod) {
      alert('Vui lòng chọn phương thức vận chuyển');
      return false;
    }

    if (!selectedPaymentMethod) {
      alert('Vui lòng chọn phương thức thanh toán');
      return false;
    }

    if (items.length === 0) {
      alert('Giỏ hàng trống');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await orderAPI.createOrder({
        shippingAddress: {
          name: `${form.firstName.trim()} ${form.lastName.trim()}`,
          phone: form.phone.trim(),
          address: form.address.trim(),
          ward: form.ward.trim(),
          district: form.district.trim(),
          city: form.city.trim(),
        },
        shippingMethodCode: selectedShippingMethod.code,
        paymentMethodCode: selectedPaymentMethod.code,
        couponCode: coupon.trim() || null,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          color: item.color || null,
          size: item.size || null,
        })),
      });

      const orderId = result?.data?.id;
      const orderCode = result?.data?.code;

      clearCart();

      if (selectedPaymentMethod.isOnline && orderId) {
        navigate(`/orders/${orderId}`);
        return;
      }

      navigate('/order-success', {
        state: {
          orderId,
          orderCode,
        },
      });
    } catch (err) {
      console.error(err);
      alert(err?.message || 'Không thể đặt hàng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="Thông tin liên hệ" step={1}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input name="firstName" placeholder="Họ" value={form.firstName} onChange={handleChange} />
              <Input name="lastName" placeholder="Tên" value={form.lastName} onChange={handleChange} />
              <Input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
              <Input name="phone" placeholder="Số điện thoại" value={form.phone} onChange={handleChange} />
            </div>
          </Section>

          <Section title="Địa chỉ giao hàng" step={2}>
            <Input name="address" placeholder="Địa chỉ" value={form.address} onChange={handleChange} />
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input name="ward" placeholder="Phường/Xã" value={form.ward} onChange={handleChange} />
              <Input name="district" placeholder="Quận/Huyện" value={form.district} onChange={handleChange} />
            </div>
            <Input name="city" placeholder="Tỉnh/TP" value={form.city} onChange={handleChange} className="mt-4" />
          </Section>

          <Section title="Phương thức vận chuyển" step={3}>
            {loadingShippingMethods ? (
              <p className="text-sm text-gray-500">Đang tải phương thức vận chuyển...</p>
            ) : shippingMethods.length === 0 ? (
              <p className="text-sm text-red-600">Chưa có phương thức vận chuyển khả dụng.</p>
            ) : (
              shippingMethods.map((method) => (
                <Option
                  key={method.id || method.code}
                  label={method.name}
                  description={method.description}
                  price={formatCurrency(method.price)}
                  checked={form.shipping === method.code}
                  onChange={() => setForm((prev) => ({ ...prev, shipping: method.code }))}
                />
              ))
            )}
          </Section>

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
                  description={method.description}
                  checked={form.payment === method.code}
                  onChange={() => setForm((prev) => ({ ...prev, payment: method.code }))}
                />
              ))
            )}
          </Section>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-5 shadow lg:sticky lg:top-6">
            <h2 className="mb-4 text-lg font-bold text-red-600">Đơn hàng</h2>

            {items.map((item) => (
              <div key={getCartItemKey(item)} className="mb-3 flex gap-3">
                <img
                  src={item.image || item.thumbnail || 'https://via.placeholder.com/100'}
                  alt={item.name || 'Sản phẩm'}
                  className="h-14 w-14 rounded object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm">{item.name}</p>
                  {(item.color || item.size) && (
                    <p className="text-xs text-gray-500">
                      {[item.color && `Màu: ${item.color}`, item.size && `Size: ${item.size}`]
                        .filter(Boolean)
                        .join(' / ')}
                    </p>
                  )}
                  <p className="text-xs">SL: {item.quantity}</p>
                </div>
                <p className="text-sm">
                  {formatCurrency(Number(item.price || item.unitPrice || 0) * Number(item.quantity || 0))}
                </p>
              </div>
            ))}

            <div className="mb-3 flex flex-col gap-2 sm:flex-row">
              <input
                value={coupon}
                onChange={(event) => setCoupon(event.target.value)}
                placeholder="Nhập mã giảm giá"
                className="flex-1 rounded border px-3 py-2"
              />
              <button
                type="button"
                onClick={applyCoupon}
                disabled={loadingCoupon}
                className="rounded bg-red-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {loadingCoupon ? 'Đang áp dụng' : 'Áp dụng'}
              </button>
            </div>

            {couponMsg && (
              <p className={`mb-2 text-sm ${discount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {couponMsg}
              </p>
            )}

            <Row label="Tạm tính" value={subtotal} />
            <Row label="Phí vận chuyển" value={shippingFee} />
            <Row label="Giảm giá" value={-discount} />

            <div className="mt-2 flex justify-between font-bold">
              <span>Tổng</span>
              <span className="text-red-600">{formatCurrency(total)}</span>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                loading ||
                loadingPaymentMethods ||
                loadingShippingMethods ||
                paymentMethods.length === 0 ||
                shippingMethods.length === 0
              }
              className="mt-4 w-full rounded bg-red-600 py-3 text-white disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {loading ? 'Đang xử lý...' : 'Đặt hàng'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, step, children }) {
  return (
    <section className="bg-white p-5 shadow">
      <div className="mb-3 flex gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white">
          {step}
        </div>
        <h2 className="font-medium">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Input({ className = '', ...props }) {
  return <input {...props} className={`w-full rounded border p-2 text-sm ${className}`} />;
}

function Option({ label, description, checked, onChange, price }) {
  return (
    <label className="mb-2 flex cursor-pointer justify-between rounded border p-3">
      <div className="flex gap-2">
        <input type="radio" checked={checked} onChange={onChange} />
        <div>
          <p>{label}</p>
          {description && <p className="text-xs text-gray-500">{description}</p>}
        </div>
      </div>
      {price && <span className="text-sm font-medium">{price}</span>}
    </label>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span>{label}</span>
      <span>{formatCurrency(value)}</span>
    </div>
  );
}
