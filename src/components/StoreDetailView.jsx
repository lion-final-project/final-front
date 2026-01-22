import React, { useState } from 'react';

const StoreDetailView = ({ store, onBack, onAddToCart }) => {
  const [activeSubTab, setActiveSubTab] = useState('menu');
  const [reviewSort, setReviewSort] = useState('latest');
  
  // Review Management State
  const [reviews, setReviews] = useState([
    { id: 1, user: '동네주민A', rate: 5, date: '2024.01.21', content: '배달이 정말 빨라요! 상품도 너무 신선하고 좋네요. 사장님이 서비스도 주셨어요!', img: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=100&q=80', isMine: true, isEdited: false },
    { id: 2, user: '식객123', rate: 4, date: '2024.01.19', content: '포장이 아주 깔끔하게 왔습니다. 만족해요. 다음에도 또 주문할게요.', img: null, isMine: false, isEdited: false },
    { id: 3, user: '맛스타그램', rate: 5, date: '2024.01.20', content: '여기 진짜 맛집이네요. 강추합니다!', img: null, isMine: false, isEdited: true },
    { id: 4, user: '불만제로', rate: 1, date: '2024.01.10', content: '배달이 너무 늦었어요... 음식도 식어서 왔네요.', img: null, isMine: true, isEdited: false },
    { id: 5, user: '단골손님', rate: 5, date: '2024.01.22', content: '항상 믿고 시킵니다. 오늘도 최고!', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=100&q=80', isMine: false, isEdited: false }
  ]);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editContent, setEditContent] = useState('');

  // Edit/Delete Handlers
  const handleDeleteReview = (id) => {
    if (window.confirm('정말 이 리뷰를 삭제하시겠습니까?')) {
      setReviews(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleStartEdit = (review) => {
    setEditingReviewId(review.id);
    setEditContent(review.content);
  };

  const handleSaveEdit = (id) => {
    setReviews(prev => prev.map(r => 
      r.id === id ? { ...r, content: editContent, isEdited: true } : r
    ));
    setEditingReviewId(null);
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditContent('');
  };

  // Mock subscription products for demo
  const subscriptionProducts = [
    { id: 'sub1', name: '[정기배송] 유기농 우유 1L (주 1회)', price: 4500, img: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80', desc: '매주 신선한 우유를 문앞으로', category: '구독' },
    { id: 'sub2', name: '[정기배송] 신선 달걀 15구 (주 1회)', price: 8900, img: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=400&q=80', desc: '아침마다 만나는 신선함', category: '구독' },
    { id: 'sub3', name: '[정기배송] 제철 과일 랜덤박스 (주 1회)', price: 25000, img: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80', desc: '가장 맛있는 제철 과일 엄선', category: '구독' }
  ];

  const handleSubscribe = (product) => {
    alert(`'${product.name}' 구독 설정 페이지로 이동합니다.`);
  };

  const handleReport = (id) => {
    alert('해당 리뷰를 신고하였습니다.');
  };

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 'menu':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
               <div style={{ display: 'flex', gap: '12px' }}>
                 {['추천순', '신상품순', '판매량순', '낮은가격순', '높은가격순'].map((sort, i) => (
                   <span key={sort} style={{ fontSize: '14px', color: i === 0 ? '#1e293b' : '#94a3b8', fontWeight: i === 0 ? '700' : '400', cursor: 'pointer' }}>
                     {sort} {i !== 4 && <span style={{ color: '#e2e8f0', margin: '0 6px' }}>|</span>}
                   </span>
                 ))}
               </div>
               <div style={{ fontSize: '13px', color: '#64748b' }}>전체 상품 <span style={{ fontWeight: '700' }}>{store.products.length + subscriptionProducts.length}</span>개</div>
            </div>

            {/* Subscription Section */}
            <div style={{ marginBottom: '50px', backgroundColor: '#fdf2f8', padding: '30px', borderRadius: '24px', border: '1px solid #fce7f3' }}>
               <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px', color: '#be185d', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 📅 주 1회 정기 배송
               </h3>
               <p style={{ color: '#db2777', marginBottom: '24px', fontSize: '15px' }}>자주 사는 상품은 구독으로 편리하게 받아보세요! (배송비 무료 혜택)</p>
               
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                  {subscriptionProducts.map(product => (
                    <div key={product.id} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #fce7f3', display: 'flex', flexDirection: 'column' }}>
                       <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                         <img src={product.img} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                         <div style={{ position: 'absolute', top: '12px', left: '12px', background: '#be185d', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>구독전용</div>
                       </div>
                       <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                         <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#333' }}>{product.name}</div>
                         <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px', flexGrow: 1, lineHeight: '1.5' }}>{product.desc}</div>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <span style={{ fontSize: '20px', fontWeight: '800', color: '#be185d' }}>{product.price.toLocaleString()}원</span>
                            <span style={{ fontSize: '13px', color: '#94a3b8' }}>/ 월 4회 기준</span>
                         </div>
                         <button 
                           onClick={() => handleSubscribe(product)}
                           style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#be185d', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '15px' }}
                         >
                           구독 시작하기
                         </button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {Object.entries(
              store.products.reduce((acc, p) => {
                if (!acc[p.category]) acc[p.category] = [];
                acc[p.category].push(p);
                return acc;
              }, {})
            ).map(([category, products]) => (
              <div key={category} style={{ marginBottom: '50px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
                  {category}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px', rowGap: '40px' }}>
                  {products.map((product, i) => {
                    // Randomly mock out of stock for 1/5 products for demo
                    const isOutOfStock = i === 3 || i === 7; 
                    
                    return (
                    <div key={product.id} style={{ display: 'flex', flexDirection: 'column', opacity: isOutOfStock ? 0.7 : 1 }}>
                      <div style={{ position: 'relative', marginBottom: '16px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <img src={product.img} alt={product.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', transition: 'transform 0.3s', filter: isOutOfStock ? 'grayscale(100%)' : 'none' }} />
                        
                        {isOutOfStock ? (
                          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             <span style={{ color: 'white', fontWeight: '800', fontSize: '18px', border: '2px solid white', padding: '8px 16px', borderRadius: '8px' }}>SOLD OUT</span>
                          </div>
                        ) : (
                          <div style={{ position: 'absolute', bottom: '12px', right: '12px' }}>
                             <button 
                               style={{ 
                                 width: '48px', height: '48px', borderRadius: '50%', 
                                 backgroundColor: 'rgba(255, 255, 255, 0.95)', border: 'none',
                                 fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                 cursor: 'pointer', color: '#333', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                              }}
                               onClick={() => handleAdd(product)}
                             >
                               🛒
                             </button>
                          </div>
                        )}
                      </div>
                      
                      <button 
                        onClick={() => !isOutOfStock && handleAdd(product)}
                        disabled={isOutOfStock}
                        style={{ 
                          width: '100%', 
                          padding: '12px', 
                          borderRadius: '8px', 
                          border: isOutOfStock ? '1px solid #e2e8f0' : '1px solid #e2e8f0', 
                          background: isOutOfStock ? '#f1f5f9' : 'white', 
                          color: isOutOfStock ? '#94a3b8' : '#333', 
                          fontWeight: '700', 
                          marginBottom: '14px',
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '6px',
                          cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                          fontSize: '15px'
                        }}
                      >
                         <span>{isOutOfStock ? '품절' : '🛍️ 담기'}</span>
                      </button>

                      <div style={{ padding: '0 4px' }}>
                        {i % 2 === 0 && !isOutOfStock && (
                           <div style={{ marginBottom: '8px' }}>
                             <span style={{ fontSize: '11px', color: '#5f0080', border: '1px solid #5f0080', padding: '3px 6px', borderRadius: '4px', fontWeight: '700' }}>Kurly Only</span>
                           </div>
                        )}
                        <div style={{ fontSize: '17px', fontWeight: '500', color: isOutOfStock ? '#94a3b8' : '#1e293b', marginBottom: '8px', lineHeight: '1.4' }}>{product.name}</div>
                        <div style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '18px', fontWeight: '900', color: isOutOfStock ? '#94a3b8' : '#fa622f' }}>10%</span>
                          <span style={{ fontSize: '18px', fontWeight: '800', color: isOutOfStock ? '#94a3b8' : '#1e293b' }}>{product.price.toLocaleString()}원</span>
                        </div>
                        <div style={{ fontSize: '14px', color: '#94a3b8', textDecoration: 'line-through', marginBottom: '10px' }}>{(product.price * 1.1).toLocaleString().split('.')[0]}원</div>
                        
                        <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                           <span style={{ color: '#64748b' }}>후기 1,234</span>
                           <span style={{ width: '1px', height: '10px', background: '#e2e8f0' }}></span>
                           <span>평점 4.8</span>
                        </div>
                      </div>
                    </div>
                  );
                  })}
                </div>
              </div>
            ))}
          </div>
        );
      case 'reviews':
        const sortedReviews = [...reviews].sort((a, b) => {
          if (reviewSort === 'latest') return new Date(b.date) - new Date(a.date);
          if (reviewSort === 'rating_desc') return b.rate - a.rate;
          if (reviewSort === 'rating_asc') return a.rate - b.rate;
          return 0;
        });

        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '40px', padding: '40px', backgroundColor: 'white', borderRadius: '24px', border: '1px solid var(--border)', marginBottom: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', fontWeight: '900', color: '#f59e0b', marginBottom: '8px' }}>{store.rate}</div>
                <div style={{ fontSize: '15px', color: '#94a3b8' }}>전체 {store.reviews}개 리뷰</div>
              </div>
              <div style={{ width: '1px', height: '60px', backgroundColor: '#e2e8f0' }}></div>
              <div style={{ flexGrow: 1 }}>
                {[5, 4, 3, 2, 1].map(star => (
                  <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '20px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#64748b', width: '30px' }}>{star}점</span>
                    <div style={{ flexGrow: 1, height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${star === 5 ? 80 : star === 4 ? 15 : 5}%`, height: '100%', backgroundColor: '#f59e0b', borderRadius: '4px' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Review Filter */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', justifyContent: 'flex-end' }}>
               {[
                 { id: 'latest', label: '최신순' },
                 { id: 'rating_desc', label: '별점 높은순' },
                 { id: 'rating_asc', label: '별점 낮은순' }
               ].map(filter => (
                 <button 
                   key={filter.id}
                   onClick={() => setReviewSort(filter.id)}
                   style={{
                     padding: '8px 16px',
                     borderRadius: '20px',
                     border: reviewSort === filter.id ? '1px solid #1e293b' : '1px solid #e2e8f0',
                     backgroundColor: reviewSort === filter.id ? '#1e293b' : 'white',
                     color: reviewSort === filter.id ? 'white' : '#64748b',
                     fontSize: '13px',
                     fontWeight: '700',
                     cursor: 'pointer',
                     transition: 'all 0.2s'
                   }}
                 >
                   {filter.label}
                 </button>
               ))}
            </div>

            {sortedReviews.map(re => (
              <div key={re.id} style={{ padding: '30px', background: 'white', borderRadius: '24px', border: '1px solid var(--border)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: '700', fontSize: '16px' }}>{re.user}</span>
                    <div style={{ color: '#f59e0b', fontSize: '14px' }}>{'★'.repeat(re.rate)}{'☆'.repeat(5-re.rate)}</div>
                    {re.isEdited && <span style={{ fontSize: '12px', color: '#94a3b8' }}>(수정됨)</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>{re.date}</span>
                    {re.isMine && editingReviewId !== re.id ? (
                      <>
                        <button onClick={() => handleStartEdit(re)} style={{ border: 'none', background: 'none', color: '#64748b', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}>수정</button>
                        <button onClick={() => handleDeleteReview(re.id)} style={{ border: 'none', background: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}>삭제</button>
                      </>
                    ) : (
                      !re.isMine && (
                        <button onClick={() => handleReport(re.id)} style={{ border: 'none', background: 'none', color: '#94a3b8', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}>신고</button>
                      )
                    )}
                  </div>
                </div>
                
                {editingReviewId === re.id ? (
                  <div style={{ marginTop: '10px' }}>
                     <textarea 
                       value={editContent} 
                       onChange={(e) => setEditContent(e.target.value)}
                       style={{ width: '100%', minHeight: '80px', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '10px' }} 
                     />
                     <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={handleCancelEdit} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>취소</button>
                        <button onClick={() => handleSaveEdit(re.id)} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer' }}>저장</button>
                     </div>
                  </div>
                ) : (
                  <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: 0 }}>{re.content}</p>
                )}
                
                {re.img && !editingReviewId && <img src={re.img} alt="review" style={{ width: '120px', height: '120px', borderRadius: '12px', marginTop: '16px', objectFit: 'cover' }} />}
              </div>
            ))}
          </div>
        );
      case 'info':
        // Extended mock data for the info tab
        const storeInfo = {
          ...store,
          businessNo: '123-45-67890',
          owner: '김사장',
          address: '서울시 강남구 테헤란로 123-45 (역삼동) 1층',
          safeNumber: '0507-1234-5678',
          intro: `안녕하세요! ${store.name}입니다.\n매일 새벽 경매시장에서 직접 공수해온 신선한 재료만을 고집합니다.\n항상 우리 가족이 먹는다는 생각으로 정성을 다해 준비하겠습니다.\n많은 이용 부탁드립니다! 감사합니다.`
        };

        return (
          <div style={{ background: 'white', padding: '40px', borderRadius: '24px', border: '1px solid var(--border)' }}>
             <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '32px', color: '#1e293b' }}>가게 정보</h3>
             
             {/* 1. Basic Info Section */}
             <div style={{ marginBottom: '40px' }}>
               <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#334155', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px' }}>기본 정보</h4>
               <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
                 <tbody>
                   <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                     <td style={{ width: '120px', padding: '12px 0', color: '#64748b', fontWeight: '500' }}>상호명</td>
                     <td style={{ padding: '12px 0', color: '#333', fontWeight: '700' }}>{storeInfo.name}</td>
                   </tr>
                   <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                     <td style={{ padding: '12px 0', color: '#64748b', fontWeight: '500' }}>사업자번호</td>
                     <td style={{ padding: '12px 0', color: '#333' }}>{storeInfo.businessNo}</td>
                   </tr>
                   <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                     <td style={{ padding: '12px 0', color: '#64748b', fontWeight: '500' }}>대표자명</td>
                     <td style={{ padding: '12px 0', color: '#333' }}>{storeInfo.owner}</td>
                   </tr>
                   <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                     <td style={{ padding: '12px 0', color: '#64748b', fontWeight: '500' }}>주소지</td>
                     <td style={{ padding: '12px 0', color: '#333' }}>{storeInfo.address}</td>
                   </tr>
                   <tr>
                     <td style={{ padding: '12px 0', color: '#64748b', fontWeight: '500' }}>안심번호</td>
                     <td style={{ padding: '12px 0', color: '#333', fontWeight: '700' }}>{storeInfo.safeNumber}</td>
                   </tr>
                 </tbody>
               </table>
             </div>

             {/* 2. Operating Hours */}
             <div style={{ marginBottom: '40px' }}>
               <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#334155', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px' }}>영업 시간</h4>
               <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '16px', color: '#475569', fontSize: '15px', lineHeight: '1.8' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '300px', marginBottom: '8px' }}>
                   <span style={{ fontWeight: '600' }}>평일</span>
                   <span>09:00 - 21:00</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '300px', marginBottom: '8px', color: '#ef4444' }}>
                   <span style={{ fontWeight: '600' }}>주말/공휴일</span>
                   <span>10:00 - 20:00</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '300px' }}>
                   <span style={{ fontWeight: '600' }}>휴무일</span>
                   <span>연중무휴</span>
                 </div>
               </div>
             </div>

             {/* 3. Store Introduction */}
             <div>
                <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#334155', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px' }}>매장 소개</h4>
                <div style={{ fontSize: '16px', lineHeight: '1.8', color: '#475569', whiteSpace: 'pre-line' }}>
                  {storeInfo.intro}
                </div>
             </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="store-detail-page" style={{ paddingBottom: '100px', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      {/* Back Button */}
      <button 
        onClick={onBack}
        style={{ 
          marginBottom: '24px', 
          border: 'none', 
          background: 'transparent', 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          fontWeight: '700', 
          color: '#64748b',
          fontSize: '15px',
          padding: '10px 0'
        }}
      >
        <span style={{ fontSize: '20px' }}>←</span> 목록으로 돌아가기
      </button>

      {/* Header Info */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ 
          height: '350px', 
          borderRadius: '32px', 
          backgroundImage: `url(${store.img})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          marginBottom: '30px',
          boxShadow: '0 20px 40px -12px rgba(0,0,0,0.15)',
          position: 'relative'
        }}>
           <div style={{ position: 'absolute', top: '24px', left: '24px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '8px 16px', borderRadius: '30px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', backdropFilter: 'blur(4px)' }}>
             <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ade80' }}></span>
             영업중 (21:00 마감)
           </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '16px', letterSpacing: '-1px', color: '#1e293b' }}>{store.name}</h1>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', fontSize: '16px', color: '#475569' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                 <span style={{ color: '#f59e0b', fontWeight: '800', fontSize: '18px' }}>★ {store.rate}</span>
                 <span style={{ textDecoration: 'underline', cursor: 'pointer', color: '#64748b' }}>리뷰 {store.reviews}개 &gt;</span>
              </div>
              <span style={{ color: '#cbd5e1' }}>|</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span>최소주문 10,000원</span>
                <span style={{ color: '#cbd5e1' }}>·</span>
                <span>배달팁 3,000원</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right', background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
             <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>예상 배달 시간</div>
             <div style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b' }}>{store.time}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '40px', position: 'sticky', top: '80px', backgroundColor: 'var(--bg-main)', zIndex: 10, paddingTop: '10px' }}>
        {['menu', 'reviews', 'info'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            style={{
              flex: 1,
              paddingBottom: '18px',
              border: 'none',
              background: 'none',
              fontSize: '18px',
              fontWeight: activeSubTab === tab ? '800' : '500',
              color: activeSubTab === tab ? 'var(--primary)' : '#94a3b8',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s'
            }}
          >
            {tab === 'menu' ? '메뉴' : tab === 'reviews' ? '리뷰' : '가게정보'}
            {activeSubTab === tab && <div style={{ position: 'absolute', bottom: '-1px', left: 0, right: 0, height: '4px', backgroundColor: 'var(--primary)', borderRadius: '4px 4px 0 0' }}></div>}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ minHeight: '600px' }}>
        {renderSubTabContent()}
      </div>
    </div>
  );
};

export default StoreDetailView;
