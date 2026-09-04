import client from './client';

export const tableApi = {
  list: () => client.get('/tables').then((r) => r.data),
  create: (payload) => client.post('/tables', payload).then((r) => r.data),
  update: (id, payload) => client.put(`/tables/${id}`, payload).then((r) => r.data),
  remove: (id) => client.delete(`/tables/${id}`).then((r) => r.data),
};
