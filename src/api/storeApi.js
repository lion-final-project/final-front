import api from './axios';

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
