import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export default function WishlistPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { items, loading, toggleWishlist } = useWishlist();

  const handleAddToCart = async (productId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await addToCart(productId, 1);
      alert('Đã thêm vào giỏ hàng');
    } catch (error) {
      alert(error.message || 'Không thể thêm vào giỏ hàng');
    }
  };

  const handleBuyNow = async (product) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (product.colors?.length || product.sizes?.length) {
      navigate(`/products/${product.id}`);
      return;
    }

    try {
      await addToCart(product.id, 1);
      navigate('/checkout');
    } catch (error) {
      alert(error.message || 'Không thể tạo đơn mua ngay');
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Đang tải wishlist...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10">
      <h1 className="text-3xl font-bold mb-6">Wishlist ({items.length})</h1>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center space-y-3">
          <p>Chưa có sản phẩm trong wishlist.</p>
          <Link to="/shop" className="text-red-600 font-medium">Đi mua sắm</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((wishlistItem) => {
            const product = wishlistItem.product;
            const needsVariantSelection = Boolean(product.colors?.length || product.sizes?.length);
            return (
              <div key={wishlistItem.id} className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row gap-4 md:items-center">
                <img
                  src={product.image || 'https://via.placeholder.com/160x160?text=No+Image'}
                  alt={product.name}
                  className="w-full md:w-32 h-32 object-cover rounded-lg"
                />

                <div className="flex-1 space-y-2">
                  <Link to={`/products/${product.id}`} className="text-xl font-semibold hover:text-red-600">
                    {product.name}
                  </Link>
                  <p className="text-red-600 font-bold">{Number(product.price).toLocaleString()}đ</p>
                  <p className="text-sm text-gray-500">Tồn kho: {product.stock}</p>
                  {needsVariantSelection ? <p className="text-xs text-gray-500">Sản phẩm này cần chọn màu/size trong trang chi tiết trước khi mua.</p> : null}
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    className="px-4 py-2 border border-red-600 text-red-600 rounded hover:bg-red-50"
                  >
                    Thêm vào giỏ
                  </button>

                  <button
                    onClick={() => handleBuyNow(product)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    {needsVariantSelection ? 'Chọn để mua' : 'Mua ngay'}
                  </button>

                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="px-4 py-2 border rounded hover:bg-gray-50"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
