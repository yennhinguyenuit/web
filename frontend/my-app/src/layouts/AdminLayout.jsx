import { useEffect, useState } from "react";
import { useNavigate, Outlet, Link } from "react-router-dom";
import api from "../services/api";

function AdminLayout() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/auth/me")
      .then(res => {
        if (res.data.success) {
          const u = res.data.data;

          // 👉 check role admin
          if (u.role !== "admin") {
            navigate("/");
          } else {
            setUser(u);
          }
        }
      })
      .catch(() => {
        navigate("/login");
      });
  }, []);

  if (!user) {
    return <h2 style={{ padding: 40 }}>Đang kiểm tra quyền...</h2>;
  }

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={{ display: "flex" }}>

      {/* SIDEBAR */}
      <div style={{
        width: 200,
        background: "#eee",
        padding: 20,
        minHeight: "100vh"
      }}>
        <h3>Admin</h3>

        <p><Link to="/admin">Dashboard</Link></p>
        <p><Link to="/admin/products">Products</Link></p>
        <p><Link to="/admin/orders">Orders</Link></p>

        <hr />

        <p>{user.name}</p>
        <button onClick={logout}>Logout</button>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, padding: 20 }}>
        <Outlet />
      </div>

    </div>
  );
}

export default AdminLayout;