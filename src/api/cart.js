import api from './axios';
import { API_BASE_URL } from '../config/api';

/**
 * 백엔드 응답을 프론트엔드 형식으로 변환
 */
const transformCartResponse = (response) => {
  if (!response || !response.stores || !Array.isArray(response.stores) || response.stores.length === 0) {
    return [];
  }

  const items = [];
  response.stores.forEach(store => {
    const storeItems = store.items;
    if (!storeItems || !Array.isArray(storeItems)) return;
    storeItems.forEach(item => {
      // 이미지 URL 처리: null이거나 빈 문자열인 경우 기본 이미지 사용
      // 백엔드에서 내려오는 필드명이 다를 수 있어 여러 가능성을 체크
      let imageUrl = item.imgUrl || item.productImageUrl || item.imageUrl || item.fileUrl;

      if (!imageUrl || imageUrl.trim() === '' || imageUrl === 'null') {
        imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YxZjVmOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTRhM2I4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
      } else if (imageUrl.startsWith('/')) {
        // 상대 경로인 경우 백엔드 URL과 결합
        imageUrl = `${API_BASE_URL}${imageUrl}`;
      } else if (imageUrl.startsWith('localhost:')) {
        // 프로토콜이 없는 localhost URL인 경우 http:// 추가
        imageUrl = `http://${imageUrl}`;
      } else if (imageUrl.startsWith('file://') || imageUrl.startsWith('C:\\') || imageUrl.startsWith('/Users/') || imageUrl.startsWith('/home/')) {
        // 로컬 파일 경로인 경우 기본 이미지로 대체
        imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YxZjVmOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTRhM2I4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
      }

      items.push({
        id: item.cartProductId,
        productId: item.productId,
        cartProductId: item.cartProductId,
        storeId: store.storeId,
        storeName: store.storeName,
        name: item.productName,
        price: item.unitPrice,
        quantity: item.quantity,
        img: imageUrl,
        stock: item.stock,
        lowStock: item.lowStock,
        active: item.active,
        deliveryFee: store.deliveryFee || 3000
      });
    });
  });

  return items;
};

const emptyCartResult = () => ({
  cartId: null,
  items: [],
  totalProductPrice: 0
});

/**
 * 장바구니 조회 (백엔드 ApiResponse 래핑 또는 raw body 모두 처리)
 */
export const getCart = async () => {
  try {
    const response = await api.get('/api/cart');
    const cartResponse = response.data?.data ?? response.data;

    if (!cartResponse || !cartResponse.stores || cartResponse.stores.length === 0) {
      return {
        cartId: cartResponse?.cartId ?? null,
        items: [],
        totalProductPrice: cartResponse?.totalProductPrice ?? 0
      };
    }

    return {
      cartId: cartResponse.cartId,
      items: transformCartResponse(cartResponse),
      totalProductPrice: cartResponse.totalProductPrice ?? 0
    };
  } catch (error) {
    console.error('장바구니 조회 오류:', error?.response?.status, error?.response?.data ?? error.message);
    return emptyCartResult();
  }
};

/**
 * 장바구니에 상품 추가
 */
export const addToCart = async (productId, quantity) => {
  const response = await api.post('/api/cart/items', {
    productId,
    quantity
  });
  const cartResponse = response.data?.data ?? response.data;
  return {
    cartId: cartResponse?.cartId ?? null,
    items: transformCartResponse(cartResponse ?? {}),
    totalProductPrice: cartResponse?.totalProductPrice ?? 0
  };
};

/**
 * 장바구니 상품 수량 업데이트
 */
export const updateCartQuantity = async (productId, quantity) => {
  const response = await api.patch(`/api/cart/items/${productId}`, {
    quantity
  });
  const cartResponse = response.data?.data ?? response.data;
  return {
    cartId: cartResponse?.cartId ?? null,
    items: transformCartResponse(cartResponse ?? {}),
    totalProductPrice: cartResponse?.totalProductPrice ?? 0
  };
};

/**
 * 장바구니에서 상품 삭제
 */
export const removeFromCart = async (productId) => {
  const response = await api.delete(`/api/cart/items/${productId}`);
  const cartResponse = response.data?.data ?? response.data;
  return {
    cartId: cartResponse?.cartId ?? null,
    items: transformCartResponse(cartResponse ?? {}),
    totalProductPrice: cartResponse?.totalProductPrice ?? 0
  };
};

/**
 * 장바구니 비우기
 */
export const clearCart = async () => {
  const response = await api.delete('/api/cart');
  const cartResponse = response.data?.data ?? response.data;
  return {
    cartId: cartResponse?.cartId ?? null,
    items: transformCartResponse(cartResponse ?? {}),
    totalProductPrice: cartResponse?.totalProductPrice ?? 0
  };
};
