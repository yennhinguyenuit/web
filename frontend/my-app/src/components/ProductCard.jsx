import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function ProductCard({ product }) {
  const [liked, setLiked] = useState(false);

  // check đã có trong wishlist chưa
  useEffect(() => {
    const list = JSON.parse(localStorage.getItem("wishlist")) || [];
    const exist = list.find(p => p.id === product.id);
    setLiked(!!exist);
  }, [product.id]);

  // toggle wishlist
  const handleWishlist = () => {
    let list = JSON.parse(localStorage.getItem("wishlist")) || [];

    const exist = list.find(p => p.id === product.id);

    if (exist) {
      list = list.filter(p => p.id !== product.id);
      setLiked(false);
    } else {
      list.push(product);
      setLiked(true);
    }

    localStorage.setItem("wishlist", JSON.stringify(list));
  };

  const addToCart = async () => {
    await api.post("/cart/items", {
      productId: product.id,
      quantity: 1
    });
    alert("Đã thêm giỏ hàng");
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: 16 }}>

      {/* ❤️ */}
      <button onClick={handleWishlist}>
        {liked ? "❤️" : "🤍"}
      </button>

      <Link to={`/products/${product.id}`}>
        <img src={product.image} style={{ width: "100%" }} />
      </Link>

      <h3>{product.name}</h3>
      <p>{product.price}đ</p>

      <button onClick={addToCart}>Add to cart</button>
    </div>
  );
}

export default ProductCard;