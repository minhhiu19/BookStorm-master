import api from './api';

const couponService = {
  async applyCoupon(code, orderAmount) {
    const response = await api.post('/coupons/apply', { code, orderAmount });
    return response.data;
  },
};

export default couponService;
