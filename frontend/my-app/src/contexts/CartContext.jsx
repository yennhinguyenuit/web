import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const normalizeVariant = (value) => (value ? String(value).trim() : '');

const calculateCartState = (items) => ({
  items,
  totalQuantity: items.reduce((total, item) => total + Number(item.quantity || 0), 0),
});

const loadLocalCart = () => {
  try {
    const items = JSON.parse(localStorage.getItem("cart") || "[]");
    return Array.isArray(items) ? calculateCartState(items) : calculateCartState([]);
  } catch {
    return calculateCartState([]);
  }
};

const getItemIdentity = (itemOrProductId, options = {}) => {
  if (typeof itemOrProductId === 'object' && itemOrProductId !== null) {
    return {
      productId: itemOrProductId.productId,
      color: normalizeVariant(itemOrProductId.color),
      size: normalizeVariant(itemOrProductId.size),
    };
  }

  return {
    productId: itemOrProductId,
    color: normalizeVariant(options.color),
    size: normalizeVariant(options.size),
  };
};

const isSameCartItem = (item, identity) =>
  String(item.productId) === String(identity.productId) &&
  normalizeVariant(item.color) === identity.color &&
  normalizeVariant(item.size) === identity.size;

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(loadLocalCart);
  const { user } = useAuth();

  // SAVE LOCAL + STATE (DUY NHẤT)
  const saveLocal = useCallback((items) => {
    localStorage.setItem("cart", JSON.stringify(items));
    setCart(calculateCartState(items));
  }, []);

  // ADD TO CART (KHÔNG overwrite server)
  const addToCart = useCallback(async (product, quantity = 1) => {
    if (!product?.id) {
      throw new Error('Invalid product');
    }

    const color = normalizeVariant(product.color);
    const size = normalizeVariant(product.size);
    const items = [...cart.items];

    const index = items.findIndex(
      i => isSameCartItem(i, { productId: product.id, color, size })
    );

    if (index !== -1) {
      items[index].quantity += quantity;
    } else {
      items.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        color,
        size,
        quantity,
      });
    }

    // update UI ngay
    saveLocal(items);

    // sync server (KHÔNG reload lại cart)
    if (navigator.onLine && user) {
      try {
        await cartAPI.addToCart(product.id, quantity, { color, size });
      } catch (e) {
        console.error("Sync lỗi:", e);
      }
    }
  }, [cart.items, saveLocal, user]);

  // UPDATE QUANTITY
  const updateQuantity = useCallback((itemOrProductId, quantity, options = {}) => {
    if (quantity < 1) return;

    const identity = getItemIdentity(itemOrProductId, options);
    const items = cart.items.map(i =>
      isSameCartItem(i, identity)
        ? { ...i, quantity }
        : i
    );

    saveLocal(items);
  }, [cart.items, saveLocal]);

  // REMOVE
  const removeItem = useCallback((itemOrProductId, options = {}) => {
    const identity = getItemIdentity(itemOrProductId, options);
    const items = cart.items.filter(
      i => !isSameCartItem(i, identity)
    );

    saveLocal(items);
  }, [cart.items, saveLocal]);

  // CLEAR
  const clearCart = useCallback(() => {
    localStorage.removeItem("cart");
    setCart(calculateCartState([]));
  }, []);

  // BACKGROUND SYNC (PWA CHUẨN)
  useEffect(() => {
    const syncCart = async () => {
      try {
        if (!navigator.onLine || !user) return;

        const items = JSON.parse(localStorage.getItem("cart") || "[]");
        if (!items.length) return;

        console.log("🔄 Sync cart...");

        await Promise.allSettled(
          items.map(item =>
            cartAPI.addToCart(item.productId, item.quantity, {
              color: item.color,
              size: item.size,
            })
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
  }), [cart, addToCart, updateQuantity, removeItem, clearCart]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
