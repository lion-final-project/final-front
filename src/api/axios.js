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

// 응답 인터셉터
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // 디버깅: 에러 응답 상세 정보
        if (error.response) {
            console.error('API 에러 응답:', {
                status: error.response.status,
                statusText: error.response.statusText,
                url: error.config?.url,
                method: error.config?.method?.toUpperCase(),
                data: error.response.data
            });
        } else if (error.request) {
            console.error('API 요청 실패 (응답 없음):', {
                url: error.config?.url,
                method: error.config?.method?.toUpperCase()
            });
        }
        
        // 공통 에러 처리 로직
        if (error.response && error.response.data) {
            const apiResponse = error.response.data;
            if (apiResponse.error && apiResponse.error.message) {
                console.error('API Error:', apiResponse.error.message);
                // 에러 객체에 서버 메시지 추가
                error.message = apiResponse.error.message;
            } else if (apiResponse.message) {
                error.message = apiResponse.message;
            }
        }
        return Promise.reject(error);
    }
);

export default api;
