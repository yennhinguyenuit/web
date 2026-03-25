import { useParams, useNavigate } from "react-router-dom"
import "./ProductDetailPage.css"

function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const products = [
    {
      id: 1,
      name: "Giày sneaker",
      price: "1.200.000đ",
      img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
      desc: "Giày sneaker thời trang, thoải mái, phù hợp đi chơi và thể thao."
    },
    {
      id: 2,
      name: "Áo khoác",
      price: "800.000đ",
      img: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b",
      desc: "Áo khoác phong cách trẻ trung, giữ ấm tốt."
    },
    {
      id: 3,
      name: "Áo thun",
      price: "200.000đ",
      img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
      desc: "Áo thun basic, dễ phối đồ, chất liệu cotton."
    },
    {
      id: 4,
      name: "Quần jean",
      price: "500.000đ",
      img: "https://images.unsplash.com/photo-1514996937319-344454492b37",
      desc: "Quần jean form đẹp, bền, phù hợp mọi phong cách."
    }
  ]

  const product = products.find(p => p.id == id)

  if (!product) return <h2>Không tìm thấy sản phẩm</h2>

  return (
    <div className="detail-container">
      <div className="detail-card">

        {/* IMAGE */}
        <div className="detail-image">
          <img src={product.img} alt={product.name} />
        </div>

        {/* INFO */}
        <div className="detail-info">
          <h1>{product.name}</h1>
          <p className="price">{product.price}</p>

          <p className="desc">{product.desc}</p>

          <div className="actions">
            <button 
              className="btn add"
              onClick={() => navigate("/cart")}
            >
              Add to Cart
            </button>

            <button 
              className="btn back"
              onClick={() => navigate("/products")}
            >
              Back to Products
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default ProductDetailPage