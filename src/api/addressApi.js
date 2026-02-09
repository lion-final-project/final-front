import axios from './axios';

/**
 * API-USER-006: 내 배송지 목록 조회
 */
export const getAddresses = async () => {
    try {
        const response = await axios.get('/api/users/me/addresses');
        return response.data.data; // Array of address objects
    } catch (error) {
        console.error('Failed to fetch addresses:', error);
        throw error;
    }
};

/**
 * 
 * @param {number} addressId 
 * @returns 
 */
export const setDefaultAddress = async (addressId) => {
    try {
        const response = await axios.patch(`/api/users/me/addresses/${addressId}/default`);
        return response.data;
    } catch (error) {
        console.error('Failed to set default address:', error);
        throw error;
    }
};
