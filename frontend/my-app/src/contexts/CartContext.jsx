import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], totalQuantity: 0 });
  const { user } = useAuth();

  // 🔥 LOAD từ local (QUAN TRỌNG NHẤT)
  useEffect(() => {
    const local = JSON.parse(localStorage.getItem("cart") || "[]");

    setCart({
      items: local,
      totalQuantity: local.reduce((t, i) => t + i.quantity, 0),
    });
  }, []);

  // 🔥 SAVE LOCAL + STATE (DUY NHẤT)
  const saveLocal = (items) => {
    localStorage.setItem("cart", JSON.stringify(items));

    setCart({
      items,
      totalQuantity: items.reduce((t, i) => t + i.quantity, 0),
    });
  };

  // 🔥 ADD TO CART (KHÔNG overwrite server)
  const addToCart = async (product, quantity = 1) => {
    const items = [...cart.items];

    const index = items.findIndex(
      i => String(i.productId) === String(product.id)
    );

    if (index !== -1) {
      items[index].quantity += quantity;
    } else {
      items.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity,
      });
    }

    // 👉 update UI ngay
    saveLocal(items);

    // 👉 sync server (KHÔNG reload lại cart)
    if (navigator.onLine && user) {
      try {
        await cartAPI.addToCart(product.id, quantity);
      } catch (e) {
        console.error("Sync lỗi:", e);
      }
    }
  };

  // 🔄 UPDATE QUANTITY
  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;

    const items = cart.items.map(i =>
      String(i.productId) === String(productId)
        ? { ...i, quantity }
        : i
    );

    saveLocal(items);
  };

  // ❌ REMOVE
  const removeItem = (productId) => {
    const items = cart.items.filter(
      i => String(i.productId) !== String(productId)
    );

    saveLocal(items);
  };

  // 🧹 CLEAR
  const clearCart = () => {
    localStorage.removeItem("cart");
    saveLocal([]);
  };

  // 🔄 BACKGROUND SYNC (PWA CHUẨN)
  useEffect(() => {
    const syncCart = async () => {
      try {
        if (!navigator.onLine || !user) return;

        const items = JSON.parse(localStorage.getItem("cart") || "[]");
        if (!items.length) return;

        console.log("🔄 Sync cart...");

        await Promise.allSettled(
          items.map(item =>
            cartAPI.addToCart(item.productId, item.quantity)
          )
        );

        console.log("✅ Đòng bộ thành công");
      } catch (err) {
        console.error("❌ Sync lỗi:", err);
      }
    };

    window.addEventListener("online", syncCart);
    return () => window.removeEventListener("online", syncCart);
  }, [user]);

  const value = useMemo(() => ({
    cart,
    cartCount: cart.totalQuantity,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
  }), [cart]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};