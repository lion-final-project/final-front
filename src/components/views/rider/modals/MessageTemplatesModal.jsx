import React from 'react';

const MESSAGES = [
  '조금 뒤 도착 예정입니다. 잠시만 기다려주세요!',
  '매장 픽업이 다소 지연되고 있습니다. 죄송합니다.',
  '도착했습니다! 문 앞에 두고 갈게요. 맛있게 드세요!',
  '벨을 누르지 말아달라는 요청 확인했습니다. 조용히 배송할게요.',
];

const MessageTemplatesModal = ({ onSend, onClose }) => {
  const handleSend = (msg) => {
    alert(`메시지가 전송되었습니다: "${msg}"`);
    onSend?.(msg);
    onClose?.();
  };
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ backgroundColor: '#1e293b', borderRadius: '20px', width: '100%', maxWidth: '400px', padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>고객에게 메시지 전송</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {MESSAGES.map((msg, i) => (
            <button key={i} onClick={() => handleSend(msg)} style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#334155', color: 'white', border: '1px solid #475569', textAlign: 'left', fontSize: '14px', cursor: 'pointer' }}>{msg}</button>
          ))}
        </div>
        <button onClick={onClose} style={{ width: '100%', marginTop: '20px', padding: '14px', border: 'none', background: 'transparent', color: '#94a3b8', fontWeight: '700', cursor: 'pointer' }}>닫기</button>
      </div>
    </div>
  );
};

export default MessageTemplatesModal;
