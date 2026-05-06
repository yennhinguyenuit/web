import { useCallback, useEffect, useState } from "react";
import { couponAPI } from "../../services/api";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    discountType: "percent",
    discountValue: "",
    minOrderValue: "",
    maxDiscount: "",
    usageLimit: "",
    perUserLimit: "",
    startAt: "",
    endAt: "",
    isActive: true,
  });

  // LOAD LIST
  const fetchCoupons = useCallback(async () => {
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
      alert("Lỗi tải danh sách coupon");
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // HANDLE INPUT
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    setForm({ ...form, isActive: e.target.checked });
  };

  // CREATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!form.code.trim()) {
      alert("Mã coupon là bắt buộc");
      return;
    }
    if (!form.name.trim()) {
      alert("Tên coupon là bắt buộc");
      return;
    }
    if (!form.discountValue) {
      alert("Giá trị giảm giá là bắt buộc");
      return;
    }

    if (form.startAt && form.endAt) {
      if (form.endAt <= form.startAt) {
        alert("Ngày kết thúc phải lớn hơn ngày bắt đầu");
        return;
      }
    }

    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        description: form.description.trim() || null,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : 0,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        perUserLimit: form.perUserLimit ? Number(form.perUserLimit) : null,
        startAt: form.startAt || null,
        endAt: form.endAt || null,
        isActive: form.isActive,
      };

      console.log("🔥 CREATE PAYLOAD:", payload);

      const res = await couponAPI.createCoupon(payload);
      console.log("✅ CREATE SUCCESS:", res.data);

      alert("✅ Tạo coupon thành công");
      await fetchCoupons();

      // reset form
      setForm({
        code: "",
        name: "",
        description: "",
        discountType: "percent",
        discountValue: "",
        minOrderValue: "",
        maxDiscount: "",
        usageLimit: "",
        perUserLimit: "",
        startAt: "",
        endAt: "",
        isActive: true,
      });

    } catch (err) {
      console.error("❌ CREATE ERROR:", err);

      const errorMessage = err?.data?.message || err?.message || "Lỗi khi tạo coupon";
      alert(`❌ ${errorMessage}`);
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa coupon này?")) return;

    try {
      await couponAPI.deleteCoupon(id);
      alert("✅ Xóa coupon thành công");
      await fetchCoupons();
    } catch (err) {
      console.error("❌ DELETE ERROR:", err);
      alert("❌ Lỗi khi xóa coupon");
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
        className="bg-white p-6 rounded-xl shadow space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="code"
            value={form.code}
            onChange={handleChange}
            placeholder="Mã coupon (VD: SALE50)"
            className="border p-2 rounded"
            required
          />

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Tên coupon"
            className="border p-2 rounded"
            required
          />

          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Mô tả (tùy chọn)"
            className="border p-2 rounded"
          />

          <select
            name="discountType"
            value={form.discountType}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="percent">Giảm giá theo %</option>
            <option value="fixed">Giảm giá cố định (đ)</option>
          </select>

          <input
            name="discountValue"
            type="number"
            value={form.discountValue}
            onChange={handleChange}
            placeholder="Giá trị giảm giá"
            className="border p-2 rounded"
            required
            min="0"
          />

          <input
            name="minOrderValue"
            type="number"
            value={form.minOrderValue}
            onChange={handleChange}
            placeholder="Giá trị đơn hàng tối thiểu"
            className="border p-2 rounded"
            min="0"
          />

          <input
            name="maxDiscount"
            type="number"
            value={form.maxDiscount}
            onChange={handleChange}
            placeholder="Giảm giá tối đa (khi %)"
            className="border p-2 rounded"
            min="0"
          />

          <input
            name="usageLimit"
            type="number"
            value={form.usageLimit}
            onChange={handleChange}
            placeholder="Giới hạn sử dụng toàn bộ"
            className="border p-2 rounded"
            min="0"
          />

          <input
            name="perUserLimit"
            type="number"
            value={form.perUserLimit}
            onChange={handleChange}
            placeholder="Giới hạn / người"
            className="border p-2 rounded"
            min="0"
          />

          <input
            name="startAt"
            type="datetime-local"
            value={form.startAt}
            onChange={handleChange}
            placeholder="Ngày bắt đầu"
            className="border p-2 rounded"
          />

          <input
            name="endAt"
            type="datetime-local"
            value={form.endAt}
            onChange={handleChange}
            placeholder="Ngày kết thúc"
            className="border p-2 rounded"
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleCheckboxChange}
              className="w-5 h-5"
            />
            <label>Kích hoạt ngay</label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-red-500 text-white py-2 rounded font-semibold hover:bg-red-600"
        >
          ➕ Tạo Coupon
        </button>
      </form>

      {/* LIST */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-bold mb-4 text-lg">📋 Danh sách Coupon</h2>

        {loading ? (
          <p>Đang tải...</p>
        ) : coupons.length === 0 ? (
          <p className="text-gray-500">Không có dữ liệu</p>
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
