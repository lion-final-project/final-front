import React from 'react';

const PhotoUploadModal = ({ deliveryPhoto, onPhotoSelect, onSubmit, onClose, isUploading }) => {
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
          {!isUploading && (
            <input type="file" accept="image/*" onChange={onPhotoSelect} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
          )}
        </div>
        <button
          onClick={onSubmit}
          disabled={!deliveryPhoto || isUploading}
          style={{
            width: '100%', padding: '16px', borderRadius: '16px',
            backgroundColor: (!deliveryPhoto || isUploading) ? '#334155' : '#38bdf8',
            color: (!deliveryPhoto || isUploading) ? '#64748b' : 'white',
            border: 'none', fontWeight: '900', fontSize: '16px',
            cursor: (!deliveryPhoto || isUploading) ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          {isUploading ? (
            <>
              <span style={{
                width: '18px', height: '18px', border: '2px solid #64748b',
                borderTopColor: 'white', borderRadius: '50%',
                display: 'inline-block',
                animation: 'spin 0.8s linear infinite'
              }} />
              업로드 중...
            </>
          ) : '배송 완료 제출'}
        </button>
        <button
          onClick={onClose}
          disabled={isUploading}
          style={{
            background: 'transparent', border: 'none', color: '#94a3b8',
            marginTop: '16px', fontWeight: '700',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            opacity: isUploading ? 0.5 : 1
          }}
        >취소</button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
};

export default PhotoUploadModal;
