import api from './api';

const reviewService = {
  async getBookReviews(bookId, page = 0, size = 10) {
    const response = await api.get(`/reviews/book/${bookId}`, {
      params: { page, size },
    });
    return response.data;
  },

  async createReview(data) {
    const response = await api.post('/reviews', data);
    return response.data;
  },
};

export default reviewService;
