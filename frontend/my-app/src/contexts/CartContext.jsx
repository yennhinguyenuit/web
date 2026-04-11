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

  // 🔥 LOAD LOCAL
  useEffect(() => {
    const local = JSON.parse(localStorage.getItem("cart") || "[]");

    setCart({
      items: local,
      totalQuantity: local.reduce((t, i) => t + i.quantity, 0),
    });
  }, []);

  // 🔥 SAVE
  const saveLocal = (items) => {
    localStorage.setItem("cart", JSON.stringify(items));

    setCart({
      items,
      totalQuantity: items.reduce((t, i) => t + i.quantity, 0),
    });
  };

  // 🔥 ADD (FIX CHÍNH)
  const addToCart = async (product, quantity = 1) => {
    const items = JSON.parse(localStorage.getItem("cart") || "[]");

    const exist = items.find(i => i.productId === product.id);

    let newItems;

    if (exist) {
      newItems = items.map(i =>
        i.productId === product.id
          ? { ...i, quantity: i.quantity + quantity }
          : i
      );
    } else {
      newItems = [
        ...items,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
        }
      ];
    }

    saveLocal(newItems);

    // sync nếu online
    if (navigator.onLine) {
      try {
        await cartAPI.addToCart(product.id, quantity);
      } catch {}
    }
  };

  // 🔄 UPDATE
  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;

    const items = JSON.parse(localStorage.getItem("cart") || "[]");

    const newItems = items.map(i =>
      i.productId === productId ? { ...i, quantity } : i
    );

    saveLocal(newItems);
  };

  // ❌ REMOVE
  const removeItem = (productId) => {
    const items = JSON.parse(localStorage.getItem("cart") || "[]");

    const newItems = items.filter(i => i.productId !== productId);

    saveLocal(newItems);
  };

  // 🧹 CLEAR
  const clearCart = () => {
    localStorage.removeItem("cart");
    saveLocal([]);
  };

  // 🔄 SYNC ONLINE
  useEffect(() => {
    const sync = async () => {
      const items = JSON.parse(localStorage.getItem("cart") || "[]");

      if (!items.length) return;

      console.log("🔄 Sync cart...");

      for (const i of items) {
        await cartAPI.addToCart(i.productId, i.quantity);
      }
    };

    window.addEventListener("online", sync);
    return () => window.removeEventListener("online", sync);
  }, []);

  const value = useMemo(() => ({
    cart,
    cartCount: cart.totalQuantity,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
  }), [cart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};