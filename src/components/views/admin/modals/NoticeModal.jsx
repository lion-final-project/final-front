import React from 'react';

const NoticeModal = ({ notice, setNotice, onSave, onClose }) => {
  if (!notice) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#1e293b', width: '100%', maxWidth: '600px', borderRadius: '24px', padding: '32px', border: '1px solid #334155' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>{notice.id ? '공지사항 수정' : '새 공지사항 등록'}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>제목</label>
            <input type="text" value={notice.title} onChange={(e) => setNotice({ ...notice, title: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>내용</label>
            <textarea value={notice.content} onChange={(e) => setNotice({ ...notice, content: e.target.value })} style={{ width: '100%', height: '200px', padding: '12px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white', resize: 'none' }} />
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

export default NoticeModal;
