const CUSTOMER_BASE_URL = '/api/faqs';

export async function getFaqsForCustomer(page = 0, size = 100) {
  const res = await fetch(`${CUSTOMER_BASE_URL}?page=${page}&size=${size}`);
  if (!res.ok) throw new Error('FAQ 목록 조회 실패');
  const json = await res.json();
  return json.data;
}