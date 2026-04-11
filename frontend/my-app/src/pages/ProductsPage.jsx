import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productAPI } from '../services/api';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../contexts/CartContext'; // 🔥 THÊM

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState(searchParams.get('search') || '');

  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCart } = useCart(); // 🔥 THÊM

  const filters = useMemo(() => ({
    search: searchParams.get('search') || '',
    categoryId: searchParams.get('category') || '',
    sort: searchParams.get('sort') || 'newest',
    page: Number(searchParams.get('page') || 1),
    limit: 50,
  }), [searchParams]);

  // 🔥 LOAD CATEGORIES
  useEffect(() => {
    productAPI.getCategories()
      .then((res) => {
        setCategories(res.data?.data || res.data || []);
      })
      .catch(console.error);
  }, []);

  // 🔥 LOAD PRODUCTS
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilter('search', keyword.trim());
  };

  // 🔥 HANDLE ADD TO CART (QUAN TRỌNG)
  const handleAddToCart = (product) => {
    addToCart(product); // truyền nguyên object
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

        {/* FILTER */}
        <div className="bg-white rounded-xl shadow p-4 grid gap-4 md:grid-cols-3">

          {/* SEARCH */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo tên sản phẩm"
              className="border rounded px-4 py-2 flex-1"
            />
            <button className="px-4 py-2 rounded bg-red-600 text-white">
              🔍 Tìm
            </button>
          </form>

          {/* CATEGORY */}
          <select
            value={filters.categoryId}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="border rounded px-4 py-2"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* SORT */}
          <select
            value={filters.sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="border rounded px-4 py-2"
          >
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
          </select>
        </div>

        {/* PRODUCTS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              liked={isWishlisted(product.id)}
              onToggleWishlist={toggleWishlist}
              onAddToCart={() => handleAddToCart(product)} // 🔥 THÊM
            />
          ))}
        </div>

        {/* EMPTY */}
        {!products.length && (
          <div className="text-center text-gray-600">
            Không tìm thấy sản phẩm phù hợp.
          </div>
        )}
      </div>
    </div>
  );
}