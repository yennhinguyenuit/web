import { useCallback, useEffect, useState } from "react";

export default function FlashSalePage() {
  const [sales, setSales] = useState([]);
  const [form, setForm] = useState({
    name: "",
    discount: "",
    start: "",
    end: ""
  });

  const fetchSales = useCallback(async () => {
    const res = await fetch("http://localhost:5000/api/flash-sale/active");
    const data = await res.json();
    if (data.data) setSales([data.data]);
  }, []);

  // LOAD LIST
  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  // CREATE
  const handleCreate = async () => {
    await fetch("http://localhost:5000/api/flash-sale", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        name: form.name,
        discount_percent: Number(form.discount),
        start_date: form.start,
        end_date: form.end
      })
    });

    fetchSales();
  };

  // DELETE
  const handleDelete = async (id) => {
    await fetch(`http://localhost:5000/api/flash-sale/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    fetchSales();
  };

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">⚡ Flash Sale Admin</h1>

      {/* FORM */}
      <div className="bg-white p-4 rounded shadow space-y-3">
        <input
          placeholder="Tên"
          className="border p-2 w-full"
          onChange={(e)=>setForm({...form,name:e.target.value})}
        />

        <input
          placeholder="% giảm"
          className="border p-2 w-full"
          onChange={(e)=>setForm({...form,discount:e.target.value})}
        />

        <input
          type="datetime-local"
          className="border p-2 w-full"
          onChange={(e)=>setForm({...form,start:e.target.value})}
        />

        <input
          type="datetime-local"
          className="border p-2 w-full"
          onChange={(e)=>setForm({...form,end:e.target.value})}
        />

        <button
          onClick={handleCreate}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Tạo Flash Sale
        </button>
      </div>

      {/* LIST */}
      <div className="grid md:grid-cols-2 gap-4">
        {sales.map(s => (
          <div key={s.id} className="bg-white p-4 rounded shadow">

            <h2 className="font-bold">{s.name}</h2>

            <p>Giảm: {s.discount_percent}%</p>
            <p>End: {new Date(s.end_date).toLocaleString()}</p>

            <button
              onClick={()=>handleDelete(s.id)}
              className="mt-2 bg-red-500 text-white px-3 py-1 rounded"
            >
              Xóa
            </button>

          </div>
        ))}
      </div>

    </div>
  );
}
