import React from 'react';

const StoreDetailModal = ({ store, onClose, onAddToCart }) => {
  const [activeSubTab, setActiveSubTab] = React.useState('menu'); // Moved to top level

  if (!store) return null;

  const handleAdd = (product) => {
    if (onAddToCart) {
      onAddToCart(product, store);
    } else {
      alert('로그인이 필요한 기능입니다.');
    }
  };

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 'menu':
        return (
          <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
            {Object.entries(
              store.products.reduce((acc, p) => {
                if (!acc[p.category]) acc[p.category] = [];
                acc[p.category].push(p);
                return acc;
              }, {})
            ).map(([category, products]) => (
              <div key={category} style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '4px', height: '18px', backgroundColor: 'var(--primary)', borderRadius: '2px' }}></span>
                  {category}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {products.map(product => (
                    <div key={product.id} style={{ 
                      display: 'flex', 
                      gap: '16px', 
                      backgroundColor: '#f8fafc', 
                      padding: '16px', 
                      borderRadius: '16px',
                      border: '1px solid var(--border)',
                      alignItems: 'center'
                    }}>
                      <img src={product.img} alt={product.name} style={{ width: '70px', height: '70px', borderRadius: '12px', objectFit: 'cover' }} />
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <span style={{ fontWeight: '700', fontSize: '15px' }}>{product.name}</span>
                          <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '15px' }}>{product.price.toLocaleString()}원</span>
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4', margin: 0 }}>{product.desc}</p>
                      </div>
                      <button 
                        onClick={() => handleAdd(product)}
                        style={{ 
                          padding: '6px 12px', 
                          borderRadius: '8px', 
                          border: '1px solid var(--primary)', 
                          background: 'transparent', 
                          color: 'var(--primary)', 
                          fontWeight: '700',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}>
                        추가
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      case 'reviews':
        return (
          <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '16px', marginBottom: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: '900', color: '#f59e0b' }}>{store.rate}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>전체 {store.reviews}개</div>
              </div>
              <div style={{ flexGrow: 1 }}>
                {[5, 4, 3, 2, 1].map(star => (
                  <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '14px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{star}점</span>
                    <div style={{ flexGrow: 1, height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${star === 5 ? 80 : star === 4 ? 15 : 5}%`, height: '100%', backgroundColor: '#f59e0b' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {[
              { id: 1, user: '동네주민A', rate: 5, date: '어제', content: '배달이 정말 빨라요! 상품도 너무 신선하고 좋네요.', img: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=100&q=80' },
              { id: 2, user: '식객123', rate: 4, date: '3일 전', content: '포장이 아주 깔끔하게 왔습니다. 만족해요.', img: null }
            ].map(re => (
              <div key={re.id} style={{ padding: '20px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '700', fontSize: '14px' }}>{re.user}</span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>{re.date}</span>
                </div>
                <div style={{ color: '#f59e0b', fontSize: '12px', marginBottom: '8px' }}>{'★'.repeat(re.rate)}{'☆'.repeat(5-re.rate)}</div>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: 0 }}>{re.content}</p>

              </div>
            ))}
          </div>
        );
      case 'info':
        return (
          <div style={{ padding: '20px 0' }}>
            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>📍 가게 위치</h4>
              <p style={{ fontSize: '14px', color: '#475569' }}>서울시 강남구 테헤란로 123-45 (역삼동)</p>
              <div style={{ height: '150px', backgroundColor: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                <span style={{ color: '#94a3b8' }}>지도 미리보기 서비스 준비 중</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>⏰ 영업 시간</h4>
                <p style={{ fontSize: '14px', color: '#475569' }}>평일: 09:00 - 21:00<br/>주말: 10:00 - 20:00</p>
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>📞 전화번호</h4>
                <p style={{ fontSize: '14px', color: '#475569' }}>02-1234-5678</p>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{
        backgroundColor: 'white',
        width: '90%',
        maxWidth: '600px',
        borderRadius: '32px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        position: 'relative',
        animation: 'slideUp 0.3s ease-out',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: 'none',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          zIndex: 10,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>✕</button>

        <div style={{
          height: '200px',
          backgroundImage: `url(${store.img})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          flexShrink: 0
        }} />

        <div style={{ padding: '30px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '8px', letterSpacing: '-0.5px' }}>{store.name}</h2>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '15px' }}>
              <span style={{ color: '#f59e0b', fontWeight: '800' }}>★ {store.rate}</span>
              <span style={{ color: '#e2e8f0' }}>|</span>
              <span style={{ color: '#64748b' }}>최소 주문 10,000원</span>
              <span style={{ color: '#e2e8f0' }}>|</span>
              <span style={{ color: '#64748b' }}>🛵 {store.time}</span>
            </div>
          </div>

          <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', marginBottom: '24px', gap: '24px' }}>
              {['menu', 'reviews', 'info'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveSubTab(tab)}
                  style={{
                    paddingBottom: '12px',
                    border: 'none',
                    background: 'none',
                    fontSize: '16px',
                    fontWeight: activeSubTab === tab ? '800' : '500',
                    color: activeSubTab === tab ? 'var(--primary)' : '#94a3b8',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s'
                  }}
                >
                  {tab === 'menu' ? '메뉴' : tab === 'reviews' ? `리뷰(${store.reviews})` : '가게정보'}
                  {activeSubTab === tab && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: 'var(--primary)', borderRadius: '3px' }}></div>}
                </button>
              ))}
          </div>

          <div style={{ flexGrow: 1, minHeight: 0 }}>
            {renderSubTabContent()}
          </div>

          <div style={{ marginTop: '24px', paddingBottom: '10px' }}>
            <button 
              onClick={onClose}
              style={{
                width: '100%',
                padding: '18px',
                backgroundColor: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontWeight: '800',
                fontSize: '16px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.3)'
              }}>
              쇼핑 계속하기
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default StoreDetailModal;
