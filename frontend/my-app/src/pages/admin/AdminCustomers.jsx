import { useEffect, useState } from "react";
import { userAPI } from "../../services/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await userAPI.getUsers();

      // 🔥 FIX QUAN TRỌNG: đọc đúng data từ API
      console.log("Users API:", res.data);

      setUsers(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa user này?")) return;

    try {
      await userAPI.deleteUser(id);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-gray-500">Đang tải users...</div>;
  }

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-red-600">
          👤 Quản lý Users
        </h1>
        <p className="text-gray-500">
          Danh sách người dùng hệ thống
        </p>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-red-100">

        <table className="w-full text-center">

          {/* HEAD */}
          <thead className="bg-red-500 text-white">
            <tr>
              <th className="p-4">Tên</th>
              <th>Email</th>
              <th>Role</th>
              <th>Delete</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id || u._id} // 🔥 fix luôn Mongo case
                className="border-t hover:bg-red-50 transition"
              >
                {/* NAME */}
                <td className="p-4 font-medium text-gray-800">
                  {u.name}
                </td>

                {/* EMAIL */}
                <td className="text-gray-600">
                  {u.email}
                </td>

                {/* ROLE */}
                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      u.role?.name === "admin"
                        ? "bg-red-100 text-red-600"
                        : "bg-pink-100 text-pink-600"
                    }`}
                  >
                    {u.role?.name || "user"}
                  </span>
                </td>

                {/* DELETE */}
                <td>
                  <button
                    onClick={() => handleDelete(u.id || u._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 hover:scale-105 transition"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>

        {/* EMPTY */}
        {users.length === 0 && (
          <div className="p-6 text-gray-400 text-center">
            Không có user
          </div>
        )}
      </div>

    </div>
  );
}