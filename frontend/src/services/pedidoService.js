import api from './api';

const pedidoService = {
  async createPedido(detalles) {
    const response = await api.post('/pedidos/', { detalles });
    return response.data;
  },

  async getPedido(id) {
    const response = await api.get(`/pedidos/${id}/`);
    return response.data;
  }
};

export default pedidoService;
