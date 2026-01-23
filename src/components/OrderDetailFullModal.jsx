import React from 'react';

const OrderDetailFullModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

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
               <span style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>{order.date} 주문</span>
               <span style={{ fontSize: '14px', color: '#64748b' }}>주문번호 {order.id}</span>
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
            <div style={{ display: 'flex', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
               <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
                 <img src={order.img} alt={order.product} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
               </div>
               <div style={{ flexGrow: 1 }}>
                 <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>{order.product || order.items}</div>
                 <div style={{ fontSize: '14px', color: '#64748b' }}>{order.price} / 1개</div>
               </div>
            </div>
          </div>

          {/* Payment Info */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#334155' }}>결제 정보</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>상품 금액</span>
                  <span style={{ fontWeight: '600' }}>{order.price}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>배송비</span>
                  <span style={{ fontWeight: '600' }}>3,000원</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>할인 금액</span>
                  <span style={{ fontWeight: '600', color: '#ef4444' }}>-0원</span>
               </div>
               <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }}></div>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px' }}>
                  <span style={{ fontWeight: '700' }}>총 결제 금액</span>
                  <span style={{ fontWeight: '800', color: '#1e293b' }}>{(parseInt(order.price.replace(/[^0-9]/g, '')) + 3000).toLocaleString()}원</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                  <span style={{ color: '#64748b' }}>결제 수단</span>
                  <span style={{ fontWeight: '600' }}>신용카드 (현대 **** 1234)</span>
               </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#334155' }}>배송 정보</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
               <div style={{ display: 'flex' }}>
                  <span style={{ width: '80px', color: '#64748b' }}>받는 분</span>
                  <span style={{ fontWeight: '600' }}>김한성</span>
               </div>
               <div style={{ display: 'flex' }}>
                  <span style={{ width: '80px', color: '#64748b' }}>주소</span>
                  <span style={{ fontWeight: '600' }}>서울특별시 강남구 역삼동 123-45 푸르지오 아파트 102동 1504호</span>
               </div>
               <div style={{ display: 'flex' }}>
                  <span style={{ width: '80px', color: '#64748b' }}>요청사항</span>
                  <span style={{ fontWeight: '600' }}>문 앞에 놓아주세요.</span>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderDetailFullModal;
