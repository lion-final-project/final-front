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
