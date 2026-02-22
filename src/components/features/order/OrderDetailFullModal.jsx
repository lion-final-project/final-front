import React, { useEffect, useState } from 'react';
import { getStoreOrderDetail } from '../../../api/orderApi';
import { PLACEHOLDER_PRODUCT_IMAGE } from '../../../constants/placeholderImage';

const OrderDetailFullModal = ({ isOpen, onClose, order }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && order?.storeOrderId) {
      setLoading(true);
      getStoreOrderDetail(order.storeOrderId)
        .then(data => {
          setDetail(data);
        })
        .catch(err => {
          console.error("주문 상세 조회 실패:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setDetail(null);
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  // 데이터가 로딩 중이거나 없을 때는 기본 props(order) 정보를 우선 보여주거나 로딩 표시
  // 여기서는 로딩 중에도 기존 order 정보를 뼈대로 보여주고, 상세 데이터가 오면 채워넣는 방식 사용

  const paymentInfo = detail?.payment;
  const orderInfo = detail?.order;
  const storeOrderInfo = detail?.storeOrder;
  const productList = detail?.products || order.storeOrder?.products || [];

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1300,
      display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'white', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto',
        borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        display: 'flex', flexDirection: 'column'
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>주문 상세 내역</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Order Info */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>
                {order.date} 주문
              </span>
              <span style={{ fontSize: '14px', color: '#64748b' }}>
                주문번호 {orderInfo?.orderNumber || order.orderNumber || order.id}
              </span>
            </div>
            <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', fontSize: '18px', color: '#1e293b' }}>{order.store}</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>{order.status}</span>
              </div>
            </div>
          </div>

          {/* Product List */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#334155' }}>주문 상품</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {productList.map((product, index) => (
                <div key={index} style={{ display: 'flex', gap: '16px', paddingBottom: '16px', borderBottom: index < productList.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#e2e8f0', flexShrink: 0 }}>
                    <img
                      src={product.productImageUrl || order.storeImageUrl || PLACEHOLDER_PRODUCT_IMAGE}
                      alt={product.productNameSnapshot}
                      onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_PRODUCT_IMAGE; }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                      {product.productNameSnapshot || "상품 정보 없음"}
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>
                      {product.priceSnapshot?.toLocaleString()}원 / {product.quantity}개
                    </div>
                  </div>
                </div>
              ))}
              {productList.length === 0 && (
                <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>상품 정보가 없습니다.</div>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#334155' }}>결제 정보</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>상품 금액</span>
                <span style={{ fontWeight: '600' }}>
                  {storeOrderInfo?.storeProductPrice?.toLocaleString() ?? order.storeOrder?.storeProductPrice?.toLocaleString() ?? '-'}원
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>배송비</span>
                <span style={{ fontWeight: '600' }}>
                  {storeOrderInfo?.deliveryFee?.toLocaleString() ?? order.storeOrder?.deliveryFee?.toLocaleString() ?? '3,000'}원
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>할인 금액</span>
                <span style={{ fontWeight: '600', color: '#ef4444' }}>-0원</span>
              </div>
              <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px' }}>
                <span style={{ fontWeight: '700' }}>총 결제 금액</span>
                <span style={{ fontWeight: '800', color: '#1e293b' }}>
                  {storeOrderInfo?.finalPrice?.toLocaleString() ?? order.price}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <span style={{ color: '#64748b' }}>결제 수단</span>
                <span style={{ fontWeight: '600' }}>
                  {paymentInfo
                    ? `${paymentInfo.cardCompany || paymentInfo.method || '카드'} ${paymentInfo.cardNumberMasked ? `(${paymentInfo.cardNumberMasked})` : ''}`
                    : '정보 없음'}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#334155' }}>배송 정보</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <div style={{ display: 'flex' }}>
                <span style={{ width: '80px', color: '#64748b' }}>받는 분</span>
                <span style={{ fontWeight: '600' }}>{orderInfo?.receiverName || '-'}</span>
              </div>
              <div style={{ display: 'flex' }}>
                <span style={{ width: '80px', color: '#64748b' }}>연락처</span>
                <span style={{ fontWeight: '600' }}>{orderInfo?.receiverPhone || '-'}</span>
              </div>
              <div style={{ display: 'flex' }}>
                <span style={{ width: '80px', color: '#64748b' }}>주소</span>
                <span style={{ fontWeight: '600', flex: 1 }}>{orderInfo?.deliveryAddress || '-'}</span>
              </div>
              <div style={{ display: 'flex' }}>
                <span style={{ width: '80px', color: '#64748b' }}>요청사항</span>
                <span style={{ fontWeight: '600' }}>{orderInfo?.deliveryRequest || '없음'}</span>
              </div>
            </div>
          </div>

          {/* Delivery Proof Photo */}
          {order.status === '배송 완료' && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#334155' }}>배송 완료 사진</h3>
              <div style={{
                width: '100%', height: '200px', backgroundColor: '#f1f5f9', borderRadius: '12px',
                overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {/* Placeholder for actual photo logic. In a real app, order would have a proofPhotoUrl field */}
                <span style={{ fontSize: '40px' }}>📦</span>
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px', textAlign: 'center' }}>
                라이더가 배송 완료 시 촬영한 사진입니다.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default OrderDetailFullModal;
