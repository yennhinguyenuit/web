export default function AboutPage() {
  return (
    <div className="bg-white">
      <section className="relative min-h-[520px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1800&q=85"
          className="absolute inset-0 h-full w-full object-cover"
          alt="Không gian thời trang Luxe Store"
        />
        <div className="absolute inset-0 bg-zinc-950/55" />
        <div className="relative mx-auto flex min-h-[520px] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl text-white">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-zinc-200">Về chúng tôi</p>
            <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-6xl">Luxe Store</h1>
            <p className="mt-6 text-lg leading-8 text-zinc-100">
              Cửa hàng thời trang chọn lọc cho những outfit dễ mặc, bền dáng và hợp nhịp sống hiện đại.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-zinc-500">Câu chuyện</p>
          <h2 className="mt-3 text-3xl font-black text-zinc-950">Tủ đồ gọn hơn, lựa chọn đúng hơn</h2>
          <p className="mt-5 leading-8 text-zinc-600">
            Luxe Store tập trung vào những thiết kế có tính ứng dụng cao: áo, quần, váy, phụ kiện và giày dép dễ phối trong nhiều hoàn cảnh.
          </p>
          <p className="mt-4 leading-8 text-zinc-600">
            Mỗi sản phẩm được chọn theo chất liệu, form dáng và khả năng phối lại nhiều lần để khách hàng mua ít hơn nhưng mặc được nhiều hơn.
          </p>
        </div>
        <img
          src="https://images.unsplash.com/photo-1521336575822-6da63fb45455?auto=format&fit=crop&w=1200&q=85"
          className="aspect-[4/3] w-full rounded-lg object-cover shadow-sm"
          alt="Chi tiết outfit thời trang"
        />
      </section>

      <section className="bg-zinc-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-zinc-500">Giá trị</p>
            <h2 className="mt-3 text-3xl font-black text-zinc-950">Những điều tụi mình giữ trong từng đơn hàng</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-4">
            {[
              ['Chất liệu ổn định', 'Ưu tiên vải dễ chăm sóc, mặc thoải mái.'],
              ['Form dễ phối', 'Thiết kế có thể đi cùng nhiều item trong tủ.'],
              ['Tư vấn rõ ràng', 'Hỗ trợ chọn size và màu theo nhu cầu thật.'],
              ['Dịch vụ gọn', 'Đặt hàng, thanh toán và đổi trả dễ theo dõi.'],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                <h3 className="font-black text-zinc-950">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
