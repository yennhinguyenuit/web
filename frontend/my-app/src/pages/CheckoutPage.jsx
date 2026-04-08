import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { accountAPI, checkoutAPI, orderAPI, paymentAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';

const EMPTY_SHIPPING_ADDRESS = {
  name: '',
  phone: '',
  address: '',
  ward: '',
  district: '',
  city: '',
};

export default function CheckoutPage() {
  const [addresses, setAddresses] = useState([]);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [addressMode, setAddressMode] = useState('saved');
  const [addressId, setAddressId] = useState('');
  const [shippingAddress, setShippingAddress] = useState(EMPTY_SHIPPING_ADDRESS);
  const [saveAddress, setSaveAddress] = useState(true);
  const [shipping, setShipping] = useState('');
  const [payment, setPayment] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discountPreview, setDiscountPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { cart, fetchCart } = useCart();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [addressRes, shippingRes, paymentRes] = await Promise.all([
          accountAPI.getAddresses(),
          checkoutAPI.getShippingMethods(),
          checkoutAPI.getPaymentMethods(),
        ]);

        const nextAddresses = addressRes.data || [];
        const nextShippingMethods = shippingRes.data || [];
        const nextPaymentMethods = paymentRes.data || [];

        setAddresses(nextAddresses);
        setShippingMethods(nextShippingMethods);
        setPaymentMethods(nextPaymentMethods);

        if (nextAddresses.length > 0) {
          const defaultAddress = nextAddresses.find((item) => item.isDefault) || nextAddresses[0];
          setAddressId(defaultAddress.id);
          setAddressMode('saved');
        } else {
          setAddressMode('new');
        }

        if (nextShippingMethods.length > 0) {
          setShipping(nextShippingMethods[0].code);
        }

        const payOSMethod = nextPaymentMethods.find((item) => item.code === 'payos' && item.isConfigured !== false);
        const fallbackMethod = nextPaymentMethods.find((item) => item.isConfigured !== false) || nextPaymentMethods[0];
        const preferredMethod = payOSMethod || fallbackMethod;
        if (preferredMethod) {
          setPayment(preferredMethod.code);
        }
      } catch (error) {
        console.error(error);
        alert(error.message || 'Không thể tải dữ liệu thanh toán');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const items = cart?.items || [];

  const selectedShipping = useMemo(
    () => shippingMethods.find((item) => item.code === shipping),
    [shippingMethods, shipping]
  );

  const selectedPayment = useMemo(
    () => paymentMethods.find((item) => item.code === payment),
    [paymentMethods, payment]
  );

  const subtotal = cart?.totalAmount || 0;
  const shippingFee = selectedShipping ? Number(selectedShipping.price || 0) : 0;
  const discount = Number(discountPreview?.discount || 0);
  const estimatedTotal = Math.max(0, subtotal + shippingFee - discount);

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setDiscountPreview(null);
      return;
    }

    try {
      const response = await checkoutAPI.validateCoupon(couponCode.trim(), subtotal);
      setDiscountPreview(response.data);
      alert(response.message || 'Áp dụng mã giảm giá thành công');
    } catch (error) {
      setDiscountPreview(null);
      alert(error.message || 'Mã giảm giá không hợp lệ');
    }
  };

  const placeOrder = async () => {
    if (!items.length) {
      alert('Giỏ hàng đang trống');
      return;
    }

    if (!shipping || !payment) {
      alert('Vui lòng chọn đầy đủ vận chuyển và thanh toán');
      return;
    }

    if (selectedPayment?.isConfigured === false) {
      alert('Phương thức thanh toán tạm thời chưa sẵn sàng');
      return;
    }

    if (addressMode === 'saved' && !addressId) {
      alert('Vui lòng chọn địa chỉ đã lưu');
      return;
    }

    if (addressMode === 'new') {
      const hasMissingField = Object.values(shippingAddress).some((value) => !String(value).trim());
      if (hasMissingField) {
        alert('Vui lòng nhập đầy đủ địa chỉ giao hàng');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        shippingMethodCode: shipping,
        paymentMethodCode: payment,
        couponCode: couponCode.trim() || undefined,
      };

      if (addressMode === 'saved') {
        payload.addressId = addressId;
      } else {
        payload.shippingAddress = shippingAddress;
        payload.saveAddress = saveAddress;
      }

      const orderResponse = await orderAPI.createOrder(payload);
      const createdOrder = orderResponse.data;

      if (payment === 'payos') {
        const intentResponse = await paymentAPI.createPaymentIntent(createdOrder.id);
        const checkoutUrl = intentResponse.data?.checkout?.url;
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
          return;
        }
      }

      await fetchCart();
      navigate(`/orders/${createdOrder.id}`);
    } catch (error) {
      alert(error.message || 'Không thể tạo thanh toán');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Đang tải trang thanh toán...</div>;
  }

  if (!items.length) {
    return (
      <div className="max-w-3xl mx-auto p-10 text-center space-y-4">
        <h1 className="text-3xl font-bold">Chưa có sản phẩm để mua</h1>
        <p className="text-gray-600">Bạn cần thêm ít nhất một sản phẩm vào giỏ hàng trước khi thanh toán.</p>
        <div className="flex justify-center gap-3">
          <Link to="/shop" className="px-6 py-3 bg-red-600 text-white rounded">Đi mua sắm</Link>
          <Link to="/cart" className="px-6 py-3 border rounded">Xem giỏ hàng</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Thanh toán</h1>
          <p className="text-gray-600 mt-1">Xác nhận thông tin giao hàng. Khi bấm thanh toán, bạn sẽ được chuyển ngay sang trang PayOS có mã QR.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/cart" className="px-4 py-2 border rounded hover:bg-gray-50">Quay lại giỏ hàng</Link>
          <Link to="/shop" className="px-4 py-2 border rounded hover:bg-gray-50">Mua thêm</Link>
        </div>
      </div>

      <div className="grid xl:grid-cols-[1.25fr_0.75fr] gap-8 items-start">
        <div className="space-y-8">
          <section className="bg-white rounded shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold">Địa chỉ giao hàng</h2>

            {addresses.length > 0 ? (
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" checked={addressMode === 'saved'} onChange={() => setAddressMode('saved')} />
                  Dùng địa chỉ đã lưu
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" checked={addressMode === 'new'} onChange={() => setAddressMode('new')} />
                  Nhập địa chỉ mới
                </label>
              </div>
            ) : null}

            {addressMode === 'saved' && addresses.length > 0 ? (
              <div className="space-y-3">
                {addresses.map((address) => (
                  <label key={address.id} className="block border rounded p-4 cursor-pointer">
                    <input
                      type="radio"
                      name="address"
                      checked={addressId === address.id}
                      onChange={() => setAddressId(address.id)}
                      className="mr-3"
                    />
                    <span className="font-medium">{address.name}</span>
                    <span className="text-sm text-gray-500 ml-2">{address.phone}</span>
                    <div className="text-sm text-gray-600 mt-1">
                      {address.address}, {address.ward}, {address.district}, {address.city}
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                <input value={shippingAddress.name} onChange={(event) => setShippingAddress((current) => ({ ...current, name: event.target.value }))} className="border rounded px-4 py-3" placeholder="Tên người nhận" />
                <input value={shippingAddress.phone} onChange={(event) => setShippingAddress((current) => ({ ...current, phone: event.target.value }))} className="border rounded px-4 py-3" placeholder="Số điện thoại" />
                <input value={shippingAddress.address} onChange={(event) => setShippingAddress((current) => ({ ...current, address: event.target.value }))} className="border rounded px-4 py-3 md:col-span-2" placeholder="Số nhà, đường" />
                <input value={shippingAddress.ward} onChange={(event) => setShippingAddress((current) => ({ ...current, ward: event.target.value }))} className="border rounded px-4 py-3" placeholder="Phường/Xã" />
                <input value={shippingAddress.district} onChange={(event) => setShippingAddress((current) => ({ ...current, district: event.target.value }))} className="border rounded px-4 py-3" placeholder="Quận/Huyện" />
                <input value={shippingAddress.city} onChange={(event) => setShippingAddress((current) => ({ ...current, city: event.target.value }))} className="border rounded px-4 py-3 md:col-span-2" placeholder="Tỉnh/Thành phố" />
                <label className="flex items-center gap-2 text-sm text-gray-600 md:col-span-2">
                  <input type="checkbox" checked={saveAddress} onChange={(event) => setSaveAddress(event.target.checked)} />
                  Lưu địa chỉ này vào tài khoản sau khi đặt hàng
                </label>
              </div>
            )}
          </section>

          <section className="bg-white rounded shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold">Vận chuyển</h2>
            <div className="space-y-3">
              {shippingMethods.map((item) => (
                <label key={item.code} className="block border rounded p-4 cursor-pointer">
                  <input type="radio" name="shipping" checked={shipping === item.code} onChange={() => setShipping(item.code)} className="mr-3" />
                  <span className="font-medium">{item.name}</span>
                  <span className="ml-2 text-red-600">{Number(item.price).toLocaleString()}đ</span>
                  {item.estimatedDays ? <div className="text-sm text-gray-500 mt-1">Dự kiến: {item.estimatedDays} ngày</div> : null}
                </label>
              ))}
            </div>
          </section>

          <section className="bg-white rounded shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold">Thanh toán</h2>
            <div className="space-y-3">
              {paymentMethods.map((item) => (
                <label key={item.code} className={`block border rounded p-4 ${payment === item.code ? 'border-red-600 bg-red-50' : ''} ${item.isConfigured === false ? 'opacity-60' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={payment === item.code}
                    onChange={() => setPayment(item.code)}
                    disabled={item.isConfigured === false}
                    className="mr-3"
                  />
                  <span className="font-medium">{item.name}</span>
                  {item.description ? <div className="text-sm text-gray-500 mt-1">{item.description}</div> : null}
                  {item.code === 'payos' ? <div className="text-sm text-gray-600 mt-2">Sau khi xác nhận, hệ thống sẽ chuyển sang PayOS để bạn quét QR hoặc thanh toán trực tiếp.</div> : null}
                  {item.isConfigured === false ? <div className="text-sm text-red-600 mt-1">Phương thức này tạm thời chưa sẵn sàng</div> : null}
                </label>
              ))}
            </div>
          </section>

          <section className="bg-white rounded shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold">Mã giảm giá</h2>
            <div className="flex flex-col md:flex-row gap-3">
              <input value={couponCode} onChange={(event) => setCouponCode(event.target.value)} className="border rounded px-4 py-3 flex-1" placeholder="Nhập mã giảm giá" />
              <button type="button" onClick={applyCoupon} className="px-5 py-3 border rounded">Áp dụng</button>
            </div>
            {discountPreview ? (
              <div className="text-sm text-green-700">
                Giảm {Number(discountPreview.discount || 0).toLocaleString()}đ với mã {discountPreview.coupon?.code}
              </div>
            ) : null}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="bg-white rounded shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold">Sản phẩm đang mua</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 border-b pb-4 last:border-b-0 last:pb-0">
                  {item.thumbnail ? <img src={item.thumbnail} alt={item.name} className="w-16 h-16 object-cover rounded" /> : null}
                  <div className="flex-1">
                    <Link to={`/products/${item.productId}`} className="font-medium hover:text-red-600">{item.name}</Link>
                    <div className="text-sm text-gray-500">SL: {item.quantity}</div>
                    {item.color ? <div className="text-sm text-gray-500">Màu: {item.color}</div> : null}
                    {item.size ? <div className="text-sm text-gray-500">Size: {item.size}</div> : null}
                  </div>
                  <div className="text-right font-medium">{Number(item.subTotal).toLocaleString()}đ</div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-gray-50 rounded p-6 space-y-3 border">
            <h2 className="text-xl font-semibold mb-2">Tóm tắt đơn hàng</h2>
            <div className="flex justify-between"><span>Tạm tính</span><span>{Number(subtotal).toLocaleString()}đ</span></div>
            <div className="flex justify-between"><span>Phí vận chuyển</span><span>{Number(shippingFee).toLocaleString()}đ</span></div>
            <div className="flex justify-between"><span>Giảm giá</span><span>-{Number(discount).toLocaleString()}đ</span></div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Tổng thanh toán</span><span>{Number(estimatedTotal).toLocaleString()}đ</span></div>
            <button onClick={placeOrder} disabled={submitting} className="w-full bg-red-600 text-white px-6 py-3 rounded disabled:opacity-60">
              {submitting ? 'Đang chuyển sang PayOS...' : 'Thanh toán ngay'}
            </button>
            <p className="text-xs text-gray-500">Sau khi bấm thanh toán, bạn sẽ được chuyển tự động sang trang PayOS có mã QR.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
