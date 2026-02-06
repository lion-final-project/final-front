import api from './axios';

/**
 * 주문 상세 조회 (결제 완료 화면/영수증용)
 * @param {number} orderId - 주문 ID
 * @returns {Promise<{ order, storeOrders, payment }>}
 */
export const getOrderDetail = async (orderId) => {
  const response = await api.get(`/api/orders/${orderId}`);
  const data = response.data?.data ?? response.data;
  return data;
};
