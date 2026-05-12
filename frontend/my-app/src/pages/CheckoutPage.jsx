import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { checkoutAPI, orderAPI } from '../services/api';

const SUPPORTED_PAYMENT_CODES = new Set(['cod', 'payos', 'bank_transfer']);
const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;
const fallbackProductImage = 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=300&q=80';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart, refreshCart } = useCart();
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
    refreshCart?.().catch((error) => {
      console.error(error);
    });
  }, [refreshCart]);

  useEffect(() => {
    let ignore = false;

    const loadShippingMethods = async () => {
      setLoadingShippingMethods(true);
      try {
        const res = await checkoutAPI.getShippingMethods();
        const methods = Array.isArray(res?.data) ? res.data : [];

        if (ignore) return;
        setShippingMethods(methods);
        setForm((prev) => ({ ...prev, shipping: prev.shipping || methods[0]?.code || '' }));
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

  const shippingFee = items.length ? Number(selectedShippingMethod?.price || 0) : 0;
  const total = Math.max(subtotal + shippingFee - discount, 0);
  const itemCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const progressSteps = ['Giỏ hàng', 'Thông tin', 'Thanh toán', 'Hoàn tất'];

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

      navigate('/order-success', { state: { orderId, orderCode } });
    } catch (err) {
      console.error(err);
      alert(err?.message || 'Không thể đặt hàng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link to="/cart" className="text-sm font-semibold text-zinc-600 hover:text-black">
            ← Quay lại giỏ hàng
          </Link>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-zinc-500">Checkout</p>
              <h1 className="mt-2 text-4xl font-black tracking-tight text-zinc-950">Hoàn tất đơn hàng</h1>
            </div>
            <div className="flex gap-2">
              {progressSteps.map((step, index) => (
                <div key={step} className="flex items-center gap-2">
                  <span className={`grid h-8 w-8 place-items-center rounded-full text-xs font-black ${
                    index <= 2 ? 'bg-zinc-950 text-white' : 'bg-zinc-200 text-zinc-500'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="hidden text-sm font-semibold text-zinc-600 sm:block">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
        <div className="space-y-5">
          <Section title="Thông tin liên hệ" step={1}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input name="firstName" placeholder="Họ" value={form.firstName} onChange={handleChange} />
              <Input name="lastName" placeholder="Tên" value={form.lastName} onChange={handleChange} />
              <Input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
              <Input name="phone" placeholder="Số điện thoại" value={form.phone} onChange={handleChange} />
            </div>
          </Section>

          <Section title="Địa chỉ giao hàng" step={2}>
            <Input name="address" placeholder="Số nhà, tên đường" value={form.address} onChange={handleChange} />
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <Input name="ward" placeholder="Phường/Xã" value={form.ward} onChange={handleChange} />
              <Input name="district" placeholder="Quận/Huyện" value={form.district} onChange={handleChange} />
              <Input name="city" placeholder="Tỉnh/TP" value={form.city} onChange={handleChange} />
            </div>
          </Section>

          <Section title="Phương thức vận chuyển" step={3}>
            {loadingShippingMethods ? (
              <SkeletonText text="Đang tải phương thức vận chuyển..." />
            ) : shippingMethods.length === 0 ? (
              <Notice>Chưa có phương thức vận chuyển khả dụng.</Notice>
            ) : (
              <div className="grid gap-3">
                {shippingMethods.map((method) => (
                  <Option
                    key={method.id || method.code}
                    label={method.name}
                    description={method.description}
                    price={formatCurrency(method.price)}
                    checked={form.shipping === method.code}
                    onChange={() => setForm((prev) => ({ ...prev, shipping: method.code }))}
                  />
                ))}
              </div>
            )}
          </Section>

          <Section title="Phương thức thanh toán" step={4}>
            {loadingPaymentMethods ? (
              <SkeletonText text="Đang tải phương thức thanh toán..." />
            ) : paymentMethods.length === 0 ? (
              <Notice>Không có phương thức thanh toán khả dụng. Vui lòng thử lại sau.</Notice>
            ) : (
              <div className="grid gap-3">
                {paymentMethods.map((method) => (
                  <Option
                    key={method.id || method.code}
                    label={method.name}
                    description={method.description}
                    checked={form.payment === method.code}
                    onChange={() => setForm((prev) => ({ ...prev, payment: method.code }))}
                  />
                ))}
              </div>
            )}
          </Section>
        </div>

        <aside className="lg:sticky lg:top-32 lg:self-start">
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-zinc-950">Tóm tắt đơn hàng</h2>
                <p className="mt-1 text-sm text-zinc-500">{itemCount} sản phẩm</p>
              </div>
              <Link to="/cart" className="text-sm font-semibold text-zinc-600 hover:text-black">
                Sửa
              </Link>
            </div>

            <div className="max-h-[340px] space-y-4 overflow-auto pr-1">
              {items.length === 0 ? (
                <div className="rounded-md border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-600">
                  Chưa có sản phẩm trong giỏ. Quay lại giỏ hàng để thêm sản phẩm trước khi thanh toán.
                </div>
              ) : (
                items.map((item) => (
                  <div key={getCartItemKey(item)} className="flex gap-3">
                    <img
                      src={item.image || item.thumbnail || fallbackProductImage}
                      onError={(event) => {
                        event.currentTarget.src = fallbackProductImage;
                      }}
                      alt={item.name || 'Sản phẩm'}
                      className="h-16 w-16 rounded-md border border-zinc-200 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-bold text-zinc-950">{item.name || item.productName || 'Sản phẩm'}</p>
                      {(item.color || item.size) && (
                        <p className="mt-1 text-xs text-zinc-500">
                          {[item.color && `Màu: ${item.color}`, item.size && `Size: ${item.size}`]
                            .filter(Boolean)
                            .join(' / ')}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-zinc-500">SL: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-zinc-950">
                      {formatCurrency(Number(item.price || item.unitPrice || 0) * Number(item.quantity || 0))}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="my-5 flex flex-col gap-2 sm:flex-row">
              <input
                value={coupon}
                onChange={(event) => setCoupon(event.target.value)}
                placeholder="Mã giảm giá"
                className="min-h-11 flex-1 rounded-md border border-zinc-300 px-3 outline-none focus:border-black focus:ring-2 focus:ring-zinc-200"
              />
              <button
                type="button"
                onClick={applyCoupon}
                disabled={loadingCoupon}
                className="min-h-11 rounded-md bg-zinc-950 px-4 text-sm font-bold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                {loadingCoupon ? 'Đang áp dụng' : 'Áp dụng'}
              </button>
            </div>

            {couponMsg && <p className="mb-3 text-sm font-medium text-zinc-700">{couponMsg}</p>}

            <div className="space-y-3 border-t border-zinc-200 pt-4">
              <Row label="Tạm tính" value={subtotal} />
              <Row label="Phí vận chuyển" value={shippingFee} />
              <Row label="Giảm giá" value={-discount} />
              <div className="flex justify-between border-t border-zinc-200 pt-4 text-lg font-black">
                <span>Tổng cộng</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                loading ||
                loadingPaymentMethods ||
                loadingShippingMethods ||
                items.length === 0 ||
                paymentMethods.length === 0 ||
                shippingMethods.length === 0
              }
              className="mt-5 w-full rounded-md bg-zinc-950 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              {loading ? 'Đang xử lý...' : selectedPaymentMethod?.isOnline ? 'Tạo đơn và thanh toán' : 'Đặt hàng'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, step, children }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-zinc-950 text-sm font-black text-white">
          {step}
        </div>
        <h2 className="text-lg font-black text-zinc-950">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Input({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={`min-h-12 w-full rounded-md border border-zinc-300 bg-white px-4 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-zinc-200 ${className}`}
    />
  );
}

function Option({ label, description, checked, onChange, price }) {
  return (
    <label className={`flex cursor-pointer justify-between gap-4 rounded-lg border p-4 transition ${
      checked ? 'border-zinc-950 bg-zinc-50' : 'border-zinc-200 bg-white hover:border-zinc-400'
    }`}>
      <div className="flex gap-3">
        <input className="mt-1 accent-black" type="radio" checked={checked} onChange={onChange} />
        <div>
          <p className="font-bold text-zinc-950">{label}</p>
          {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
        </div>
      </div>
      {price && <span className="shrink-0 text-sm font-black text-zinc-950">{price}</span>}
    </label>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm text-zinc-600">
      <span>{label}</span>
      <span className="font-semibold text-zinc-950">{formatCurrency(value)}</span>
    </div>
  );
}

function Notice({ children }) {
  return <p className="rounded-md border border-zinc-300 bg-zinc-100 p-3 text-sm text-zinc-700">{children}</p>;
}

function SkeletonText({ text }) {
  return <p className="animate-pulse text-sm text-zinc-500">{text}</p>;
}
