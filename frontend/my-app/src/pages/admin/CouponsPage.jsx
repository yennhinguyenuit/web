import { useEffect, useState } from "react";
import { couponAPI } from "../../services/api";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({
    code: "",
    discount: "",
  });

  // 🔥 LOAD COUPONS
  const fetchCoupons = async () => {
    try {
      const res = await couponAPI.getCoupons();
      setCoupons(res.data || []);
    } catch (err) {
      console.error("Lỗi load coupon", err);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // 🔥 ADD COUPON
  const handleAdd = async () => {
    try {
      if (!form.code) return;

      await couponAPI.createCoupon({
        code: form.code,
        discount: Number(form.discount),
      });

      setForm({ code: "", discount: "" });
      fetchCoupons(); // reload
    } catch (err) {
      console.error("Lỗi tạo coupon", err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">🎟️ Quản lý mã giảm giá</h1>

      {/* FORM */}
      <div className="bg-white p-5 rounded-xl shadow space-y-3">
        <h2 className="font-semibold">Tạo mã mới</h2>

        <div className="flex gap-3">
          <input
            placeholder="Code"
            className="border p-2 rounded w-full"
            value={form.code}
            onChange={(e) =>
              setForm({ ...form, code: e.target.value })
            }
          />

          <input
            placeholder="% giảm"
            className="border p-2 rounded w-full"
            value={form.discount}
            onChange={(e) =>
              setForm({ ...form, discount: e.target.value })
            }
          />

          <button
            onClick={handleAdd}
            className="bg-red-500 text-white px-4 rounded"
          >
            Thêm
          </button>
        </div>
      </div>

      {/* LIST */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Code</th>
              <th>Giảm</th>
            </tr>
          </thead>

          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3 font-semibold">{c.code}</td>
                <td>{c.discount}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}