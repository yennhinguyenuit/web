import { useCallback, useEffect, useState } from "react";
import { flashSaleAPI, productAPI } from "../../services/api";

const FLASH_SALE_STATUS_LABELS = {
  running: "Dang chay",
  scheduled: "Sap dien ra",
  ended: "Da ket thuc",
  inactive: "Da tat",
};

export default function FlashSalePage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    name: "",
    discount_percent: "",
    start_date: "",
    end_date: "",
    productIds: [],
  });

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // LOAD FLASH SALES
  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const res = await flashSaleAPI.getFlashSales();
      const data = Array.isArray(res?.data)
        ? res.data
        : res?.data
          ? [res.data]
          : [];
      setSales(data);
    } catch (err) {
      console.error("❌ FETCH SALES ERROR:", err);
      alert("Lỗi tải flash sale");
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // LOAD PRODUCTS
  useEffect(() => {
    const loadProducts = async () => {
      setProductsLoading(true);
      try {
        const res = await productAPI.getProducts({ limit: 100 });
        setProducts(res?.data?.items || []);
      } catch (err) {
        console.error("❌ FETCH PRODUCTS ERROR:", err);
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };
    loadProducts();
  }, []);

  // INITIAL LOAD
  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  // CREATE FLASH SALE
  const handleCreate = async () => {
    // Validate
    if (!form.name.trim()) {
      alert("Tên flash sale là bắt buộc");
      return;
    }
    if (!form.discount_percent) {
      alert("Tỷ lệ giảm giá là bắt buộc");
      return;
    }
    if (!form.start_date || !form.end_date) {
      alert("Ngày bắt đầu và ngày kết thúc là bắt buộc");
      return;
    }
    if (new Date(form.end_date) <= new Date(form.start_date)) {
      alert("Ngày kết thúc phải lớn hơn ngày bắt đầu");
      return;
    }
    if (form.productIds.length === 0) {
      alert("Vui lòng chọn ít nhất 1 sản phẩm");
      return;
    }

    setCreating(true);
    try {
      const payload = {
        name: form.name.trim(),
        discount_percent: Number(form.discount_percent),
        start_date: form.start_date,
        end_date: form.end_date,
        productIds: form.productIds,
      };

      console.log("🔥 CREATE PAYLOAD:", payload);

      const res = await flashSaleAPI.createFlashSale(payload);
      console.log("✅ CREATE SUCCESS:", res.data);

      alert("✅ Tạo flash sale thành công");

      // Reset form
      setForm({
        name: "",
        discount_percent: "",
        start_date: "",
        end_date: "",
        productIds: [],
      });

      // Reload list
      await fetchSales();

    } catch (err) {
      console.error("❌ CREATE ERROR:", err);
      const errorMessage = err?.data?.message || err?.message || "Lỗi khi tạo flash sale";
      alert(`❌ ${errorMessage}`);
    } finally {
      setCreating(false);
    }
  };

  // DELETE FLASH SALE
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa flash sale này?")) return;

    try {
      await flashSaleAPI.deleteFlashSale(id);
      alert("✅ Xóa flash sale thành công");
      await fetchSales();
    } catch (err) {
      console.error("❌ DELETE ERROR:", err);
      alert("❌ Lỗi khi xóa flash sale");
    }
  };

  // TOGGLE PRODUCT SELECTION
  const toggleProductSelection = (productId) => {
    setForm((prev) => {
      const exists = prev.productIds.includes(productId);
      return {
        ...prev,
        productIds: exists
          ? prev.productIds.filter((id) => id !== productId)
          : [...prev.productIds, productId],
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* FORM */}
      <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm space-y-3">
        <input
          placeholder="Tên flash sale"
          className="border border-neutral-300 p-2 w-full rounded focus:border-neutral-950 focus:outline-none"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="% giảm giá (VD: 30)"
          type="number"
          className="border border-neutral-300 p-2 w-full rounded focus:border-neutral-950 focus:outline-none"
          value={form.discount_percent}
          onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
          min="0"
          max="100"
        />

        <div>
          <label className="text-sm font-semibold text-neutral-700">Ngày bắt đầu</label>
          <input
            type="datetime-local"
            className="border border-neutral-300 p-2 w-full rounded mt-1 focus:border-neutral-950 focus:outline-none"
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-neutral-700">Ngày kết thúc</label>
          <input
            type="datetime-local"
            className="border border-neutral-300 p-2 w-full rounded mt-1 focus:border-neutral-950 focus:outline-none"
            value={form.end_date}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
          />
        </div>

        <div>
          <p className="font-semibold mb-2 text-neutral-950">Chọn sản phẩm ({form.productIds.length} đã chọn)</p>
          <div className="max-h-48 overflow-auto border border-neutral-200 rounded p-2 space-y-1 bg-neutral-50">
            {productsLoading ? (
              <p className="text-neutral-500">Đang tải sản phẩm...</p>
            ) : products.length === 0 ? (
              <p className="text-neutral-500">Không có sản phẩm</p>
            ) : (
              products.map((p) => (
                <label key={p.id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded">
                  <input
                    type="checkbox"
                    checked={form.productIds.includes(p.id)}
                    onChange={() => toggleProductSelection(p.id)}
                    className="w-4 h-4"
                  />
                  <span className="flex-1">{p.name}</span>
                </label>
              ))
            )}
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={creating}
          className="w-full bg-neutral-950 text-white px-4 py-2 rounded font-semibold hover:bg-neutral-800 disabled:opacity-50"
        >
          {creating ? "Đang tạo..." : "Tạo Flash Sale"}
        </button>
      </div>

      {/* LIST */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
        <div className="border-b border-neutral-200 bg-neutral-100 px-6 py-4">
          <h2 className="font-bold text-lg text-neutral-950">Flash Sale Đang Chạy</h2>
        </div>

        {loading ? (
          <p className="p-6 text-neutral-500">Đang tải...</p>
        ) : sales.length === 0 ? (
          <p className="p-6 text-neutral-500">Không có flash sale nào</p>
        ) : (
          <div className="grid gap-4 p-6 md:grid-cols-2">
            {sales.map((s) => (
              <div key={s.id} className="border border-neutral-200 rounded-lg p-4 bg-white shadow-sm">
                <h2 className="font-bold text-lg text-neutral-950">{s.name}</h2>

                <p className="text-sm text-neutral-600 mt-2">
                  <strong>Trang thai:</strong> {FLASH_SALE_STATUS_LABELS[s.status] || s.status || "Khong ro"}
                </p>

                <p className="text-sm text-neutral-600">
                  <strong>Giảm:</strong> {s.discount_percent}%
                </p>

                <p className="text-sm text-neutral-600">
                  <strong>Bắt đầu:</strong> {new Date(s.start_date).toLocaleString("vi-VN")}
                </p>

                <p className="text-sm text-neutral-600">
                  <strong>Kết thúc:</strong> {new Date(s.end_date).toLocaleString("vi-VN")}
                </p>

                <p className="text-sm text-neutral-600">
                  <strong>Sản phẩm:</strong> {s.products?.length || 0} sản phẩm
                </p>

                <button
                  onClick={() => handleDelete(s.id)}
                  className="mt-3 w-full bg-red-600 text-white px-3 py-2 rounded font-semibold hover:bg-red-700"
                >
                  Xóa Flash Sale
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
