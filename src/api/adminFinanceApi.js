import api from './axios';

export const getAdminOverviewStats = async () => {
  const response = await api.get('/api/admin/finance/overview');
  return response.data.data;
};

export const getAdminTransactionTrend = async (period = 'weekly') => {
  const response = await api.get('/api/admin/finance/overview/transactions', {
    params: { period }
  });
  return response.data.data;
};

export const getAdminTransactionDetail = async (period = 'weekly', label) => {
  const response = await api.get('/api/admin/finance/overview/transactions/details', {
    params: { period, label }
  });
  return response?.data?.data ?? response?.data ?? {};
};

export const getAdminTransactionOrderDetail = async (storeOrderId) => {
  const response = await api.get(`/api/admin/finance/overview/transactions/orders/${storeOrderId}`);
  return response?.data?.data ?? response?.data ?? {};
};

export const getAdminStoreSettlementSummary = async (yearMonth) => {
  const response = await api.get('/api/admin/finance/settlements/store/summary', {
    params: { yearMonth }
  });
  return response.data.data;
};

export const getAdminPaymentSummary = async (yearMonth) => {
  const response = await api.get('/api/admin/finance/payments/summary', {
    params: { yearMonth }
  });
  return response.data.data;
};

export const getAdminStoreSettlementTrend = async (months = 6, yearMonth) => {
  const response = await api.get('/api/admin/finance/settlements/store/trend', {
    params: { months, yearMonth }
  });
  return response.data.data;
};

export const getAdminStoreSettlements = async ({ yearMonth, status, keyword, page = 0, size = 10 }) => {
  const params = { yearMonth, status, keyword, page, size };
  Object.keys(params).forEach((key) => {
    if (params[key] === undefined || params[key] === null || params[key] === '') {
      delete params[key];
    }
  });

  const response = await api.get('/api/admin/finance/settlements/store', { params });
  return response.data.data;
};

export const executeAdminStoreSettlement = async (yearMonth) => {
  const response = await api.post('/api/admin/finance/settlements/store/execute', { yearMonth });
  return response.data.data;
};

export const executeAdminStoreSettlementSingle = async (settlementId) => {
  const response = await api.post(`/api/admin/finance/settlements/store/${settlementId}/execute`);
  return response.data.data;
};

export const executeAdminRiderSettlement = async (yearMonth) => {
  const response = await api.post('/api/admin/finance/settlements/rider/execute', { yearMonth });
  return response.data.data;
};

export const executeAdminRiderSettlementSingle = async (settlementId) => {
  const response = await api.post(`/api/admin/finance/settlements/rider/${settlementId}/execute`);
  return response.data.data;
};

export const getAdminRiderSettlementSummary = async (yearMonth) => {
  const response = await api.get('/api/admin/finance/settlements/rider/summary', {
    params: { yearMonth }
  });
  return response.data.data;
};

export const getAdminRiderSettlementTrend = async (months = 6, yearMonth) => {
  const response = await api.get('/api/admin/finance/settlements/rider/trend', {
    params: { months, yearMonth }
  });
  return response.data.data;
};

export const getAdminRiderSettlements = async ({ yearMonth, status, keyword, page = 0, size = 10 }) => {
  const params = { yearMonth, status, keyword, page, size };
  Object.keys(params).forEach((key) => {
    if (params[key] === undefined || params[key] === null || params[key] === '') {
      delete params[key];
    }
  });

  const response = await api.get('/api/admin/finance/settlements/rider', { params });
  return response.data.data;
};
