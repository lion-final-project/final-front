import api from './axios';

/**
 * 근처 마트 검색 (PostGIS 기반)
 * 
 * 회원: 기본 배송지의 위도/경도 사용
 * 비회원: 카카오맵에서 선택한 위치의 위도/경도 사용
 * 
 * @param {Object} options - 검색 옵션
 * @param {number} options.latitude - 위도 (필수, -90 ~ 90)
 * @param {number} options.longitude - 경도 (필수, -180 ~ 180)
 * @param {number} [options.storeCategoryId] - 마트 카테고리 ID (선택)
 * @param {string} [options.keyword] - 검색어 (선택, 2~20자)
 * @param {number} [options.lastDistance] - 마지막 거리 (커서 페이지네이션용)
 * @param {number} [options.lastId] - 마지막 마트 ID (커서 페이지네이션용)
 * @param {number} [options.size=10] - 페이지 크기 (1~100, 기본값 10)
 * @returns {Promise<{content: Array, hasNext: boolean, ...}>} Slice 응답
 * 
 * @example
 * // 첫 페이지 조회
 * const result = await getNearbyStores({ latitude: 37.5665, longitude: 126.9780 });
 * 
 * // 다음 페이지 조회 (무한 스크롤)
 * const lastStore = result.content[result.content.length - 1];
 * const nextResult = await getNearbyStores({
 *   latitude: 37.5665,
 *   longitude: 126.9780,
 *   lastDistance: lastStore.distance,
 *   lastId: lastStore.storeId
 * });
 */
export const getNearbyStores = async ({
    latitude,
    longitude,
    storeCategoryId = null,
    keyword = null,
    lastDistance = null,
    lastId = null,
    size = 10
}) => {
    const params = {
        latitude,
        longitude,
        size
    };

    // 선택적 파라미터 추가 (kebab-case로 변환)
    if (storeCategoryId != null) {
        params['store-category-id'] = storeCategoryId;
    }
    if (keyword != null && keyword.trim().length >= 2) {
        params.keyword = keyword.trim();
    }
    if (lastDistance != null) {
        params['last-distance'] = lastDistance;
    }
    if (lastId != null) {
        params['last-id'] = lastId;
    }

    try {
        const response = await api.get('/api/users/stores', { params });
        // ApiResponse<Slice<StoreNearbyResponse>> 구조
        const data = response.data?.data ?? response.data;
        return data;
    } catch (error) {
        console.error('근처 마트 검색 오류:', error);
        throw error;
    }
};

/**
 * 근처 마트 검색 응답의 개별 마트 정보
 * @typedef {Object} StoreNearbyItem
 * @property {number} storeId - 마트 ID
 * @property {string} storeName - 마트 이름
 * @property {number} distance - 거리 (미터)
 * @property {number} reviewCount - 리뷰 수
 * @property {string} storeImage - 마트 이미지 URL
 * @property {boolean} isOpen - 영업 중 여부
 * @property {string} addressLine1 - 주소
 * @property {number} latitude - 위도
 * @property {number} longitude - 경도
 */

/**
 * 회원 탈퇴 가능 여부 조회 (GET /api/users/me/withdrawal/eligibility)
 * @returns {Promise<{canWithdraw: boolean, blockedReasons: Array<{code: string, message: string}>}>}
 */
export const getWithdrawalEligibility = async () => {
  const response = await api.get('/api/users/me/withdrawal/eligibility');
  const data = response.data?.data ?? response.data;
  return data;
};

/**
 * 회원 탈퇴 확정 (DELETE /api/users/me). 제한 사유 있으면 409.
 * @returns {Promise<{message: string, loggedOut: boolean, nextAction: string}>}
 */
export const deleteWithdrawal = async () => {
  const response = await api.delete('/api/users/me');
  const data = response.data?.data ?? response.data;
  return data;
};
