import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // LOAD ORDERS
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/orders', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        const data = await res.json();

        setOrders(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  // FORMAT DATE
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  // FORMAT MONEY
  const formatMoney = (money) => {
    return Number(money).toLocaleString() + 'đ';
  };

  return (
    <div className="max-w-5xl mx-auto p-10">
      <h1 className="text-3xl font-bold mb-6">Đơn hàng của tôi</h1>

      {loading ? (
        <p>Đang tải...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">Bạn chưa có đơn hàng nào.</p>
      ) : (
        <div className="bg-white shadow rounded overflow-hidden">

          {/* HEADER */}
          <div className="grid grid-cols-4 bg-gray-100 p-4 font-semibold">
            <p>Mã đơn</p>
            <p>Ngày đặt</p>
            <p>Tổng tiền</p>
            <p>Trạng thái</p>
          </div>

          {/* LIST */}
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => navigate(`/orders/${order.id}`)}
              className="grid grid-cols-4 p-4 border-b hover:bg-gray-50 cursor-pointer"
            >
              <p className="text-red-600 font-medium">
                #{order.code}
              </p>

              <p>{formatDate(order.createdAt)}</p>

              <p className="font-semibold">
                {formatMoney(order.total)}
              </p>

              <p className="capitalize">
                {order.status}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}