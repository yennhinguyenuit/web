import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { reviewAPI } from '../services/api';

export default function ReviewsPage() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId');
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReviews = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }

      try {
        const res = await reviewAPI.getProductReviews(productId);
        setReviews(res.data?.items || []);
        setSummary(res.data?.summary || null);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [productId]);

  const data = useMemo(
    () => reviews.filter((review) => (review.comment || '').toLowerCase().includes(search.toLowerCase())),
    [reviews, search]
  );

  if (!productId) {
    return <div className="p-10 text-center">Thiếu productId trên query string.</div>;
  }

  if (loading) {
    return <div className="p-10 text-center">Đang tải đánh giá...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8 md:p-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reviews</h1>
        {summary ? <p className="text-gray-600 mt-2">⭐ {summary.ratingAvg || 0} · {summary.reviewCount || 0} đánh giá</p> : null}
      </div>

      <input
        placeholder="Tìm trong nội dung đánh giá"
        className="border rounded px-4 py-2 w-full"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <div className="space-y-4">
        {data.map((review) => (
          <div key={review.id} className="bg-white rounded-xl shadow p-4 space-y-2">
            <p className="font-semibold">{review.user?.name || 'Khách hàng'}</p>
            <p>{review.rating}⭐</p>
            <p>{review.comment || 'Không có bình luận'}</p>
          </div>
        ))}

        {!data.length ? <p className="text-gray-600">Chưa có đánh giá phù hợp.</p> : null}
      </div>
    </div>
  );
}
