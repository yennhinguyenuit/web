import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

function AdminLayout() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    authAPI
      .getMe()
      .then((res) => {
        const currentUser = res.data;
        if (currentUser.role !== 'admin') {
          navigate('/');
          return;
        }
        setUser(currentUser);
      })
      .catch(() => {
        navigate('/login');
      });
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg px-8 py-6 text-lg font-medium text-slate-700">
          Đang kiểm tra quyền truy cập...
        </div>
      </div>
    );
  }

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 transition ${
      isActive
        ? 'bg-red-600 text-white shadow'
        : 'text-slate-700 hover:bg-red-50 hover:text-red-600'
    }`;

  const pageTitle =
    location.pathname === '/admin'
      ? 'Dashboard'
      : location.pathname.includes('/admin/products')
      ? 'Quản lý sản phẩm'
      : location.pathname.includes('/admin/orders')
      ? 'Quản lý đơn hàng'
      : location.pathname.includes('/admin/customers')
      ? 'Khách hàng'
      : location.pathname.includes('/admin/reports')
      ? 'Báo cáo'
      : 'Admin Panel';

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <aside className="w-72 bg-white border-r border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="mb-8">
            <p className="text-sm text-slate-500">Trang quản trị</p>
            <h1 className="text-2xl font-bold text-red-600">LUXE ADMIN</h1>
          </div>

          <nav className="space-y-2">
            <NavLink to="/admin" end className={navClass}>
              <span>📊</span>
              <span>Dashboard</span>
            </NavLink>

            <NavLink to="/admin/products" className={navClass}>
              <span>🛍️</span>
              <span>Sản phẩm</span>
            </NavLink>

            <NavLink to="/admin/orders" className={navClass}>
              <span>📦</span>
              <span>Đơn hàng</span>
            </NavLink>

            <NavLink to="/admin/customers" className={navClass}>
              <span>👤</span>
              <span>Khách hàng</span>
            </NavLink>

            <NavLink to="/admin/reports" className={navClass}>
              <span>📈</span>
              <span>Báo cáo</span>
            </NavLink>
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-200">
            <div className="mb-4 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Đang đăng nhập</p>
              <p className="font-semibold text-slate-800">{user.name}</p>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>

            <button
              onClick={logout}
              className="w-full rounded-xl bg-red-600 px-4 py-3 text-white font-medium hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </aside>

        <main className="flex-1">
          <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{pageTitle}</h2>
              <p className="text-sm text-slate-500">Quản lý hệ thống cửa hàng</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="rounded-xl border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
              >
                Về trang chủ
              </button>
            </div>
          </header>

          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;