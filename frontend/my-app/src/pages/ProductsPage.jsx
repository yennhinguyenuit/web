import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productAPI } from '../services/api';
import { useWishlist } from '../hooks/useWishlist';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState(searchParams.get('search') || '');
  const { isWishlisted, toggleWishlist } = useWishlist();

  const filters = useMemo(
    () => ({
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      sort: searchParams.get('sort') || 'newest',
      page: Number(searchParams.get('page') || 1),
      limit: 12,
    }),
    [searchParams]
  );

  useEffect(() => {
    setKeyword(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    productAPI
      .getCategories()
      .then((res) => setCategories(res.data || []))
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const res = await productAPI.getProducts(filters);
        setProducts(res.data?.items || []);
        setPagination(res.data?.pagination || null);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [filters]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);

    if (!value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }

    if (key !== 'page') {
      next.set('page', '1');
    }

    setSearchParams(next);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    updateFilter('search', keyword.trim());
  };

  if (loading) {
    return <div className="p-10 text-center">Đang tải...</div>;
  }

  return (
    <div className="bg-red-50 min-h-screen pb-10">
      <div className="bg-red-600 py-10 mb-8 text-center text-white shadow-lg">
        <h1 className="text-4xl font-bold mb-2">Shop</h1>
        <p className="text-gray-100 text-lg">
          Khám phá những sản phẩm mới và độc đáo của chúng tôi
        </p>
      </div>

      <div className="px-6 lg:px-10 space-y-6">
        <div className="bg-white rounded-xl shadow p-4 grid gap-4 md:grid-cols-3">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm theo tên sản phẩm"
              className="border rounded px-4 py-2 flex-1"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
            >
              🔍 Tìm
            </button>
          </form>

          <select
            value={filters.category}
            onChange={(event) => updateFilter('category', event.target.value)}
            className="border rounded px-4 py-2"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={filters.sort}
            onChange={(event) => updateFilter('sort', event.target.value)}
            className="border rounded px-4 py-2"
          >
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
            <option value="rating_desc">Đánh giá cao</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              liked={isWishlisted(product.id)}
              onToggleWishlist={toggleWishlist}
            />
          ))}
        </div>

        {!products.length ? (
          <div className="text-center text-gray-600">
            Không tìm thấy sản phẩm phù hợp.
          </div>
        ) : null}

        {pagination?.totalPages > 1 ? (
          <div className="flex justify-center gap-2">
            {Array.from({ length: pagination.totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => updateFilter('page', String(pageNumber))}
                className={`px-4 py-2 rounded border ${
                  pageNumber === pagination.page
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white'
                }`}
              >
                {pageNumber}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}