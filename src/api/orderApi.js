import api from './axios';

/**
 * 주문 목록 조회 (마이페이지용)
 * @param {number} page - 페이지 번호 (기본값: 0)
 * @param {number} size - 페이지 크기 (기본값: 10)
 * @param {string} startDate - 시작 날짜 (ISO 형식, 선택)
 * @param {string} endDate - 종료 날짜 (ISO 형식, 선택)
 * @param {string} searchTerm - 검색어 (상품명, 선택)
 * @returns {Promise<{ orders, totalPages, totalElements, currentPage, size }>}
 */
export const getOrderList = async (page = 0, size = 10, startDate = null, endDate = null, searchTerm = null) => {
  try {
    const params = { page, size };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (searchTerm && searchTerm.trim()) params.searchTerm = searchTerm.trim();
    
    const response = await api.get('/api/orders', { params });
    console.log('API 응답 전체:', response);
    console.log('response.data:', response.data);
    const data = response.data?.data ?? response.data;
    console.log('추출된 data:', data);
    return data;
  } catch (error) {
    console.error('주문 목록 조회 오류:', error);
    return {
      storeOrders: [],
      totalPages: 0,
      totalElements: 0,
      currentPage: 0,
      size: 10
    };
  }
};

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
 * 쿠폰/할인·포인트는 null·0 허용.
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
