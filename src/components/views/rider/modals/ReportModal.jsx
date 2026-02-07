import React from 'react';

const ReportModal = ({ historyItem, reportTarget, setReportTarget, reportContent, setReportContent, onSubmit, onClose }) => {
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ backgroundColor: '#1e293b', borderRadius: '24px', width: '100%', maxWidth: '360px', padding: '24px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>신고하기</h3>
        <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '24px' }}>{historyItem ? `주문번호 ${historyItem.id}` : '신고 내용을 입력해주세요'}</p>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#cbd5e1', fontSize: '12px', marginBottom: '8px', fontWeight: '700' }}>신고 대상</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setReportTarget('STORE')} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: reportTarget === 'STORE' ? '2px solid var(--primary)' : '1px solid #334155', backgroundColor: reportTarget === 'STORE' ? '#0f172a' : '#1e293b', color: reportTarget === 'STORE' ? 'var(--primary)' : '#94a3b8', fontWeight: '800', cursor: 'pointer' }}>🏪 마트</button>
            <button onClick={() => setReportTarget('CUSTOMER')} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: reportTarget === 'CUSTOMER' ? '2px solid var(--primary)' : '1px solid #334155', backgroundColor: reportTarget === 'CUSTOMER' ? '#0f172a' : '#1e293b', color: reportTarget === 'CUSTOMER' ? 'var(--primary)' : '#94a3b8', fontWeight: '800', cursor: 'pointer' }}>👤 고객</button>
          </div>
        </div>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', color: '#cbd5e1', fontSize: '12px', marginBottom: '8px', fontWeight: '700' }}>신고 사유</label>
          <textarea value={reportContent} onChange={(e) => setReportContent(e.target.value)} placeholder="상세한 신고 내용을 입력해주세요." style={{ width: '100%', height: '100px', padding: '14px', borderRadius: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', fontSize: '14px', resize: 'none' }} />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: '12px', backgroundColor: '#334155', border: 'none', fontWeight: '700', cursor: 'pointer', color: '#94a3b8' }}>취소</button>
          <button onClick={onSubmit} style={{ flex: 2, padding: '14px', borderRadius: '12px', backgroundColor: '#ef4444', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer' }}>🚨 신고하기</button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
