import React from 'react';

const AddVehicleModal = ({ registeredVehicles, setRegisteredVehicles, onClose }) => {
  const add = (type, model) => {
    setRegisteredVehicles([...registeredVehicles, { id: Date.now(), type, model: model || '', plate: '', isVerified: true }]);
    onClose();
  };
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ backgroundColor: '#1e293b', borderRadius: '24px', width: '100%', maxWidth: '400px', padding: '32px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '24px' }}>운송 수단 추가</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '14px', color: '#94a3b8' }}>자유롭게 추가 가능한 수단</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button onClick={() => add('walking')} style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', cursor: 'pointer' }}>🚶 도보</button>
            <button onClick={() => add('bicycle', '일반 자전거')} style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', cursor: 'pointer' }}>🚲 자전거</button>
          </div>
          <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '12px' }}>면허/심사가 필요한 수단</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button onClick={() => alert('오토바이/승용차 추가는 상담사 문의가 필요합니다.')} style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#334155', border: '1px solid #475569', color: '#94a3b8', cursor: 'pointer', textAlign: 'left' }}>🛵 오토바이 추가 문의</button>
            <button onClick={() => alert('오토바이/승용차 추가는 상담사 문의가 필요합니다.')} style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#334155', border: '1px solid #475569', color: '#94a3b8', cursor: 'pointer', textAlign: 'left' }}>🚗 승용차 추가 문의</button>
          </div>
        </div>
        <button onClick={onClose} style={{ width: '100%', marginTop: '32px', padding: '16px', background: 'transparent', border: 'none', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}>닫기</button>
      </div>
    </div>
  );
};

export default AddVehicleModal;
