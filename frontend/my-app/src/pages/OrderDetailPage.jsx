import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(res => {
        if (res.data.success) {
          setOrder(res.data.data);
        }
      });
  }, [id]);

  if (!order) return <p>Loading...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h1>Chi tiết đơn</h1>

      <p>ID: {order.id}</p>
      <p>Status: {order.status}</p>
      <p>Total: {order.total}</p>

      <h3>Sản phẩm:</h3>
      {order.items.map(item => (
        <div key={item.product.id}>
          <p>{item.product.name}</p>
          <p>Số lượng: {item.quantity}</p>
        </div>
      ))}
    </div>
  );
}