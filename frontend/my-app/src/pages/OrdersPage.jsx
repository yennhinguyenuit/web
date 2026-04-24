import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../services/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('processing');

  useEffect(() => {
    orderAPI
      .getOrders()
      .then((res) => setOrders(res.data || []))
      .catch((err) => console.error(err));
  }, []);

  const processingOrders = orders.filter(o =>
    ['pending', 'confirmed', 'shipping'].includes(o.status?.toLowerCase())
  );

  const completedOrders = orders.filter(o =>
    o.status?.toLowerCase() === 'completed'
  );

  const cancelledOrders = orders.filter(o =>
    o.status?.toLowerCase() === 'cancelled'
  );

  const renderOrders = (list) => {
    if (list.length === 0) return <p>Không có đơn</p>;

    return list.map((o) => (
      <div key={o.id} className="bg-white shadow rounded p-4">
        <p><strong>Mã đơn:</strong> {o.code}</p>
        <p><strong>Tổng tiền:</strong> {Number(o.total).toLocaleString()}đ</p>
        <p><strong>Trạng thái:</strong> {o.status}</p>
        <p><strong>Thanh toán:</strong> {o.paymentStatus}</p>

        <div className="flex gap-3 mt-3">
          <Link to={`/orders/${o.id}`} className="text-blue-600">
            Xem chi tiết
          </Link>
        </div>
      </div>
    ));
  };

  return (
    <div className="max-w-4xl mx-auto p-10">
      <h1 className="text-3xl font-bold mb-6">Đơn hàng của tôi</h1>

      {/* TAB */}
      <div className="flex gap-4 mb-6 border-b pb-2">
        <button onClick={() => setTab('processing')}>
          Đang xử lý
        </button>

        <button onClick={() => setTab('completed')}>
          Hoàn thành
        </button>

        <button onClick={() => setTab('cancelled')}>
          Đã hủy
        </button>
      </div>

      {tab === 'processing' && renderOrders(processingOrders)}
      {tab === 'completed' && renderOrders(completedOrders)}
      {tab === 'cancelled' && renderOrders(cancelledOrders)}
    </div>
  );
}