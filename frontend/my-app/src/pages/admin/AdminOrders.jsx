import { useEffect, useState } from "react";
import { adminAPI } from "../../services/api";

const statusOptions = [
  { value: "confirmed", label: "Confirmed" },
  { value: "shipping", label: "Shipping" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await adminAPI.getOrders();

      console.log("Orders API:", res.data);

      // 🔥 FIX QUAN TRỌNG
      setOrders(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await adminAPI.updateOrderStatus(id, { status });
      fetchOrders();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId("");
    }
  };

  if (loading) {
    return <div className="text-gray-500">Đang tải đơn hàng...</div>;
  }

  return (
    <div className="p-6 space-y-6">

      <div>
        <h1 className="text-3xl font-bold text-red-600">
          📦 Quản lý đơn hàng
        </h1>
        <p className="text-gray-500">
          Cập nhật trạng thái đơn hàng
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-red-100 overflow-hidden">

        <table className="w-full text-center">

          <thead className="bg-red-500 text-white">
            <tr>
              <th className="p-4">Mã đơn</th>
              <th>Khách hàng</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Đổi trạng thái</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => {
              const id = o.id || o._id;

              return (
                <tr key={id} className="border-t hover:bg-red-50 transition">
                  <td className="p-4 font-medium text-gray-800">
                    {o.code || id}
                  </td>

                  <td className="text-gray-600">
                    {o.customerName || "Khách"}
                  </td>

                  <td className="text-red-600 font-semibold">
                    {Number(o.total || 0).toLocaleString()}đ
                  </td>

                  <td>
                    <span className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-600">
                      {o.status}
                    </span>
                  </td>

                  <td>
                    <select
                      value={o.status}
                      onChange={(e) =>
                        handleChangeStatus(id, e.target.value)
                      }
                      disabled={updatingId == id}
                      className="border border-red-300 rounded-lg px-3 py-2"
                    >
                      {statusOptions.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>

        </table>

        {orders.length === 0 && (
          <div className="p-6 text-gray-400 text-center">
            Không có đơn hàng
          </div>
        )}
      </div>
    </div>
  );
}