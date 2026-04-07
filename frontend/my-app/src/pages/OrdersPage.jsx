import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function OrdersPage() {
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
    <div style={{ padding: 40 }}>
      <h1>Đơn hàng</h1>

      {orders.length === 0 ? (
        <p>Chưa có đơn</p>
      ) : (
        orders.map(o => (
          <div key={o.id}>
            <p>ID: {o.id}</p>
            <p>Total: {o.total}</p>
            <p>Status: {o.status}</p>

            <Link to={`/orders/${o.id}`}>
              <button>Xem chi tiết</button>
            </Link>

            <hr />
          </div>
        ))
      )}
    </div>
  );
}