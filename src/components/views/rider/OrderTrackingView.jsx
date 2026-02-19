import React, { useEffect, useMemo, useState } from 'react';
import { getDeliveryTrackingDetail, getDeliveryTrackingList } from '../../../api/orderApi';

const OrderTrackingView = ({ trackingTarget, onBack, isModal = false }) => {
  const [shops, setShops] = useState([]);
  const [activeShopIdx, setActiveShopIdx] = useState(0);
  const [detailsByDeliveryId, setDetailsByDeliveryId] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const deliveryMap = '/src/assets/delivery_map.png';
  const deliveryProof = '/src/assets/delivery_proof.png';

  const currentShop = shops[activeShopIdx] || null;
  const currentDetail = currentShop ? detailsByDeliveryId[currentShop.id] : null;

  const getStatusText = (trackingStepLabel) => {
    if (!trackingStepLabel) return '상태 확인 중입니다';
    return trackingStepLabel;
  };

  const statusIcon = (status) => {
    switch (status) {
      case 'REQUESTED': return '📦';
      case 'ACCEPTED': return '👨‍🍳';
      case 'PICKED_UP': return '🛍️';
      case 'DELIVERING': return '🚀';
      case 'DELIVERED': return '✨';
      default: return '📍';
    }
  };

  const getStepIndex = (trackingStep) => {
    const steps = ['ORDER_RECEIVED', 'PREPARING', 'PICKUP_WAITING', 'DELIVERING', 'DELIVERED'];
    return steps.indexOf(trackingStep);
  };

  const formatTime = (value) => {
    if (!value) return '진행 중';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '진행 중';
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const getStepTimeLabel = (timeValue, isActive) => {
    if (!isActive) return '진행 예정';
    return formatTime(timeValue);
  };

  const openTarget = useMemo(() => {
    if (!trackingTarget) return {};
    return {
      deliveryId: trackingTarget.deliveryId,
      storeOrderId: trackingTarget.storeOrderId,
      orderId: trackingTarget.orderId,
      orderNumber: trackingTarget.orderNumber,
    };
  }, [trackingTarget]);

  useEffect(() => {
    let isMounted = true;

    const fetchTrackingList = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getDeliveryTrackingList(0, 20);
        const rows = Array.isArray(result?.content) ? result.content : [];

        const mapped = rows.map((item) => ({
          id: item.deliveryId,
          orderId: item.orderId,
          storeOrderId: item.storeOrderId,
          orderNumber: item.orderNumber,
          name: item.storeName || '상점',
          status: item.deliveryStatus,
          trackingStep: item.trackingStep,
          trackingStepLabel: item.trackingStepLabel,
          eta: item.estimatedMinutes ?? 0,
          etaAt: item.estimatedArrivalAt,
          updatedAt: item.updatedAt,
          rider: '-',
          icon: '🏪',
        }));

        if (!isMounted) return;

        setShops(mapped);

        if (mapped.length === 0) {
          setActiveShopIdx(0);
          return;
        }

        let nextIndex = 0;
        if (openTarget.deliveryId) {
          const idx = mapped.findIndex((m) => m.id === openTarget.deliveryId);
          if (idx >= 0) nextIndex = idx;
        } else if (openTarget.storeOrderId) {
          const idx = mapped.findIndex((m) => m.storeOrderId === openTarget.storeOrderId);
          if (idx >= 0) nextIndex = idx;
        } else if (openTarget.orderId) {
          const idx = mapped.findIndex((m) => m.orderId === openTarget.orderId);
          if (idx >= 0) nextIndex = idx;
        }

        setActiveShopIdx(nextIndex);
      } catch (e) {
        if (!isMounted) return;
        setError('배송 추적 정보를 불러오지 못했습니다.');
        setShops([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTrackingList();

    return () => {
      isMounted = false;
    };
  }, [openTarget.deliveryId, openTarget.orderId, openTarget.storeOrderId]);

  useEffect(() => {
    if (!currentShop?.id) return;

    let isMounted = true;

    const fetchDetail = async () => {
      try {
        const detail = await getDeliveryTrackingDetail(currentShop.id);
        if (!isMounted) return;

        setDetailsByDeliveryId((prev) => ({
          ...prev,
          [currentShop.id]: detail,
        }));

        setShops((prev) => prev.map((shop) => (
          shop.id === currentShop.id
            ? {
              ...shop,
              status: detail.deliveryStatus || shop.status,
              trackingStep: detail.trackingStep || shop.trackingStep,
              trackingStepLabel: detail.trackingStepLabel || shop.trackingStepLabel,
              eta: detail.estimatedMinutes ?? shop.eta,
              etaAt: detail.estimatedArrivalAt ?? shop.etaAt,
              rider: detail.riderName || '-',
            }
            : shop
        )));
      } catch (_) {
        // 상세 실패 시 기존 리스트 데이터로 표시 유지
      }
    };

    fetchDetail();
    const intervalId = setInterval(fetchDetail, 1000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [currentShop?.id]);

  if (loading) {
    return (
      <div style={{
        padding: isModal ? '24px' : '20px',
        textAlign: 'center',
        color: '#64748b',
      }}>
        배송 정보를 불러오는 중입니다.
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: isModal ? '24px' : '20px',
        textAlign: 'center',
        color: '#ef4444',
      }}>
        {error}
      </div>
    );
  }

  if (!currentShop) {
    return (
      <div style={{
        padding: isModal ? '24px' : '20px',
        textAlign: 'center',
        color: '#64748b',
      }}>
        진행 중인 배달 주문이 없습니다.
      </div>
    );
  }

  const currentTrackingStep = currentDetail?.trackingStep || currentShop.trackingStep;
  const currentStatus = currentDetail?.deliveryStatus || currentShop.status;
  const currentStepIndex = getStepIndex(currentTrackingStep);
  const deliveryPhotoUrl = currentDetail?.deliveryPhotoUrls?.[0] || deliveryProof;

  return (
    <div style={{
      padding: isModal ? '0' : '20px',
      maxWidth: isModal ? '100%' : '600px',
      margin: '0 auto',
      height: '100%',
      overflowY: 'auto'
    }}>
      {!isModal && (
        <button
          onClick={onBack}
          style={{ marginBottom: '20px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600', color: '#64748b' }}
        >
          ← 주문 내역으로 돌아가기
        </button>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
        {shops.map((shop, idx) => (
          <button
            key={shop.id}
            onClick={() => setActiveShopIdx(idx)}
            style={{
              padding: '10px 16px',
              borderRadius: '12px',
              border: 'none',
              background: activeShopIdx === idx ? 'var(--primary)' : '#f1f5f9',
              color: activeShopIdx === idx ? 'white' : '#64748b',
              fontWeight: '700',
              fontSize: '14px',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <span>{shop.icon}</span>
            {shop.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>

        <div style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ fontSize: '24px' }}>{statusIcon(currentStatus)}</div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>{getStatusText(currentDetail?.trackingStepLabel || currentShop.trackingStepLabel)}</h2>
          </div>

          <div style={{ position: 'relative', paddingLeft: '16px' }}>
            <div style={{ position: 'absolute', left: '6px', top: '10px', bottom: '10px', width: '2px', backgroundColor: '#f1f5f9' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {[
                {
                  label: '주문 접수',
                  time: getStepTimeLabel(currentDetail?.orderReceivedAt, currentStepIndex >= 0),
                  active: currentStepIndex >= 0
                },
                {
                  label: '상품 준비 중',
                  time: getStepTimeLabel(currentDetail?.preparingAt, currentStepIndex >= 1),
                  active: currentStepIndex >= 1
                },
                {
                  label: '픽업 대기',
                  time: getStepTimeLabel(currentDetail?.pickupWaitingAt, currentStepIndex >= 2),
                  active: currentStepIndex >= 2
                },
                {
                  label: '배송 중',
                  time: getStepTimeLabel(currentDetail?.deliveringAt, currentStepIndex >= 3),
                  active: currentStepIndex >= 3
                },
                {
                  label: '배송 완료',
                  time: getStepTimeLabel(currentDetail?.deliveredAt, currentStepIndex >= 4),
                  active: currentStepIndex >= 4
                }
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', position: 'relative' }}>
                  <div style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: step.active ? 'var(--primary)' : 'white',
                    border: step.active ? '2px solid var(--primary)' : '2px solid #cbd5e1',
                    zIndex: 1,
                    marginTop: '2px'
                  }} />
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: step.active ? '700' : '500', color: step.active ? '#1e293b' : '#94a3b8' }}>{step.label}</div>
                    <div style={{ fontSize: '12px', color: step.active ? '#64748b' : '#cbd5e1', marginTop: '2px' }}>{step.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {currentStatus === 'DELIVERING' && (
            <div style={{ marginTop: '24px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', height: '200px' }}>
              <img src={deliveryMap} alt="Delivery Map" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          {currentStatus === 'DELIVERED' && (currentDetail?.deliveryPhotoUrls?.length ?? 0) > 0 && (
            <div style={{ marginTop: '24px' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: '#334155' }}>배송 완료 사진</div>
              <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <img src={deliveryPhotoUrl} alt="Delivery Proof" style={{ width: '100%', height: 'auto', maxHeight: '300px', objectFit: 'cover' }} />
              </div>
            </div>
          )}
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>예상 도착 시간</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)' }}>{currentShop.eta || 0}분</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>도착 예정</div>
              <div style={{ fontSize: '18px', fontWeight: '700' }}>{formatTime(currentShop.etaAt)}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🚗</div>
            <div style={{ flexGrow: 1 }}>
              <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '2px' }}>{currentDetail?.riderName || currentShop.rider || '-'}</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>{currentDetail?.riderPhone || '연락처 정보 없음'}</div>
              {currentDetail?.riderLocation && (
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                  위치: {currentDetail.riderLocation.latitude.toFixed(5)}, {currentDetail.riderLocation.longitude.toFixed(5)}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ padding: '8px 16px', borderRadius: '8px', background: '#f1f5f9', color: '#1e293b', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>전화</button>
              <button style={{ padding: '8px 16px', borderRadius: '8px', background: '#f1f5f9', color: '#1e293b', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>문자</button>
            </div>
          </div>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', color: '#334155' }}>주문 요약</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: '#64748b' }}>주문 번호</span>
              <span style={{ fontWeight: '600' }}>{currentDetail?.orderNumber || currentShop.orderNumber || '-'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '14px' }}>
              <span style={{ color: '#64748b' }}>배송지</span>
              <span style={{ fontWeight: '600', textAlign: 'right', lineHeight: '1.5' }}>{currentDetail?.deliveryAddress || '-'}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderTrackingView;
