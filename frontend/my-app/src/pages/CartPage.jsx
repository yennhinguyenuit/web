import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

export default function CartPage() {
  const [cart, setCart] = useState([]);

  const loadCart = () => {
    api.get("/cart")
      .then(res => {
        if (res.data.success) {
          setCart(res.data.data.items);
        }
      })
      .catch(err => console.log(err));
  };

  useEffect(() => {
    loadCart();
  }, []);

  const removeItem = (itemId) => {
    api.delete(`/cart/items/${itemId}`)
      .then(() => loadCart());
  };

  const updateQty = (itemId, qty) => {
    if (qty < 1) return;

    api.patch(`/cart/items/${itemId}`, {
      quantity: qty
    }).then(() => loadCart());
  };

  const total = cart.reduce((sum, item) => {
    return sum + item.product.price * item.quantity;
  }, 0);

  return (
    <div className="p-10 bg-gray-100 min-h-[80vh]">
      <h1 className="text-2xl font-bold mb-6">Cart</h1>

      {cart.length === 0 ? (
        <div className="bg-white p-6 rounded shadow text-center">
          Giỏ hàng trống
        </div>
      ) : (
        <>
          {cart.map(item => (
            <div key={item.id} className="bg-white p-4 rounded shadow mb-4">
              <h3 className="font-semibold">{item.product.name}</h3>
              <p className="text-red-600">{item.product.price}đ</p>

              <div className="flex items-center gap-3 my-2">
                <button onClick={() => updateQty(item.id, item.quantity - 1)} className="px-3 bg-gray-200">-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQty(item.id, item.quantity + 1)} className="px-3 bg-gray-200">+</button>
              </div>

              <button onClick={() => removeItem(item.id)} className="text-red-500">
                Remove
              </button>
            </div>
          ))}

          <h2 className="text-xl font-bold mt-4">Tổng: {total}đ</h2>

          <Link to="/checkout">
            <button className="mt-4 bg-red-600 text-white px-6 py-2 rounded">
              Thanh toán
            </button>
          </Link>
        </>
      )}
    </div>
  );
}