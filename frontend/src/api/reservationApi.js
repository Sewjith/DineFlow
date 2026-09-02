import client from './client';

export const reservationApi = {
  book: (payload) => client.post('/reservations', payload).then((r) => r.data),

  // admin
  listByDate: (date) =>
    client.get('/reservations', { params: { date } }).then((r) => r.data),
  updateStatus: (id, status) =>
    client.patch(`/reservations/${id}/status`, { status }).then((r) => r.data),
};
