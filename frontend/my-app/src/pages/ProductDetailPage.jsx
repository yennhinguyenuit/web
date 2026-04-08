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
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [tab, setTab] = useState('desc');
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

  useEffect(() => {
    if (myReview) {
      setReviewForm({
        rating: myReview.rating,
        comment: myReview.comment || '',
      });
    } else {
      setReviewForm({ rating: 5, comment: '' });
    }
  }, [myReview]);

  const buildCartOptions = () => ({
    color: selectedColor || undefined,
    size: selectedSize || undefined,
  });

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await addToCart(product.id, quantity, buildCartOptions());
      alert('Đã thêm vào giỏ hàng');
    } catch (error) {
      alert(error.message || 'Không thể thêm vào giỏ hàng');
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await addToCart(product.id, quantity, buildCartOptions());
      navigate('/checkout');
    } catch (error) {
      alert(error.message || 'Không thể tạo đơn mua ngay');
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await toggleWishlist(product.id);
    } catch (error) {
      alert(error.message || 'Không thể cập nhật wishlist');
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    if (!user) {
      navigate('/login');
      return;
    }

    setSubmittingReview(true);
    try {
      if (myReview) {
        await reviewAPI.updateReview(myReview.id, reviewForm);
      } else {
        await reviewAPI.createReview(product.id, reviewForm);
      }

      await loadProduct();
      setTab('review');
      alert(myReview ? 'Đã cập nhật đánh giá' : 'Đã gửi đánh giá');
    } catch (error) {
      alert(error.message || 'Không thể gửi đánh giá');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!myReview) return;

    try {
      await reviewAPI.deleteReview(myReview.id);
      await loadProduct();
      alert('Đã xóa đánh giá');
    } catch (error) {
      alert(error.message || 'Không thể xóa đánh giá');
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Đang tải...</div>;
  }

  if (!product) {
    return <div className="p-10 text-center">Không tìm thấy sản phẩm.</div>;
  }

  const images = product.images?.length ? product.images : [product.image].filter(Boolean);
  const availableStock = Math.max(0, Number(product.stock || 0));
  const isOutOfStock = availableStock <= 0;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-red-600 py-8 text-center text-white shadow">
        <h1 className="text-4xl font-bold tracking-wide">Chi tiết sản phẩm</h1>
      </div>

      <div className="p-6 md:p-10 space-y-10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 bg-white p-6 rounded-xl shadow">
          <div className="space-y-4">
            <img
              src={product.image || 'https://via.placeholder.com/600x500?text=No+Image'}
              alt={product.name}
              className="w-full h-[400px] object-cover rounded-lg"
            />

            {images.length > 1 ? (
              <div className="grid grid-cols-4 gap-3">
                {images.map((image, index) => (
                  <img key={`${image}-${index}`} src={image} alt={`${product.name}-${index + 1}`} className="w-full h-24 object-cover rounded border" />
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold">{product.name}</h2>
                <p className="text-sm text-gray-500 mt-1">Danh mục: {product.category?.name || 'Chưa phân loại'}</p>
              </div>
              <button onClick={handleToggleWishlist} className="text-2xl" aria-label="wishlist">
                {isWishlisted(product.id) ? '❤️' : '🤍'}
              </button>
            </div>

            <p className="text-red-600 text-3xl font-bold">{Number(product.price || 0).toLocaleString()}đ</p>

            {product.originalPrice ? (
              <p className="text-sm text-gray-400 line-through">{Number(product.originalPrice).toLocaleString()}đ</p>
            ) : null}

            <div className="text-gray-600 space-y-1">
              <p>⭐ {product.rating || 0} · {product.reviewCount || 0} đánh giá</p>
              <p>Tồn kho: {availableStock}</p>
              {product.badge ? <p>Badge: {product.badge}</p> : null}
              {isOutOfStock ? <p className="text-red-600 font-medium">Sản phẩm hiện đang hết hàng.</p> : null}
            </div>

            {product.colors?.length ? (
              <div>
                <p className="font-medium mb-2">Màu sắc</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded border ${selectedColor === color ? 'border-red-600 text-red-600' : 'border-gray-300'}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {product.sizes?.length ? (
              <div>
                <p className="font-medium mb-2">Kích cỡ</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded border ${selectedSize === size ? 'border-red-600 text-red-600' : 'border-gray-300'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div>
              <p className="font-medium mb-2">Số lượng</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity((current) => Math.max(1, current - 1))} className="px-4 py-2 border rounded" disabled={isOutOfStock}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity((current) => Math.min(availableStock || current + 1, current + 1))} className="px-4 py-2 border rounded" disabled={isOutOfStock}>+</button>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="border border-red-600 text-red-600 px-6 py-3 rounded hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Thêm vào giỏ hàng
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mua ngay
              </button>
              <Link to="/cart" className="px-6 py-3 border rounded hover:bg-gray-50 text-center">Xem giỏ hàng</Link>
            </div>

            <div className="rounded-lg border bg-red-50 p-4 text-sm text-gray-600 space-y-1">
              <p className="font-semibold text-gray-800">Mua hàng nhanh</p>
              <p>1. Chọn màu/size nếu sản phẩm có biến thể.</p>
              <p>2. Nhấn <span className="font-medium">Mua ngay</span> để thêm vào giỏ và chuyển thẳng sang thanh toán.</p>
              <p>3. Hoặc nhấn <span className="font-medium">Thêm vào giỏ hàng</span> để tiếp tục chọn thêm sản phẩm khác.</p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-10 bg-white p-6 rounded-xl shadow">
          <div className="flex justify-center gap-8 border-b pb-4 mb-6">
            <button onClick={() => setTab('desc')} className={`font-semibold ${tab === 'desc' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500'}`}>
              Mô tả sản phẩm
            </button>
            <button onClick={() => setTab('review')} className={`font-semibold ${tab === 'review' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500'}`}>
              Đánh giá khách hàng
            </button>
          </div>

          {tab === 'desc' ? (
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>{product.description || 'Chưa có mô tả'}</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-lg font-semibold">⭐ {reviewSummary?.ratingAvg || 0}</p>
                <p className="text-sm text-gray-500">{reviewSummary?.reviewCount || 0} đánh giá</p>
              </div>

              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4 space-y-2">
                    <p className="font-semibold">{review.user?.name || 'Khách hàng'}</p>
                    <p>{review.rating}⭐</p>
                    <p>{review.comment || 'Không có bình luận'}</p>
                  </div>
                ))}

                {!reviews.length ? <p className="text-gray-500">Chưa có đánh giá nào.</p> : null}
              </div>

              <form onSubmit={handleReviewSubmit} className="border rounded-lg p-4 space-y-4">
                <h3 className="text-xl font-semibold">{myReview ? 'Cập nhật đánh giá của bạn' : 'Viết đánh giá'}</h3>
                <select
                  value={reviewForm.rating}
                  onChange={(event) => setReviewForm((current) => ({ ...current, rating: Number(event.target.value) }))}
                  className="border rounded px-4 py-2"
                >
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>{rating} sao</option>
                  ))}
                </select>

                <textarea
                  value={reviewForm.comment}
                  onChange={(event) => setReviewForm((current) => ({ ...current, comment: event.target.value }))}
                  className="w-full border rounded px-4 py-3"
                  rows={4}
                  placeholder="Chia sẻ trải nghiệm của bạn"
                />

                <div className="flex flex-wrap gap-3">
                  <button disabled={submittingReview} className="px-5 py-2 bg-red-600 text-white rounded disabled:opacity-60">
                    {submittingReview ? 'Đang gửi...' : myReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
                  </button>

                  {myReview ? (
                    <button type="button" onClick={handleDeleteReview} className="px-5 py-2 border rounded">
                      Xóa đánh giá
                    </button>
                  ) : null}
                </div>

                <p className="text-sm text-gray-500">Backend chỉ cho phép đánh giá khi bạn đã mua và nhận đơn hàng này.</p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
