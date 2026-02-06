import api from './axios';

const BASE_URL = '/api/subscriptions';

const STATUS_MAP = {
  ACTIVE: '구독중',
  PAUSED: '일시정지',
  CANCELLATION_PENDING: '해지 예정',
  CANCELLED: '해지됨',
};

/**
 * 백엔드 GetSubscriptionResponse → 마이페이지 구독 관리 UI 형식으로 변환.
 * @param {Object} d - GetSubscriptionResponse
 * @returns {Object} UI용 구독 객체 (id, name, period, price, status, img, nextPayment, monthlyCount, includedItems)
 */
export function mapSubscriptionToUI(d) {
  const nextPaymentDate = d.nextPaymentDate;
  return {
    id: String(d.subscriptionId),
    name: d.subscriptionProductName ?? '-',
    period: d.deliveryTimeSlot ? `정기배달 (${d.deliveryTimeSlot})` : '정기배달',
    price: `${(d.totalAmount ?? 0).toLocaleString()}원/월`,
    status: STATUS_MAP[d.status] ?? d.status ?? '-',
    statusRaw: d.status,
    img: '📦',
    nextPayment: nextPaymentDate ? nextPaymentDate.replace(/-/g, '.') : '-',
    monthlyCount: '-',
    includedItems: [],
  };
}

/**
 * 고객 구독 목록 조회 (API-SUB-002).
 * @returns {Promise<Array>} UI 형식의 구독 목록
 */
export async function getMySubscriptions() {
  const response = await api.get(BASE_URL);
  const list = response.data.data ?? [];
  return list.map(mapSubscriptionToUI);
}

/**
 * 구독 해지 요청 (API-SUB-005). 다음 결제일 기준 해지 예정으로 전환.
 * @param {number|string} subscriptionId
 * @param {string} [reason] 해지 사유 (선택)
 */
export async function cancelSubscription(subscriptionId, reason) {
  const params = reason ? { reason } : {};
  await api.delete(`${BASE_URL}/${subscriptionId}`, { params });
}

/**
 * 구독 일시정지 (API-SUB-003). ACTIVE 상태일 때만 가능.
 * @param {number|string} subscriptionId
 */
export async function pauseSubscription(subscriptionId) {
  await api.patch(`${BASE_URL}/${subscriptionId}/pause`);
}

/**
 * 구독 재개 (API-SUB-004). PAUSED 상태일 때만 가능.
 * @param {number|string} subscriptionId
 */
export async function resumeSubscription(subscriptionId) {
  await api.patch(`${BASE_URL}/${subscriptionId}/resume`);
}
