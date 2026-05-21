import logo from '../assets/logo-new.png';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const catalogLinks = [
  { to: '/shop', label: 'Tất cả sản phẩm' },
  { to: '/men', label: 'Thời trang nam' },
  { to: '/women', label: 'Thời trang nữ' },
  { to: '/accessories', label: 'Phụ kiện' },
  { to: '/shoes', label: 'Giày dép' },
];

const pageLinks = [
  { to: '/reviews', label: 'Đánh giá' },
  { to: '/faq', label: 'FAQ' },
  { to: '/size-guide', label: 'Bảng size' },
  { to: '/shipping-returns', label: 'Vận chuyển & đổi trả' },
  { to: '/gift-cards', label: 'Thẻ quà tặng' },
  { to: '/loyalty', label: 'Khách hàng thân thiết' },
  { to: '/lookbook', label: 'Lookbook' },
  { to: '/blog', label: 'Blog' },
  { to: '/store-locator', label: 'Cửa hàng' },
  { to: '/partners', label: 'Đối tác' },
];

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 7h15l-1.6 8.4a2 2 0 0 1-2 1.6H8.2a2 2 0 0 1-2-1.7L5 3H2" />
      <path d="M9 21h.01M18 21h.01" />
      <path d="M9 7a3 3 0 0 1 6 0" />
    </svg>
  );
}

function Header() {
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const keyword = search.trim();
    navigate(keyword ? `/shop?search=${encodeURIComponent(keyword)}` : '/shop');
  };

  const getCartCount = () => {
    if (cartCount) return cartCount;
    const local = JSON.parse(localStorage.getItem('cart') || '[]');
    return local.reduce((total, item) => total + Number(item.quantity || 0), 0);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 text-zinc-950 shadow-sm backdrop-blur">
      <div className="bg-zinc-950 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-white">
        Miễn phí vận chuyển cho đơn hàng từ 500.000đ
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link to="/" className="flex items-center gap-3 text-xl font-black tracking-tight text-zinc-950">
          <img src={logo} className="h-10 w-10 rounded-full object-contain ring-1 ring-zinc-200" alt="Luxe Store" />
          <span>Luxe Store</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-zinc-700">
          <Link to="/" className="transition hover:text-black">Trang chủ</Link>
          <Link to="/shop" className="transition hover:text-black">Cửa hàng</Link>
          <Link to="/about" className="transition hover:text-black">Giới thiệu</Link>
          <Link to="/blog" className="transition hover:text-black">Blog</Link>
          <Link to="/contact" className="transition hover:text-black">Liên hệ</Link>
        </nav>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <form onSubmit={handleSearch} className="flex min-w-0 items-center gap-2">
            <input
              placeholder="Tìm sản phẩm..."
              className="h-10 w-full rounded-full border border-zinc-300 bg-white px-4 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-zinc-200 sm:w-52"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button type="submit" className="h-10 rounded-full bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800">
              Tìm
            </button>
          </form>

          <div className="relative flex items-center gap-3">
            {user ? (
              <>
                <Link to="/account" className="hidden max-w-40 truncate text-sm font-semibold text-zinc-700 hover:text-black md:block">
                  {user.name || user.email}
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:border-black hover:text-black"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-zinc-700 hover:text-black">Đăng nhập</Link>
                <Link to="/register" className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-100">Đăng ký</Link>
              </>
            )}

            <Link to="/cart" className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 text-white transition hover:bg-zinc-800" aria-label="Giỏ hàng">
              <CartIcon />
              <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-white px-1 text-center text-xs font-bold text-zinc-950 ring-2 ring-zinc-950">
                {getCartCount()}
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-zinc-300 px-4 text-sm font-bold text-zinc-950 transition hover:bg-zinc-100"
              aria-expanded={menuOpen}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Mục lục
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-12 z-50 w-[min(92vw,420px)] overflow-hidden rounded-lg border border-zinc-200 bg-white text-left shadow-2xl">
                <div className="grid gap-6 p-5 sm:grid-cols-2">
                  <div>
                    <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Danh mục</p>
                    <div className="grid gap-2">
                      {catalogLinks.map((item) => (
                        <Link key={item.label} to={item.to} onClick={closeMenu} className="rounded-md px-3 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-100">
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Trang khác</p>
                    <div className="grid gap-2">
                      {pageLinks.map((item) => (
                        <Link key={item.to} to={item.to} onClick={closeMenu} className="rounded-md px-3 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-100">
                          {item.label}
                        </Link>
                      ))}
                      {user && (
                        <>
                          <Link to="/wishlist" onClick={closeMenu} className="rounded-md px-3 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-100">Yêu thích</Link>
                          <Link to="/account" onClick={closeMenu} className="rounded-md px-3 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-100">Tài khoản</Link>
                          <Link to="/orders" onClick={closeMenu} className="rounded-md px-3 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-100">Đơn hàng</Link>
                        </>
                      )}
                      {user?.role === 'admin' && (
                        <Link to="/admin" onClick={closeMenu} className="rounded-md bg-zinc-950 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-800">
                          Quản trị
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
