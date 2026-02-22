import api from './axios';

/**
 * 문의 작성
 * @param {Object} data - { category, title, content }
 * @param {File} file - 첨부 파일 (선택)
 */
export const createInquiry = async (data, file = null) => {
  try {
    const formData = new FormData();
    
    // JSON 데이터를 Blob으로 변환하여 추가
    const requestBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    formData.append('request', requestBlob);
    
    // 파일이 있으면 추가
    if (file) {
      formData.append('file', file);
    }

    const response = await api.post('/api/inquiries', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.data || response.data;
  } catch (error) {
    console.error('문의 작성 오류:', error);
    throw error;
  }
};

/**
 * 내 문의 목록 조회
 * @param {number} page - 페이지 번호 (0부터 시작)
 * @param {number} size - 페이지 크기
 */
export const getMyInquiries = async (page = 0, size = 5) => {
  try {
    const response = await api.get('/api/inquiries', {
      params: { page, size, sort: 'createdAt,desc' },
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error('문의 목록 조회 오류:', error);
    throw error;
  }
};

/**
 * 문의 삭제
 * @param {number} inquiryId - 문의 ID
 */
export const deleteInquiry = async (inquiryId) => {
  try {
    const response = await api.delete(`/api/inquiries/${inquiryId}`);
    return response.data;
  } catch (error) {
    console.error('문의 삭제 오류:', error);
    throw error;
  }
};

/**
 * 어드민 - 문의 목록 조회
 * @param {string} status - 상태 필터 (PENDING, ANSWERED) 또는 null
 * @param {number} page - 페이지 번호
 * @param {number} size - 페이지 크기
 */
export const getAdminInquiries = async (status = null, page = 0, size = 10) => {
  try {
    const params = { page, size, sort: 'createdAt,desc' };
    if (status) {
      params.status = status;
    }
    const response = await api.get('/api/admin/inquiries', { params });
    return response.data.data || response.data;
  } catch (error) {
    console.error('어드민 문의 목록 조회 오류:', error);
    throw error;
  }
};

/**
 * 어드민 - 문의 상세 조회
 * @param {number} inquiryId - 문의 ID
 */
export const getAdminInquiryDetail = async (inquiryId) => {
  try {
    const response = await api.get(`/api/admin/inquiries/${inquiryId}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('어드민 문의 상세 조회 오류:', error);
    throw error;
  }
};

/**
 * 어드민 - 문의 답변 등록
 * @param {number} inquiryId - 문의 ID
 * @param {string} answer - 답변 내용
 */
export const answerInquiry = async (inquiryId, answer) => {
  try {
    const response = await api.post(`/api/admin/inquiries/${inquiryId}/answer`, {
      answer,
    });
    return response.data;
  } catch (error) {
    console.error('문의 답변 등록 오류:', error);
    throw error;
  }
};
