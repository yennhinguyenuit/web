import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);
const FALLBACK_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80';

const normalizeVariant = (value) => (value ? String(value).trim() : '');

const calculateCartState = (items) => ({
  items,
  totalQuantity: items.reduce((total, item) => total + Number(item.quantity || 0), 0),
});

const normalizeCartItem = (item) => ({
  productId: item.productId || item.product?.id,
  id: item.id,
  name: item.name || item.productName || item.product?.name || `Product ${item.productId || item.product?.id}`,
  price: item.price || item.unitPrice || item.product?.price || 0,
  image: item.image || item.thumbnail || item.productImage || item.product?.image || FALLBACK_PRODUCT_IMAGE,
  color: normalizeVariant(item.color),
  size: normalizeVariant(item.size),
  quantity: Number(item.quantity || 1),
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

const mergeCartItems = (currentItems, incomingItems) => {
  const merged = [...currentItems.map(normalizeCartItem)];

  incomingItems.map(normalizeCartItem).forEach((incoming) => {
    if (!incoming.productId) return;

    const identity = getItemIdentity(incoming);
    const index = merged.findIndex((item) => isSameCartItem(item, identity));

    if (index >= 0) {
      merged[index] = {
        ...merged[index],
        ...incoming,
        quantity: Math.max(Number(merged[index].quantity || 0), Number(incoming.quantity || 0)),
      };
    } else {
      merged.push(incoming);
    }
  });

  return merged;
};

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
    const normalizedItems = items.map(normalizeCartItem).filter((item) => item.productId);
    localStorage.setItem("cart", JSON.stringify(normalizedItems));
    setCart(calculateCartState(normalizedItems));
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
      items[index].name = product.name || items[index].name;
      items[index].price = product.price || items[index].price;
      items[index].image = product.image || product.thumbnail || product.images?.[0] || items[index].image || FALLBACK_PRODUCT_IMAGE;
    } else {
      items.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image || product.thumbnail || product.images?.[0] || FALLBACK_PRODUCT_IMAGE,
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

  const refreshCart = useCallback(async () => {
    if (!navigator.onLine || !user) return cart;

    const response = await cartAPI.getCart();
    const serverItems = response?.data?.items || [];
    const localItems = loadLocalCart().items;
    const mergedItems = mergeCartItems(localItems, serverItems);
    saveLocal(mergedItems);
    return calculateCartState(mergedItems);
  }, [saveLocal, user]);

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

  useEffect(() => {
    if (!user || !navigator.onLine) return;

    let ignore = false;

    const loadServerCart = async () => {
      try {
        const response = await cartAPI.getCart();
        if (ignore) return;
        const serverItems = response?.data?.items || [];
        if (!serverItems.length && !cart.items.length) return;
        saveLocal(mergeCartItems(cart.items, serverItems));
      } catch (error) {
        console.error('Load cart lỗi:', error);
      }
    };

    loadServerCart();
    return () => {
      ignore = true;
    };
  }, [user, saveLocal]);

  const value = useMemo(() => ({
    cart,
    cartCount: cart.totalQuantity,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart,
  }), [cart, addToCart, updateQuantity, removeItem, clearCart, refreshCart]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
