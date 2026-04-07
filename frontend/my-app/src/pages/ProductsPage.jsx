import { useEffect, useState } from "react";
import api from "../services/api";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get("/products")
      .then(res => {
        if (res.data.success) {
          setProducts(res.data.data);
        }
      })
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="p-10 bg-gray-100 min-h-[80vh]">
      <h1 className="text-2xl font-bold mb-6">Products</h1>

      <div className="grid grid-cols-4 gap-6">
        {products.map(p => (
          <div key={p.id} className="bg-white p-4 rounded shadow">
            <img src={p.image} className="h-40 w-full object-cover mb-3" />
            <h3 className="font-semibold">{p.name}</h3>
            <p className="text-red-600 font-bold">{p.price}đ</p>
          </div>
        ))}
      </div>
    </div>
  );
}