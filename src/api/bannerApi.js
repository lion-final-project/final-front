/**
 * 배너 CRUD API
 * - 서버 응답: imageUrl, linkUrl, backgroundColor, status(ACTIVE|INACTIVE)
 * - 모달/UI: img, promotion, color, status(노출 중|일시 중지|종료)
 */
const BASE_URL = '/api/admin/banners';

function toModalShape(b) {
  if (!b) return null;
  return {
    id: b.id,
    title: b.title ?? '',
    content: b.content ?? '',
    img: b.imageUrl ?? '',
    promotion: b.linkUrl ?? '',
    color: b.backgroundColor ?? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    status: b.status === 'ACTIVE' ? '노출 중' : b.status === 'INACTIVE' ? '일시 중지' : '종료',
  };
}

function toRequestPayload(banner, { isUpdate = false } = {}) {
  const payload = {
    title: banner.title ?? '',
    content: banner.content ?? '',
    imageUrl: banner.img ?? banner.imageUrl ?? '',
    linkUrl: banner.promotion ?? banner.linkUrl ?? '',
    backgroundColor: banner.color ?? banner.backgroundColor ?? '',
    displayOrder: banner.displayOrder ?? 0,
    status: banner.status === '노출 중' ? 'ACTIVE' : 'INACTIVE',
  };
  if (!isUpdate) {
    const now = new Date();
    const oneYearLater = new Date(now);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    payload.startedAt = now.toISOString().slice(0, 19);
    payload.endedAt = oneYearLater.toISOString().slice(0, 19);
  }
  return payload;
}

export async function getBanners() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
  const url = API_BASE_URL ? `${API_BASE_URL}${BASE_URL}` : BASE_URL;
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error('배너 목록 조회 실패');
  const json = await res.json();
  const list = json.data ?? [];
  return list.map(toModalShape);
}

export async function createBanner(banner) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
  const url = API_BASE_URL ? `${API_BASE_URL}${BASE_URL}` : BASE_URL;
  const body = toRequestPayload(banner);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? '배너 등록 실패');
  }
  const json = await res.json();
  return json.data;
}

export async function updateBanner(bannerId, banner) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
  const url = API_BASE_URL ? `${API_BASE_URL}${BASE_URL}/${bannerId}` : `${BASE_URL}/${bannerId}`;
  const body = toRequestPayload(banner, { isUpdate: true });
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('배너 수정 실패');
  const json = await res.json();
  return json.data;
}

export async function deleteBanner(bannerId) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
  const url = API_BASE_URL ? `${API_BASE_URL}${BASE_URL}/${bannerId}` : `${BASE_URL}/${bannerId}`;
  const res = await fetch(url, { method: 'DELETE', credentials: 'include' });
  if (!res.ok) throw new Error('배너 삭제 실패');
  const json = await res.json();
  return json.data;
}
