import api, { notifyLoginSuccess } from './axios';

export const authApi = {
    // 현재 로그인한 사용자 정보 조회
    me: () => api.get('/api/auth/me').then(res => res.data),

    // 이메일 중복 확인
    checkEmail: (email) => api.get(`/api/auth/check-email?email=${encodeURIComponent(email)}`).then(res => res.data),

    // 휴대폰 번호 중복 확인
    checkPhone: (phone) => api.get(`/api/auth/check-phone?phone=${phone}`).then(res => res.data),

    // 회원가입
    register: (data) => api.post('/api/auth/register', data).then(res => res.data),

    // 로그인
    login: (data) => api.post('/api/auth/login', data).then(res => res.data),

    // 휴대폰 인증번호 발송
    sendVerification: (phone) => api.post('/api/auth/send-verification', { phone }).then(res => res.data),

    // 휴대폰 인증번호 확인
    verifyPhone: (phone, verificationCode) => api.post('/api/auth/verify-phone', { phone, verificationCode }).then(res => res.data),

    // 소셜 로그인 추가 정보 입력 및 가입 완료
    socialSignupComplete: (data) => api.post('/api/auth/social-signup/complete', data).then(res => res.data),

    // 토큰 갱신
    refresh: () => api.post('/api/auth/refresh').then(res => res.data),

    // 로그아웃
    logout: () => api.post('/api/auth/logout').then(res => res.data),

    // 카카오 로그인 URL (프론트에서 리다이렉트용)
    kakaoAuthorize: () => {
        const base = import.meta.env.VITE_KAKAO_OAUTH_AUTHORIZE_URL || (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080') + '/oauth2/authorization/kakao';
        return base;
    },

    // 비밀번호 재설정 요청
    requestPasswordReset: (email) => api.post('/api/auth/password-reset/request', { email }).then(res => res.data),

    // 비밀번호 재설정 확인
    confirmPasswordReset: (token, newPassword) => api.post('/api/auth/password-reset/confirm', { token, newPassword }).then(res => res.data)
};

// 기존 코드와의 호환성을 위한 개별 export (점진적 전환)
// AuthModal.jsx와 App.jsx에서 payload(User 객체 등)를 직접 기대하므로 data.data를 반환하도록 처리

export const login = async (email, password) => {
    try {
        const response = await api.post('/api/auth/login', { email, password });
        // ApiResponse: { success: true, data: { ...loginResponse }, ... }
        notifyLoginSuccess(); // 로그인 직후 pre-login 요청의 뒤늦은 refresh 실패가 세션 만료를 트리거하지 않도록 억제
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

export const signup = async (signupData) => {
    try {
        const response = await api.post('/api/auth/register', signupData);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

export const logout = async () => {
    try {
        await api.post('/api/auth/logout');
    } catch (error) {
        throw error;
    }
};

/** 서버에 쿠키 삭제 응답(Set-Cookie)을 요청. 로그아웃 후 한 번 더 호출해 브라우저 쿠키 삭제를 확실히 함. */
export const clearAuthCookies = () => api.get('/api/auth/clear-cookies');

export const checkAuth = async () => {
    try {
        const response = await api.get('/api/auth/me');
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

// 추가된 export
export const checkEmail = async (email) => {
    const response = await api.get(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
    return response.data.data; // DuplicateCheckResponse
};

export const checkPhone = async (phone) => {
    const response = await api.get(`/api/auth/check-phone?phone=${phone}`);
    return response.data.data; // DuplicateCheckResponse
};

export const sendVerification = async (phone) => {
    const response = await api.post('/api/auth/send-verification', { phone });
    return response.data.data; // SendVerificationResponse
};

export const verifyPhone = async (phone, verificationCode) => {
    const response = await api.post('/api/auth/verify-phone', { phone, verificationCode });
    return response.data.data; // VerifyPhoneResponse
};

export const socialSignupComplete = async (data) => {
    const response = await api.post('/api/auth/social-signup/complete', data);
    return response.data.data; // MeResponse
};

export const requestPasswordReset = async (email) => {
    const response = await api.post('/api/auth/password-reset/request', { email });
    return response.data; // ApiResponse
};

export const confirmPasswordReset = async (token, newPassword) => {
    const response = await api.post('/api/auth/password-reset/confirm', { token, newPassword });
    return response.data; // ApiResponse
};
