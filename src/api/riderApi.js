import api from './axios';

export const registerRider = async (formData) => {
    try {
        const response = await api.post('/api/riders/register', formData);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

export const getRiderApprovals = async (page = 0, size = 10) => {
    try {
        const response = await api.get('/api/riders/approvals', {
            params: { page, size, sort: 'id,desc' }
        });
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

export const deleteRiderApproval = async (approvalId) => {
    try {
        const response = await api.delete(`/api/riders/approvals/${approvalId}`);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

export const getRiderInfo = async () => {
    try {
        const response = await api.get('/api/riders');
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

export const updateRiderStatus = async (status) => {
    try {
        const response = await api.patch('/api/riders/status', { "operation-status": status });
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

export const updateRiderLocation = async (locationData) => {
    try {
        const response = await api.post('/api/riders/locations', locationData);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

export const getRiderLocation = async (riderId) => {
    try {
        const response = await api.get(`/api/riders/locations/${riderId}`);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

export const removeRiderLocation = async (riderId) => {
    try {
        const response = await api.delete(`/api/riders/locations/${riderId}`);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

export const getMyDeliveries = async (status = null, page = 0, size = 10) => {
    try {
        const params = { page, size };
        if (status) params.status = status;
        const response = await api.get('/api/riders/deliveries', { params });
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

export const getDeliveryDetail = async (deliveryId) => {
    try {
        const response = await api.get(`/api/riders/deliveries/${deliveryId}`);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

export const acceptDelivery = async (deliveryId) => {
    try {
        const response = await api.post(`/api/riders/deliveries/${deliveryId}/accept`);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

export const pickUpDelivery = async (deliveryId) => {
    try {
        const response = await api.patch(`/api/riders/deliveries/${deliveryId}/pickup`);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

export const startDelivery = async (deliveryId) => {
    try {
        const response = await api.patch(`/api/riders/deliveries/${deliveryId}/start`);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

export const completeDelivery = async (deliveryId) => {
    try {
        const response = await api.patch(`/api/riders/deliveries/${deliveryId}/complete`);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};
