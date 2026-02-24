import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// 프록시 사용: 요청을 5173으로 보내서 쿠키(SameSite=Lax)가 붙고, Vite가 8080으로 전달
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// 요청 인터셉터
api.interceptors.request.use(
    (config) => {
        // 디버깅: 요청 URL 확인
        const fullUrl = config.baseURL
            ? `${config.baseURL}${config.url}`
            : config.url;
        console.log('API 요청:', {
            method: config.method?.toUpperCase(),
            url: fullUrl,
            baseURL: config.baseURL || '(상대 경로 - Vite 프록시 사용)',
            path: config.url
        });
        // 토큰이 있다면 헤더에 추가하는 로직이 여기에 들어갈 수 있습니다.
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 401 시 refresh 1회 재시도 후 실패하면 세션 만료 이벤트 발생
let isRefreshing = false;
let failedQueue = []; // refresh 완료 대기 중인 요청들

// 로그인 직후 일정 시간 동안 pre-login 요청의 뒤늦은 refresh 실패가
// session-expired를 트리거하지 않도록 막는 플래그
let loginJustSucceeded = false;

export function notifyLoginSuccess() {
    loginJustSucceeded = true;
    setTimeout(() => { loginJustSucceeded = false; }, 5000);
}

function processQueue(error) {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve();
    });
    failedQueue = [];
}

function dispatchSessionExpired() {
    if (loginJustSucceeded) return; // 로그인 직후에는 세션 만료 이벤트 무시
    try {
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
    } catch (e) {
        console.warn('auth:session-expired dispatch failed', e);
    }
}

// 응답 인터셉터
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const config = error.config;

        // 디버깅: 에러 응답 상세 정보
        if (error.response) {
            console.error('API 에러 응답:', {
                status: error.response.status,
                statusText: error.response.statusText,
                url: config?.url,
                method: config?.method?.toUpperCase(),
                data: error.response.data
            });
        } else if (error.request) {
            console.error('API 요청 실패 (응답 없음):', {
                url: config?.url,
                method: config?.method?.toUpperCase()
            });
        }

        // 공통 에러 처리 로직
        if (error.response && error.response.data) {
            const apiResponse = error.response.data;
            if (apiResponse.error && apiResponse.error.message) {
                console.error('API Error:', apiResponse.error.message);
                error.message = apiResponse.error.message;
            } else if (apiResponse.message) {
                error.message = apiResponse.message;
            }
        }

        // 401: refresh 1회 시도 후 재요청, 실패 시 세션 만료 처리 (로그아웃 요청은 재시도 제외)
        if (error.response?.status === 401 && config) {
            const isRefreshUrl = typeof config.url === 'string' && config.url.includes('/api/auth/refresh');
            const isLogoutUrl = typeof config.url === 'string' && config.url.includes('/api/auth/logout');
            const isRetry = config._retryByAuth === true;

            if (!isRefreshUrl && !isLogoutUrl && !isRetry) {
                if (isRefreshing) {
                    // 이미 refresh 중이면 큐에 등록하고 완료 후 재시도
                    return new Promise((resolve, reject) => {
                        failedQueue.push({
                            resolve: () => { config._retryByAuth = true; resolve(api.request(config)); },
                            reject,
                        });
                    });
                }

                isRefreshing = true;
                try {
                    await api.post('/api/auth/refresh');
                    processQueue(null);
                    config._retryByAuth = true;
                    return api.request(config);
                } catch (refreshErr) {
                    if (loginJustSucceeded) {
                        // pre-login 요청의 뒤늦은 refresh 실패:
                        // 이미 로그인 완료 상태이므로 큐와 원래 요청을 모두 재시도
                        processQueue(null);
                        config._retryByAuth = true;
                        return api.request(config);
                    }
                    processQueue(refreshErr);
                    dispatchSessionExpired();
                } finally {
                    isRefreshing = false;
                }
            } else {
                dispatchSessionExpired();
            }
        }

        return Promise.reject(error);
    }
);

export default api;
