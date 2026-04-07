import { useEffect, useState } from "react";
import api from "../../services/api";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    api.get("/orders")
      .then(res => {
        if (res.data.success) {
          const list = res.data.data.map(o => o.shippingAddress);
          setCustomers(list);
        }
      });
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Khách hàng</h1>

      {customers.map((c, i) => (
        <div key={i}>
          <p>{c.name}</p>
          <p>{c.phone}</p>
        </div>
      ))}
    </div>
  );
}