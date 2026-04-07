import { useEffect, useState } from "react";
import api from "../../services/api";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get("/products")
      .then(res => {
        if (res.data.success) {
          setProducts(res.data.data);
        }
      });
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Quản lý sản phẩm</h1>

      {products.map(p => (
        <div key={p.id} style={{ borderBottom: "1px solid #ccc", padding: 10 }}>
          <h3>{p.name}</h3>
          <p>{p.price}đ</p>
          <p>Tồn kho: {p.stock}</p>
        </div>
      ))}
    </div>
  );
}