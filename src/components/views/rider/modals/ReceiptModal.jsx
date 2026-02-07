import React from 'react';

const ReceiptModal = ({ receipt, onClose }) => {
  if (!receipt) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ backgroundColor: 'white', color: 'black', borderRadius: '4px', width: '100%', maxWidth: '360px', padding: '24px', fontFamily: 'monospace' }}>
        <div style={{ textAlign: 'center', borderBottom: '1px dashed #ccc', paddingBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>[전자 영수증]</h3>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>동네마켓 - {receipt.store}</div>
        </div>
        <div style={{ padding: '20px 0', borderBottom: '1px dashed #ccc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>주문 번호</span><span>{receipt.id}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}><span>배달 완료</span><span>2026.01.24 {receipt.time}</span></div>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>주문 내역</div>
          <div style={{ fontSize: '13px' }}>{receipt.items}</div>
        </div>
        <div style={{ padding: '20px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold' }}><span>배달 수수료</span><span>{receipt.fee.toLocaleString()}원</span></div>
        </div>
        <button onClick={onClose} style={{ width: '100%', padding: '14px', background: '#333', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' }}>확인</button>
      </div>
    </div>
  );
};

export default ReceiptModal;
