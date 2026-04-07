import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);

  // load từ localStorage
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(data);
  }, []);

  // xoá sản phẩm
  const removeItem = (id) => {
    const newList = wishlist.filter(p => p.id !== id);
    localStorage.setItem("wishlist", JSON.stringify(newList));
    setWishlist(newList);
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Wishlist ({wishlist.length})</h1>

      {wishlist.length === 0 ? (
        <p>Chưa có sản phẩm</p>
      ) : (
        wishlist.map(p => (
          <div key={p.id} style={{ borderBottom: "1px solid #ccc" }}>
            <h3>{p.name}</h3>
            <p>{p.price}đ</p>

            <Link to={`/products/${p.id}`}>
              <button>Xem</button>
            </Link>

            <button onClick={() => removeItem(p.id)}>
              ❌ Xóa
            </button>

            <hr />
          </div>
        ))
      )}
    </div>
  );
}