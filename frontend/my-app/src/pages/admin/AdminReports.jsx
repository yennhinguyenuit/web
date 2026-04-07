import { useEffect, useState } from "react";
import api from "../../services/api";

export default function AdminReports() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/orders")
      .then(res => setOrders(res.data.data));
  }, []);

  const total = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div style={{ padding: 20 }}>
      <h1>Báo cáo</h1>

      <p>Tổng doanh thu: {total}đ</p>
      <p>Số đơn: {orders.length}</p>
    </div>
  );
}