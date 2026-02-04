import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080', // Spring Boot 기본 포트
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// 요청 인터셉터
api.interceptors.request.use(
    (config) => {
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
        // 공통 에러 처리 로직
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

export default api;
