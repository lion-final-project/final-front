/**
 * 라이더 대시보드 API 응답 매핑 유틸리티.
 * 백엔드의 hyphenated-key JSON을 프론트엔드 camelCase로 변환합니다.
 */
export const mapToLocalDelivery = (d) => {
    if (!d) return null;
    return {
        id: d.id,
        storeOrderId: d['store-order-id'],
        storeName: d['store-name'],
        pickupAddress: d['pickup-address'],
        deliveryAddress: d['delivery-address'],
        status: mapDeliveryStatus(d.status),
        fee: d['delivery-fee'] || 0,
        createdAt: d['created-at'],
        acceptedAt: d['accepted-at'],
        deliveredAt: d['delivered-at'],
    };
};

/**
 * 백엔드 DeliveryStatus (UPPER_CASE)를 프론트엔드 메인탭 상태(lowercase)로 매핑.
 */
const mapDeliveryStatus = (status) => {
    if (!status) return 'accepted';
    const s = status.toUpperCase();
    switch (s) {
        case 'ACCEPTED': return 'accepted';
        case 'PICKED_UP': return 'pickup';
        case 'DELIVERING': return 'delivering';
        case 'DELIVERED': return 'done';
        default: return 'accepted';
    }
};
