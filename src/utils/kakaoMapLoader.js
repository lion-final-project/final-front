/**
 * 카카오맵 SDK를 VITE_KAKAO_APP_KEY로 동적 로드합니다.
 * 주소 검색(Geocoder) → 위·경도 저장 → PostGIS 거리 기반 배송비 계산에 사용됩니다.
 */
const KAKAO_SDK_URL = '//dapi.kakao.com/v2/maps/sdk.js';

let loadPromise = null;

export function loadKakaoMapScript() {
  const key = import.meta.env.VITE_KAKAO_APP_KEY;
  if (!key) {
    console.warn('VITE_KAKAO_APP_KEY가 설정되지 않았습니다. 카카오맵/주소 검색이 동작하지 않을 수 있습니다.');
    return Promise.resolve();
  }
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.kakao?.maps?.load) return Promise.resolve(); // 이미 로드됨

  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = `${KAKAO_SDK_URL}?appkey=${encodeURIComponent(key)}&libraries=services&autoload=false`;
    script.async = true;
    script.onload = () => {
      if (window.kakao?.maps?.load) {
        window.kakao.maps.load(() => resolve());
      } else {
        resolve();
      }
    };
    script.onerror = () => {
      console.warn('카카오맵 SDK 로드 실패');
      resolve();
    };
    document.head.appendChild(script);
  });
  return loadPromise;
}
