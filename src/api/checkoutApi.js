import api from './axios';

/**
 * 주문서 미리보기(Checkout) 조회
 * @param {number[]} cartItemIds - 장바구니 상품 ID 목록 (CartProduct.id = cartProductId)
 * @param {number|null} addressId - 배송지 ID (미지정 시 기본 배송지 사용)
 * @returns {Promise<{ address, payment, storeGroups, priceSummary }>}
 */
export const getCheckout = async (cartItemIds, addressId = null) => {
  if (!cartItemIds || cartItemIds.length === 0) {
    return {
      address: null,
      payment: null,
      storeGroups: [],
      priceSummary: { productTotal: 0, deliveryTotal: 0, discount: 0, points: 0, finalTotal: 0 },
    };
  }
  const idsParam = cartItemIds.join(',');
  const params = addressId != null ? { cartItemIds: idsParam, addressId } : { cartItemIds: idsParam };
  const response = await api.get('/api/checkout', { params });
  const data = response.data?.data ?? response.data;
  return data;
};
