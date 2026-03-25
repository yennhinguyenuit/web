function AboutPage() {
  return (
    <div>

      {/* HERO */}
      <div style={{
        height: "400px",
        background: "url(https://images.unsplash.com/photo-1521336575822-6da63fb45455)",
        backgroundSize: "cover",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <h1 style={{ fontSize: "40px" }}>Về chúng tôi</h1>
      </div>

      {/* CONTENT */}
      <div style={{ padding: "40px" }}>
        <h2>Câu chuyện của chúng tôi</h2>
        <p>
          LUXE STORE mang đến thời trang cao cấp và trải nghiệm mua sắm hiện đại.
        </p>
      </div>

      {/* VALUES */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        gap: "20px",
        padding: "40px"
      }}>
        <div style={{ border: "1px solid #ddd", padding: "20px" }}>
          <h3>Chất lượng</h3>
          <p>Sản phẩm cao cấp</p>
        </div>

        <div style={{ border: "1px solid #ddd", padding: "20px" }}>
          <h3>Khách hàng</h3>
          <p>Luôn ưu tiên</p>
        </div>

        <div style={{ border: "1px solid #ddd", padding: "20px" }}>
          <h3>Chính hãng</h3>
          <p>100% đảm bảo</p>
        </div>

        <div style={{ border: "1px solid #ddd", padding: "20px" }}>
          <h3>Trải nghiệm</h3>
          <p>Đẳng cấp</p>
        </div>
      </div>

    </div>
  )
}

export default AboutPage