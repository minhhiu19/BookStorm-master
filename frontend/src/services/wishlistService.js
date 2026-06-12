import api from './api';

const wishlistService = {
  getWishlist: (page = 0, size = 12) => api.get('/wishlist', { params: { page, size } }),
  addToWishlist: (bookId) => api.post(`/wishlist/${bookId}`),
  removeFromWishlist: (bookId) => api.delete(`/wishlist/${bookId}`),
  checkWishlist: (bookId) => api.get(`/wishlist/check/${bookId}`),
};

export default wishlistService;
