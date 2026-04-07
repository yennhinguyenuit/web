import { useEffect, useState } from "react";
import api from "../../services/api";

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get("/orders").then(res => setOrders(res.data.data));
    api.get("/products").then(res => setProducts(res.data.data));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard</h1>

      <p>Tổng đơn hàng: {orders.length}</p>
      <p>Tổng sản phẩm: {products.length}</p>
    </div>
  );
}