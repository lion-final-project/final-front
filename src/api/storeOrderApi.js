import api from './axios';

/**
 * 대시보드 신규 주문 현황 조회 (사장님용)
 * StoreOrderService.getNewOrders 호출
 * @returns {Promise<Array>} GetStoreOrderResponse[]
 */
export const getNewOrders = async () => {
  const response = await api.get('/api/store/orders/new');
  const data = response.data?.data ?? response.data ?? [];
  return Array.isArray(data) ? data : [];
};

/**
 * 주문 접수 (사장님용)
 * StoreOrderService.acceptOrder 호출
 * @param {number} storeOrderId - 마트 주문 ID
 * @param {number} prepTime - 준비 시간(분), 5~25
 */
export const acceptOrder = async (storeOrderId, prepTime) => {
  await api.patch(`/api/store/orders/${storeOrderId}/accept`, { prepTime });
};

/**
 * 준비 완료 (ACCEPTED → READY)
 * StoreOrderService.completePreparation 호출
 * @param {number} storeOrderId - 마트 주문 ID
 */
export const completePreparation = async (storeOrderId) => {
  await api.patch(`/api/store/orders/${storeOrderId}/ready`);
};

/**
 * 처리 완료 주문 조회 (사장님용) - 라이더 구간만
 * StoreOrderService.getCompletedOrders - PICKED_UP, DELIVERING
 * @returns {Promise<Array>} GetCompletedStoreOrderResponse[]
 */
export const getCompletedOrders = async () => {
  const response = await api.get('/api/store/orders/completed');
  const data = response.data?.data ?? response.data ?? [];
  return Array.isArray(data) ? data : [];
};

/**
 * 주문 내역 전체 조회 (페이지네이션)
 * StoreOrderService.getAllOrders - 모든 상태, createdAt 내림차순
 * @param {number} page - 0-based 페이지
 * @param {number} size - 페이지 크기 (기본 20)
 * @returns {Promise<{ content: Array, totalElements: number, totalPages: number, number: number, size: number }>}
 */
export const getOrderHistory = async (page = 0, size = 20) => {
  const response = await api.get('/api/store/orders/history', {
    params: { page, size, sort: 'createdAt,desc' },
  });
  const pageData = response.data?.data ?? response.data ?? {};
  const content = Array.isArray(pageData.content) ? pageData.content : [];
  return {
    content,
    totalElements: pageData.totalElements ?? 0,
    totalPages: pageData.totalPages ?? 0,
    number: pageData.number ?? 0,
    size: pageData.size ?? size,
  };
};

/**
 * 주문 거절 (PENDING -> REJECTED)
 * StoreOrderService.rejectOrder 호출
 * @param {number} storeOrderId - 마트 주문 ID
 * @param {string} reason - 거절 사유
 */
export const rejectOrder = async (storeOrderId, reason) => {
  await api.patch(`/api/store/orders/${storeOrderId}/reject`, { reason });
};
