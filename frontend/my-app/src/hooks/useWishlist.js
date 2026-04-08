import { useCallback, useEffect, useMemo, useState } from 'react';
import { wishlistAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const useWishlist = () => {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshWishlist = useCallback(async () => {
    if (!user) {
      setItems([]);
      return [];
    }

    setLoading(true);
    try {
      const response = await wishlistAPI.getWishlist();
      const nextItems = response.data?.items || [];
      setItems(nextItems);
      return nextItems;
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      setItems([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setItems([]);
      return;
    }

    refreshWishlist();
  }, [user, authLoading, refreshWishlist]);

  const toggleWishlist = async (productId) => {
    if (!user) {
      throw new Error('Vui lòng đăng nhập để dùng wishlist');
    }

    const exists = items.some((item) => item.product?.id === productId);

    if (exists) {
      await wishlistAPI.removeItem(productId);
      const nextItems = items.filter((item) => item.product?.id !== productId);
      setItems(nextItems);
      return { liked: false, items: nextItems };
    }

    const response = await wishlistAPI.addItem(productId);
    const createdItem = response.data;
    const nextItems = [createdItem, ...items];
    setItems(nextItems);
    return { liked: true, items: nextItems };
  };

  const wishlistIds = useMemo(
    () => new Set(items.map((item) => item.product?.id).filter(Boolean)),
    [items]
  );

  return {
    items,
    loading,
    totalItems: items.length,
    refreshWishlist,
    toggleWishlist,
    isWishlisted: (productId) => wishlistIds.has(productId),
  };
};
