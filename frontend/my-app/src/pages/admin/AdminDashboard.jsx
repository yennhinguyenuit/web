import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { statsAPI } from "../../services/api";

const formatCurrency = (value) =>
  `${Number(value || 0).toLocaleString()}đ`;

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [revenue, setRevenue] = useState([]);
  const [ordersSummary, setOrdersSummary] = useState({});
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const s = await statsAPI.getSummary();
      const r = await statsAPI.getRevenue();
      const o = await statsAPI.getOrders();
      const t = await statsAPI.getTopProducts();
setTopProducts(t?.data || t || []);

      console.log("🔥 SUMMARY:", s);
      console.log("🔥 REVENUE:", r);
      console.log("🔥 ORDERS:", o);

      // ✅ FIX CHUẨN Ở ĐÂY
      setStats(s?.data || s || {});

      setRevenue(
        ((r?.data || r) || []).map((item) => ({
          month: `Tháng ${item.month}`,
          total: Number(item.revenue || 0),
        }))
      );

      setOrdersSummary((o?.data || o) || {});
    } catch (err) {
      console.error("❌ LOAD DATA ERROR:", err);
    }
  };

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold">👋 Xin chào, Admin</h1>
        <p className="text-sm opacity-90">
          Dashboard - Quản lý hệ thống cửa hàng
        </p>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="p-5 rounded-xl bg-blue-500 text-white">
          📦 Tổng đơn: {stats.totalOrders || 0}
        </div>

        <div className="p-5 rounded-xl bg-purple-500 text-white">
          💳 Đã xác nhận: {stats.paidOrders || 0}
        </div>

        <div className="p-5 rounded-xl bg-green-500 text-white">
          ✅ Hoàn thành: {stats.completedOrders || 0}
        </div>

        <div className="p-5 rounded-xl bg-red-500 text-white">
          💰 {formatCurrency(stats.totalRevenue)}
        </div>

        <div className="p-5 rounded-xl bg-indigo-500 text-white">
  👤 Users: {stats.totalUsers || 0}
</div>

<div className="p-5 rounded-xl bg-yellow-500 text-white">
  ⏳ Pending: {stats.pendingOrders || 0}
</div>
      </div>

      {/* CHART DOANH THU */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-bold mb-4">📈 Doanh thu theo ngày</h2>

        {revenue.length === 0 ? (
          <p className="text-gray-400 text-center">
            Không có dữ liệu
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value) =>
                  `${Number(value).toLocaleString()}đ`
                }
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#ef4444"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* TỔNG QUAN ĐƠN HÀNG */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-bold mb-4">📦 Tổng quan trạng thái đơn hàng</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl bg-slate-100 p-4">Tổng đơn: {ordersSummary.total || 0}</div>
          <div className="rounded-xl bg-yellow-100 p-4">Pending: {ordersSummary.pending || 0}</div>
          <div className="rounded-xl bg-green-100 p-4">Completed: {ordersSummary.completed || 0}</div>
          <div className="rounded-xl bg-red-100 p-4">Cancelled: {ordersSummary.cancelled || 0}</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
  <h2 className="font-bold mb-4">🔥 Sản phẩm bán chạy</h2>

  {topProducts.length === 0 ? (
    <p className="text-gray-400">Không có dữ liệu</p>
  ) : (
    topProducts.map((p, i) => (
      <div key={i} className="flex justify-between border-b py-2">
        <span>{p.name}</span>
        <span>{p.sold} đã bán</span>
      </div>
    ))
  )}
</div>

      {/* ORDERS LIST */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-bold mb-4">🧾 Đơn hàng mới</h2>

        {(stats.latestOrders || []).length === 0 ? (
          <p className="text-gray-400 text-center">
            Không có đơn hàng
          </p>
        ) : (
          stats.latestOrders.map((o) => (
            <div
              key={o.id}
              className="flex justify-between border-b py-2"
            >
              <div>
                <b>{o.code}</b>
                <p className="text-sm text-gray-500">
                  {o.customerName}
                </p>
              </div>

              <div>{formatCurrency(o.total)}</div>
              <div>{o.status}</div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}