import client from './client';

export const menuApi = {
  listCategories: () => client.get('/categories').then((r) => r.data),

  createCategory: (payload) => client.post('/categories', payload).then((r) => r.data),
  updateCategory: (id, payload) => client.put(`/categories/${id}`, payload).then((r) => r.data),
  deleteCategory: (id) => client.delete(`/categories/${id}`),

  // params: { categoryId, search, available }
  listItems: (params = {}) => client.get('/menu-items', { params }).then((r) => r.data),
  getItem: (id) => client.get(`/menu-items/${id}`).then((r) => r.data),

  createItem: (payload) => client.post('/menu-items', payload).then((r) => r.data),
  updateItem: (id, payload) => client.put(`/menu-items/${id}`, payload).then((r) => r.data),
  setAvailability: (id, available) =>
    client.patch(`/menu-items/${id}/availability`, { available }).then((r) => r.data),
  deleteItem: (id) => client.delete(`/menu-items/${id}`),
};
