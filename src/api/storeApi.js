import api from './axios';

/**
 * 내 상점 정보 조회 (상호명, 카테고리, 배달 가능 여부 등)
 * @returns {Promise<{ storeId, storeName, categoryName, isDeliveryAvailable } | null>}
 */
export const getMyStore = async () => {
  const response = await api.get('/api/stores/my');
  const data = response.data?.data ?? response.data;
  return data ?? null;
};

/**
 * 내 상점 배달 가능 on/off 수정
 * @param {boolean} deliveryAvailable
 */
export const updateDeliveryAvailable = async (deliveryAvailable) => {
  await api.patch('/api/stores/my/delivery-available', { deliveryAvailable });
};

/**
 * 내 상점 대표 이미지 URL 수정 (업로드 후 받은 URL 전달)
 * @param {string} storeImageUrl
 */
export const updateStoreImage = async (storeImageUrl) => {
  await api.patch('/api/stores/my/store-image', {
    storeImageUrl: storeImageUrl ?? '',
  });
};

/**
 * 내 상점 요일별 영업시간 조회
 * @returns {Promise<Array>} { dayOfWeek, openTime, closeTime, isClosed }[] (dayOfWeek 0=일 ~ 6=토, 정렬됨)
 */
export const getBusinessHours = async () => {
    const response = await api.get('/api/stores/my/business-hours');
    const data = response.data?.data ?? response.data ?? [];
    return Array.isArray(data) ? data : [];
};

/**
 * 내 상점 요일별 영업시간 수정 (배달 불가능 상태에서만 가능)
 * @param {Array<{ dayOfWeek: number, openTime: string, closeTime: string, isClosed: boolean }>} businessHours
 */
export const updateBusinessHours = async (businessHours) => {
    await api.put('/api/stores/my/business-hours', businessHours);
};

/**
 * 상점 카테고리 목록 조회
 * @returns {Promise<Array>} 카테고리 목록 [{id, categoryName}, ...]
 */
export const getStoreCategories = async () => {
    try {
        const response = await api.get('/api/stores/categories');
        return response.data?.data ?? [];
    } catch (error) {
        console.error('상점 카테고리 목록 조회 실패:', error);
        return [];
    }
};