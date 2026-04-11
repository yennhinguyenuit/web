import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { productAPI, reviewAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../hooks/useWishlist';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [loading, setLoading] = useState(true);

  const myReview = useMemo(
    () => reviews.find((item) => item.user?.id === user?.id) || null,
    [reviews, user]
  );

  const loadProduct = async () => {
    setLoading(true);
    try {
      const [productRes, reviewRes] = await Promise.all([
        productAPI.getProductById(id),
        reviewAPI.getProductReviews(id),
      ]);

      const nextProduct = productRes.data;
      setProduct(nextProduct);
      setReviews(reviewRes.data?.items || []);
      setReviewSummary(reviewRes.data?.summary || null);

      setSelectedColor(nextProduct.colors?.[0] || '');
      setSelectedSize(nextProduct.sizes?.[0] || '');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  // 🔥 FIX LOGIC (GIỮ UI)
  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await addToCart(
        {
          ...product,
          color: selectedColor,
          size: selectedSize,
        },
        quantity
      );

      alert('Đã thêm vào giỏ hàng');
    } catch (error) {
      alert('Không thể thêm vào giỏ hàng');
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await addToCart(
        {
          ...product,
          color: selectedColor,
          size: selectedSize,
        },
        quantity
      );

      navigate('/checkout');
    } catch (error) {
      alert('Không thể mua ngay');
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await toggleWishlist(product.id);
    } catch {
      alert('Không thể cập nhật wishlist');
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Đang tải...</div>;
  }

  if (!product) {
    return <div className="p-10 text-center">Không tìm thấy sản phẩm.</div>;
  }

  const availableStock = Math.max(0, Number(product.stock || 0));

  return (
    <div className="bg-red-50 min-h-screen pb-10">
      <div className="bg-red-600 py-10 mb-8 text-center text-white shadow-lg">
        <h1 className="text-4xl font-bold mb-2">Chi tiết sản phẩm</h1>
      </div>

      <div className="px-6 lg:px-10">
        <div className="bg-white rounded-xl shadow p-6 grid md:grid-cols-2 gap-10">

          {/* IMAGE */}
          <img
            src={product.image || 'https://via.placeholder.com/500'}
            alt={product.name}
            className="w-full h-[400px] object-cover rounded"
          />

          {/* INFO */}
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <h2 className="text-3xl font-bold">{product.name}</h2>

              <button onClick={handleToggleWishlist}>
                {isWishlisted(product.id) ? '❤️' : '🤍'}
              </button>
            </div>

            <p className="text-gray-500">
              Danh mục: {product.category?.name || 'Default Category'}
            </p>

            <p className="text-red-600 text-2xl font-bold">
              {Number(product.price || 0).toLocaleString()}đ
            </p>

            <p>Tồn kho: {availableStock}</p>

            {/* QUANTITY */}
            <div>
              <p>Số lượng</p>
              <div className="flex items-center gap-3 mt-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="border px-2"
                >
                  -
                </button>

                <span>{quantity}</span>

                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="border px-2"
                >
                  +
                </button>
              </div>
            </div>

            {/* BUTTON */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAddToCart}
                className="border border-red-600 text-red-600 px-4 py-2 rounded"
              >
                Thêm vào giỏ hàng
              </button>

              <button
                onClick={handleBuyNow}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Mua ngay
              </button>

              <Link
                to="/cart"
                className="border px-4 py-2 rounded"
              >
                Xem giỏ hàng
              </Link>
            </div>

            {/* NOTE */}
            <div className="bg-red-50 p-4 rounded mt-4 text-sm text-gray-700">
              <p><b>Mua hàng nhanh</b></p>
              <p>1. Chọn màu/size nếu có</p>
              <p>2. Nhấn Mua ngay để thanh toán</p>
              <p>3. Hoặc thêm vào giỏ để mua nhiều sản phẩm</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}