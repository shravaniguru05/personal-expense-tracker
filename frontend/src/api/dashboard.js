import apiClient from './client';

export const getDashboardSummary = async (params = {}) => {
  const res = await apiClient.get('/api/dashboard/summary', { params });
  return res.data;
};

export const seedDemoData = async () => {
  const res = await apiClient.post('/api/dashboard/seed-demo');
  return res.data;
};

export const resetData = async () => {
  const res = await apiClient.post('/api/dashboard/reset-data');
  return res.data;
};
