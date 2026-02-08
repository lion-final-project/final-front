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

/**
 * 주문 생성 (결제 요청). 일반결제는 배달 시간대 미선택(주문 즉시 배달). 구독결제 시 deliveryTimeSlot 전달.
 * @param {{ addressId: number, paymentMethodId: number, deliveryTimeSlot?: string, deliveryRequest?: string, cartItemIds: number[], couponId?: number | null, usePoints?: number }} payload
 * @returns {Promise<{ orderId, orderNumber, status, storeOrders, payment, orderedAt }>}
 */
export const createOrder = async (payload) => {
  const response = await api.post('/api/orders', {
    addressId: payload.addressId,
    paymentMethodId: payload.paymentMethodId,
    deliveryTimeSlot: payload.deliveryTimeSlot ?? null,
    deliveryRequest: payload.deliveryRequest ?? '',
    cartItemIds: payload.cartItemIds,
    couponId: payload.couponId ?? null,
    usePoints: payload.usePoints ?? 0,
  });
  const data = response.data?.data ?? response.data;
  return data;
};
