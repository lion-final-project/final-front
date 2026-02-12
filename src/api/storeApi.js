import api from './axios';

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
