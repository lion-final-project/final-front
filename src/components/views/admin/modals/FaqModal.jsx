import React from 'react';

const FaqModal = ({ faq, setFaq, onSave, onClose }) => {
  if (!faq) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#1e293b', width: '100%', maxWidth: '600px', borderRadius: '24px', padding: '32px', border: '1px solid #334155' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>{faq.id ? 'FAQ 수정' : '새 FAQ 등록'}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>질문 (Question)</label>
            <input type="text" placeholder="질문을 입력하세요" value={faq.question} onChange={(e) => setFaq({ ...faq, question: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>답변 (Answer)</label>
            <textarea placeholder="답변을 입력하세요" value={faq.answer} onChange={(e) => setFaq({ ...faq, answer: e.target.value })} style={{ width: '100%', height: '200px', padding: '12px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white', resize: 'none' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#334155', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>취소</button>
          <button onClick={onSave} style={{ flex: 2, padding: '14px', borderRadius: '12px', background: '#38bdf8', color: '#0f172a', border: 'none', fontWeight: '800', cursor: 'pointer' }}>저장하기</button>
        </div>
      </div>
    </div>
  );
};

export default FaqModal;
