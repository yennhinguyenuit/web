import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { reviewAPI } from '../services/api';

const featuredReviews = [
  {
    name: 'Minh Anh',
    rating: 5,
    comment: 'Form áo gọn, chất vải dày vừa phải và dễ phối với đồ công sở.',
  },
  {
    name: 'Quốc Bảo',
    rating: 5,
    comment: 'Đặt online nhưng tư vấn size khá chuẩn. Giao hàng nhanh và đóng gói sạch.',
  },
  {
    name: 'Hà My',
    rating: 4,
    comment: 'Màu sắc tối giản đúng ý, dùng được nhiều dịp. Sẽ quay lại mua thêm.',
  },
];

export default function ReviewsPage() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId');
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(Boolean(productId));

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

  const source = productId ? reviews : featuredReviews;
  const data = useMemo(
    () => source.filter((review) => (review.comment || '').toLowerCase().includes(search.toLowerCase())),
    [source, search]
  );

  return (
    <div className="min-h-screen bg-zinc-50">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-zinc-500">Đánh giá</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
            Khách hàng nói gì
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-600">
            Tổng hợp cảm nhận về form dáng, chất liệu, tư vấn size và trải nghiệm mua sắm tại Luxe Store.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Stat value={summary?.ratingAvg || '4.9'} label="Điểm trung bình" />
            <Stat value={summary?.reviewCount || '15k+'} label="Lượt phản hồi" />
            <Stat value="98%" label="Hài lòng sau mua" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            placeholder="Tìm trong nội dung đánh giá"
            className="min-h-12 w-full rounded-md border border-zinc-300 bg-white px-4 outline-none focus:border-black focus:ring-2 focus:ring-zinc-200 sm:max-w-md"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Link to="/shop" className="rounded-md bg-zinc-950 px-5 py-3 text-center text-sm font-bold text-white hover:bg-zinc-800">
            Xem sản phẩm
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((item) => <div key={item} className="h-48 animate-pulse rounded-lg bg-white" />)}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {data.map((review, index) => (
              <article key={review.id || index} className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-zinc-500">
                  {'★'.repeat(Number(review.rating || 5))}
                </p>
                <p className="mt-4 leading-7 text-zinc-700">{review.comment || 'Không có bình luận'}</p>
                <p className="mt-5 font-black text-zinc-950">{review.user?.name || review.name || 'Khách hàng'}</p>
              </article>
            ))}
          </div>
        )}

        {!loading && !data.length ? (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-10 text-center text-zinc-600">
            Chưa có đánh giá phù hợp.
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-5">
      <p className="text-3xl font-black text-zinc-950">{value}</p>
      <p className="mt-2 text-sm font-semibold text-zinc-500">{label}</p>
    </div>
  );
}
