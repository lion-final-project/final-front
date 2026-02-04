const BASE_URL = '/api/admin/notices';
const CUSTOMER_BASE_URL = '/api/notices';

export async function getNotices(page = 0, size = 20) {
  const res = await fetch(`${BASE_URL}?page=${page}&size=${size}`);
  if (!res.ok) throw new Error('공지사항 목록 조회 실패');
  const json = await res.json();
  return json.data;
}

export async function createNotice(title, content) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content }),
  });
  if (!res.ok) throw new Error('공지사항 등록 실패');
  const json = await res.json();
  return json.data;
}

export async function updateNotice(noticeId, title, content) {
  const res = await fetch(`${BASE_URL}/${noticeId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content }),
  });
  if (!res.ok) throw new Error('공지사항 수정 실패');
  const json = await res.json();
  return json.data;
}

export async function deleteNotice(noticeId) {
  const res = await fetch(`${BASE_URL}/${noticeId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('공지사항 삭제 실패');
  const json = await res.json();
  return json.data;
}

export async function getNoticesForCustomer(page = 0, size = 20) {
  const res = await fetch(`${CUSTOMER_BASE_URL}?page=${page}&size=${size}`);
  if (!res.ok) throw new Error('공지사항 목록 조회 실패');
  const json = await res.json();
  return json.data;
}
