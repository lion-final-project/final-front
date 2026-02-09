import React, { useState, useEffect } from 'react';

const OrderReportModal = ({ isOpen, order, onClose }) => {
  const [target, setTarget] = useState('STORE'); // STORE or RIDER
  const [content, setContent] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTarget('STORE');
      setContent('');
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const handleSubmit = () => {
    if (!content) {
      alert('신고 내용을 입력해주세요.');
      return;
    }
    const targetName = target === 'STORE' ? '마트' : '배달원';
    alert(`${targetName} 신고가 접수되었습니다.`);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1300,
      display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)'
    }} onClick={onClose}>
      <div style={{
        background: 'white', width: '100%', maxWidth: '400px', borderRadius: '24px', padding: '32px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'scaleUp 0.2s ease-out'
      }} onClick={e => e.stopPropagation()}>
        
        <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>신고하기</h3>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
          주문번호 #{order.id} 관련 신고
        </p>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>신고 대상</label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setTarget('STORE')}
              style={{
                flex: 1, padding: '12px', borderRadius: '12px', border: target === 'STORE' ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                background: target === 'STORE' ? '#f0fdf4' : 'white', color: target === 'STORE' ? 'var(--primary)' : '#64748b', fontWeight: '700', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}
            >
              🏪 마트
            </button>
            <button
              onClick={() => setTarget('RIDER')}
              style={{
                flex: 1, padding: '12px', borderRadius: '12px', border: target === 'RIDER' ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                background: target === 'RIDER' ? '#f0fdf4' : 'white', color: target === 'RIDER' ? 'var(--primary)' : '#64748b', fontWeight: '700', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}
            >
              🛵 배달원
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>신고 내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="상세한 신고 내용을 입력해주세요."
            style={{ width: '100%', height: '120px', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', resize: 'none', fontFamily: 'inherit' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={onClose}
            style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#f1f5f9', border: 'none', fontWeight: '700', cursor: 'pointer', color: '#64748b' }}
          >취소</button>
          <button 
            onClick={handleSubmit}
            style={{ flex: 2, padding: '14px', borderRadius: '12px', background: '#ef4444', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3)' }}
          >🚨 신고하기</button>
        </div>

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

export default OrderReportModal;
