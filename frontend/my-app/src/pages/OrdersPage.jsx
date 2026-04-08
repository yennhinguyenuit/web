import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../services/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    orderAPI
      .getOrders()
      .then((res) => setOrders(res.data || []))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-10">
      <h1 className="text-3xl font-bold mb-6">Đơn hàng của tôi</h1>

      {orders.length === 0 ? (
        <p>Chưa có đơn hàng.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="bg-white shadow rounded p-4">
              <p><strong>Mã đơn:</strong> {o.code}</p>
              <p><strong>Tổng tiền:</strong> {Number(o.total).toLocaleString()}đ</p>
              <p><strong>Trạng thái đơn:</strong> {o.status}</p>
              <p><strong>Trạng thái thanh toán:</strong> {o.paymentStatus}</p>

              <Link to={`/orders/${o.id}`} className="inline-block mt-3 text-red-600">
                Xem chi tiết
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
