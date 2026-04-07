import { useEffect, useState } from "react";
import api from "../../services/api";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/orders")
      .then(res => {
        if (res.data.success) {
          setOrders(res.data.data);
        }
      });
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Quản lý đơn hàng</h1>

      {orders.map(o => (
        <div key={o.id} style={{ borderBottom: "1px solid #ccc", padding: 10 }}>
          <p>Mã: {o.id}</p>
          <p>Tổng: {o.total}đ</p>
          <p>Trạng thái: {o.status}</p>
        </div>
      ))}
    </div>
  );
}