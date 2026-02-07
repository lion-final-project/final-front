import React from 'react';

const PhotoUploadModal = ({ deliveryPhoto, onPhotoSelect, onSubmit, onClose }) => {
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ backgroundColor: '#1e293b', borderRadius: '24px', width: '100%', maxWidth: '360px', padding: '24px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>배달 완료 인증</h3>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>반드시 배송 완료 사진을 촬영해 첨부해야 합니다.</p>
        <div style={{ backgroundColor: '#0f172a', borderRadius: '16px', height: '200px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #334155', overflow: 'hidden', position: 'relative' }}>
          {deliveryPhoto ? (
            <img src={deliveryPhoto} alt="Delivery Proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ color: '#64748b', fontSize: '14px', flexDirection: 'column', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>📷</span>
              <span style={{ fontWeight: '700' }}>사진을 등록해주세요</span>
            </div>
          )}
          <input type="file" accept="image/*" onChange={onPhotoSelect} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
        </div>
        <button onClick={onSubmit} disabled={!deliveryPhoto} style={{ width: '100%', padding: '16px', borderRadius: '16px', backgroundColor: deliveryPhoto ? '#38bdf8' : '#334155', color: deliveryPhoto ? 'white' : '#64748b', border: 'none', fontWeight: '900', fontSize: '16px', cursor: deliveryPhoto ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>배송 완료 제출</button>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', marginTop: '16px', fontWeight: '700', cursor: 'pointer' }}>취소</button>
      </div>
    </div>
  );
};

export default PhotoUploadModal;
