import api from './api';

const orderService = {
  createOrder: (data) => api.post('/orders', data),
  getMyOrders: (page = 0, size = 10) => api.get('/orders', { params: { page, size } }),
  getOrderByCode: (code) => api.get(`/orders/${code}`),
  cancelOrder: (code) => api.put(`/orders/${code}/cancel`),
  getOrderShipping: (orderCode) => api.get(`/orders/${orderCode}/shipping`),
  createReturnRequest: (orderCode, reason, description = '') =>
    api.post(`/returns/order/${orderCode}`, { reason, description }),
  getMyReturns: (page = 0, size = 10) => api.get('/returns', { params: { page, size } }),
};

export default orderService;
