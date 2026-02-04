import api from './axios';

// 로그인
export const login = async (email, password) => {
    try {
        const response = await api.post('/api/v1/test/login', { email, password });
        return response.data; // { id, email, name }
    } catch (error) {
        throw error;
    }
};

// 회원가입
export const signup = async (signupData) => {
    try {
        const response = await api.post('/api/v1/test/signup', signupData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// 로그아웃
export const logout = async () => {
    try {
        await api.post('/api/v1/test/logout');
    } catch (error) {
        throw error;
    }
};

// 인증 상태 확인 (새로고침 시)
export const checkAuth = async () => {
    try {
        const response = await api.get('/api/v1/test/me');
        return response.data; // { id, email, name }
    } catch (error) {
        throw error;
    }
};
