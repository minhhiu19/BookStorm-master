import api from './api';

const userService = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  getAddresses: () => api.get('/user/addresses'),
  addAddress: (data) => api.post('/user/addresses', data),
  updateAddress: (id, data) => api.put(`/user/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/user/addresses/${id}`),
  setDefaultAddress: (id) => api.put(`/user/addresses/${id}/default`),
  changePassword: (oldPassword, newPassword) =>
    api.put('/user/change-password', { oldPassword, newPassword }),
  uploadAvatar: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/user/profile/avatar', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default userService;
