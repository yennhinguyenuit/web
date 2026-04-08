import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();

  const fetchCart = async () => {
    if (!user) {
      setCart(null);
      return null;
    }

    setLoading(true);
    try {
      const response = await cartAPI.getCart();
      if (response.success) {
        setCart(response.data);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      fetchCart();
      return;
    }

    setCart(null);
  }, [user, authLoading]);

  const addToCart = async (productId, quantity = 1, options = {}) => {
    const response = await cartAPI.addToCart(productId, quantity, options);
    setCart(response.data);
    return response;
  };

  const updateQuantity = async (itemId, quantity) => {
    const response = await cartAPI.updateQuantity(itemId, quantity);
    setCart(response.data);
    return response;
  };

  const removeItem = async (itemId) => {
    const response = await cartAPI.removeItem(itemId);
    setCart(response.data);
    return response;
  };

  const clearCart = async () => {
    const response = await cartAPI.clearCart();
    setCart(response.data);
    return response;
  };

  const value = useMemo(
    () => ({
      cart,
      loading,
      cartCount: cart?.totalQuantity || 0,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      fetchCart,
    }),
    [cart, loading]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
