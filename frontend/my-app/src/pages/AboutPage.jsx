export default function AboutPage() {
  return (
    <div className="bg-white">

      {/* 🔥 HERO (GIỮ MÀU ẢNH GỐC) */}
      <div className="relative h-[450px]">
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8"
          className="w-full h-full object-cover"
        />

        {/* overlay đen nhẹ */}
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center">
          <h1 className="text-5xl font-bold mb-4">
            Về chúng tôi
          </h1>
          <p className="text-xl text-gray-200">
            Nơi phong cách gặp gỡ đẳng cấp
          </p>
        </div>
      </div>

      {/* 🔥 STORY */}
      <div className="grid md:grid-cols-2 gap-10 p-10 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-4 text-red-600">
            Câu chuyện của chúng tôi
          </h2>

          <p className="text-gray-600 mb-4">
            LUXE STORE được thành lập với sứ mệnh mang đến trải nghiệm mua sắm
            thời trang cao cấp đẳng cấp quốc tế cho khách hàng Việt Nam.
          </p>

          <p className="text-gray-600 mb-4">
            Thời trang không chỉ là quần áo - đó là phong cách sống và cá tính riêng.
          </p>

          <p className="text-gray-600">
            Chúng tôi mang đến những lựa chọn tốt nhất từ các thương hiệu hàng đầu.
          </p>
        </div>

        <img
          src="https://images.unsplash.com/photo-1521336575822-6da63fb45455"
          className="rounded-lg shadow-lg"
        />
      </div>

      {/* 🔥 CORE VALUES (ĐỎ NHẠT) */}
      <div className="bg-red-50 py-16 text-center">
        <h2 className="text-3xl font-bold mb-2 text-red-600">
          Giá trị cốt lõi
        </h2>
        <p className="text-gray-500 mb-10">
          Những nguyên tắc định hướng mọi hoạt động của chúng tôi
        </p>

        <div className="grid md:grid-cols-4 gap-6 px-10">

          {[
            {
              title: "Chất lượng cao cấp",
              desc: "Sản phẩm từ thương hiệu uy tín hàng đầu",
            },
            {
              title: "Tận tâm khách hàng",
              desc: "Luôn hỗ trợ khách hàng nhanh chóng",
            },
            {
              title: "Đảm bảo chính hãng",
              desc: "100% sản phẩm rõ nguồn gốc",
            },
            {
              title: "Trải nghiệm đẳng cấp",
              desc: "Dịch vụ và giao diện cao cấp",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
            >
              {/* icon */}
              <div className="w-12 h-12 bg-red-100 text-red-600 flex items-center justify-center rounded mb-4">
                ★
              </div>

              <h3 className="font-bold mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 🔥 TIMELINE */}
      <div className="py-16 px-10 text-center">
        <h2 className="text-3xl font-bold mb-2 text-red-600">
          Hành trình phát triển
        </h2>
        <p className="text-gray-500 mb-10">
          Những cột mốc quan trọng của LUXE STORE
        </p>

        <div className="max-w-2xl mx-auto space-y-8">

          <div className="bg-white p-6 rounded shadow border-l-4 border-red-600">
            <h3 className="text-red-600 font-bold text-xl">2018</h3>
            <p className="font-semibold">Ra mắt</p>
            <p className="text-gray-500">
              Khai trương cửa hàng đầu tiên tại TP.HCM
            </p>
          </div>

          <div className="bg-white p-6 rounded shadow border-l-4 border-red-600">
            <h3 className="text-red-600 font-bold text-xl">2020</h3>
            <p className="font-semibold">Mở rộng</p>
            <p className="text-gray-500">
              Ra mắt nền tảng thương mại điện tử
            </p>
          </div>

          <div className="bg-white p-6 rounded shadow border-l-4 border-red-600">
            <h3 className="text-red-600 font-bold text-xl">2024</h3>
            <p className="font-semibold">Phát triển</p>
            <p className="text-gray-500">
              Mở rộng toàn quốc và nâng cấp trải nghiệm khách hàng
            </p>
          </div>

        </div>
      </div>

    </div>
  )
}