import api from './axios';

export const uploadFile = async (file, userId, applicantType, documentType) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        // applicantType: 'rider' or 'store'
        // documentType: 'id_card', 'bank_passbook', etc.
        const response = await api.post(
            `/api/storage/${userId}/${applicantType}/${documentType}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data.data; // URL 반환 (ApiResponse.success의 data 필드)
    } catch (error) {
        throw error;
    }
};

// 배달 증빙 사진 업로드 → URL 반환
export const uploadDeliveryPhoto = async (file, orderNumber, deliveryId) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post(
            `/api/storage/delivery/${orderNumber}/${deliveryId}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data.data; // 업로드된 URL 반환
    } catch (error) {
        throw error;
    }
};
