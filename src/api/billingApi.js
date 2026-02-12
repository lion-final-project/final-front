import api from './axios';

/**
 * 카드 자동결제 billingKey 발급
 * @param {Object} request - billingKey 발급 요청
 * @param {string} request.authKey - 토스에서 받은 authKey
 * @param {string} request.customerKey - 고객 키
 * @returns {Promise<{ cardCompany, cardNumberMasked }>}
 */
export const issueCardBillingKey = async (request) => {
  const response = await api.post('/api/billing/card', request);
  return response.data?.data ?? response.data;
};

/**
 * 내 결제 수단 목록 조회
 * @returns {Promise<Array<{ id, methodType, cardCompany, cardNumberMasked, isDefault }>>}
 */
export const getMyPaymentMethods = async () => {
  const response = await api.get('/api/billing/methods');
  return response.data?.data ?? response.data;
};

/**
 * 기본 결제 수단 설정
 * @param {number} paymentMethodId - 결제 수단 ID
 * @returns {Promise<void>}
 */
export const setDefaultPaymentMethod = async (paymentMethodId) => {
  const response = await api.patch(`/api/billing/methods/${paymentMethodId}/default`);
  return response.data?.data ?? response.data;
};

/**
 * 결제 수단 삭제
 * @param {number} paymentMethodId - 결제 수단 ID
 * @returns {Promise<void>}
 */
export const deletePaymentMethod = async (paymentMethodId) => {
  const response = await api.delete(`/api/billing/methods/${paymentMethodId}`);
  return response.data?.data ?? response.data;
};
