import React from 'react';

const ReceiptModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const total = parseInt(order.price.replace(/[^0-9]/g, '')) + 3000;

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1300,
      display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'white', width: '340px', padding: '30px', 
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', 
        display: 'flex', flexDirection: 'column',
        backgroundImage: 'radial-gradient(circle at 0 100%, transparent 8px, white 8px), radial-gradient(circle at 100% 100%, transparent 8px, white 8px)',
        backgroundPosition: '0 100%, 100% 100%',
        backgroundSize: '50% 16px',
        backgroundRepeat: 'repeat-x',
        paddingBottom: '40px',
        position: 'relative'
      }} onClick={e => e.stopPropagation()}>
        
        <h2 style={{ textAlign: 'center', fontSize: '20px', fontWeight: '800', marginBottom: '24px', borderBottom: '2px dashed #e2e8f0', paddingBottom: '20px' }}>
           영수증 (RECEIPT)
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', fontSize: '13px', color: '#64748b' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
             <span>매장명</span>
             <span>{order.store}</span>
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
             <span>거래일시</span>
             <span>{order.date} 14:30:22</span>
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
             <span>주문번호</span>
             <span>{order.id}</span>
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
             <span>대표자</span>
             <span>김사장</span>
           </div>
        </div>

        <div style={{ borderBottom: '2px dashed #e2e8f0', marginBottom: '24px' }}></div>

        <div style={{ marginBottom: '24px' }}>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 80px', fontSize: '13px', fontWeight: '700', marginBottom: '12px', color: '#334155' }}>
              <span>상품명</span>
              <span style={{ textAlign: 'center' }}>수량</span>
              <span style={{ textAlign: 'right' }}>금액</span>
           </div>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 80px', fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
              <span>{order.product || order.items}</span>
              <span style={{ textAlign: 'center' }}>1</span>
              <span style={{ textAlign: 'right' }}>{order.price}</span>
           </div>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 80px', fontSize: '13px', color: '#64748b' }}>
              <span>배송비</span>
              <span style={{ textAlign: 'center' }}>1</span>
              <span style={{ textAlign: 'right' }}>3,000</span>
           </div>
        </div>

        <div style={{ borderBottom: '2px dashed #e2e8f0', marginBottom: '24px' }}></div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
             <span>공급가액</span>
             <span>{Math.round(total / 1.1).toLocaleString()}</span>
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
             <span>부가세</span>
             <span>{Math.round(total - (total/1.1)).toLocaleString()}</span>
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '800', marginTop: '8px', color: '#1e293b' }}>
             <span>합계</span>
             <span>{total.toLocaleString()}원</span>
           </div>
        </div>

        <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
           <p>이용해 주셔서 감사합니다.</p>
           <p style={{ marginTop: '4px' }}>동네마켓 (Neighborhood Market)</p>
        </div>
        
        <button 
           onClick={onClose}
           style={{ 
             position: 'absolute', bottom: '-50px', left: '50%', transform: 'translateX(-50%)',
             width: '40px', height: '40px', borderRadius: '50%', background: 'white', border: 'none',
             cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center'
           }}
        >
          ✕
        </button>

      </div>
    </div>
  );
};

export default ReceiptModal;
