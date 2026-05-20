import { useEffect, useState } from 'react';
import { LayoutDashboard, Package, ShoppingCart, TicketPercent, Users, Zap } from 'lucide-react';
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-neutral-950 rounded-lg shadow-lg px-8 py-6 text-lg font-medium text-white">
          Đang kiểm tra quyền truy cập...
        </div>
      </div>
    );
  }

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 transition ${
      isActive
        ? 'bg-neutral-950 text-white shadow'
        : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950'
    }`;

  const pageTitle =
    location.pathname === '/admin'
      ? 'Dashboard'
      : location.pathname.includes('/admin/products')
      ? 'Quản lý sản phẩm'
      : location.pathname.includes('/admin/orders')
      ? 'Quản lý đơn hàng'
      : location.pathname.includes('/admin/users') || location.pathname.includes('/admin/customers')
      ? 'Quản lý Users'
      : location.pathname.includes('/admin/coupons')
      ? 'Mã giảm giá'
      : location.pathname.includes('/admin/flash-sale')
      ? 'Flash Sale'
      : 'Admin Panel';

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="w-72 bg-neutral-50 border-r border-neutral-200 shadow-sm p-6 flex flex-col">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-red-600">LUXE ADMIN</h1>
          </div>

          <nav className="space-y-2">
            <NavLink to="/admin" end className={navClass}>
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </NavLink>

            <NavLink to="/admin/products" className={navClass}>
              <Package className="h-5 w-5" />
              <span>Sản phẩm</span>
            </NavLink>

            <NavLink to="/admin/orders" className={navClass}>
              <ShoppingCart className="h-5 w-5" />
              <span>Đơn hàng</span>
            </NavLink>

            <NavLink to="/admin/users" className={navClass}>
              <Users className="h-5 w-5" />
              <span>Quản lý Users</span>
            </NavLink>

            {/* NEW */}
            <NavLink to="/admin/coupons" className={navClass}>
              <TicketPercent className="h-5 w-5" />
              <span>Mã giảm giá</span>
            </NavLink>

            <NavLink to="/admin/flash-sale" className={navClass}>
              <Zap className="h-5 w-5" />
              <span>Flash Sale</span>
            </NavLink>
          </nav>

          {/* USER */}
          <div className="mt-auto pt-6 border-t border-neutral-200">
            <div className="mb-4 rounded-lg border border-neutral-200 bg-white p-4">
              <p className="text-sm text-neutral-500">Đang đăng nhập</p>
              <p className="font-semibold text-neutral-950">{user.name}</p>
              <p className="text-sm text-neutral-500">{user.email}</p>
            </div>

            <button
              onClick={logout}
              className="w-full rounded-xl bg-neutral-950 px-4 py-3 text-white font-medium transition hover:bg-neutral-800"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 bg-neutral-50">
          <header className="bg-neutral-950 border-b border-neutral-900 px-8 py-6 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white">
                {pageTitle}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="rounded-xl border border-white/20 bg-white px-4 py-2 text-neutral-950 transition hover:bg-neutral-100"
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
