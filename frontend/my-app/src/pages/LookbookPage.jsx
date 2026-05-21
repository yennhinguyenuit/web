import { Link } from 'react-router-dom';

const looks = [
  {
    title: 'Workday Clean',
    image: 'https://images.unsplash.com/photo-1506629905607-d405d7d3b0d2?auto=format&fit=crop&w=900&q=80',
    tags: ['Sơ mi', 'Quần suông', 'Tối giản'],
  },
  {
    title: 'Weekend Easy',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
    tags: ['Áo thun', 'Denim', 'Sneaker'],
  },
  {
    title: 'Evening Black',
    image: 'https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=900&q=80',
    tags: ['Đen trắng', 'Layer', 'Phụ kiện'],
  },
];

export default function LookbookPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-zinc-500">Lookbook</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">Gợi ý phối đồ</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-600">
            Những outfit đen trắng dễ ứng dụng, phù hợp đi làm, đi chơi và các dịp cần sự gọn gàng.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        {looks.map((look) => (
          <article key={look.title} className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
            <img src={look.image} alt={look.title} className="aspect-[4/5] w-full object-cover grayscale" />
            <div className="p-5">
              <h2 className="text-xl font-black text-zinc-950">{look.title}</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {look.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-bold text-zinc-700">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-zinc-950 p-8 text-white">
          <h2 className="text-2xl font-black">Tìm sản phẩm trong lookbook</h2>
          <p className="mt-2 max-w-2xl text-zinc-300">Vào cửa hàng để lọc theo danh mục, màu sắc và mức giá phù hợp.</p>
          <Link to="/shop" className="mt-5 inline-flex rounded-md bg-white px-5 py-3 text-sm font-bold text-zinc-950 hover:bg-zinc-100">
            Xem sản phẩm
          </Link>
        </div>
      </div>
    </div>
  );
}
