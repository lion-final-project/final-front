import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config/api';
import { DELIVERY_TIME_SLOTS } from '../../../constants/deliveryTimeSlots';
import * as reviewApi from '../../../api/reviewApi';

/** 구독 상품 이미지 URL 해석: 상대 경로면 API_BASE_URL 붙임, 없으면 기본 이미지 */
const DEFAULT_SUBSCRIPTION_IMG = 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80';
const resolveSubscriptionImg = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.trim()) return DEFAULT_SUBSCRIPTION_IMG;
  if (imageUrl.startsWith('/') && !imageUrl.startsWith('//')) {
    const base = (API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');
    return `${base}${imageUrl}`;
  }
  return imageUrl;
};

const StoreDetailView = ({ store, onBack, onAddToCart, onSubscribeCheckout }) => {
  const [activeSubTab, setActiveSubTab] = useState('menu');
  const [reviewSort, setReviewSort] = useState('latest');
  const [selectedDeliveryTime, setSelectedDeliveryTime] = useState(DELIVERY_TIME_SLOTS[0]?.value ?? '08:00~11:00');
  const [subscriptionProducts, setSubscriptionProducts] = useState([]);
  const [subscriptionProductsLoading, setSubscriptionProductsLoading] = useState(false);
  /** 마트 일반 상품 목록 (메뉴 탭) */
  const [storeProducts, setStoreProducts] = useState([]);
  const [storeProductsLoading, setStoreProductsLoading] = useState(false);
  /** 현재 로그인한 고객이 이미 구독 중인 구독 상품 ID 목록 (재구독 방지용) */
  const [mySubscriptionProductIds, setMySubscriptionProductIds] = useState([]);

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewStats, setReviewStats] = useState({
    average: 0,
    totalCount: 0,
    stars: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  const fetchReviews = async () => {
    if (!store?.id) return;
    setReviewsLoading(true);
    try {
      const data = await reviewApi.getStoreReviews(store.id, { page: 0, size: 50 });
      const mapped = (data.reviews?.content || []).map(r => ({
        id: r.reviewId,
        user: r.writerNickname,
        rate: r.rating,
        date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '',
        content: r.content,
        reply: r.ownerReply,
        isMine: false,
        isEdited: false,
        products: (r.products || []).map(p => p.productName).join(', ')
      }));
      setReviews(mapped);

      if (data.statistics) {
        const s = data.statistics;
        const total = (s.fiveStar || 0) + (s.fourStar || 0) + (s.threeStar || 0) + (s.twoStar || 0) + (s.oneStar || 0);
        setReviewStats({
          average: s.average || 0,
          totalCount: total,
          stars: {
            5: s.fiveStar || 0,
            4: s.fourStar || 0,
            3: s.threeStar || 0,
            2: s.twoStar || 0,
            1: s.oneStar || 0
          }
        });
      }
    } catch (e) {
      console.error('리뷰 조회 실패:', e);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'reviews' && store?.id) {
      fetchReviews();
    }
  }, [activeSubTab, store?.id, reviewSort]); // Also refetch on sort change if backend supports it

  const deliveryTimeSlots = DELIVERY_TIME_SLOTS.map((s) => s.value);

  // 마트 일반 상품 목록 조회 (메뉴 탭)
  useEffect(() => {
    const storeId = store?.id;
    if (storeId == null || typeof storeId !== 'number') {
      setStoreProducts([]);
      return;
    }
    setStoreProductsLoading(true);
    fetch(`${API_BASE_URL}/api/stores/${storeId}/products`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const list = json?.data ?? json ?? [];
        const arr = Array.isArray(list) ? list : [];
        setStoreProducts(
          arr.map((p) => ({
            id: p.productId ?? p.id,
            name: p.productName ?? p.name ?? '',
            price: p.salePrice ?? p.price ?? 0,
            img: p.productImageUrl ?? p.product_image_url ?? p.img ?? 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80',
            category: p.categoryName ?? p.category ?? '기타',
            stock: p.stock ?? 0,
            description: p.description ?? '',
            desc: p.description ?? '',
            discountRate: p.discountRate ?? 0,
            origin: p.origin ?? '',
          }))
        );
      })
      .catch(() => setStoreProducts([]))
      .finally(() => setStoreProductsLoading(false));
  }, [store?.id]);

  useEffect(() => {
    const storeId = store?.id;
    if (storeId != null && typeof storeId === 'number') {
      setSubscriptionProductsLoading(true);
      fetch(`${API_BASE_URL}/api/stores/${storeId}/subscription-products`, { credentials: 'include' })
        .then((res) => res.ok ? res.json() : null)
        .then((json) => {
          const list = json?.data ?? [];
          if (Array.isArray(list) && list.length > 0) {
            setSubscriptionProducts(list.map((p) => {
              const daysLen = (p.daysOfWeek ?? []).length;
              const monthlyTotal = p.totalDeliveryCount ?? (daysLen > 0 ? daysLen * 4 : 4);
              return {
                id: p.subscriptionProductId ?? p.id,
                name: p.name ?? '',
                price: p.price ?? 0,
                desc: p.description ?? '',
                img: resolveSubscriptionImg(p.imageUrl),
                daysOfWeek: p.daysOfWeek ?? [],
                totalDeliveryCount: monthlyTotal,
              };
            }));
          } else {
            setSubscriptionProducts(getMockSubscriptionProducts());
          }
        })
        .catch(() => setSubscriptionProducts(getMockSubscriptionProducts()))
        .finally(() => setSubscriptionProductsLoading(false));
    } else {
      setSubscriptionProducts(getMockSubscriptionProducts());
    }
  }, [store?.id]);

  // 고객 구독 목록 조회 (이미 구독한 상품은 버튼 비활성화용)
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/subscriptions`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const list = json?.data ?? [];
        if (Array.isArray(list)) {
          const ids = list
            .map((s) => s.subscriptionProductId)
            .filter((id) => id != null);
          setMySubscriptionProductIds(ids);
        } else {
          setMySubscriptionProductIds([]);
        }
      })
      .catch(() => setMySubscriptionProductIds([]));
  }, []);

  const getMockSubscriptionProducts = () => [
    { id: 'sub1', name: '[정기배송] 유기농 우유 1L (주 1회)', price: 4500, img: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80', desc: '매주 신선한 우유를 문앞으로', category: '구독', deliveryFrequency: '주 1회', daysOfWeek: [1], totalDeliveryCount: 4 },
    { id: 'sub2', name: '[정기배송] 신선 달걀 15구 (주 1회)', price: 8900, img: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=400&q=80', desc: '아침마다 만나는 신선함', category: '구독', deliveryFrequency: '주 1회', daysOfWeek: [1], totalDeliveryCount: 4 },
    { id: 'sub3', name: '[정기배송] 제철 과일 랜덤박스 (주 1회)', price: 25000, img: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80', desc: '가장 맛있는 제철 과일 엄선', category: '구독', deliveryFrequency: '주 1회', daysOfWeek: [1], totalDeliveryCount: 4 },
  ];

  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [selectedSubForDetail, setSelectedSubForDetail] = useState(null);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState(null);
  const [selectedProductCategory, setSelectedProductCategory] = useState('전체');

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

  const handleSubscribe = (product) => {
    setSelectedSubForDetail(product);
  };

  const [reportingReviewId, setReportingReviewId] = useState(null);
  const [reportReason, setReportReason] = useState('');

  const handleReport = (id) => {
    setReportingReviewId(id);
  };

  const submitReport = () => {
    if (!reportReason.trim()) {
      alert('신고 내용을 입력해주세요.');
      return;
    }
    alert(`해당 리뷰(#${reportingReviewId})에 대한 신고가 접수되었습니다.\n사유: ${reportReason}`);
    setReportingReviewId(null);
    setReportReason('');
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
              <div style={{ fontSize: '13px', color: '#64748b' }}>전체 상품 <span style={{ fontWeight: '700' }}>{storeProducts.length + subscriptionProducts.length}</span>개</div>
            </div>

            {/* Subscription Section */}
            <div style={{ marginBottom: '50px', backgroundColor: '#fdf2f8', padding: '30px', borderRadius: '24px', border: '1px solid #fce7f3' }}>
              <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px', color: '#be185d', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📅 정기 배송
              </h3>
              <p style={{ color: '#db2777', marginBottom: '24px', fontSize: '15px' }}>자주 사는 상품은 구독으로 편리하게 받아보세요! (배송비 무료 혜택)</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {subscriptionProducts.map(product => (
                  <div key={product.id} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #fce7f3', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                      <img
                        src={product.img}
                        alt={product.name}
                        onError={(e) => { e.target.src = DEFAULT_SUBSCRIPTION_IMG; }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{ position: 'absolute', top: '12px', left: '12px', background: '#be185d', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>구독전용</div>
                    </div>
                    <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#333' }}>{product.name}</div>
                      <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px', flexGrow: 1, lineHeight: '1.5' }}>{product.desc}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <span style={{ fontSize: '20px', fontWeight: '800', color: '#be185d' }}>{product.price.toLocaleString()}원</span>
                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>/ 월 {(product.totalDeliveryCount ?? ((product.daysOfWeek || []).length * 4)) || 4}회 기준</span>
                      </div>
                      {(() => {
                        const isAlreadySubscribed = mySubscriptionProductIds.some(
                          (sid) => sid == product.id || sid === product.id
                        );
                        return (
                          <button
                            type="button"
                            disabled={isAlreadySubscribed}
                            onClick={() => !isAlreadySubscribed && handleSubscribe(product)}
                            style={{
                              width: '100%',
                              padding: '14px',
                              borderRadius: '12px',
                              background: isAlreadySubscribed ? '#e2e8f0' : '#be185d',
                              color: isAlreadySubscribed ? '#64748b' : 'white',
                              border: 'none',
                              fontWeight: '700',
                              cursor: isAlreadySubscribed ? 'not-allowed' : 'pointer',
                              fontSize: '15px',
                              opacity: isAlreadySubscribed ? 0.9 : 1,
                            }}
                          >
                            {isAlreadySubscribed ? '이미 구독중' : '구독 시작하기'}
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Category Tabs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
              {['전체', ...new Set(storeProducts.map(p => p.category))].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedProductCategory(cat)}
                  style={{
                    padding: '8px 20px', borderRadius: '20px', border: 'none',
                    backgroundColor: selectedProductCategory === cat ? 'var(--primary)' : '#f8fafc',
                    color: selectedProductCategory === cat ? 'white' : '#64748b',
                    fontWeight: '800', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s'
                  }}
                >{cat}</button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px', rowGap: '40px' }}>
              {storeProductsLoading ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748b' }}>상품 목록을 불러오는 중...</div>
              ) : storeProducts
                .filter(p => selectedProductCategory === '전체' || p.category === selectedProductCategory)
                .map((product, i) => {
                  const isOutOfStock = product.stock <= 0;
                  const isLowStock = product.stock > 0 && product.stock <= 5;

                  return (
                    <div key={product.id} style={{ display: 'flex', flexDirection: 'column', opacity: isOutOfStock ? 0.7 : 1 }}>
                      <div
                        onClick={() => !isOutOfStock && setSelectedProductForDetail(product)}
                        style={{ position: 'relative', marginBottom: '16px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', cursor: isOutOfStock ? 'default' : 'pointer' }}
                      >
                        <img src={product.img} alt={product.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', transition: 'transform 0.3s', filter: isOutOfStock ? 'grayscale(100%)' : 'none' }} />

                        {isOutOfStock && (
                          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: 'white', fontWeight: '800', fontSize: '18px', border: '2px solid white', padding: '8px 16px', borderRadius: '8px' }}>SOLD OUT</span>
                          </div>
                        )}
                        {isLowStock && (
                          <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                            품절임박: {product.stock}개 남음
                          </div>
                        )}
                      </div>

                      <div style={{ padding: '0 4px' }}>
                        {(i % 2 === 0 && !isOutOfStock) && (
                          <div style={{ marginBottom: '8px' }}>
                            <span style={{ fontSize: '11px', color: '#ef4444', border: '1px solid #ef4444', padding: '3px 6px', borderRadius: '4px', fontWeight: '700' }}>특가 상품</span>
                          </div>
                        )}
                        <div
                          onClick={() => !isOutOfStock && setSelectedProductForDetail(product)}
                          style={{ fontSize: '17px', fontWeight: '500', color: isOutOfStock ? '#94a3b8' : '#1e293b', marginBottom: '8px', lineHeight: '1.4', cursor: isOutOfStock ? 'default' : 'pointer' }}
                        >
                          {product.name}
                        </div>
                        <div style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '18px', fontWeight: '900', color: isOutOfStock ? '#94a3b8' : '#fa622f' }}>10%</span>
                          <span style={{ fontSize: '18px', fontWeight: '800', color: isOutOfStock ? '#94a3b8' : '#1e293b' }}>{product.price.toLocaleString()}원</span>
                        </div>
                        <div style={{ fontSize: '14px', color: '#94a3b8', textDecoration: 'line-through', marginBottom: '10px' }}>{(product.price * 1.1).toLocaleString().split('.')[0]}원</div>

                        {/* 
                    <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                        <span style={{ color: '#64748b' }}>후기 1,234</span>
                        <span style={{ width: '1px', height: '10px', background: '#e2e8f0' }}></span>
                        <span>평점 4.8</span>
                    </div> 
                    */}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        );
      case 'reviews':
        if (reviewsLoading) {
          return (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', background: 'white', borderRadius: '24px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>⌛</div>
              <p>리뷰를 불러오는 중입니다...</p>
            </div>
          );
        }

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
                <div style={{ fontSize: '48px', fontWeight: '900', color: '#f59e0b', marginBottom: '8px' }}>
                  {reviewStats.totalCount > 0 ? (Math.round(reviewStats.average * 10) / 10).toFixed(1) : '0.0'}
                </div>
                <div style={{ fontSize: '15px', color: '#94a3b8' }}>전체 {reviewStats.totalCount}개 리뷰</div>
              </div>
              <div style={{ width: '1px', height: '60px', backgroundColor: '#e2e8f0' }}></div>
              <div style={{ flexGrow: 1 }}>
                {[5, 4, 3, 2, 1].map(star => {
                  const count = reviewStats.stars[star] || 0;
                  const percentage = reviewStats.totalCount > 0 ? (count / reviewStats.totalCount) * 100 : 0;
                  return (
                    <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '20px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', color: '#64748b', width: '30px' }}>{star}점</span>
                      <div style={{ flexGrow: 1, height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: '#f59e0b', borderRadius: '4px' }}></div>
                      </div>
                      <span style={{ fontSize: '12px', color: '#94a3b8', width: '30px' }}>{count}</span>
                    </div>
                  );
                })}
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

            {reviews.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center', backgroundColor: 'white', borderRadius: '24px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>💬</div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>아직 작성된 리뷰가 없습니다</h3>
                <p style={{ color: '#64748b', fontSize: '14px' }}>첫 번째 리뷰의 주인공이 되어보세요!</p>
              </div>
            ) : (
              sortedReviews.map(re => (
                <div key={re.id} style={{ padding: '30px', background: 'white', borderRadius: '24px', border: '1px solid var(--border)', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: '700', fontSize: '16px' }}>{re.user ? re.user.charAt(0) + '**' : '익명'}</span>
                      <div style={{ color: '#f59e0b', fontSize: '14px' }}>{'★'.repeat(re.rate)}{'☆'.repeat(5 - re.rate)}</div>
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
                    <div>
                      <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: '0 0 12px 0' }}>{re.content}</p>
                      {re.products && (
                        <div style={{ fontSize: '12px', color: '#94a3b8', background: '#f8fafc', padding: '4px 10px', borderRadius: '6px', display: 'inline-block' }}>
                          구매상품: {re.products}
                        </div>
                      )}
                    </div>
                  )}

                  {re.reply && (
                    <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '16px', borderLeft: '4px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>사장님 답변</span>
                      </div>
                      <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', margin: 0 }}>{re.reply}</p>
                    </div>
                  )}
                </div>
              ))
            )}
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
      case 'subscription':
        return (
          <div style={{ border: '1px solid #fce7f3', padding: '40px', borderRadius: '24px', background: 'linear-gradient(to bottom, #fff, #fff5f8)' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px', color: '#be185d' }}>오늘 주문하면 주 1회 배송!</h3>
            <p style={{ color: '#db2777', marginBottom: '40px' }}>단골 마트의 상품을 매주 집 앞으로 편하게 받아보세요.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
              {subscriptionProducts.map(product => (
                <div key={product.id} style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(190, 24, 93, 0.05)', border: '1px solid #fce7f3' }}>
                  <div style={{ height: '240px', overflow: 'hidden' }}>
                    <img src={product.img} alt={product.name} onError={(e) => { e.target.src = DEFAULT_SUBSCRIPTION_IMG; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '30px' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                      <span style={{ fontSize: '12px', background: '#be185d', color: 'white', padding: '4px 10px', borderRadius: '8px', fontWeight: '700' }}>무료 배송</span>
                      <span style={{ fontSize: '12px', background: '#fdf2f8', color: '#be185d', padding: '4px 10px', borderRadius: '8px', fontWeight: '700', border: '1px solid #fce7f3' }}>{product.deliveryFrequency}</span>
                    </div>
                    <h4 style={{ fontSize: '19px', fontWeight: '800', marginBottom: '12px' }}>{product.name}</h4>
                    <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px', lineHeight: '1.6' }}>{product.desc}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                      <span style={{ fontSize: '22px', fontWeight: '900', color: '#be185d' }}>{product.price.toLocaleString()}원</span>
                      <span style={{ fontSize: '13px', color: '#94a3b8' }}>/ 월 정기 결제</span>
                    </div>
                    <button
                      onClick={() => handleSubscribe(product)}
                      style={{ width: '100%', padding: '16px', borderRadius: '16px', background: '#be185d', color: 'white', border: 'none', fontWeight: '800', fontSize: '16px', cursor: 'pointer' }}
                    >구독하기</button>
                  </div>
                </div>
              ))}
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
                <span style={{ color: '#f59e0b', fontWeight: '800', fontSize: '18px' }}>★ {reviewStats.totalCount > 0 ? (Math.round(reviewStats.average * 10) / 10).toFixed(1) : '0.0'}</span>
                <span style={{ textDecoration: 'underline', cursor: 'pointer', color: '#64748b' }}>리뷰 {reviewStats.totalCount}개 &gt;</span>
              </div>
              <span style={{ color: '#cbd5e1' }}>|</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span>최소주문 10,000원</span>
                <span style={{ color: '#cbd5e1' }}>·</span>
                <span>배달팁 3,000원</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '40px', position: 'sticky', top: '80px', backgroundColor: 'var(--bg-main)', zIndex: 10, paddingTop: '10px' }}>
        {['menu', 'reviews', 'subscription', 'info'].map((tab) => (
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
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            {tab === 'menu' ? '메뉴' : tab === 'reviews' ? '리뷰' : tab === 'subscription' ? '구독상품' : '가게정보'}
            {activeSubTab === tab && <div style={{ position: 'absolute', bottom: '-1px', left: 0, right: 0, height: '4px', backgroundColor: 'var(--primary)', borderRadius: '4px 4px 0 0' }}></div>}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ minHeight: '600px' }}>
        {renderSubTabContent()}
      </div>

      <ProductDetailModal
        product={selectedProductForDetail}
        store={store}
        onClose={() => setSelectedProductForDetail(null)}
        onAddToCart={onAddToCart}
      />

      <SubscriptionDetailModal
        subscription={selectedSubForDetail}
        onClose={() => setSelectedSubForDetail(null)}
        deliveryTimeSlots={deliveryTimeSlots}
        selectedDeliveryTime={selectedDeliveryTime}
        setSelectedDeliveryTime={setSelectedDeliveryTime}
        onPayment={() => {
          const payload = {
            ...selectedSubForDetail,
            deliveryTime: selectedDeliveryTime,
            deliveryTimeSlot: selectedDeliveryTime,
          };
          onSubscribeCheckout(payload);
          setSelectedSubForDetail(null);
        }}
      />

      {reportingReviewId && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', width: '90%', maxWidth: '400px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>리뷰 신고하기</h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>신고 사유를 구체적으로 입력해주세요.</p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="신고 내용을 입력하세요..."
              style={{ width: '100%', minHeight: '120px', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px', resize: 'none', fontSize: '14px' }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setReportingReviewId(null)}
                style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '700', cursor: 'pointer' }}>취소</button>
              <button
                onClick={submitReport}
                style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: '#ef4444', color: 'white', fontWeight: '700', cursor: 'pointer' }}>신고 접수</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProductDetailModal = ({ product, store, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  if (!product) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, backdropFilter: 'blur(8px)', animation: 'fadeIn 0.3s ease-out'
    }} onClick={onClose}>
      <div style={{
        background: 'white', width: '90%', maxWidth: '800px', borderRadius: '32px',
        display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        position: 'relative', animation: 'slideUp 0.3s ease-out'
      }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', border: 'none', background: 'white', width: '40px', height: '40px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer', color: '#94a3b8', zIndex: 1, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>✕</button>

        <div style={{ width: '100%', aspectRatio: '1/1', overflow: 'hidden' }}>
          <img src={product.img} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <div style={{ padding: '40px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '800', marginBottom: '8px' }}>{product.category}</div>
          <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#1e293b', marginBottom: '12px' }}>{product.name}</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
            <div style={{ fontSize: '14px', color: '#64748b' }}>
              <span style={{ fontWeight: '700', marginRight: '8px' }}>원산지</span>
              <span>{product.origin || '정보 없음'}</span>
            </div>
            <div style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
              <span style={{ fontWeight: '700', marginRight: '8px' }}>상품설명</span>
              <span>{product.description || product.desc || '정보 없음'}</span>
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            {product.discountRate > 0 && (
              <div style={{ fontSize: '14px', color: '#94a3b8', textDecoration: 'line-through', marginBottom: '4px' }}>
                {Math.floor(product.price / (1 - product.discountRate / 100)).toLocaleString()}원
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {product.discountRate > 0 && <span style={{ fontSize: '24px', fontWeight: '900', color: '#fa622f' }}>{product.discountRate}%</span>}
              <span style={{ fontSize: '32px', fontWeight: '900', color: '#1e293b' }}>{product.price.toLocaleString()}원</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '24px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '700', color: '#475569' }}>수량</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'white', padding: '8px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', color: '#94a3b8' }}>-</button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ width: '40px', textAlign: 'center', fontWeight: '800', border: 'none', outline: 'none', fontSize: '16px', backgroundColor: 'transparent' }}
                />
                <button onClick={() => setQuantity(quantity + 1)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', color: '#94a3b8' }}>+</button>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
              <span style={{ color: '#64748b', fontWeight: '700' }}>총 합계 금액</span>
              <span style={{ fontSize: '28px', fontWeight: '900', color: 'var(--primary)' }}>{(product.price * quantity).toLocaleString()}원</span>
            </div>
            <button
              onClick={() => {
                if (onAddToCart) onAddToCart(product, store, quantity);
                onClose();
              }}
              style={{
                width: '100%', padding: '20px', borderRadius: '16px', background: 'var(--primary)',
                color: 'white', border: 'none', fontWeight: '800', fontSize: '18px',
                cursor: 'pointer', boxShadow: '0 8px 20px rgba(46, 204, 113, 0.3)'
              }}
            >
              장바구니 담기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

const SubscriptionDetailModal = ({ subscription, onClose, onPayment, deliveryTimeSlots, selectedDeliveryTime, setSelectedDeliveryTime }) => {
  if (!subscription) return null;

  const daysOfWeek = subscription.daysOfWeek ?? [];
  const weeklyFreq = Array.isArray(daysOfWeek) ? daysOfWeek.length : 0;
  const monthlyTotal = subscription.totalDeliveryCount ?? (weeklyFreq > 0 ? weeklyFreq * 4 : 4);
  const daysDisplay = Array.isArray(daysOfWeek) && daysOfWeek.length > 0
    ? [...new Set(daysOfWeek)]
      .sort((a, b) => Number(a) - Number(b))
      .map((d) => (DAY_LABELS[Number(d)] ?? d) + '요일')
      .join(', ')
    : '요일 미설정';

  // Calculate next delivery date (e.g., next Monday)
  const getNextDeliveryDate = () => {
    const now = new Date();
    const result = new Date();
    result.setDate(now.getDate() + (1 + 7 - now.getDay()) % 7 || 7);
    return `${result.getFullYear()}년 ${result.getMonth() + 1}월 ${result.getDate()}일 (월)`;
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, backdropFilter: 'blur(8px)', animation: 'fadeIn 0.3s ease-out'
    }} onClick={onClose}>
      <div style={{
        background: 'white', width: '90%', maxWidth: '440px', borderRadius: '32px',
        padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        position: 'relative', animation: 'slideUp 0.3s ease-out', overflowY: 'auto', maxHeight: '90vh'
      }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', border: 'none', background: 'transparent', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}>✕</button>

        <div style={{ width: '100%', height: '240px', borderRadius: '20px', overflow: 'hidden', marginBottom: '24px' }}>
          <img src={subscription.img} alt={subscription.name} onError={(e) => { e.target.src = DEFAULT_SUBSCRIPTION_IMG; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ background: '#fdf2f8', color: '#be185d', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '800' }}>BEST</span>
          <span style={{ background: '#f0fdf4', color: '#166534', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '800' }}>무료배송</span>
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b', marginBottom: '12px' }}>{subscription.name}</h2>
        <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>{subscription.desc}</p>

        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '20px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#64748b', fontWeight: '600', fontSize: '14px' }}>배송 주기</span>
            <span style={{ color: '#1e293b', fontWeight: '800', fontSize: '14px' }}>매주 {daysDisplay} (주 {weeklyFreq || 1}회 / 월 {monthlyTotal}회)</span>
          </div>
          <div style={{ marginBottom: '24px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '16px 0' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: '800', color: '#be185d' }}>희망 배송 시간대</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {deliveryTimeSlots.map(time => (
                <button
                  key={time}
                  onClick={() => setSelectedDeliveryTime(time)}
                  style={{
                    padding: '10px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: '700',
                    border: selectedDeliveryTime === time ? '2px solid #be185d' : '1px solid #e2e8f0',
                    background: selectedDeliveryTime === time ? '#fdf2f8' : 'white',
                    color: selectedDeliveryTime === time ? '#be185d' : '#64748b',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
            <span style={{ color: '#64748b', fontWeight: '600', fontSize: '14px' }}>월 구독료</span>
            <span style={{ color: '#1e293b', fontWeight: '900', fontSize: '18px' }}>{subscription.price?.toLocaleString()}원</span>
          </div>
        </div>

        <button
          onClick={onPayment}
          style={{
            width: '100%', padding: '18px', borderRadius: '16px', background: 'linear-gradient(135deg, #be185d, #db2777)',
            color: 'white', border: 'none', fontWeight: '800', fontSize: '17px',
            cursor: 'pointer', boxShadow: '0 8px 20px rgba(190, 24, 93, 0.3)',
            transition: 'transform 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {subscription.price?.toLocaleString()}원 결제하고 구독 시작하기
        </button>
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '16px' }}>구독 해지는 언제든 마이페이지에서 가능합니다.</p>
      </div>
    </div>
  );
};

export default StoreDetailView;
