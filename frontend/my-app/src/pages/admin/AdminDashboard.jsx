import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';

const formatCurrency = (value) => `${Number(value || 0).toLocaleString()}đ`;

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
    return <div className="text-red-600">{error}</div>;
  }

  if (!stats) {
    return <div className="text-slate-600">Đang tải dashboard...</div>;
  }

  const cards = [
    { title: 'Người dùng', value: stats.totalUsers, icon: '👤' },
    { title: 'Sản phẩm', value: stats.totalProducts, icon: '🛍️' },
    { title: 'Đơn hàng', value: stats.totalOrders, icon: '📦' },
    { title: 'Doanh thu', value: formatCurrency(stats.totalRevenue), icon: '💰' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map((card) => (
          <div key={card.title} className="rounded-2xl bg-white shadow-sm border border-slate-100 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">{card.title}</p>
                <p className="mt-2 text-3xl font-bold text-slate-800">{card.value}</p>
              </div>
              <div className="text-3xl">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-800">Đơn hàng mới nhất</h2>
          <span className="text-sm text-slate-500">
            {(stats.latestOrders || []).length} đơn gần đây
          </span>
        </div>

        <div className="space-y-4">
          {(stats.latestOrders || []).map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
            >
              <div>
                <p className="font-semibold text-slate-800">{order.code}</p>
                <p className="text-sm text-slate-500">
                  {order.customerName || 'Không rõ khách hàng'}
                </p>
              </div>

              <div className="text-slate-800 font-semibold">
                {formatCurrency(order.total)}
              </div>

              <span
                className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-medium ${
                  statusClass[order.status] || 'bg-slate-100 text-slate-700'
                }`}
              >
                {statusLabel[order.status] || order.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}