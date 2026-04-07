function AboutPage() {
  return (
    <div>

      {/* HERO */}
      <div className="h-[400px] bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: "url(https://images.unsplash.com/photo-1521336575822-6da63fb45455)"
        }}
      >
        <h1 className="text-4xl font-bold text-white bg-black/40 px-6 py-2 rounded">
          Về chúng tôi
        </h1>
      </div>

      {/* CONTENT */}
      <div className="max-w-5xl mx-auto py-12 px-6 text-center">
        <h2 className="text-2xl font-semibold mb-4">
          Câu chuyện của chúng tôi
        </h2>
        <p className="text-gray-600">
          LUXE STORE mang đến thời trang cao cấp và trải nghiệm mua sắm hiện đại.
        </p>
      </div>

      {/* VALUES */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 px-6 pb-12">

        <div className="border rounded-xl p-6 text-center shadow hover:shadow-lg transition">
          <h3 className="font-bold text-lg mb-2">Chất lượng</h3>
          <p className="text-gray-500">Sản phẩm cao cấp</p>
        </div>

        <div className="border rounded-xl p-6 text-center shadow hover:shadow-lg transition">
          <h3 className="font-bold text-lg mb-2">Khách hàng</h3>
          <p className="text-gray-500">Luôn ưu tiên</p>
        </div>

        <div className="border rounded-xl p-6 text-center shadow hover:shadow-lg transition">
          <h3 className="font-bold text-lg mb-2">Chính hãng</h3>
          <p className="text-gray-500">100% đảm bảo</p>
        </div>

        <div className="border rounded-xl p-6 text-center shadow hover:shadow-lg transition">
          <h3 className="font-bold text-lg mb-2">Trải nghiệm</h3>
          <p className="text-gray-500">Đẳng cấp</p>
        </div>

      </div>

    </div>
  )
}

export default AboutPage