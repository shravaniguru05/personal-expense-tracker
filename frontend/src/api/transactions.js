import apiClient from './client';

export const getTransactions = async (params = {}) => {
  const res = await apiClient.get('/api/transactions', { params });
  return res.data;
};

export const getTransaction = async (id) => {
  const res = await apiClient.get(`/api/transactions/${id}`);
  return res.data;
};

export const createTransaction = async (data) => {
  const res = await apiClient.post('/api/transactions', data);
  return res.data;
};

export const updateTransaction = async (id, data) => {
  const res = await apiClient.put(`/api/transactions/${id}`, data);
  return res.data;
};

export const deleteTransaction = async (id) => {
  await apiClient.delete(`/api/transactions/${id}`);
};

export const exportTransactionsCSV = (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  const baseURL = import.meta.env.VITE_API_URL || '';
  const url = `${baseURL}/api/transactions/export/csv?${params.toString()}`;
  window.open(url, '_blank');
};

