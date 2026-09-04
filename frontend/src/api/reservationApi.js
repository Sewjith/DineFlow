import client from './client';

export const reservationApi = {
  book: (payload) => client.post('/reservations', payload).then((r) => r.data),
  historyByPhone: (phone) =>
    client.get('/reservations/history', { params: { phone } }).then((r) => r.data),
  availability: (date, partySize) =>
    client.get('/reservations/availability', { params: { date, partySize } }).then((r) => r.data),

  // admin
  listByDate: (date) =>
    client.get('/reservations', { params: { date } }).then((r) => r.data),
  update: (id, payload) =>
    client.put(`/reservations/${id}`, payload).then((r) => r.data),
  updateStatus: (id, status) =>
    client.patch(`/reservations/${id}/status`, { status }).then((r) => r.data),
};
