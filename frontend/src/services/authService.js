import api from './api';

const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    // Map fullName -> name for frontend consistency
    if (user && user.fullName && !user.name) {
      user.name = user.fullName;
    }
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return response.data;
  },

  async register(data) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token, newPassword) {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },
};

export default authService;
