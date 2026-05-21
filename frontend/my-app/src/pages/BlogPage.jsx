import { Link } from 'react-router-dom';

const posts = [
  {
    title: '5 công thức phối đồ đi học, đi làm dễ áp dụng',
    image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=1000&q=85',
    tag: 'Phối đồ',
  },
  {
    title: 'Chọn size áo quần online sao cho ít bị lệch',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85',
    tag: 'Size guide',
  },
  {
    title: 'Những item nên có trong tủ đồ tối giản',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85',
    tag: 'Tủ đồ',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-zinc-500">Blog Luxe Store</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">Gợi ý mặc đẹp hằng ngày</h1>
            <p className="mt-5 leading-8 text-zinc-600">
              Tổng hợp cách phối đồ, chọn size và chăm sóc trang phục để bạn mua đúng món và mặc được lâu hơn.
            </p>
            <Link to="/shop" className="mt-7 inline-flex rounded-full bg-zinc-950 px-6 py-3 text-sm font-bold text-white hover:bg-zinc-800">
              Xem sản phẩm
            </Link>
          </div>
          <img
            src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1400&q=85"
            className="aspect-[16/10] w-full rounded-lg object-cover shadow-sm"
            alt="Người mẫu mặc outfit thời trang"
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <article key={post.title} className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
              <img src={post.image} alt={post.title} className="aspect-[4/3] w-full object-cover" />
              <div className="p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">{post.tag}</p>
                <h2 className="mt-3 text-xl font-black leading-snug text-zinc-950">{post.title}</h2>
                <p className="mt-3 text-sm leading-6 text-zinc-600">
                  Gợi ý ngắn gọn, dễ áp dụng khi chọn đồ trên Luxe Store.
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
