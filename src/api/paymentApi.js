import api from './axios';

/**
 * 결제 준비 API
 * @param {Object} request - 결제 준비 요청
 * @param {Object} request.productQuantities - 상품 ID -> 수량 맵 (예: { 1: 2, 2: 1 })
 * @param {string} request.paymentMethod - 결제 수단 ('CARD', 'KAKAO_PAY', 'NAVER_PAY', 'TOSS_PAY')
 * @param {string} request.deliveryAddress - 배송지 주소
 * @param {string} [request.deliveryRequest] - 배송 요청사항
 * @returns {Promise<{ orderId, paymentId, pgOrderId, amount }>}
 */
export const preparePayment = async (request) => {
  const response = await api.post('/api/payments/prepare', request);
  return response.data?.data ?? response.data;
};

/**
 * 결제 확인 API
 * @param {Object} request - 결제 확인 요청
 * @param {number} request.paymentId - 결제 ID
 * @param {string} request.paymentKey - 토스에서 받은 paymentKey
 * @returns {Promise<Object>}
 */
export const confirmPayment = async (request) => {
  const response = await api.post('/api/payments/confirm', request);
  return response.data?.data ?? response.data;
};
