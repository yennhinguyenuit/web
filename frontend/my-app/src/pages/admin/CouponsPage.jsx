import { useCallback, useEffect, useState } from "react";
import { couponAPI } from "../../services/api";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    code: "",
    discount: "",
    minOrder: "",
    startDate: "",
    endDate: "",
    status: "active",
  });

  // 🔥 LOAD COUPONS
  const fetchCoupons = useCallback(async () => {
    try {
      const res = await couponAPI.getCoupons();
      setCoupons(res.data || []);
    } catch (err) {
      console.error("Lỗi load coupon", err);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // GET LIST
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await couponAPI.getCoupons();

      const data = res.data;

      if (Array.isArray(data)) setCoupons(data);
      else if (Array.isArray(data.data)) setCoupons(data.data);
      else if (Array.isArray(data.coupons)) setCoupons(data.coupons);
      else setCoupons([]);
    } catch (err) {
      console.error("❌ GET ERROR:", err);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  // HANDLE INPUT
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // CREATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.startDate && form.endDate) {
      if (form.endDate < form.startDate) {
        alert("Ngày kết thúc phải lớn hơn ngày bắt đầu");
        return;
      }
    }

    try {
      const payload = {
        code: form.code.trim(),
        discount: Number(form.discount),

        // gửi cả 2 để chắc chắn backend nhận
        minOrder: Number(form.minOrder || 0),
        min_order: Number(form.minOrder || 0),

        startDate: form.startDate,
        start_date: form.startDate,

        endDate: form.endDate,
        end_date: form.endDate,

        status: form.status,
      };

      console.log("🔥 PAYLOAD:", payload);

      const res = await couponAPI.createCoupon(payload);
      console.log("✅ CREATE:", res.data);

      await fetchCoupons();

      // reset form
      setForm({
        code: "",
        discount: "",
        minOrder: "",
        startDate: "",
        endDate: "",
        status: "active",
      });

    } catch (err) {
      console.error("❌ FULL ERROR:", err);

      if (err.response) {
        console.error("❌ BACKEND:", err.response.data);
        alert(JSON.stringify(err.response.data)); // 🔥 hiện lỗi thật
      } else {
        alert("Không kết nối được server");
      }
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Xóa coupon?")) return;

    try {
      await couponAPI.deleteCoupon(id);
      await fetchCoupons();
    } catch (err) {
      console.error("❌ DELETE ERROR:", err);
    }
  };

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-3xl font-bold text-red-600">
        🎟 Quản lý Coupon
      </h1>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow grid grid-cols-2 gap-4"
      >
        <input
          name="code"
          value={form.code}
          onChange={handleChange}
          placeholder="Code"
          className="border p-2 rounded"
          required
        />

        <input
          name="discount"
          type="number"
          value={form.discount}
          onChange={handleChange}
          placeholder="Discount (%)"
          className="border p-2 rounded"
          required
        />

        <input
          name="minOrder"
          type="number"
          value={form.minOrder}
          onChange={handleChange}
          placeholder="Min Order"
          className="border p-2 rounded"
        />

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <input
          type="date"
          name="startDate"
          value={form.startDate}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <input
          type="date"
          name="endDate"
          value={form.endDate}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <button
          type="submit"
          className="col-span-2 bg-red-500 text-white py-2 rounded"
        >
          ➕ Tạo Coupon
        </button>
      </form>

      {/* LIST */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-bold mb-4">📋 Danh sách Coupon</h2>

        {loading ? (
          <p>Đang tải...</p>
        ) : coupons.length === 0 ? (
          <p>Không có dữ liệu</p>
        ) : (
          coupons.map((c) => (
            <div key={c.id} className="flex justify-between border-b py-2">
              <div>
                <b>{c.code}</b>
                <p>Giảm {c.discount}%</p>
              </div>

              <div>
                {new Date(c.startDate).toLocaleDateString("vi-VN")} →
                {new Date(c.endDate).toLocaleDateString("vi-VN")}
              </div>

              <button onClick={() => handleDelete(c.id)}>
                Xóa
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
