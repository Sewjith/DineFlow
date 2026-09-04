import client from './client';

export const orderApi = {
  place: (payload) => client.post('/orders', payload).then((r) => r.data),
  getByReference: (reference) =>
    client.get(`/orders/reference/${reference}`).then((r) => r.data),
  historyByPhone: (phone) =>
    client.get('/orders/history', { params: { phone } }).then((r) => r.data),

  // admin
  dashboard: () => client.get('/orders/dashboard').then((r) => r.data),
  list: (status) =>
    client.get('/orders', { params: status ? { status } : {} }).then((r) => r.data),
  getById: (id) => client.get(`/orders/${id}`).then((r) => r.data),
  updateStatus: (id, status) =>
    client.patch(`/orders/${id}/status`, { status }).then((r) => r.data),
};
