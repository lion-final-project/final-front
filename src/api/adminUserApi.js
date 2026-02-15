import api from './axios';

export const getAdminUsers = async ({ page = 0, size = 10, keyword = '', status = null } = {}) => {
  const params = { page, size };
  if (keyword && keyword.trim()) {
    params.keyword = keyword.trim();
  }
  if (status && status !== 'ALL') {
    params.status = status;
  }
  const response = await api.get('/api/admin/users', { params });
  return response.data.data || response.data;
};

export const getAdminUserDetail = async (userId) => {
  const response = await api.get(`/api/admin/users/${userId}`);
  return response.data.data || response.data;
};

export const updateAdminUserStatus = async (userId, status, reason = '') => {
  const response = await api.patch(`/api/admin/users/${userId}/status`, { status, reason });
  return response.data.data || response.data;
};
