import api from './axios';

export const registerRider = async (formData) => {
    try {
        // JSON 전송 (Content-Type: application/json 자동 설정)
        const response = await api.post('/api/riders/register', formData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// 라이더 신청 목록 조회
export const getRiderApprovals = async (page = 0, size = 10) => {
    try {
        const response = await api.get('/api/riders/approvals', {
            params: { page, size, sort: 'id,desc' }
        });
        return response.data; // ApiResponse
    } catch (error) {
        throw error;
    }
};

// 라이더 신청 취소
export const deleteRiderApproval = async (approvalId) => {
    try {
        const response = await api.delete(`/api/riders/approvals/${approvalId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// 라이더 정보 조회
export const getRiderInfo = async () => {
    try {
        const response = await api.get('/api/riders');
        return response.data; // ApiResponse<RiderResponse>
    } catch (error) {
        throw error;
    }
};

// 라이더 영업 상태 변경
export const updateRiderStatus = async (status) => { // status: 'RUNNING' or 'STOP'
    try {
        const response = await api.patch('/api/riders/status', { "operation-status": status });
        return response.data; // ApiResponse<RiderResponse>
    } catch (error) {
        throw error;
    }
};

// 라이더 위치 업데이트
export const updateRiderLocation = async (locationData) => {
    try {
        const response = await api.post('/api/riders/locations', locationData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// 특정 라이더 위치 조회
export const getRiderLocation = async (riderId) => {
    try {
        const response = await api.get(`/api/riders/locations/${riderId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
// 특정 라이더 위치 삭제
export const removeRiderLocation = async (riderId) => {
    try {
        const response = await api.delete(`/api/riders/locations/${riderId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// 내 배달 목록 조회 (status 필터 선택적)
export const getMyDeliveries = async (status) => {
    try {
        const params = status ? { status } : {};
        const response = await api.get('/api/riders/deliveries', { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// 배달 상세 조회
export const getDeliveryDetail = async (deliveryId) => {
    try {
        const response = await api.get(`/api/riders/deliveries/${deliveryId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// 배달 수락 (REQUESTED → ACCEPTED)
export const acceptDeliveryRequest = async (deliveryId) => {
    try {
        const response = await api.post(`/api/riders/deliveries/${deliveryId}/accept`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// 픽업 완료 (ACCEPTED → PICKED_UP)
export const pickUpDelivery = async (deliveryId) => {
    try {
        const response = await api.patch(`/api/riders/deliveries/${deliveryId}/pickup`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// 배송 시작 (PICKED_UP → DELIVERING)
export const startDelivery = async (deliveryId) => {
    try {
        const response = await api.patch(`/api/riders/deliveries/${deliveryId}/start`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// 배달 완료 (증빙 사진 URL 필수)
export const completeDelivery = async (deliveryId, photoUrl) => {
    try {
        const response = await api.patch(`/api/riders/deliveries/${deliveryId}/complete`, { photoUrl });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// 정산 목록 조회
export const getRiderSettlements = async (year, month) => {
    try {
        const params = {};
        if (year) params.year = year;
        if (month) params.month = month;
        const response = await api.get('/api/riders/settlements', { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// 정산 상세 조회
export const getRiderSettlementDetail = async (settlementId) => {
    try {
        const response = await api.get(`/api/riders/settlements/${settlementId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// 라이더 배달 이력 조회
export const getRiderDeliveryHistory = async (page = 0, size = 10) => {
    try {
        const response = await api.get('/api/riders/deliveries/history', {
            params: { page, size }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};
