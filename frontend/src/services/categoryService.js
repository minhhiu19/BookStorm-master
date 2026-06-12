import api from './api';

const categoryService = {
  getCategories: () => api.get('/categories'),
  getRootCategories: () => api.get('/categories/root'),
  getCategoryById: (id) => api.get(`/categories/${id}`),
};

export default categoryService;
