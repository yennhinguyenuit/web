import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productAPI } from '../services/api';
import { useWishlist } from '../hooks/useWishlist';

export default function ProductsPage({ initialCategory = '', pageTitle = 'Cửa hàng' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState(searchParams.get('search') || '');

  const { isWishlisted, toggleWishlist } = useWishlist();
  const filters = useMemo(() => ({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || initialCategory,
    sort: searchParams.get('sort') || 'newest',
    page: Number(searchParams.get('page') || 1),
    limit: 50,
  }), [searchParams, initialCategory]);

  useEffect(() => {
    productAPI.getCategories()
      .then((res) => {
        setCategories(res.data?.data || res.data || []);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await productAPI.getProducts(filters);

        setProducts(res.data?.items || []);
        setPagination(res.data?.pagination || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);

    if (!value) next.delete(key);
    else next.set(key, value);

    if (key !== 'page') next.set('page', '1');

    setSearchParams(next);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    updateFilter('search', keyword.trim());
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-12">
      <section className="bg-stone-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-zinc-300">Luxe Store</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{pageTitle}</h1>
          <p className="mt-4 max-w-2xl text-stone-300">
            Khám phá sản phẩm mới, lọc theo danh mục và sắp xếp để tìm đúng món bạn cần.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_220px_220px]">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm theo tên sản phẩm"
                className="h-12 min-w-0 flex-1 rounded-md border border-stone-200 bg-stone-50 px-4 outline-none transition focus:border-zinc-950 focus:bg-white focus:ring-4 focus:ring-zinc-200"
              />
              <button className="h-12 rounded-md bg-zinc-950 px-5 text-sm font-bold text-white transition hover:bg-zinc-800">
                Tìm
              </button>
            </form>

            <select
              value={filters.category}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="h-12 rounded-md border border-stone-200 bg-stone-50 px-4 outline-none transition focus:border-zinc-950 focus:bg-white focus:ring-4 focus:ring-zinc-200"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={filters.sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="h-12 rounded-md border border-stone-200 bg-stone-50 px-4 outline-none transition focus:border-zinc-950 focus:bg-white focus:ring-4 focus:ring-zinc-200"
            >
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-[430px] animate-pulse rounded-lg bg-white shadow-sm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                liked={isWishlisted(product.id)}
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </div>
        )}

        {!loading && !products.length && (
          <div className="rounded-lg border border-dashed border-stone-300 bg-white p-10 text-center text-stone-600">
            Không tìm thấy sản phẩm phù hợp.
          </div>
        )}

        {pagination?.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => updateFilter('page', String(pagination.page - 1))}
              className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-zinc-300 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Trước
            </button>
            <span className="text-sm font-medium text-stone-600">
              Trang {pagination.page} / {pagination.totalPages}
            </span>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => updateFilter('page', String(pagination.page + 1))}
              className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-zinc-300 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
