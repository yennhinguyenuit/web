import { useEffect, useMemo, useState } from 'react';
import { adminAPI } from '../../services/api';

export default function AdminReports() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    adminAPI
      .getOrders()
      .then((res) => setOrders(res.data || []))
      .catch((err) => console.error(err));
  }, []);

  const totalRevenue = useMemo(
    () => orders.filter((o) => o.paymentStatus === 'paid').reduce((sum, o) => sum + Number(o.total || 0), 0),
    [orders]
  );

  const paidOrders = useMemo(
    () => orders.filter((o) => o.paymentStatus === 'paid').length,
    [orders]
  );

  const deliveredOrders = useMemo(
    () => orders.filter((o) => o.status === 'delivered').length,
    [orders]
  );

  const cards = [
    { title: 'Tổng doanh thu', value: `${totalRevenue.toLocaleString()}đ`, icon: '💰' },
    { title: 'Tổng số đơn', value: orders.length, icon: '📦' },
    { title: 'Đơn đã thanh toán', value: paidOrders, icon: '💳' },
    { title: 'Đơn đã giao', value: deliveredOrders, icon: '✅' },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-6">
        <h1 className="text-2xl font-bold text-slate-800">Báo cáo</h1>
        <p className="text-slate-500 mt-1">Tổng hợp số liệu đơn hàng và doanh thu</p>
      </div>

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
    </div>
  );
}