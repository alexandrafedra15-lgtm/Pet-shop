import api from './api';

const productoService = {
  async getProductos(especie = '') {
    const params = especie ? { especie } : {};
    const response = await api.get('/productos/', { params });
    return response.data;
  }
};

export default productoService;
