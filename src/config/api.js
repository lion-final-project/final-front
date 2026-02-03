/**
 * 백엔드 API Base URL (Vite: import.meta.env.VITE_* 만 노출)
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const authApi = {
  checkEmail: (email) =>
    `${API_BASE_URL}/api/auth/check-email?email=${encodeURIComponent(email)}`,
  checkPhone: (phone) =>
    `${API_BASE_URL}/api/auth/check-phone?phone=${encodeURIComponent(phone)}`,
  sendVerification: () => `${API_BASE_URL}/api/auth/send-verification`,
  verifyPhone: () => `${API_BASE_URL}/api/auth/verify-phone`,
  register: () => `${API_BASE_URL}/api/auth/register`,
};
