/**
 * 상품/주문 이미지가 없을 때 사용하는 플레이스홀더 (깨짐 방지, 소비자 인지용)
 * - "이미지 준비중" 문구를 작게 표시
 */
export const PLACEHOLDER_PRODUCT_IMAGE = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect fill="#e2e8f0" width="400" height="400"/><text x="200" y="205" fill="#94a3b8" font-family="sans-serif" font-size="11" text-anchor="middle">이미지 준비중</text></svg>'
);
