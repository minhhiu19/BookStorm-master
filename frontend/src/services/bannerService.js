import api from './api';

const bannerService = {
  getActiveBanners: () => api.get('/banners'),
};

export default bannerService;
