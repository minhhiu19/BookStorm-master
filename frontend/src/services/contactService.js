import api from './api';

const contactService = {
  async sendMessage(data) {
    const response = await api.post('/contact', data);
    return response.data;
  },
};

export default contactService;
