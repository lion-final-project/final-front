import React from 'react';

const ReportModal = ({ order, reportTarget, setReportTarget, reportContent, setReportContent, onSubmit, onClose }) => {
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div style={{ background: 'white', width: '100%', maxWidth: '450px', borderRadius: '24px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>신고하기</h3>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
          {order ? `주문번호 #${order.id} 관련 신고` : '신고 내용을 입력해주세요.'}
        </p>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>신고 대상</label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setReportTarget('RIDER')}
              style={{
                flex: 1, padding: '12px', borderRadius: '12px', border: reportTarget === 'RIDER' ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                background: reportTarget === 'RIDER' ? '#f0fdf4' : 'white', color: reportTarget === 'RIDER' ? 'var(--primary)' : '#64748b', fontWeight: '700', cursor: 'pointer'
              }}
            >
              🛵 배달원
            </button>
            <button
              onClick={() => setReportTarget('CUSTOMER')}
              style={{
                flex: 1, padding: '12px', borderRadius: '12px', border: reportTarget === 'CUSTOMER' ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                background: reportTarget === 'CUSTOMER' ? '#f0fdf4' : 'white', color: reportTarget === 'CUSTOMER' ? 'var(--primary)' : '#64748b', fontWeight: '700', cursor: 'pointer'
              }}
            >
              👤 고객
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>신고 내용</label>
          <textarea
            value={reportContent}
            onChange={(e) => setReportContent(e.target.value)}
            placeholder="상세한 신고 내용을 입력해주세요."
            style={{ width: '100%', height: '100px', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', resize: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#f1f5f9', border: 'none', fontWeight: '700', cursor: 'pointer' }}>취소</button>
          <button onClick={onSubmit} style={{ flex: 2, padding: '14px', borderRadius: '12px', background: '#ef4444', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>🚨 신고하기</button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
