import "./HomePage.css"
import { Link } from "react-router-dom"

function HomePage() {
  const products = [
    {
      id: 1,
      name: "Giày sneaker",
      price: "1.200.000đ",
      img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff"
    },
    {
      id: 2,
      name: "Áo khoác",
      price: "800.000đ",
      img: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b"
    },
    {
      id: 3,
      name: "Áo thun",
      price: "200.000đ",
      img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"
    },
    {
      id: 4,
      name: "Quần jean",
      price: "500.000đ",
      img: "https://images.unsplash.com/photo-1514996937319-344454492b37"
    }
  ]

  return (
    <div className="home">
      <h2 className="title">Sản phẩm nổi bật</h2>

      {/* 👉 Nút đi tới giỏ hàng */}
      <Link to="/cart">
        <button className="btn">Go to Cart</button>
      </Link>

      <div className="grid">
        {products.map(p => (
          <div key={p.id} className="card">

            {/* 👉 Click ảnh đi tới detail */}
            <Link to={`/products/${p.id}`}>
              <img src={p.img} />
            </Link>

            <h3>{p.name}</h3>
            <p>{p.price}</p>

            {/* 👉 Add to cart cũng có thể chuyển */}
            <Link to="/cart">
              <button className="btn">Add to cart</button>
            </Link>

          </div>
        ))}
      </div>
    </div>
  )
}

export default HomePage