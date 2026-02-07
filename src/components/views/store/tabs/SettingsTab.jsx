import React from 'react';

const SettingsTab = ({ storeInfo, setStoreInfo, businessHours, handleBusinessHourChange }) => (
  <div style={{ background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxWidth: '800px' }}>
    <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '32px' }}>마트 운영 설정</h2>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>마트 상호명</label>
          <div style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px', backgroundColor: '#f8fafc', color: '#64748b', fontWeight: '600' }}>
            {storeInfo.name}
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>* 입점 신청 시 승인된 상호명입니다. (수정 불가)</p>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>업종 카테고리</label>
          <div style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px', backgroundColor: '#f8fafc', color: '#64748b', fontWeight: '600' }}>
            {storeInfo.category}
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>* 등록된 업종 정보입니다. (수정 불가)</p>
        </div>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '12px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>스토어 대표 이미지 / 로고</label>
        <div
          onClick={() => document.getElementById('store-logo-upload')?.click()}
          style={{
            width: '100%', maxWidth: '400px', height: '200px', borderRadius: '16px', border: '2px dashed #cbd5e1',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#f8fafc', cursor: 'pointer', overflow: 'hidden', position: 'relative'
          }}
        >
          {storeInfo.img ? (
            <img src={storeInfo.img} alt="Store Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '600' }}>이미지 업로드 (권장: 800x600)</span>
          )}
          <input
            id="store-logo-upload"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setStoreInfo({ ...storeInfo, img: reader.result });
                reader.readAsDataURL(file);
              }
            }}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '20px', fontWeight: '800', fontSize: '16px', color: '#1e293b' }}>요일별 영업 시간 설정</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {businessHours.map((bh, idx) => (
            <div
              key={idx}
              style={{
                display: 'grid', gridTemplateColumns: 'minmax(80px, 1fr) 2fr 2fr 2fr 1fr', gap: '16px', alignItems: 'center',
                padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9',
                backgroundColor: bh.isClosed ? '#fef2f2' : 'white',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: '15px', fontWeight: '700', color: bh.isClosed ? '#ef4444' : '#1e293b' }}>{bh.day}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8' }}>오픈</span>
                <input type="time" disabled={bh.isClosed} value={bh.open} onChange={(e) => handleBusinessHourChange(idx, 'open', e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: bh.isClosed ? '#f1f5f9' : 'white', cursor: bh.isClosed ? 'not-allowed' : 'text' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8' }}>마감</span>
                <input type="time" disabled={bh.isClosed} value={bh.close} onChange={(e) => handleBusinessHourChange(idx, 'close', e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: bh.isClosed ? '#f1f5f9' : 'white', cursor: bh.isClosed ? 'not-allowed' : 'text' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#8b5cf6' }}>라스트 오더</span>
                <input type="time" disabled={bh.isClosed} value={bh.lastOrder} onChange={(e) => handleBusinessHourChange(idx, 'lastOrder', e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #8b5cf6', fontSize: '13px', backgroundColor: bh.isClosed ? '#f1f5f9' : 'white', cursor: bh.isClosed ? 'not-allowed' : 'text', color: bh.isClosed ? '#94a3b8' : '#8b5cf6' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                <input type="checkbox" id={`closed-${idx}`} checked={bh.isClosed} onChange={(e) => handleBusinessHourChange(idx, 'isClosed', e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#ef4444' }} />
                <label htmlFor={`closed-${idx}`} style={{ fontSize: '13px', fontWeight: '700', color: bh.isClosed ? '#ef4444' : '#64748b', cursor: 'pointer' }}>휴무</label>
              </div>
            </div>
          ))}
        </div>
      </div>
      <button style={{ marginTop: '20px', padding: '18px', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '800', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)' }}>
        운영 설정 완료
      </button>
    </div>
  </div>
);

export default SettingsTab;
