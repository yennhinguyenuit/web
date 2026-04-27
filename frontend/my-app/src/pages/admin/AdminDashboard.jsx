import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';

const formatCurrency = (value) =>
  `${Number(value || 0).toLocaleString()}đ`;

const statusLabel = {
  pending: 'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};

const statusClass = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipping: 'bg-purple-100 text-purple-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminAPI
      .getDashboard()
      .then((res) => setStats(res.data))
      .catch((error) => {
        console.error(error);
        setError(error.message || 'Không tải được dashboard');
      });
  }, []);

  if (error) {
    return <div className="text-red-600 p-6">{error}</div>;
  }

  if (!stats) {
    return (
      <div className="text-slate-600 p-6">
        Đang tải dashboard...
      </div>
    );
  }

  const cards = [
    {
      title: 'Người dùng',
      value: stats.totalUsers,
      icon: '👤',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Sản phẩm',
      value: stats.totalProducts,
      icon: '🛍️',
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Đơn hàng',
      value: stats.totalOrders,
      icon: '📦',
      color: 'from-orange-500 to-red-500',
    },
    {
      title: 'Doanh thu',
      value: formatCurrency(stats.totalRevenue),
      icon: '💰',
      color: 'from-emerald-500 to-emerald-600',
    },
  ];

  return (
    <div className="space-y-6 p-6">

<div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-2xl shadow-lg">
  
  <h1 className="text-2xl font-bold flex items-center gap-2">
    👋 Xin chào, Admin
  </h1>

  <p className="text-sm opacity-90 mt-1">
    Dashboard - Quản lý hệ thống cửa hàng
  </p>

</div>

      {/* STATS */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map((card) => (
          <div
            key={card.title}
            className={`rounded-2xl p-5 text-white shadow-lg 
            bg-gradient-to-r ${card.color}
            hover:scale-105 transition duration-300`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm opacity-80">
                  {card.title}
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {card.value}
                </p>
              </div>
              <div className="text-3xl">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ORDERS */}
      <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-800">
            🧾 Đơn hàng mới nhất
          </h2>
          <span className="text-sm text-slate-500">
            {(stats.latestOrders || []).length} đơn gần đây
          </span>
        </div>

        <div className="space-y-4">
          {(stats.latestOrders || []).map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-sm hover:shadow-md transition"
            >
              <div>
                <p className="font-semibold text-slate-800">
                  {order.code}
                </p>
                <p className="text-sm text-slate-500">
                  {order.customerName || 'Không rõ khách hàng'}
                </p>
              </div>

              <div className="text-slate-800 font-semibold">
                {formatCurrency(order.total)}
              </div>

              <span
                className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-medium ${
                  statusClass[order.status] ||
                  'bg-slate-100 text-slate-700'
                }`}
              >
                {statusLabel[order.status] || order.status}
              </span>
            </div>
          ))}
        </div>

        {/* EMPTY */}
        {stats.latestOrders?.length === 0 && (
          <div className="text-center text-slate-400 py-6">
            💤 Chưa có đơn hàng nào
          </div>
        )}
      </div>

    </div>
  );
}