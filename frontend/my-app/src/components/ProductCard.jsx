import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

function ProductCard({ product, liked = false, onToggleWishlist }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const requiresVariantSelection = Boolean(product.colors?.length || product.sizes?.length);
  const image = product.image || 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80';
  const fallbackImage = 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80';

  const ensureLoggedIn = () => {
    if (user) return true;
    navigate('/login');
    return false;
  };

  const handleWishlist = async () => {
    if (!ensureLoggedIn() || !onToggleWishlist) return;

    try {
      await onToggleWishlist(product.id);
    } catch (error) {
      alert(error.message || 'Không thể cập nhật danh sách yêu thích');
    }
  };

  const handleAddToCart = async () => {
    if (!ensureLoggedIn()) return;

    if (requiresVariantSelection) {
      navigate(`/products/${product.id}`);
      return;
    }

    try {
      await addToCart(product, 1);
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
      await addToCart(product, 1);
      navigate('/checkout');
    } catch (error) {
      alert(error.message || 'Không thể tạo đơn mua ngay');
    }
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link to={`/products/${product.id}`} className="relative block aspect-[4/5] overflow-hidden bg-stone-100">
        <img
          src={image}
          alt={product.name}
          onError={(event) => {
            event.currentTarget.src = fallbackImage;
          }}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-stone-700 shadow-sm">
          {product.category?.name || 'Sản phẩm'}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link to={`/products/${product.id}`} className="line-clamp-2 font-semibold text-stone-950 transition hover:text-zinc-950">
              {product.name}
            </Link>
            <p className="mt-2 text-lg font-black text-zinc-950">
              {Number(product.price || 0).toLocaleString('vi-VN')}đ
            </p>
          </div>

          <button
            type="button"
            onClick={handleWishlist}
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border text-lg transition ${
              liked
                ? 'border-zinc-300 bg-zinc-100 text-zinc-950'
                : 'border-stone-200 bg-white text-stone-500 hover:border-zinc-300 hover:text-zinc-950'
            }`}
            aria-label="Yêu thích"
          >
            {liked ? '♥' : '♡'}
          </button>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            className="min-h-11 rounded-md border border-zinc-300 px-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100"
          >
            Thêm giỏ
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            className="min-h-11 rounded-md bg-stone-950 px-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Mua ngay
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
