import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

function ProductCard({ product, liked = false, onToggleWishlist }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const requiresVariantSelection = Boolean(product.colors?.length || product.sizes?.length);

  const ensureLoggedIn = () => {
    if (user) return true;
    navigate('/login');
    return false;
  };

  const handleWishlist = async () => {
    if (!ensureLoggedIn()) return;

    if (!onToggleWishlist) return;

    try {
      await onToggleWishlist(product.id);
    } catch (error) {
      alert(error.message || 'Không thể cập nhật wishlist');
    }
  };

  // 🔥 FIX CHÍNH Ở ĐÂY
  const handleAddToCart = async () => {
    if (!ensureLoggedIn()) return;

    if (requiresVariantSelection) {
      navigate(`/products/${product.id}`);
      return;
    }

    try {
      await addToCart(product, 1); // ✅ FIX: truyền full product
    } catch (error) {
      alert(error.message || 'Không thể thêm vào giỏ hàng');
    }
  };

  const handleBuyNow = async () => {
    if (!ensureLoggedIn()) return;

    if (requiresVariantSelection) {
      navigate(`/products/${product.id}`);
      return;
    }

    try {
      await addToCart(product, 1); // ✅ FIX: truyền full product
      navigate('/checkout');
    } catch (error) {
      alert(error.message || 'Không thể tạo đơn mua ngay');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-xl transition p-4 flex flex-col gap-3">
      <div className="flex justify-between items-start gap-3">
        <span className="text-xs text-gray-500">
          {product.category?.name || 'Sản phẩm'}
        </span>

        <button onClick={handleWishlist} className="text-xl">
          {liked ? '❤️' : '🤍'}
        </button>
      </div>

      <Link to={`/products/${product.id}`}>
        <img
          src={product.image || 'https://via.placeholder.com/300'}
          alt={product.name}
          className="w-full h-56 object-cover rounded"
        />
      </Link>

      <div className="space-y-1 flex-1">
        <h3 className="font-semibold">{product.name}</h3>
        <p className="text-red-600 font-bold">
          {Number(product.price || 0).toLocaleString()}đ
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleAddToCart}
          className="border border-red-600 text-red-600 py-2 rounded"
        >
          Thêm vào giỏ
        </button>

        <button
          onClick={handleBuyNow}
          className="bg-red-600 text-white py-2 rounded"
        >
          Mua ngay
        </button>
      </div>
    </div>
  );
}

export default ProductCard;