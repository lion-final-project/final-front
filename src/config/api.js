/**
 * 백엔드 API Base URL (Vite: import.meta.env.VITE_* 만 노출)
 * 카카오 로그인 시 8080으로 이동 (리다이렉트 URI와 동일 호스트 필요).
 */
export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/+$/, '');

/** 카카오 콘솔 등록 리다이렉트 URI: http://localhost:8080/login/oauth2/code/kakao
 *  이 주소로 이동해야 백엔드가 카카오 소셜 로그인창으로 리다이렉트함 (회원가입 폼이 아님) */
export const KAKAO_OAUTH_AUTHORIZE_URL =
  (import.meta.env.VITE_KAKAO_OAUTH_AUTHORIZE_URL || 'http://localhost:8080/oauth2/authorization/kakao').replace(/\/+$/, '');

export const authApi = {
  checkEmail: (email) =>
    `${API_BASE_URL}/api/auth/check-email?email=${encodeURIComponent(email)}`,
  checkPhone: (phone) =>
    `${API_BASE_URL}/api/auth/check-phone?phone=${encodeURIComponent(phone)}`,
  sendVerification: () => `${API_BASE_URL}/api/auth/send-verification`,
  verifyPhone: () => `${API_BASE_URL}/api/auth/verify-phone`,
  register: () => `${API_BASE_URL}/api/auth/register`,
  login: () => `${API_BASE_URL}/api/auth/login`,
  logout: () => `${API_BASE_URL}/api/auth/logout`,
  refresh: () => `${API_BASE_URL}/api/auth/refresh`,
  /** 현재 로그인 사용자 (세션 또는 JWT). credentials 필요 */
  me: () => `${API_BASE_URL}/api/auth/me`,
  /** 카카오: 이 URL로 이동 → 백엔드가 카카오 소셜 로그인창으로 리다이렉트 (회원가입 폼 아님) */
  kakaoAuthorize: () => KAKAO_OAUTH_AUTHORIZE_URL,
  /** 카카오 최초 로그인 후 추가 회원가입 완료 (세션에 kakao_pending 필요, credentials 포함) */
  socialSignupComplete: () => `${API_BASE_URL}/api/auth/social-signup/complete`,
};

/** 마트(사장님) 구독 상품 API - API-SOP-009, API-SOP-010 등 */
export const subscriptionProductApi = {
  list: () => `${API_BASE_URL}/api/store/subscription-products`,
  create: () => `${API_BASE_URL}/api/store/subscription-products`,
  update: (id) => `${API_BASE_URL}/api/store/subscription-products/${id}`,
  updateStatus: (id) => `${API_BASE_URL}/api/store/subscription-products/${id}/status`,
  requestDeletion: (id) => `${API_BASE_URL}/api/store/subscription-products/${id}/deletion`,
  /** 삭제 예정 구독 상품의 구독자에게 알림(SSE) 발송 */
  notifySubscribers: (id) => `${API_BASE_URL}/api/store/subscription-products/${id}/notify-subscribers`,
  deleteImmediately: (id) => `${API_BASE_URL}/api/store/subscription-products/${id}`,
  /** 주간 배송 일정 (시간대별) 조회 */
  deliverySchedule: (startDate) =>
    startDate
      ? `${API_BASE_URL}/api/store/subscriptions/delivery-schedule?startDate=${startDate}`
      : `${API_BASE_URL}/api/store/subscriptions/delivery-schedule`,
  /** 지정 날짜·시간대 구독 배송 일괄 접수 (ACCEPTED 전환) */
  acceptDelivery: () => `${API_BASE_URL}/api/store/subscriptions/delivery-schedule/accept`,
};

/** 고객 구독 API - API-SUB-001 등 */
export const subscriptionApi = {
  list: () => `${API_BASE_URL}/api/subscriptions`,
  create: () => `${API_BASE_URL}/api/subscriptions`,
};
