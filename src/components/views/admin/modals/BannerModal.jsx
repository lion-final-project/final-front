import React from 'react';

const COLOR_OPTIONS = [
  { value: 'linear-gradient(45deg, #ff9a9e, #fad0c4)', label: 'Pink Dream' },
  { value: 'linear-gradient(120deg, #a1c4fd, #c2e9fb)', label: 'Blue Sky' },
  { value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', label: 'Deep Purple' },
  { value: 'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)', label: 'Fresh Green' },
  { value: 'linear-gradient(to right, #f83600 0%, #f9d423 100%)', label: 'Sunset' },
];

const BannerModal = ({ banner, setBanner, onSave, onClose }) => {
  if (!banner) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#1e293b', width: '100%', maxWidth: '600px', borderRadius: '24px', padding: '32px', border: '1px solid #334155' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>{banner.id ? '배너 수정' : '새 배너 등록'}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>제목</label>
            <input type="text" placeholder="배너 메인 타이틀" value={banner.title} onChange={(e) => setBanner({ ...banner, title: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>내용 (설명)</label>
            <input type="text" placeholder="배너 보조 설명 문구" value={banner.content} onChange={(e) => setBanner({ ...banner, content: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>이미지 URL</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input type="text" placeholder="https://..." value={banner.img} onChange={(e) => setBanner({ ...banner, img: e.target.value })} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white' }} />
              {banner.img && <div style={{ width: '42px', height: '42px', borderRadius: '8px', backgroundImage: `url(${banner.img})`, backgroundSize: 'cover' }}></div>}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>노출 상태</label>
              <select value={banner.status} onChange={(e) => setBanner({ ...banner, status: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white' }}>
                <option value="노출 중">노출 중</option>
                <option value="일시 중지">일시 중지</option>
                <option value="종료">종료</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>배너 배경색 (Gradients)</label>
              <select value={banner.color} onChange={(e) => setBanner({ ...banner, color: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white' }}>
                {COLOR_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div style={{ marginTop: '24px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>기획전 연동</label>
          <input
            type="text"
            placeholder="예: 제철 과일 기획전"
            value={banner.promotion}
            onChange={(e) => setBanner({ ...banner, promotion: e.target.value })}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#334155', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>취소</button>
          <button onClick={onSave} style={{ flex: 2, padding: '14px', borderRadius: '12px', background: '#38bdf8', color: '#0f172a', border: 'none', fontWeight: '800', cursor: 'pointer' }}>저장하기</button>
        </div>
      </div>
    </div>
  );
};

export default BannerModal;
