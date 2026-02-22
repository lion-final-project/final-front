import api from './axios';

export const getAdminRefunds = async (page = 0, size = 10, status = null) => {
    const params = { page, size };
    if (status && status !== 'ALL') {
        params.status = status;
    }
    const response = await api.get('/api/admin/refunds', {
        params
    });
    return response.data;
};

export const getAdminRefundDetail = async (refundId) => {
    const response = await api.get(`/api/admin/refunds/${refundId}`);
    return response.data;
};

export const approveAdminRefund = async (refundId, _, responsibility) => {
    const response = await api.post(`/api/admin/refunds/${refundId}/approve`, {
        responsibility
    });
    return response.data;
};

export const rejectAdminRefund = async (refundId, reason = '') => {
    const response = await api.post(`/api/admin/refunds/${refundId}/reject`, { reason });
    return response.data;
};
