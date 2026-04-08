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

    if (!onToggleWishlist) {
      return;
    }

    try {
      await onToggleWishlist(product.id);
    } catch (error) {
      alert(error.message || 'Không thể cập nhật wishlist');
    }
  };

  const handleAddToCart = async () => {
    if (!ensureLoggedIn()) return;

    if (requiresVariantSelection) {
      navigate(`/products/${product.id}`);
      return;
    }

    try {
      await addToCart(product.id, 1);
      alert('Đã thêm vào giỏ hàng');
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
      await addToCart(product.id, 1);
      navigate('/checkout');
    } catch (error) {
      alert(error.message || 'Không thể tạo đơn mua ngay');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-xl transition p-4 flex flex-col gap-3">
      <div className="flex justify-between items-start gap-3">
        <span className="text-xs text-gray-500">{product.category?.name || 'Sản phẩm'}</span>
        <button onClick={handleWishlist} className="text-xl" aria-label="wishlist">
          {liked ? '❤️' : '🤍'}
        </button>
      </div>

      <Link to={`/products/${product.id}`} className="block">
        <img
          src={product.image || 'https://via.placeholder.com/300x200?text=No+Image'}
          alt={product.name}
          className="w-full h-56 object-cover rounded"
        />
      </Link>

      <div className="space-y-1 flex-1">
        <Link to={`/products/${product.id}`} className="block">
          <h3 className="font-semibold hover:text-red-600">{product.name}</h3>
        </Link>
        {product.badge ? <p className="text-xs text-red-600 uppercase">{product.badge}</p> : null}
        <p className="text-red-600 font-bold">{Number(product.price || 0).toLocaleString()}đ</p>
        {product.rating ? (
          <p className="text-sm text-gray-500">⭐ {Number(product.rating).toFixed(1)} · {product.reviewCount || 0} đánh giá</p>
        ) : null}
        {requiresVariantSelection ? (
          <p className="text-xs text-gray-500">Chọn màu/size trong trang chi tiết trước khi mua.</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={handleAddToCart} className="w-full border border-red-600 text-red-600 py-2 rounded hover:bg-red-50">
          {requiresVariantSelection ? 'Chọn biến thể' : 'Thêm vào giỏ'}
        </button>
        <button onClick={handleBuyNow} className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700">
          Mua ngay
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
