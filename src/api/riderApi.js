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
