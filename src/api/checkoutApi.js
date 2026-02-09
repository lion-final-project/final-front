import api from './axios';

/**
 * 주문서 미리보기(Checkout) 조회. 쿠폰/할인·포인트 반영 (null·0 허용).
 * @param {number[]} cartItemIds - 장바구니 상품 ID 목록 (CartProduct.id = cartProductId)
 * @param {number|null} addressId - 배송지 ID (미지정 시 기본 배송지 사용)
 * @param {{ couponId?: number | null, usePoints?: number }} [options] - 쿠폰/포인트
 * @returns {Promise<{ address, payment, storeGroups, priceSummary }>}
 */
export const getCheckout = async (cartItemIds, addressId = null, options = {}) => {
  if (!cartItemIds || cartItemIds.length === 0) {
    return {
      address: null,
      payment: null,
      storeGroups: [],
      priceSummary: { productTotal: 0, deliveryTotal: 0, discount: 0, points: 0, finalTotal: 0 },
    };
  }
  const idsParam = cartItemIds.join(',');
  const params = { cartItemIds: idsParam };
  if (addressId != null) params.addressId = addressId;
  if (options.couponId != null) params.couponId = options.couponId;
  if (options.usePoints != null && options.usePoints >= 0) params.usePoints = options.usePoints;
  const response = await api.get('/api/checkout', { params });
  const data = response.data?.data ?? response.data;
  return data;
};
