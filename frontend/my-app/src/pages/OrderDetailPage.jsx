import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { orderAPI, paymentAPI } from '../services/api';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadOrder = async () => {
    try {
      const res = await orderAPI.getOrderById(id);
      setOrder(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const refreshPayment = async () => {
    try {
      await paymentAPI.getPaymentStatus(id);
      await loadOrder();
    } catch (err) {
      alert(err.message || 'Không thể cập nhật trạng thái thanh toán');
    }
  };

  const continuePayment = async () => {
    try {
      const res = await paymentAPI.createPaymentIntent(id);
      const checkoutUrl = res.data?.checkout?.url;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }
      await loadOrder();
    } catch (err) {
      alert(err.message || 'Không thể mở lại trang thanh toán');
    }
  };

  if (loading) return <p className="p-10">Đang tải...</p>;
  if (!order) return <p className="p-10">Không tìm thấy đơn hàng.</p>;

  const payment = order.payment || {};
  const checkoutUrl = payment.checkout?.url;

  return (
    <div className="max-w-4xl mx-auto p-10 space-y-8">
      <div className="bg-white rounded shadow p-6 space-y-2">
        <h1 className="text-3xl font-bold">Chi tiết đơn hàng</h1>
        <p><strong>Mã đơn:</strong> {order.code}</p>
        <p><strong>Trạng thái đơn:</strong> {order.status}</p>
        <p><strong>Trạng thái thanh toán:</strong> {order.paymentStatus}</p>
        <p><strong>Tổng tiền:</strong> {Number(order.total).toLocaleString()}đ</p>
      </div>

      {order.shippingAddress ? (
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-3">Địa chỉ giao hàng</h2>
          <p>{order.shippingAddress.name} - {order.shippingAddress.phone}</p>
          <p>
            {order.shippingAddress.address}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.city}
          </p>
        </div>
      ) : null}

      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-semibold mb-3">Sản phẩm</h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="border-b pb-3 last:border-b-0 flex gap-4">
              {item.productImage ? <img src={item.productImage} alt={item.productName} className="w-16 h-16 object-cover rounded" /> : null}
              <div className="flex-1">
                <p className="font-medium">{item.productName}</p>
                <p>Số lượng: {item.quantity}</p>
                {item.color ? <p>Màu: {item.color}</p> : null}
                {item.size ? <p>Size: {item.size}</p> : null}
              </div>
              <div className="text-right">
                <p>Đơn giá: {Number(item.unitPrice).toLocaleString()}đ</p>
                <p className="font-medium">Tạm tính: {Number(item.subTotal).toLocaleString()}đ</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {payment.requiresAction ? (
        <div className="bg-white rounded shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold">Thanh toán đơn hàng</h2>
          <p className="text-gray-600">Đơn hàng này đang chờ thanh toán. Bạn có thể mở lại trang PayOS để quét QR hoặc hoàn tất thanh toán trực tuyến.</p>
          <div className="flex flex-wrap gap-3">
            {checkoutUrl ? (
              <a href={checkoutUrl} className="inline-block bg-red-600 text-white px-4 py-2 rounded">
                Mở trang PayOS
              </a>
            ) : (
              <button onClick={continuePayment} className="inline-block bg-red-600 text-white px-4 py-2 rounded">
                Thanh toán lại
              </button>
            )}
            <button onClick={refreshPayment} className="px-4 py-2 border rounded">
              Cập nhật trạng thái thanh toán
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
