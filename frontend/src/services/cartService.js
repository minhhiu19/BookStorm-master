import api from './api';

const cartService = {
  getCart: () => api.get('/cart'),
  addToCart: (bookId, quantity = 1) => api.post('/cart/items', { bookId, quantity }),
  updateCartItem: (itemId, quantity) => api.put(`/cart/items/${itemId}`, { quantity }),
  removeCartItem: (itemId) => api.delete(`/cart/items/${itemId}`),
  clearCart: () => api.delete('/cart/clear'),
};

export default cartService;
