import api from './api';

const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login/', { email, password });
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.id,
        email: response.data.email,
        telefono: response.data.telefono
      }));
    }
    return response.data;
  },

  async register(email, password, telefono) {
    const response = await api.post('/auth/register/', { email, password, telefono });
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.id,
        email: response.data.email,
        telefono: response.data.telefono
      }));
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  }
};

export default authService;
