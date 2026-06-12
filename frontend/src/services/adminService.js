import api from './api';

const adminService = {
  // ==========================================
  // Dashboard
  // ==========================================
  async getDashboardStats() {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  async getBestSellingBooks(limit = 10) {
    const response = await api.get('/admin/dashboard/best-sellers', {
      params: { limit },
    });
    return response.data;
  },

  async getBestSellingBooksDetailed(limit = 20) {
    const response = await api.get('/admin/dashboard/best-sellers/detailed', {
      params: { limit },
    });
    return response.data;
  },

  async getMonthlyRevenue(year, month) {
    const response = await api.get('/admin/dashboard/monthly-revenue', {
      params: { year, month },
    });
    return response.data;
  },

  // ==========================================
  // Books
  // ==========================================
  async getBooks(page = 0, size = 20, sort = 'createdAt,desc') {
    const response = await api.get('/admin/books', {
      params: { page, size, sort },
    });
    return response.data;
  },

  async getBookById(id) {
    const response = await api.get(`/admin/books/${id}`);
    return response.data;
  },

  async createBook(data) {
    const response = await api.post('/admin/books', data);
    return response.data;
  },

  async updateBook(id, data) {
    const response = await api.put(`/admin/books/${id}`, data);
    return response.data;
  },

  async deleteBook(id) {
    const response = await api.delete(`/admin/books/${id}`);
    return response.data;
  },

  // Backend nhận từng file (param "file"). Hàm này nhận FormData chứa nhiều "files" hoặc 1 file đơn.
  async uploadBookImages(id, formData) {
    // FormData có thể chứa entries 'files' (cũ) hoặc 'file' (mới)
    const allFiles = [];
    for (const [key, value] of formData.entries()) {
      if (value instanceof File || value instanceof Blob) allFiles.push(value);
    }
    const responses = [];
    for (const f of allFiles) {
      const fd = new FormData();
      fd.append('file', f);
      const r = await api.post(`/admin/books/${id}/images`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      responses.push(r.data);
    }
    return responses;
  },

  async deleteBookImage(bookId, imageId) {
    const response = await api.delete(`/admin/books/${bookId}/images/${imageId}`);
    return response.data;
  },

  async toggleBookFeatured(id) {
    const response = await api.put(`/admin/books/${id}/toggle-featured`);
    return response.data;
  },

  async toggleBookActive(id) {
    const response = await api.put(`/admin/books/${id}/toggle-active`);
    return response.data;
  },

  // ==========================================
  // Categories
  // ==========================================
  async getCategories(page = 0, size = 50) {
    const response = await api.get('/admin/categories', {
      params: { page, size },
    });
    return response.data;
  },

  async getCategoryById(id) {
    const response = await api.get(`/admin/categories/${id}`);
    return response.data;
  },

  async createCategory(data) {
    const response = await api.post('/admin/categories', data);
    return response.data;
  },

  async updateCategory(id, data) {
    const response = await api.put(`/admin/categories/${id}`, data);
    return response.data;
  },

  async deleteCategory(id) {
    const response = await api.delete(`/admin/categories/${id}`);
    return response.data;
  },

  async uploadCategoryImage(id, formData) {
    const response = await api.post(`/admin/categories/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // ==========================================
  // Orders
  // ==========================================
  async getOrders(page = 0, size = 20, status = null) {
    const params = { page, size };
    if (status) params.status = status;
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },

  async getOrderById(id) {
    const response = await api.get(`/admin/orders/${id}`);
    return response.data;
  },

  async updateOrderStatus(id, status) {
    const response = await api.put(`/admin/orders/${id}/status`, { status });
    return response.data;
  },

  async getOrdersByStatus(status, page = 0, size = 20) {
    const response = await api.get('/admin/orders', {
      params: { status, page, size },
    });
    return response.data;
  },

  // ==========================================
  // Users
  // ==========================================
  async getUsers(page = 0, size = 20, search = '') {
    const params = { page, size };
    if (search) params.search = search;
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  async getUserById(id) {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  async updateUserRole(id, role) {
    const response = await api.put(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  async toggleUserActive(id) {
    const response = await api.put(`/admin/users/${id}/toggle-status`);
    return response.data;
  },

  // ==========================================
  // Coupons
  // ==========================================
  async getCoupons(page = 0, size = 20) {
    const response = await api.get('/admin/coupons', {
      params: { page, size },
    });
    return response.data;
  },

  async getCouponById(id) {
    const response = await api.get(`/admin/coupons/${id}`);
    return response.data;
  },

  async createCoupon(data) {
    const response = await api.post('/admin/coupons', data);
    return response.data;
  },

  async updateCoupon(id, data) {
    const response = await api.put(`/admin/coupons/${id}`, data);
    return response.data;
  },

  async deleteCoupon(id) {
    const response = await api.delete(`/admin/coupons/${id}`);
    return response.data;
  },

  async toggleCouponActive(id) {
    const response = await api.put(`/admin/coupons/${id}/toggle-active`);
    return response.data;
  },

  // ==========================================
  // Banners
  // ==========================================
  async getBanners(page = 0, size = 20) {
    const response = await api.get('/admin/banners', {
      params: { page, size },
    });
    return response.data;
  },

  async getBannerById(id) {
    const response = await api.get(`/admin/banners/${id}`);
    return response.data;
  },

  async createBanner(data) {
    const response = await api.post('/admin/banners', data);
    return response.data;
  },

  async updateBanner(id, data) {
    const response = await api.put(`/admin/banners/${id}`, data);
    return response.data;
  },

  async deleteBanner(id) {
    const response = await api.delete(`/admin/banners/${id}`);
    return response.data;
  },

  async uploadBannerImage(id, formData) {
    const response = await api.post(`/admin/banners/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async toggleBannerActive(id) {
    const response = await api.put(`/admin/banners/${id}/toggle-active`);
    return response.data;
  },

  // ==========================================
  // Reviews
  // ==========================================
  async getReviews(page = 0, size = 20, visible = null) {
    const params = { page, size };
    if (visible !== null) params.visible = visible;
    const response = await api.get('/admin/reviews', { params });
    return response.data;
  },

  async getReviewsByBook(bookId) {
    const response = await api.get(`/admin/reviews/book/${bookId}`);
    return response.data;
  },

  async toggleReviewVisibility(id) {
    const response = await api.put(`/admin/reviews/${id}/toggle-visibility`);
    return response.data;
  },

  async deleteReview(id) {
    const response = await api.delete(`/admin/reviews/${id}`);
    return response.data;
  },

  // ==========================================
  // Shipping
  // ==========================================
  async createShipping(orderCode, data) {
    const response = await api.post(`/admin/shipping/order/${orderCode}`, data);
    return response.data;
  },

  async updateShippingStatus(id, data) {
    const response = await api.put(`/admin/shipping/${id}/status`, data);
    return response.data;
  },

  async getShippingByOrder(orderCode) {
    const response = await api.get(`/admin/shipping/order/${orderCode}`);
    return response.data;
  },

  async getShippingConfig() {
    const response = await api.get('/admin/shipping/config');
    return response.data;
  },

  async updateShippingConfig(data) {
    const response = await api.put('/admin/shipping/config', data);
    return response.data;
  },

  // ==========================================
  // Returns
  // ==========================================
  async getReturnRequests(page = 0, size = 20, status = null) {
    const params = { page, size };
    if (status) params.status = status;
    const response = await api.get('/admin/returns', { params });
    return response.data;
  },

  async processReturn(id, approved, refundAmount = null) {
    const data = { approved };
    if (refundAmount !== null) data.refundAmount = refundAmount;
    const response = await api.put(`/admin/returns/${id}/process`, data);
    return response.data;
  },

  // ==========================================
  // Notifications
  // ==========================================
  async sendNotification(data) {
    const response = await api.post('/admin/notifications/send', data);
    return response.data;
  },

  async sendBulkNotification(data) {
    const response = await api.post('/admin/notifications/bulk', data);
    return response.data;
  },

  // ==========================================
  // Contact Messages
  // ==========================================
  async getContactMessages(page = 0, size = 20, status = '') {
    const params = { page, size };
    if (status) params.status = status;
    const response = await api.get('/admin/contacts', { params });
    return response.data;
  },

  async updateContactMessageStatus(id, status) {
    const response = await api.put(`/admin/contacts/${id}/status`, null, {
      params: { status },
    });
    return response.data;
  },

  async deleteContactMessage(id) {
    const response = await api.delete(`/admin/contacts/${id}`);
    return response.data;
  },
};

export default adminService;
