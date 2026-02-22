import api from './axios';

export const getAdminReports = async ({ page = 0, size = 10, keyword = '', status = null } = {}) => {
  const params = { page, size };
  if (keyword && keyword.trim()) {
    params.keyword = keyword.trim();
  }
  if (status && status !== 'ALL') {
    params.status = status;
  }
  const response = await api.get('/api/admin/reports', { params });
  return response.data.data || response.data;
};

export const getAdminReportDetail = async (reportId) => {
  const response = await api.get(`/api/admin/reports/${reportId}`);
  return response.data.data || response.data;
};

export const resolveAdminReport = async (reportId, resultMessage) => {
  const response = await api.patch(`/api/admin/reports/${reportId}/resolve`, { resultMessage });
  return response.data.data || response.data;
};

export const getAdminBroadcastHistory = async ({ page = 0, size = 10 } = {}) => {
  const response = await api.get('/api/admin/notifications/broadcasts', { params: { page, size } });
  return response.data.data || response.data;
};

export const createAdminBroadcast = async ({ targetType, title, content }) => {
  const response = await api.post('/api/admin/notifications/broadcasts', { targetType, title, content });
  return response.data.data || response.data;
};

