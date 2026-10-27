import apiClient from './client';

export const getCategories = async (type) => {
  const params = type ? { type } : {};
  const res = await apiClient.get('/api/categories', { params });
  return res.data;
};

export const createCategory = async (data) => {
  const res = await apiClient.post('/api/categories', data);
  return res.data;
};

export const updateCategory = async (id, data) => {
  const res = await apiClient.put(`/api/categories/${id}`, data);
  return res.data;
};

export const deleteCategory = async (id) => {
  await apiClient.delete(`/api/categories/${id}`);
};
