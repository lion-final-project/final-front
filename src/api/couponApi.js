import api from './axios';

/**
 * 주문/결제 시 사용 가능한 쿠폰 목록 조회
 * @returns {Promise<{ id: number, name: string, discountAmount: number }[]>}
 */
export const getAvailableCoupons = async () => {
  const response = await api.get('/api/coupons');
  const data = response.data?.data ?? response.data;
  return Array.isArray(data) ? data : [];
};
