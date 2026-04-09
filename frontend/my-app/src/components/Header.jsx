import logo from '../assets/logo-new.png';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

function Header() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cart, cartCount } = useCart();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const keyword = search.trim();
    navigate(keyword ? `/shop?search=${encodeURIComponent(keyword)}` : '/shop');
  };

  // 🔥 fallback offline nếu chưa sync backend
  const getCartCount = () => {
    if (cartCount) return cartCount;

    const local = JSON.parse(localStorage.getItem("cart") || "[]");
    return local.reduce((t, i) => t + i.quantity, 0);
  };

  return (
    <header className="bg-white shadow">
      <div className="bg-red-600 text-white text-center py-2 text-sm">
        MIỄN PHÍ VẬN CHUYỂN CHO ĐƠN HÀNG TRÊN 500.000Đ
      </div>

      <div className="flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-red-600">
          <img src={logo} className="h-9 w-9 object-contain" alt="Logo" />
          <span>LUXE STORE</span>
        </Link>

        {/* NAV */}
        <nav className="flex flex-wrap gap-4 font-medium text-gray-700">
          <Link to="/" className="hover:text-red-600">Home</Link>
          <Link to="/shop" className="hover:text-red-600">Shop</Link>
          <Link to="/about" className="hover:text-red-600">About</Link>
          <Link to="/contact" className="hover:text-red-600">Contact</Link>
          {user && <Link to="/wishlist" className="hover:text-red-600">Wishlist</Link>}
          {user && <Link to="/account" className="hover:text-red-600">Account</Link>}
          {user && <Link to="/orders" className="hover:text-red-600">Orders</Link>}
          {user?.role === 'admin' && <Link to="/admin" className="hover:text-red-600">Admin</Link>}
        </nav>

        {/* SEARCH + USER + CART */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          
          {/* SEARCH */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <input
              placeholder="Search..."
              className="px-4 py-2 border rounded-full text-sm w-full lg:w-48 outline-none"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button type="submit" className="px-3 py-2 border rounded-full text-sm hover:bg-gray-50">
              Tìm
            </button>
          </form>

          {/* USER + CART */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-gray-700 hidden md:block">
                  Hi, {user.name || user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm hover:text-red-600">Login</Link>
                <Link to="/register" className="text-sm hover:text-red-600">Register</Link>
              </>
            )}

            {/* 🛒 CART (STARBUCKS STYLE) */}
            <Link to="/cart">
              <div className="relative text-xl cursor-pointer">
                🛒
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-1 rounded-full min-w-5 text-center">
                  {getCartCount()}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;