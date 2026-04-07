import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import api from "../services/api"

function HomePage() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    api.get("/products")
      .then(res => {
        if (res.data.success) {
          setProducts(res.data.data)
        }
      })
      .catch(err => console.log(err))
  }, [])

  return (
    <div className="p-10 bg-gray-100 min-h-[80vh]">
      <h2 className="text-2xl font-bold mb-6">Sản phẩm nổi bật</h2>

      <Link to="/cart">
        <button className="bg-red-600 text-white px-6 py-2 rounded mb-6 hover:bg-red-700">
          Go to Cart
        </button>
      </Link>

      <div className="grid grid-cols-4 gap-6">
        {products.map(p => (
          <div key={p.id} className="bg-white p-4 rounded shadow">

            <Link to={`/products/${p.id}`}>
              <img src={p.image} className="h-40 w-full object-cover mb-3" />
            </Link>

            <h3 className="font-semibold">{p.name}</h3>
            <p className="text-red-600 font-bold">{p.price}đ</p>

            <button
              className="mt-2 w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
              onClick={() => {
                api.post("/cart/items", {
                  productId: p.id,
                  quantity: 1
                })
              }}
            >
              Add to cart
            </button>

          </div>
        ))}
      </div>
    </div>
  )
}

export default HomePage