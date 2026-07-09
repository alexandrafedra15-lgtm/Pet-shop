import api from './api';

const mascotaService = {
  async getMascotas() {
    const response = await api.get('/mascotas/');
    return response.data;
  },

  async createMascota(mascotaData) {
    const response = await api.post('/mascotas/', mascotaData);
    return response.data;
  },

  async getRazas(especie) {
    // Public endpoint
    const response = await api.get(`/razas/${especie}/`);
    return response.data;
  }
};

export default mascotaService;
