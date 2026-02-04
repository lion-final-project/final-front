import api from './axios';

const CUSTOMER_BASE_URL = '/api/faqs';
const ADMIN_BASE_URL = '/api/admin/faqs';

export async function getFaqsForCustomer(page = 0, size = 100) {
  const response = await api.get(`${CUSTOMER_BASE_URL}?page=${page}&size=${size}`);
  return response.data.data;
}

export async function getFaqsForAdmin(page = 0, size = 20) {
  const response = await api.get(`${ADMIN_BASE_URL}?page=${page}&size=${size}`);
  return response.data.data;
}

export async function createFaq(question, answer) {
  const response = await api.post(ADMIN_BASE_URL, { question, answer });
  return response.data.data;
}

export async function updateFaq(faqId, question, answer) {
  const response = await api.patch(`${ADMIN_BASE_URL}/${faqId}`, { question, answer });
  return response.data.data;
}

export async function deleteFaq(faqId) {
  const response = await api.delete(`${ADMIN_BASE_URL}/${faqId}`);
  return response.data.data;
}
