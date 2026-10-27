import apiClient from './client';

export const getBudgets = async (month) => {
  const params = month ? { month } : {};
  const res = await apiClient.get('/api/budgets', { params });
  return res.data;
};

export const createOrUpdateBudget = async (data) => {
  const res = await apiClient.post('/api/budgets', data);
  return res.data;
};

export const updateBudget = async (id, data) => {
  const res = await apiClient.put(`/api/budgets/${id}`, data);
  return res.data;
};

export const deleteBudget = async (id) => {
  await apiClient.delete(`/api/budgets/${id}`);
};
