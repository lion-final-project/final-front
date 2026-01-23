import React from 'react';

const OrderDetailModal = ({ isOpen, onClose, order, onTracking, onReview, onOpenDetail, onOpenReceipt, onOpenInquiry }) => {
  if (!isOpen || !order) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1200,
      display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)'
    }} onClick={onClose}>
      <div style={{
        background: 'white', width: '300px', borderRadius: '16px', overflow: 'hidden',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', animation: 'scaleUp 0.2s ease-out', position: 'relative'
      }} onClick={e => e.stopPropagation()}>
        
        <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', margin: '0 auto 12px', borderRadius: '8px', overflow: 'hidden' }}>
             <img src={order.img} alt={order.product} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, lineHeight: '1.4', wordBreak: 'keep-all' }}>{order.product}</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <button style={{ padding: '16px', border: 'none', background: 'white', borderBottom: '1px solid #f1f5f9', fontSize: '15px', color: '#1e293b', cursor: 'pointer', textAlign: 'center' }} onClick={() => { onClose(); onOpenDetail(order); }}>
            주문상세
          </button>
          
          <button style={{ padding: '16px', border: 'none', background: 'white', borderBottom: '1px solid #f1f5f9', fontSize: '15px', color: '#1e293b', cursor: 'pointer', textAlign: 'center' }} onClick={() => { onClose(); onTracking(order); }}>
            배송조회
          </button>

          <button style={{ padding: '16px', border: 'none', background: 'white', borderBottom: '1px solid #f1f5f9', fontSize: '15px', color: '#1e293b', cursor: 'pointer', textAlign: 'center' }} onClick={() => { onClose(); onOpenReceipt(order); }}>
            영수증조회
          </button>
          
          <div style={{ borderTop: '4px solid #f8fafc' }}></div>

          <div style={{ display: 'flex' }}>
             <button style={{ flex: 1, padding: '16px', border: 'none', background: 'white', fontSize: '14px', color: '#1e293b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => { onClose(); onOpenInquiry(order); }}>
               <span style={{ color: '#22c55e' }}>💬</span> 톡톡하기
             </button>
             <div style={{ width: '1px', background: '#f1f5f9' }}></div>
             <button style={{ flex: 1, padding: '16px', border: 'none', background: 'white', fontSize: '14px', color: '#1e293b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => alert('전화 문의 연결 (준비중)')}>
               <span style={{ color: '#22c55e' }}>📞</span> 전화문의
             </button>
          </div>
        </div>

        <button onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', fontSize: '24px', color: '#cbd5e1', cursor: 'pointer', padding: '4px' }}>✕</button>
      </div>
      <style>{`
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default OrderDetailModal;
