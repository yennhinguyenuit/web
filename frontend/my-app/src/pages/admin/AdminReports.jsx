import { useCallback, useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";
import { statsAPI } from "../../services/api";

const defaultSummary = {
  totalRevenue: 0,
  totalOrders: 0,
  paidOrders: 0,
  deliveredOrders: 0,
};

export default function AdminReports() {
  const [revenue, setRevenue] = useState([]);
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(defaultSummary);

  const loadData = useCallback(async () => {
    try {
      const r = await statsAPI.getRevenue();
      const o = await statsAPI.getOrders();
      const s = await statsAPI.getSummary();

      setRevenue(r.data?.data || []);
      setOrders(o.data?.data || []);
      setSummary(s.data?.data || defaultSummary);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-8">
      {/* SUMMARY */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

  <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
    <p className="flex items-center gap-2 text-lg font-semibold text-neutral-600">
      Tổng doanh thu
    </p>
    <h2 className="text-2xl font-bold mt-2 text-neutral-950">
      {summary.totalRevenue.toLocaleString()}đ
    </h2>
  </div>

  <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
    <p className="flex items-center gap-2 text-lg font-semibold text-neutral-600">
      Tổng đơn hàng
    </p>
    <h2 className="text-2xl font-bold mt-2 text-neutral-950">
      {summary.totalOrders}
    </h2>
  </div>

  <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
    <p className="flex items-center gap-2 text-lg font-semibold text-neutral-600">
      Đã thanh toán
    </p>
    <h2 className="text-2xl font-bold mt-2 text-neutral-950">
      {summary.paidOrders}
    </h2>
  </div>

  <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
    <p className="flex items-center gap-2 text-lg font-semibold text-neutral-600">
      Đơn hoàn thành
    </p>
    <h2 className="text-2xl font-bold mt-2 text-neutral-950">
      {summary.deliveredOrders}
    </h2>
  </div>

</div>

      {/* DOANH THU */}
      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 bg-neutral-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-neutral-950">
            Doanh thu
          </h2>
        </div>

        <ResponsiveContainer width="100%" height={300} className="p-6">
          <LineChart data={revenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line dataKey="total" stroke="#111827" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ĐƠN HÀNG */}
      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 bg-neutral-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-neutral-950">
            Tổng đơn hàng
          </h2>
        </div>

        <ResponsiveContainer width="100%" height={300} className="p-6">
          <BarChart data={orders}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#111827" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
