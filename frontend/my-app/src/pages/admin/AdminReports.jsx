import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";
import { statsAPI } from "../../services/api";

export default function AdminReports() {
  const [revenue, setRevenue] = useState([]);
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    paidOrders: 0,
    deliveredOrders: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const r = await statsAPI.getRevenue();
      const o = await statsAPI.getOrders();
      const s = await statsAPI.getSummary();

      setRevenue(r.data?.data || []);
      setOrders(o.data?.data || []);
      setSummary(s.data?.data || summary);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">📊 Báo cáo</h1>
        <p className="text-slate-500">📌 Tổng quan doanh thu & đơn hàng</p>
      </div>

      {/* SUMMARY */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

  <div className="rounded-2xl p-5 text-white shadow bg-red-500">
    <p className="flex items-center gap-2 text-lg font-semibold">
      <span className="text-2xl">💰</span>
      Tổng doanh thu
    </p>
    <h2 className="text-2xl font-bold mt-2">
      {summary.totalRevenue.toLocaleString()}đ
    </h2>
  </div>

  <div className="rounded-2xl p-5 text-white shadow bg-blue-500">
    <p className="flex items-center gap-2 text-lg font-semibold">
      <span className="text-2xl">📦</span>
      Tổng đơn hàng
    </p>
    <h2 className="text-2xl font-bold mt-2">
      {summary.totalOrders}
    </h2>
  </div>

  <div className="rounded-2xl p-5 text-white shadow bg-purple-500">
    <p className="flex items-center gap-2 text-lg font-semibold">
      <span className="text-2xl">💳</span>
      Đã thanh toán
    </p>
    <h2 className="text-2xl font-bold mt-2">
      {summary.paidOrders}
    </h2>
  </div>

  <div className="rounded-2xl p-5 text-white shadow bg-green-500">
    <p className="flex items-center gap-2 text-lg font-semibold">
      <span className="text-2xl">✅</span>
      Đơn hoàn thành
    </p>
    <h2 className="text-2xl font-bold mt-2">
      {summary.deliveredOrders}
    </h2>
  </div>

</div>

      {/* DOANH THU */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-lg font-semibold mb-4 text-slate-700">
          📈 Doanh thu
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line dataKey="total" stroke="#ef4444" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ĐƠN HÀNG */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-lg font-semibold mb-4 text-slate-700">
          📦 Tổng đơn hàng
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={orders}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}