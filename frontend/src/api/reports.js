import apiClient from './client';

export const getReportsData = async (params = {}) => {
  const res = await apiClient.get('/api/reports/analytics', { params });
  return res.data;
};

