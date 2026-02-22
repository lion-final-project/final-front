import React from 'react';

const REJECT_REASONS = ['재고 부족', '영업 종료', '배달 불가 지역', '기타 사유'];

const RejectModal = ({ rejectReason, setRejectReason, customRejectReason = '', setCustomRejectReason, onConfirm, onClose }) => {
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div style={{ background: 'white', width: '100%', maxWidth: '400px', borderRadius: '24px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>주문 거절 사유 선택</h3>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>주문을 거절하시는 사유를 선택해주세요. 고객에게 알림이 전송됩니다.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
          {REJECT_REASONS.map((reason) => (
            <button key={reason} onClick={() => setRejectReason(reason)} style={{ padding: '16px', borderRadius: '12px', border: '2px solid', borderColor: rejectReason === reason ? 'var(--primary)' : '#f1f5f9', background: rejectReason === reason ? 'rgba(46, 204, 113, 0.05)' : 'white', color: rejectReason === reason ? 'var(--primary)' : '#475569', fontWeight: '700', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}>{reason}</button>
          ))}
        </div>
        {rejectReason === '기타 사유' && (
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>
              사유 입력 (200자 이내)
            </label>
            <textarea
              value={customRejectReason}
              onChange={(e) => setCustomRejectReason?.(e.target.value)}
              placeholder="거절 사유를 입력해주세요."
              maxLength={200}
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                fontSize: '14px',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', textAlign: 'right' }}>
              {customRejectReason.length}/200
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#f1f5f9', border: 'none', fontWeight: '700', cursor: 'pointer' }}>취소</button>
          <button onClick={onConfirm} style={{ flex: 2, padding: '14px', borderRadius: '12px', background: '#ef4444', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>거절 확정</button>
        </div>
      </div>
    </div>
  );
};

export default RejectModal;
