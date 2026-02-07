import React from 'react';

const OrderDetailModal = ({ order, onClose }) => {
  if (!order) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'white', width: '100%', maxWidth: '450px', borderRadius: '24px', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>주문 상세 내역</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', color: '#94a3b8', cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', marginBottom: '24px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>주문번호</div>
          <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '12px' }}>{order.id}</div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>주문상품</div>
          <div style={{ fontWeight: '600' }}>{order.items}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>결제액</div>
            <div style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '18px' }}>{order.price}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>주문시간</div>
            <div style={{ fontSize: '14px' }}>{order.date}</div>
          </div>
        </div>
        <button onClick={onClose} style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer' }}>확인</button>
      </div>
    </div>
  );
};

export default OrderDetailModal;
