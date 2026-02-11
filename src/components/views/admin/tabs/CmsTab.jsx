import React, { useState } from 'react';
import Pagination from '../../../ui/Pagination';

const CmsTab = ({
  bannerList, setBannerList, onBannerAdd, onBannerEdit, onBannerDelete, onBannerReorder,
  promotions, setSelectedPromotion, onPromotionAdd,
  noticeList, onNoticeAdd, onNoticeEdit, onNoticeDelete, fetchNotices,
  faqs, onFaqAdd, onFaqEdit, onFaqDelete,
  currentPage, itemsPerPage, setCurrentPage,
}) => {
  const [draggingIndex, setDraggingIndex] = useState(null);

  const handleDragStart = (index) => {
    setDraggingIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (index) => {
    if (draggingIndex === null || draggingIndex === index) return;
    const updated = [...bannerList];
    const [moved] = updated.splice(draggingIndex, 1);
    updated.splice(index, 0, moved);
    setDraggingIndex(null);
    setBannerList(updated);
    if (onBannerReorder) {
      onBannerReorder(updated);
    }
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
  };

  return (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
    <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>홈 페이지 배너 관리</h2>
        <button onClick={onBannerAdd} style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#38bdf8', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>+ 새 배너 추가</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        {bannerList.map((banner, index) => (
          <div
            key={banner.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
            onDragEnd={handleDragEnd}
            style={{
              borderRadius: '16px',
              padding: '20px',
              background: banner.color,
              position: 'relative',
              height: '140px',
              display: 'flex',
              alignItems: 'center',
              overflow: 'hidden',
              cursor: 'move',
              outline: draggingIndex === index ? '2px dashed rgba(148,163,184,0.8)' : 'none',
            }}
          >
            <div style={{ flex: 1, zIndex: 1 }}>
              <div style={{ fontSize: '18px', fontWeight: '800', color: 'white' }}>{banner.title}</div>
              <div style={{ fontSize: '13px', marginTop: '4px', color: 'white', opacity: 0.9 }}>{banner.content}</div>
              <div style={{ fontSize: '11px', marginTop: '8px', color: 'white', backgroundColor: 'rgba(0,0,0,0.2)', padding: '2px 8px', borderRadius: '4px', display: 'inline-block' }}>{banner.promotion}</div>
              <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8, color: 'white' }}>상태: {banner.status}</div>
            </div>
            {banner.img && <div style={{ width: '80px', height: '80px', borderRadius: '12px', backgroundImage: `url(${banner.img})`, backgroundSize: 'cover', backgroundPosition: 'center', marginLeft: '16px' }} />}
            <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px', zIndex: 2 }}>
              <button onClick={() => onBannerEdit(banner)} style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.3)', border: 'none', color: 'white', fontSize: '11px', cursor: 'pointer' }}>수정</button>
              <button onClick={() => onBannerDelete(banner)} style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 0.3)', border: 'none', color: 'white', fontSize: '11px', cursor: 'pointer' }}>삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>기획전 관리</h2>
        <button onClick={onPromotionAdd} style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#38bdf8', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>+ 새 기획전 추가</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        {promotions.map((promo) => (
          <div key={promo.id} style={{ backgroundColor: '#0f172a', borderRadius: '16px', overflow: 'hidden', border: '1px solid #334155' }}>
            <div style={{ height: '120px', backgroundImage: `url(${promo.bannerImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>{promo.period}</div>
                  <div style={{ fontWeight: '800', fontSize: '18px' }}>{promo.title}</div>
                </div>
                <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', backgroundColor: promo.status === '진행 중' ? '#064e3b' : '#450a0a', color: promo.status === '진행 중' ? '#34d399' : '#f87171' }}>{promo.status}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button onClick={() => setSelectedPromotion(promo)} style={{ flex: 1, padding: '10px', borderRadius: '8px', backgroundColor: '#334155', color: 'white', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>자세히 보기</button>
                <button style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#1e293b', color: '#94a3b8', border: '1px solid #334155', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>수정</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>공지사항 관리</h2>
        <button onClick={onNoticeAdd} style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#38bdf8', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>+ 공지 등록</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {noticeList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((notice) => (
          <div key={notice.id} style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>{notice.date}</div>
                <div style={{ fontWeight: '800', fontSize: '16px' }}>{notice.title}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => onNoticeEdit(notice)} style={{ border: 'none', background: 'transparent', color: '#94a3b8', fontSize: '12px', cursor: 'pointer' }}>수정</button>
                <button onClick={() => onNoticeDelete(notice)} style={{ border: 'none', background: 'transparent', color: '#ef4444', fontSize: '12px', cursor: 'pointer' }}>삭제</button>
              </div>
            </div>
            <div style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>{notice.content}</div>
          </div>
        ))}
      </div>
      <Pagination currentPage={currentPage} totalItems={noticeList.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
    </div>

    <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>자주 묻는 질문 (FAQ) 관리</h2>
        <button onClick={onFaqAdd} style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#38bdf8', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>+ FAQ 등록</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {faqs.map((faq) => (
          <div key={faq.id} style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '12px' }}>
              <div style={{ fontWeight: '800', color: '#38bdf8' }}>Q. {faq.question}</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => onFaqEdit(faq)} style={{ border: 'none', background: 'transparent', color: '#94a3b8', fontSize: '12px', cursor: 'pointer' }}>수정</button>
                <button onClick={() => onFaqDelete(faq)} style={{ border: 'none', background: 'transparent', color: '#ef4444', fontSize: '12px', cursor: 'pointer' }}>삭제</button>
              </div>
            </div>
            <div style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>A. {faq.answer}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
  );
};

export default CmsTab;
