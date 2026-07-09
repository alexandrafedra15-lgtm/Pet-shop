import api from './api';

const pagoService = {
  async crearOrdenPaypal(pedidoId) {
    const response = await api.post(`/pago/crear-orden/${pedidoId}/`);
    return response.data;
  },

  async capturarPago(orderId) {
    const response = await api.post(`/pago/capturar/${orderId}/`);
    return response.data;
  }
};

export default pagoService;
