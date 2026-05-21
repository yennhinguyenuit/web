import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { productAPI } from '../services/api';
import { useWishlist } from '../hooks/useWishlist';
import ProductCard from '../components/ProductCard';
import FlashSale from '../components/FlashSale';

const categoryOptions = ['Thời Trang Nam', 'Thời Trang Nữ', 'Phụ Kiện', 'Giày Dép'];
const colorOptions = ['Đen', 'Trắng', 'Xám', 'Navy', 'Xanh đậm', 'Xanh nhạt', 'Nâu', 'Be', 'Bạc', 'Vàng', 'Xanh', 'Hồng', 'Đỏ'];
const sizeOptions = ['S', 'M', 'L', 'XL', 'XXL'];
const MAX_PRICE = 2900000;

function FilterDrawer({ open, onClose, filters, setFilters, onReset }) {
  const toggleListValue = (key, value) => {
    setFilters((current) => {
      const exists = current[key].includes(value);
      return {
        ...current,
        [key]: exists ? current[key].filter((item) => item !== value) : [...current[key], value],
      };
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button className="absolute inset-0 bg-black/35" onClick={onClose} aria-label="Đóng bộ lọc" />
      <aside className="absolute right-0 top-0 flex h-full w-[min(486px,100vw)] flex-col overflow-y-auto bg-white shadow-2xl">
        <div className="flex items-center justify-between px-7 py-7">
          <h3 className="text-3xl font-black text-zinc-950">Bộ lọc</h3>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full text-zinc-600 hover:bg-zinc-100" aria-label="Đóng">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-9 px-2 pb-8 sm:px-7">
          <section>
            <h4 className="mb-6 text-2xl font-black text-zinc-950">Danh mục</h4>
            <div className="grid gap-3">
              {categoryOptions.map((category) => (
                <label key={category} className="flex cursor-pointer items-center gap-3 text-xl font-semibold text-zinc-900">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={() => toggleListValue('categories', category)}
                    className="h-6 w-6 rounded-md border-zinc-300 accent-red-600"
                  />
                  {category}
                </label>
              ))}
            </div>
          </section>

          <section>
            <h4 className="mb-6 text-2xl font-black text-zinc-950">Khoảng giá</h4>
            <input
              type="range"
              min="0"
              max={MAX_PRICE}
              step="50000"
              value={filters.maxPrice}
              onChange={(event) => setFilters((current) => ({ ...current, maxPrice: Number(event.target.value) }))}
              className="h-2 w-full accent-red-600"
            />
            <div className="mt-3 flex justify-between text-xl font-medium text-zinc-500">
              <span>0 đ</span>
              <span>{filters.maxPrice.toLocaleString('vi-VN')} đ</span>
            </div>
          </section>

          <section>
            <h4 className="mb-6 text-2xl font-black text-zinc-950">Màu sắc</h4>
            <div className="flex flex-wrap gap-3">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => toggleListValue('colors', color)}
                  className={`rounded-full border px-5 py-2 text-lg font-semibold transition ${
                    filters.colors.includes(color)
                      ? 'border-zinc-950 bg-zinc-950 text-white'
                      : 'border-zinc-300 bg-white text-zinc-800 hover:border-zinc-950'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h4 className="mb-6 text-2xl font-black text-zinc-950">Kích thước</h4>
            <div className="grid grid-cols-5 gap-3">
              {sizeOptions.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleListValue('sizes', size)}
                  className={`h-14 rounded-lg border text-xl font-semibold transition ${
                    filters.sizes.includes(size)
                      ? 'border-zinc-950 bg-zinc-950 text-white'
                      : 'border-zinc-300 bg-white text-zinc-800 hover:border-zinc-950'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 mt-auto grid grid-cols-2 gap-3 border-t border-zinc-200 bg-white p-4">
          <button type="button" onClick={onReset} className="h-12 rounded-md border border-zinc-300 font-bold text-zinc-900 hover:bg-zinc-100">
            Xóa lọc
          </button>
          <button type="button" onClick={onClose} className="h-12 rounded-md bg-zinc-950 font-bold text-white hover:bg-zinc-800">
            Áp dụng
          </button>
        </div>
      </aside>
    </div>
  );
}

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    categories: [],
    colors: [],
    sizes: [],
    maxPrice: MAX_PRICE,
  });

  const { isWishlisted, toggleWishlist } = useWishlist();

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const res = await productAPI.getProducts({
          category: filters.categories[0] || '',
          maxPrice: filters.maxPrice < MAX_PRICE ? filters.maxPrice : '',
          sort: 'newest',
          limit: 12,
        });

        setProducts(res.data?.items || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [filters.categories, filters.maxPrice]);

  const visibleProducts = useMemo(() => {
    return products
      .filter((product) => {
        if (!filters.colors.length) return true;
        return product.colors?.some((color) => filters.colors.includes(color));
      })
      .filter((product) => {
        if (!filters.sizes.length) return true;
        return product.sizes?.some((size) => filters.sizes.includes(size));
      })
      .slice(0, 4);
  }, [products, filters.colors, filters.sizes]);

  const activeFilterCount = filters.categories.length + filters.colors.length + filters.sizes.length + (filters.maxPrice < MAX_PRICE ? 1 : 0);
  const resetFilters = () => setFilters({ categories: [], colors: [], sizes: [], maxPrice: MAX_PRICE });

  return (
    <div className="bg-white text-stone-900">
      <FilterDrawer open={filterOpen} onClose={() => setFilterOpen(false)} filters={filters} setFilters={setFilters} onReset={resetFilters} />

      <section className="relative min-h-[620px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1800&q=85"
          className="absolute inset-0 h-full w-full object-cover"
          alt="Bộ sưu tập thời trang Luxe Store"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/75 via-stone-950/35 to-transparent" />

        <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl text-white">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.28em] text-zinc-200">Luxe Store Collection</p>
            <h1 className="text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Thời trang tối giản, mặc đẹp mỗi ngày
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-stone-100">
              Khám phá những thiết kế dễ phối, chất liệu thoải mái và form dáng tinh gọn cho nhịp sống hiện đại.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="rounded-full bg-zinc-950 px-7 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-zinc-950/20 transition hover:bg-zinc-800">
                Mua sắm ngay
              </Link>
              <Link to="/about" className="rounded-full border border-white/40 px-7 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-white hover:text-stone-950">
                Về Luxe Store
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-stone-200 bg-stone-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-7 text-center sm:grid-cols-3 sm:px-6 lg:px-8">
          <div><p className="text-2xl font-black">15.000+</p><p className="mt-1 text-sm text-stone-300">Khách hàng tin chọn</p></div>
          <div><p className="text-2xl font-black">4.9/5</p><p className="mt-1 text-sm text-stone-300">Đánh giá trung bình</p></div>
          <div><p className="text-2xl font-black">98%</p><p className="mt-1 text-sm text-stone-300">Hài lòng sau mua</p></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <FlashSale />
      </section>

      <section className="bg-stone-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-zinc-950">Gợi ý hôm nay</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-stone-950 sm:text-4xl">Sản phẩm nổi bật</h2>
              <p className="mt-3 max-w-2xl text-stone-600">Chọn nhanh món bạn thích rồi thêm vào giỏ hoặc mua ngay.</p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFilterOpen(true)}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-zinc-300 bg-white px-5 text-sm font-bold text-zinc-950 shadow-sm transition hover:border-zinc-950"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 5h18M6 12h12M10 19h4" />
                </svg>
                Bộ lọc{activeFilterCount ? ` (${activeFilterCount})` : ''}
              </button>
              <Link to="/shop" className="inline-flex h-11 items-center rounded-full border border-stone-300 px-5 text-sm font-bold text-stone-800 transition hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-950">
                Xem tất cả
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => <div key={item} className="h-[430px] animate-pulse rounded-lg bg-white shadow-sm" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} liked={isWishlisted(product.id)} onToggleWishlist={toggleWishlist} />
              ))}
            </div>
          )}

          {!loading && !visibleProducts.length && (
            <div className="rounded-lg border border-dashed border-stone-300 bg-white p-10 text-center text-stone-600">
              Không có sản phẩm phù hợp với bộ lọc hiện tại.
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.15fr] lg:px-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-zinc-950">Cam kết</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-stone-950 sm:text-4xl">Trải nghiệm mua sắm gọn, nhanh, đáng tin</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ['Đổi trả dễ dàng', 'Hỗ trợ đổi size và đổi màu theo chính sách cửa hàng.'],
            ['Thanh toán an toàn', 'Quy trình thanh toán rõ ràng, theo dõi đơn hàng thuận tiện.'],
            ['Tư vấn tận tâm', 'Đội ngũ hỗ trợ chọn size, phối đồ và xử lý đơn nhanh.'],
          ].map(([title, desc]) => (
            <div key={title} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
              <h3 className="font-bold text-stone-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-stone-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
