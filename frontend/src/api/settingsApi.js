import client from './client';

export const settingsApi = {
  get: () => client.get('/settings').then((r) => r.data),
  update: (payload) => client.put('/settings', payload).then((r) => r.data),
};
