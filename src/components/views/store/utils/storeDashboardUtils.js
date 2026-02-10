/** 백엔드 status -> 한글 */
export const STATUS_TO_KO = { ACTIVE: '운영중', INACTIVE: '숨김', PENDING_DELETE: '삭제 예정' };
export const KO_TO_STATUS = { '운영중': 'ACTIVE', '숨김': 'INACTIVE', '삭제 예정': 'PENDING_DELETE' };

/** 배송 요일: 0=일, 1=월, 2=화, 3=수, 4=목, 5=금, 6=토 */
const NUM_TO_KO = { 0: '일', 1: '월', 2: '화', 3: '수', 4: '목', 5: '금', 6: '토' };
export const KO_TO_NUM = { '일': 0, '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6 };

/** API 응답 → 프론트 sub 형식 */
export const mapApiToSub = (d) => ({
  id: String(d.subscriptionProductId ?? d.id),
  name: d.name ?? '',
  price: (d.price ?? 0).toLocaleString() + '원/월',
  subscribers: d.subscriberCount ?? 0,
  status: STATUS_TO_KO[d.status] ?? d.status ?? '운영중',
  monthlyTotal: d.totalDeliveryCount ?? 0,
  weeklyFreq: d.weeklyFreq != null ? d.weeklyFreq : (d.daysOfWeek && d.daysOfWeek.length) ? d.daysOfWeek.length : null,
  deliveryDays: (d.daysOfWeek ?? []).map((n) => NUM_TO_KO[n]).filter(Boolean),
  selectedProducts: (d.items ?? []).map((i) => ({ id: String(i.productId), qty: i.quantity ?? 1, productName: i.productName })),
  description: d.description ?? '',
});

export const getSubscriptionHeaders = () => ({ 'Content-Type': 'application/json' });

export const parsePriceValue = (price) => {
  if (price === undefined || price === null) return 0;
  const numeric = Number(String(price).replace(/[^\d]/g, ''));
  return Number.isNaN(numeric) ? 0 : numeric;
};

export const formatCurrency = (value) => `${Math.max(0, value).toLocaleString('ko-KR')}원`;

export const getPriceDisplay = (price, discountRate = 0) => {
  const basePrice = parsePriceValue(price);
  if (!basePrice) {
    const fallback = typeof price === 'string' && price.trim().length > 0 ? price : '0원';
    return { hasDiscount: false, originalText: fallback, saleText: fallback };
  }
  const numericDiscount = Number(discountRate) || 0;
  const hasDiscount = numericDiscount > 0;
  const saleValue = hasDiscount ? Math.round(basePrice * (100 - numericDiscount) / 100) : basePrice;
  return {
    hasDiscount,
    originalText: formatCurrency(basePrice),
    saleText: formatCurrency(saleValue),
    discountRate: numericDiscount,
  };
};

export const getApiBase = () => import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/** 백엔드 StoreOrderStatus -> 프론트 한글 */
export const STORE_ORDER_STATUS_TO_KO = {
  PENDING: '신규',
  ACCEPTED: '준비중',
  READY: '픽업가능',
  PICKED_UP: '픽업 완료',
  DELIVERING: '배달중',
  DELIVERED: '배달완료',
  CANCELLED: '취소됨',
  REJECTED: '거절됨',
};

/** API GetStoreOrderResponse -> 대시보드 주문 형식 */
export const mapStoreOrderToDisplay = (d) => {
  const products = d.products ?? [];
  const itemsList = products.map((p) => ({
    name: p.productName ?? '',
    qty: p.productQuantity ?? 1,
    price: formatCurrency((p.price ?? 0) * (p.productQuantity ?? 1)),
  }));
  const orderedAt = d.orderedAt ? new Date(d.orderedAt) : null;
  const acceptedAt = d.acceptedAt ? new Date(d.acceptedAt) : null;
  const prepMins = d.prepTime ?? 10;
  const readyAt = acceptedAt ? acceptedAt.getTime() + prepMins * 60 * 1000 : null;
  return {
    id: d.storeOrderId,
    orderNumber: d.orderNumber ?? String(d.storeOrderId),
    storeOrderId: d.storeOrderId,
    items: d.orderTitle ?? '',
    itemsList,
    price: formatCurrency(d.finalPrice ?? d.productPrice ?? 0),
    status: STORE_ORDER_STATUS_TO_KO[d.status] ?? d.status ?? '신규',
    date: orderedAt ? orderedAt.toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '',
    prepTime: prepMins,
    createdAt: orderedAt ? orderedAt.getTime() : null,
    acceptedAt: acceptedAt ? acceptedAt.getTime() : null,
    readyAt,
    deliveryAddress: d.deliveryAddress ?? '',
  };
};

/** API GetCompletedStoreOrderResponse -> 주문 관리 표시 형식 (처리 완료 탭용) */
export const mapCompletedStoreOrderToDisplay = (d) => {
  const products = d.products ?? [];
  const itemsList = products.map((p) => ({
    name: p.productName ?? '',
    qty: p.productQuantity ?? 1,
    price: formatCurrency((p.price ?? 0) * (p.productQuantity ?? 1)),
  }));
  const orderedAt = d.orderedAt ? new Date(d.orderedAt) : null;
  return {
    id: d.storeOrderId,
    orderNumber: d.orderNumber ?? String(d.storeOrderId),
    storeOrderId: d.storeOrderId,
    items: d.orderTitle ?? '',
    itemsList,
    price: formatCurrency(d.finalPrice ?? d.productPrice ?? 0),
    status: STORE_ORDER_STATUS_TO_KO[d.status] ?? d.status ?? '',
    date: orderedAt ? orderedAt.toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '',
    deliveryAddress: d.deliveryAddress ?? '',
    rejectionReason: d.cancelReason ?? null,
  };
};

export const getStatusColor = (status) => {
  const map = {
    '신규': { bg: '#fee2e2', text: '#991b1b' },
    '준비중': { bg: '#fff7ed', text: '#9a3412' },
    '준비완료': { bg: '#f0fdf4', text: '#166534' },
    '배차 완료': { bg: '#e0e7ff', text: '#4338ca' },
    '픽업 완료': { bg: '#fef3c7', text: '#92400e' },
    '픽업가능': { bg: '#eff6ff', text: '#1e40af' },
    '배달중': { bg: '#fdf4ff', text: '#701a75' },
    '배달완료': { bg: '#f1f5f9', text: '#475569' },
    '완료': { bg: '#f1f5f9', text: '#475569' },
    '거절됨': { bg: '#fef2f2', text: '#ef4444' },
  };
  return map[status] || { bg: '#f1f5f9', text: '#475569' };
};
