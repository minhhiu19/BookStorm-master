import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import cartService from '../services/cartService';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (authLoading || !isAuthenticated) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const response = await cartService.getCart();
      setCart(response.data || response);
    } catch {
      // silent fail - user may not have a cart yet
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(async (bookId, quantity = 1) => {
    try {
      const response = await cartService.addToCart(bookId, quantity);
      setCart(response.data);
      toast.success('Đã thêm sách vào giỏ hàng');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể thêm sách vào giỏ hàng');
      throw error;
    }
  }, []);

  const updateCartItem = useCallback(async (itemId, quantity) => {
    try {
      const response = await cartService.updateCartItem(itemId, quantity);
      setCart(response.data);
    } catch (error) {
      toast.error('Could not update cart');
      throw error;
    }
  }, []);

  const removeCartItem = useCallback(async (itemId) => {
    try {
      const response = await cartService.removeCartItem(itemId);
      setCart(response.data);
      toast.success('Removed from cart');
    } catch (error) {
      toast.error('Could not remove item');
      throw error;
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      await cartService.clearCart();
      setCart(null);
    } catch (error) {
      toast.error('Could not clear cart');
    }
  }, []);

  const cartItems = cart?.items || [];
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + ((item.book?.price ?? item.price ?? 0) * item.quantity), 0);

  const value = {
    cart,
    cartItems,
    cartCount,
    cartTotal,
    loading,
    fetchCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
