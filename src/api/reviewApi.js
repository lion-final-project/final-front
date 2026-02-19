import api from './axios';

/**
 * 리뷰 상세 조회
 * @param {number} reviewId 
 * @returns {Promise<Object>}
 */
export const getReviewDetail = async (reviewId) => {
    const response = await api.get(`/api/reviews/${reviewId}`);
    return response.data?.data ?? response.data;
};

/**
 * 리뷰 수정
 * @param {number} reviewId 
 * @param {string} content 
 * @param {number} rating 
 * @returns {Promise<void>}
 */
export const updateReview = async (reviewId, content, rating) => {
    await api.patch(`/api/reviews/${reviewId}`, { content, rating });
};

/**
 * 리뷰 작성
 * @param {number} storeOrderId 
 * @param {Object} reviewData - { rating: number, content: string }
 * @returns {Promise<Object>}
 */
export const createReview = async (storeOrderId, reviewData) => {
    const response = await api.post(`/api/reviews/${storeOrderId}`, reviewData);
    return response.data?.data ?? response.data;
};

/**
 * 리뷰 삭제
 * @param {number} reviewId 
 * @returns {Promise<void>}
 */
export const deleteReview = async (reviewId) => {
    await api.delete(`/api/reviews/${reviewId}`);
};

/**
 * 스토어 리뷰 목록 조회
 * @param {number} storeId 
 * @param {Object} params - { sortType, page, size }
 * @returns {Promise<Object>}
 */
export const getStoreReviews = async (storeId, params = {}) => {
    const response = await api.get(`/api/reviews/stores/${storeId}`, { params });
    return response.data?.data ?? response.data;
};

/**
 * 리뷰 사장님 답글 작성
 * @param {number} reviewId 
 * @param {string} replyContent 
 * @returns {Promise<void>}
 */
export const addOwnerReply = async (reviewId, content) => {
    await api.post(`/api/reviews/${reviewId}/reply`, { content });
};
