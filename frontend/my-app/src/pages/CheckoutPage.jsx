import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const items = cart?.items || [];

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    ward: '',
    district: '',
    city: '',
    note: '',
    shipping: 'standard', // 
    payment: 'cod'
  });

  const [loading, setLoading] = useState(false);

  // COUPON
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const subtotal = items.reduce((t, i) => t + i.price * i.quantity, 0);

  // ✅ FIX: dùng express thay vì fast
  const shippingFee = form.shipping === 'express' ? 50000 : 0;

  const total = subtotal + shippingFee - discount;

  // APPLY COUPON
  const applyCoupon = async () => {
    if (!coupon) return;

    setLoadingCoupon(true);
    try {
      const res = await fetch('http://localhost:5000/api/coupons/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: coupon })
      });

      const data = await res.json();

      if (res.ok) {
        const value = data.data?.discount || 50000;
        setDiscount(value);
        setCouponMsg(`✔ Giảm ${value.toLocaleString()}đ`);
      } else {
        setDiscount(0);
        setCouponMsg(data.message);
      }
    } catch {
      setCouponMsg('Lỗi server');
    } finally {
      setLoadingCoupon(false);
    }
  };

  // SUBMIT
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
    // 🚀 GỬI TRỰC TIẾP ITEMS
    const res = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
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

        // 🔥 QUAN TRỌNG NHẤT
        items: items.map(i => ({
          productId: i.productId,
          quantity: i.quantity
        }))
      })
    });

    const result = await res.json();

    if (!res.ok) {
      alert(result.message || 'Lỗi tạo đơn');
      return;
    }

    const order = result.data;

    clearCart();
    navigate(`/order-success?orderId=${order.id}&code=${order.code}`);

  } catch (err) {
    console.error(err);
    alert('Lỗi server');
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="bg-gray-50 min-h-screen py-10 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-3 gap-8">

        {/* LEFT */}
        <div className="col-span-2 space-y-6">

          <Section title="Thông tin liên hệ" step={1}>
            <div className="grid grid-cols-2 gap-4">
              <Input name="firstName" placeholder="Họ" onChange={handleChange}/>
              <Input name="lastName" placeholder="Tên" onChange={handleChange}/>
              <Input name="email" placeholder="Email" onChange={handleChange}/>
              <Input name="phone" placeholder="SĐT" onChange={handleChange}/>
            </div>
          </Section>

          <Section title="Địa chỉ giao hàng" step={2}>
            <Input name="address" placeholder="Địa chỉ" onChange={handleChange}/>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Input name="ward" placeholder="Phường/Xã" onChange={handleChange}/>
              <Input name="district" placeholder="Quận/Huyện" onChange={handleChange}/>
            </div>
            <Input name="city" placeholder="Tỉnh/TP" onChange={handleChange} className="mt-4"/>
          </Section>

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

          <Section title="Phương thức thanh toán" step={4}>
            <Option
              label="Thanh toán khi nhận hàng"
              checked={form.payment === 'cod'}
              onChange={() => setForm({ ...form, payment: 'cod' })}
            />
            <Option
              label="Thanh toán online (QR / Banking)"
              checked={form.payment === 'payos'}
              onChange={() => setForm({ ...form, payment: 'payos' })}
            />
          </Section>

        </div>

        {/* RIGHT */}
        <div className="bg-white p-6 rounded shadow sticky top-6 h-fit">

          <h2 className="font-bold text-xl mb-4 text-red-600">Đơn hàng</h2>

          {items.map(i => (
            <div key={i.productId} className="flex gap-3 mb-3 items-center">
              <img src={i.image || '/no-image.png'} className="w-16 h-16 object-cover rounded border"/>
              <div className="flex-1">
                <p>{i.name}</p>
                <p className="text-sm">SL: {i.quantity}</p>
              </div>
              <p>{(i.price * i.quantity).toLocaleString()}đ</p>
            </div>
          ))}

          <div className="flex gap-2 mb-3">
            <input value={coupon} onChange={(e)=>setCoupon(e.target.value)} className="border px-3 py-2 flex-1"/>
            <button onClick={applyCoupon} className="bg-red-600 text-white px-4">
              {loadingCoupon ? '...' : 'Áp dụng'}
            </button>
          </div>

          {couponMsg && <p className="text-sm mb-2">{couponMsg}</p>}

          <Row label="Tạm tính" value={subtotal}/>
          <Row label="Ship" value={shippingFee}/>
          <Row label="Giảm" value={`- ${discount}`} />

          <div className="flex justify-between font-bold mt-3">
            <span>Tổng</span>
            <span className="text-red-600">{total.toLocaleString()}đ</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 mt-4 rounded"
          >
            {loading ? 'Đang xử lý...' : 'Đặt hàng'}
          </button>

        </div>
      </div>
    </div>
  );
}

// UI
function Section({ title, step, children }) {
  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex gap-3 mb-3">
        <div className="bg-red-600 text-white w-8 h-8 flex items-center justify-center rounded-full">
          {step}
        </div>
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Input(props) {
  return <input {...props} className="border p-2 w-full rounded"/>;
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
    <div className="flex justify-between">
      <span>{label}</span>
      <span>{typeof value === 'number' ? value.toLocaleString() + 'đ' : value}</span>
    </div>
  );
}