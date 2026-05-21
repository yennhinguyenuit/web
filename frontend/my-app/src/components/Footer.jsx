import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-stone-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
        <div>
          <h2 className="text-xl font-black tracking-tight">Luxe Store</h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-stone-300">
            Thời trang dễ mặc, chất liệu chọn lọc và trải nghiệm mua sắm gọn gàng cho mỗi ngày.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-stone-400">Mua sắm</h3>
          <div className="mt-4 grid gap-2 text-sm text-stone-300">
            <Link to="/shop" className="hover:text-white">Cửa hàng</Link>
            <Link to="/wishlist" className="hover:text-white">Yêu thích</Link>
            <Link to="/orders" className="hover:text-white">Đơn hàng</Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-stone-400">Hỗ trợ</h3>
          <div className="mt-4 grid gap-2 text-sm text-stone-300">
            <Link to="/about" className="hover:text-white">Giới thiệu</Link>
            <Link to="/contact" className="hover:text-white">Liên hệ</Link>
            <Link to="/reviews" className="hover:text-white">Đánh giá</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-4 text-center text-sm text-stone-400">
        © 2026 Luxe Store. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
