import React, { useState } from 'react';
import Header from './Header';
import Hero from './Hero';
import StoreGrid from './StoreGrid';
import CategorySidebar from './CategorySidebar';
import SearchResultsView from './SearchResultsView';
import CheckoutView from './CheckoutView';
import OrderTrackingView from './OrderTrackingView';
import ResidentDeliveryView from './ResidentDeliveryView';
import SupportView from './SupportView';
import PartnerPage from './PartnerPage';
import Footer from './Footer';
import { orders, subscriptions, reviews, stores, addresses, paymentMethods, faqs, categories, coupons, inquiries, loyaltyPoints } from '../data/mockData';

const CustomerView = ({ userRole, setUserRole, isLoggedIn, onLogout, onOpenAuth, setSelectedStore, isResidentRider, setIsResidentRider, isDeliveryMode, setIsDeliveryMode, notificationCount }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('fruit');
  const [searchQuery, setSearchQuery] = useState('');
  // const [debouncedSearch, setDebouncedSearch] = useState(''); // Removed to satisfy lint

  const [cartItems, setCartItems] = useState([]);
  const [toast, setToast] = useState(null);

  /* useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]); */

  // Show toast feedback for interactions
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };
  const [trackingOrderId] = useState('202601210001'); // trackingOrderId is read, setTrackingOrderId is not.

  const [myPageTab, setMyPageTab] = useState('profile');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rate: 5, content: '' });
  const [verifyStep, setVerifyStep] = useState(0); // 0: intro, 1: location, 2: id, 3: success

  const handleOpenReviewModal = (order) => {
    setSelectedOrderForReview(order);
    setReviewForm({ rate: 5, content: '' });
    setIsReviewModalOpen(true);
  };

  const handleSaveReview = (e) => {
    e.preventDefault();
    alert('리뷰가 등록되었습니다! 소중한 의견 감사합니다.');
    setIsReviewModalOpen(false);
  };

  const onAddToCart = (product, store) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1, storeId: store.id, storeName: store.name }];
    });
    showToast(`${product.name}이(가) 장바구니에 담겼습니다.`);
  };

  const onUpdateQuantity = (id, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const onRemoveFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    showToast('장바구니에서 상품이 삭제되었습니다.');
  };

  const clearCart = () => setCartItems([]);

  const renderActiveView = () => {
    if (isDeliveryMode) return <ResidentDeliveryView />;

    switch (activeTab) {
      case 'special':
        return (
          <div style={{ padding: '20px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>진행 중인 기획전</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {[
                { title: '겨울철 비타민 충전!', desc: '제철 과일 20% 할인', color: 'linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)' },
                { title: '따끈따끈 밀키트', desc: '우리집이 맛집! 전품목 15%', color: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)' },
                { title: '우리동네 정육점 특가', desc: '한우/한돈 최대 30% 할인', color: 'linear-gradient(to right, #f78ca0 0%, #f9748f 19%, #fd868c 60%, #fe9a8b 100%)' },
                { title: '유기농 야채 새벽배송', desc: '신규 구독 시 첫 주 무료', color: 'linear-gradient(to top, #0ba360 0%, #3cba92 100%)' }
              ].map((special, i) => (
                <div key={i} style={{ height: '200px', borderRadius: '20px', background: special.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '20px', textAlign: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>{special.title}</h3>
                    <p style={{ fontSize: '14px' }}>{special.desc}</p>
                    <button 
                      onClick={() => showToast('상세 기획전 페이지로 이동합니다. (데모)')}
                      style={{ marginTop: '16px', padding: '8px 16px', borderRadius: '20px', background: 'white', color: '#333', border: 'none', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>자세히 보기</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'subscription':
        return (
          <div style={{ padding: '20px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>나의 구독 관리</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {subscriptions.map((sub) => (
                <div key={sub.id} style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ fontSize: '32px' }}>{sub.img}</div>
                    <div style={{ backgroundColor: sub.status === '이용 중' ? '#f0fdf4' : '#f1f5f9', color: sub.status === '이용 중' ? 'var(--primary)' : 'var(--text-muted)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '700' }}>{sub.status}</div>
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '18px', marginBottom: '8px' }}>{sub.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>{sub.period} | <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{sub.price}</span></div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => showToast('구독 구성 변경 모달을 준비 중입니다.')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', fontWeight: '600', cursor: 'pointer' }}>구성 변경</button>
                    <button onClick={() => showToast('이번 주 배송을 건너뛰었습니다.')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', fontWeight: '600', cursor: 'pointer' }}>건너뛰기</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'cart': {
        if (!isLoggedIn) {
          return (
            <div style={{ padding: '100px 0', textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
              <div style={{ fontSize: '64px', marginBottom: '24px' }}>🛒</div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>장바구니 확인을 위해 <br /> 로그인이 필요합니다</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.6' }}>회원가입 후 동네마켓의 신선한 상품들과 <br /> 다양한 혜택을 만나보세요!</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button onClick={onOpenAuth} className="btn-primary" style={{ padding: '16px', fontSize: '16px' }}>간편 로그인 / 회원가입</button>
                <button onClick={() => setActiveTab('home')} style={{ padding: '16px', borderRadius: '12px', background: '#f1f5f9', color: '#475569', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '16px' }}>홈으로 돌아가기</button>
              </div>
            </div>
          );
        }
        const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return (
          <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>장바구니 ({cartItems.length})</h2>
            {cartItems.length === 0 ? (
              <div style={{ background: 'white', padding: '60px 24px', borderRadius: '16px', border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontSize: '64px', marginBottom: '24px' }}>🛒</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '18px', marginBottom: '32px' }}>장바구니가 비어있습니다.</p>
                <button 
                  onClick={() => setActiveTab('home')}
                  style={{ padding: '16px 32px', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '16px' }}
                >쇼핑하러 가기</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {cartItems.map((item) => (
                    <div key={item.id} style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <img src={item.img} alt={item.name} style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }} />
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{item.storeName}</div>
                        <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>{item.name}</div>
                        <div style={{ fontWeight: '800', color: 'var(--primary)' }}>{item.price.toLocaleString()}원</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#f1f5f9', padding: '6px 12px', borderRadius: '24px' }}>
                        <button onClick={() => onUpdateQuantity(item.id, -1)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: '800' }}>-</button>
                        <span style={{ fontWeight: '700', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.id, 1)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: '800' }}>+</button>
                      </div>
                      <button onClick={() => onRemoveFromCart(item.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
                    </div>
                  ))}
                </div>
                <div style={{ height: 'fit-content', position: 'sticky', top: '100px' }}>
                  <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>결제 금액</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                        <span>상품 금액</span>
                        <span>{totalPrice.toLocaleString()}원</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                        <span>배송비</span>
                        <span>3,000원</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                      <span style={{ fontWeight: '700', fontSize: '18px' }}>총 결제금액</span>
                      <span style={{ fontWeight: '800', fontSize: '20px', color: 'var(--primary)' }}>{(totalPrice + 3000).toLocaleString()}원</span>
                    </div>
                    <button 
                      onClick={() => setActiveTab('checkout')}
                      style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '700', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)' }}
                    >주문하기</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }
      case 'checkout':
        return <CheckoutView cartItems={cartItems} onComplete={() => { 
          clearCart(); 
          alert('주문이 성공적으로 완료되었습니다! 잠시 후 대시보드에서 배송 현황을 확인하실 수 있습니다.');
          setActiveTab('home'); 
        }} />;
      case 'tracking':
        return <OrderTrackingView orderId={trackingOrderId} onBack={() => setActiveTab('home')} />;
      case 'support':
        return <SupportView userRole={userRole} onOpenAuth={onOpenAuth} />;
      case 'partner':
        return (
          <PartnerPage 
            onBack={() => setActiveTab('home')} 
            onRegister={(role) => {
              setUserRole(role);
              setActiveTab('home');
              window.scrollTo(0,0);
            }} 
          />
        );
      case 'mypage':
        if (!isLoggedIn) {
          return (
            <div style={{ padding: '100px 0', textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
              <div style={{ fontSize: '64px', marginBottom: '24px' }}>👤</div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>마이페이지 확인을 위해 <br /> 로그인이 필요합니다</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.6' }}>회원가입 후 동네마켓의 신선한 상품들과 <br /> 다양한 혜택을 만나보세요!</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button onClick={onOpenAuth} className="btn-primary" style={{ padding: '16px', fontSize: '16px' }}>간편 로그인 / 회원가입</button>
                <button onClick={() => setActiveTab('home')} style={{ padding: '16px', borderRadius: '12px', background: '#f1f5f9', color: '#475569', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '16px' }}>홈으로 돌아가기</button>
              </div>
            </div>
          );
        }
        return (
          <div style={{ padding: '20px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>마이 페이지</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }}>
              <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', height: 'fit-content' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f1f5f9', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                    {isLoggedIn ? '👤' : '👣'}
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '18px' }}>
                    {isLoggedIn ? '사용자 님' : '비회원 님'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {isLoggedIn ? "님은 'VIP' 등급입니다." : '로그인하고 혜택을 받으세요.'}
                  </div>
                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <div style={{ backgroundColor: '#fdf2f8', color: '#db2777', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800' }}>
                      P {loyaltyPoints.toLocaleString()}
                    </div>
                    <div style={{ backgroundColor: '#fff7ed', color: '#c2410c', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800' }}>
                      쿠폰 {coupons.length}장
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { id: 'profile', label: '주문/리뷰 관리', icon: '📝' },
                    { id: 'address', label: '배송지 관리', icon: '📍' },
                    { id: 'payment', label: '결제 수단 관리', icon: '💳' },
                    { id: 'coupon', label: '쿠폰함', icon: '🎫' },
                    { id: 'help', label: '고객센터', icon: '📞' },
                    { id: 'resident', label: '동네 라이더 신청', icon: '🛵' }
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => setMyPageTab(tab.id)}
                      style={{ 
                        textAlign: 'left', 
                        padding: '12px 16px', 
                        borderRadius: '12px', 
                        border: 'none', 
                        background: myPageTab === tab.id ? 'rgba(46, 204, 113, 0.1)' : 'transparent', 
                        color: myPageTab === tab.id ? 'var(--primary)' : '#475569',
                        fontWeight: '700', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => { if (myPageTab !== tab.id) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                      onMouseOut={(e) => { if (myPageTab !== tab.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <span style={{ fontSize: '18px' }}>{tab.icon}</span>
                      <span style={{ whiteSpace: 'nowrap' }}>{tab.label}</span>
                    </button>
                  ))}
                  <div style={{ height: '1px', background: '#f1f5f9', margin: '12px 0' }}></div>
                  <button 
                    onClick={onLogout}
                    style={{ 
                      textAlign: 'left', 
                      padding: '12px 16px', 
                      borderRadius: '12px', 
                      border: 'none', 
                      background: 'transparent', 
                      fontWeight: '700', 
                      color: '#94a3b8', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <span>🚪</span>
                    로그아웃
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {myPageTab === 'profile' && (
                  <>
                    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>최근 주문 내역</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {orders.length > 0 ? (
                          orders.slice(0, 5).map((order, i) => (
                            <div key={order.id} style={{ display: 'flex', gap: '16px', paddingBottom: '20px', borderBottom: i === Math.min(orders.length - 1, 4) ? 'none' : '1px solid #f1f5f9' }}>
                              <img src={order.img} alt={order.store} style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
                              <div style={{ flexGrow: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                  <span style={{ fontWeight: '700' }}>{order.store}</span>
                                  <span style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '600' }}>{order.status}</span>
                                </div>
                                <div style={{ fontSize: '14px', color: '#475569' }}>{order.items} | {order.price}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{order.date} | 주문번호 {order.id}</div>
                              </div>
                              {order.status === '배송 중' && (
                                <button onClick={() => setActiveTab('tracking')} className="btn-secondary" style={{ height: 'fit-content', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--primary)', background: 'transparent', color: 'var(--primary)', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>배송추적</button>
                              )}
                              {(order.status === '배송 완료' || order.status === '완료') && (
                                <button onClick={() => handleOpenReviewModal(order)} style={{ height: 'fit-content', padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>리뷰 쓰기</button>
                              )}
                            </div>
                          ))
                        ) : (
                          <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                            <p style={{ color: 'var(--text-muted)' }}>최근 주문 내역이 없습니다.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>나의 리뷰</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {reviews.length > 0 ? (
                          reviews.map((review, i) => (
                            <div key={review.id} style={{ paddingBottom: '20px', borderBottom: i === reviews.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontWeight: '700', fontSize: '15px' }}>{review.store}</span>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                  <span style={{ color: '#f59e0b', fontSize: '14px' }}>{'★'.repeat(review.rate)}</span>
                                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{review.date}</span>
                                </div>
                              </div>
                              <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: 0 }}>{review.content}</p>
                            </div>
                          ))
                        ) : (
                          <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✍️</div>
                            <p style={{ color: 'var(--text-muted)' }}>작성한 리뷰가 없습니다.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {myPageTab === 'coupon' && (
                  <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>나의 쿠폰함</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {coupons.map(coupon => (
                        <div key={coupon.id} style={{ display: 'flex', border: '1px solid #f1f5f9', borderRadius: '16px', overflow: 'hidden' }}>
                          <div style={{ width: '100px', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
                            <div style={{ fontSize: '12px', fontWeight: '600' }}>DISCOUNT</div>
                            <div style={{ fontSize: '20px', fontWeight: '800' }}>{coupon.discount}</div>
                          </div>
                          <div style={{ flexGrow: 1, padding: '16px', position: 'relative' }}>
                            <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>{coupon.name}</div>
                            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>{coupon.minOrder}</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>~{coupon.expiry} 까지</div>
                            <div style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--primary)', fontWeight: '700', fontSize: '12px' }}>{coupon.status}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {myPageTab === 'address' && (
                  <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '700' }}>배송지 관리</h3>
                      <button 
                        onClick={() => showToast('새 배송지 추가 양식을 준비 중입니다.')}
                        style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>+ 새 배송지 추가</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {addresses.map(addr => (
                        <div key={addr.id} style={{ padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9', backgroundColor: addr.isDefault ? 'rgba(46, 204, 113, 0.02)' : 'white' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: '800', fontSize: '16px' }}>{addr.label}</span>
                              {addr.isDefault && <span style={{ fontSize: '10px', backgroundColor: 'var(--primary)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>기본배송지</span>}
                            </div>
                            <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#94a3b8' }}>
                              <span onClick={() => showToast('배송 정보 수정 기능을 준비 중입니다.')} style={{ cursor: 'pointer' }}>수정</span>
                              <span onClick={() => showToast('배송 정보를 삭제하시겠습니까?')} style={{ cursor: 'pointer' }}>삭제</span>
                            </div>
                          </div>
                          <div style={{ fontSize: '15px', color: '#1e293b', marginBottom: '4px' }}>{addr.address}</div>
                          <div style={{ fontSize: '14px', color: '#64748b' }}>{addr.detail}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {myPageTab === 'payment' && (
                  <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '700' }}>결제 수단 관리</h3>
                      <button 
                        onClick={() => showToast('새 결제 수단 등록 페이지로 이동합니다.')}
                        style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>+ 결제 수단 추가</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                      {paymentMethods.map(pm => (
                        <div key={pm.id} style={{ padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9', position: 'relative' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ width: '40px', height: '24px', backgroundColor: pm.color, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '8px', fontWeight: '900' }}>
                              {pm.type === 'card' ? 'CARD' : 'PAY'}
                            </div>
                            <span style={{ fontWeight: '700' }}>{pm.name}</span>
                          </div>
                          {pm.number && <div style={{ fontSize: '14px', color: '#64748b' }}>{pm.number}</div>}
                          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {pm.isDefault ? <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700' }}>기본 결제수단</span> : <span onClick={() => showToast('기본 결제 수단으로 변경되었습니다.')} style={{ fontSize: '12px', color: '#94a3b8', cursor: 'pointer' }}>기본으로 설정</span>}
                            <span onClick={() => showToast('결제 수단이 삭제되었습니다.')} style={{ fontSize: '12px', color: '#ef4444', cursor: 'pointer' }}>삭제</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {myPageTab === 'help' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>자주 묻는 질문 (FAQ)</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {faqs.map(faq => (
                          <details key={faq.id} style={{ border: '1px solid #f1f5f9', borderRadius: '12px', overflow: 'hidden' }}>
                            <summary style={{ padding: '16px', background: '#fafafa', cursor: 'pointer', fontWeight: '600', fontSize: '14px', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span><span style={{ color: 'var(--primary)', marginRight: '8px' }}>[{faq.category}]</span> {faq.question}</span>
                              <span style={{ fontSize: '10px' }}>▼</span>
                            </summary>
                            <div style={{ padding: '16px', fontSize: '14px', color: '#475569', lineHeight: '1.6', borderTop: '1px solid #f1f5f9' }}>
                              {faq.answer}
                            </div>
                          </details>
                        ))}
                      </div>
                    </div>

                    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>1:1 문의하기</h3>
                      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>해결되지 않은 문제는 1:1 문의를 남겨주세요. 최대한 빠르게 답변해 드립니다.</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <select style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                          <option>문의 유형 선택</option>
                          <option>주문/취소</option>
                          <option>배송</option>
                          <option>결제</option>
                          <option>시스템 오류</option>
                          <option>기타</option>
                        </select>
                        <textarea 
                          placeholder="문의 내용을 상세히 적어주세요."
                          style={{ width: '100%', height: '120px', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'none' }}
                        ></textarea>
                        <button 
                          onClick={() => alert('문의가 성공적으로 접수되었습니다.')}
                          style={{ padding: '14px', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                        >문의 등록하기</button>
                      </div>
                    </div>

                    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>나의 문의 내역</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {inquiries.map(inquiry => (
                          <div key={inquiry.id} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700' }}>[{inquiry.type}]</span>
                              <span style={{ fontSize: '12px', color: '#94a3b8' }}>{inquiry.date}</span>
                            </div>
                            <div style={{ fontWeight: '700', marginBottom: '8px' }}>{inquiry.title}</div>
                            <div style={{ fontSize: '14px', color: '#475569', marginBottom: inquiry.answer ? '12px' : '0' }}>{inquiry.content}</div>
                            {inquiry.answer && (
                              <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', fontSize: '13px', color: '#334155', borderLeft: '4px solid var(--primary)' }}>
                                <div style={{ fontWeight: '800', marginBottom: '4px', color: 'var(--primary)' }}>답변</div>
                                {inquiry.answer}
                              </div>
                            )}
                            <div style={{ marginTop: '12px', textAlign: 'right' }}>
                              <span style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '4px', backgroundColor: inquiry.status === '답변 완료' ? '#f0fdf4' : '#f1f5f9', color: inquiry.status === '답변 완료' ? '#16a34a' : '#64748b', fontWeight: '700' }}>
                                {inquiry.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {myPageTab === 'resident' && (
                  <div style={{ background: 'white', padding: '40px', borderRadius: '24px', border: '1px solid var(--border)', textAlign: 'center' }}>
                    {isResidentRider ? (
                      <div>
                        <div style={{ fontSize: '64px', marginBottom: '24px' }}>🎉</div>
                        <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '16px' }}>이미 동네 라이더이시군요!</h3>
                        <p style={{ color: '#64748b', marginBottom: '32px' }}>헤더의 <b>'배달 모드로 전환'</b> 버튼을 눌러 지금 바로 시작해보세요.</p>
                        <button 
                          onClick={() => setIsDeliveryMode(true)}
                          style={{ padding: '16px 32px', borderRadius: '12px', background: '#38bdf8', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                        >배달 시작하기</button>
                      </div>
                    ) : (
                      <>
                        {verifyStep === 0 && (
                          <div>
                            <div style={{ fontSize: '64px', marginBottom: '24px' }}>🏘️</div>
                            <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '16px' }}>우리 동네 라이더가 되어보세요</h3>
                            <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '32px' }}>
                              근거리 배달로 이웃에게 따뜻함을 전달하고 소소한 수익도 얻어보세요.<br/>
                              오토바이가 없어도 도보나 자전거로 충분히 가능합니다!
                            </p>
                            <button 
                              onClick={() => setVerifyStep(1)}
                              style={{ padding: '16px 32px', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                            >동네 인증 시작하기</button>
                          </div>
                        )}
                        {verifyStep === 1 && (
                          <div>
                            <div style={{ fontSize: '48px', marginBottom: '24px' }}>📍</div>
                            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>현재 위치를 확인합니다</h3>
                            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>인증된 거주지 주변 1km 이내의 배달 건만 수령 가능합니다.</p>
                            <div style={{ height: '180px', backgroundColor: '#f1f5f9', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px', border: '1px solid #e2e8f0' }}>
                              <span style={{ color: 'var(--primary)', fontWeight: '700' }}>[GPS 시뮬레이션: 역삼동 확인됨]</span>
                            </div>
                            <button 
                              onClick={() => setVerifyStep(2)}
                              style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                            >위치 인증 완료</button>
                          </div>
                        )}
                        {verifyStep === 2 && (
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🪪</div>
                              <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>신원 확인 및 서류 등록</h3>
                              <p style={{ color: '#64748b', fontSize: '14px' }}>안전한 배달 환경을 위해 신분 인증이 필요합니다.</p>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                              <label style={{ display: 'block', fontWeight: '700', fontSize: '14px', marginBottom: '12px' }}>신분증 종류 선택</label>
                              <div style={{ display: 'flex', gap: '12px' }}>
                                {['주민등록증', '운전면허증'].map(type => (
                                  <button 
                                    key={type}
                                    style={{ 
                                      flex: 1, 
                                      padding: '12px', 
                                      borderRadius: '12px', 
                                      border: '1.5px solid #e2e8f0', 
                                      backgroundColor: 'white',
                                      fontWeight: '600',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {type}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div style={{ 
                              border: '2px dashed #cbd5e1', 
                              borderRadius: '16px', 
                              padding: '40px 20px', 
                              textAlign: 'center', 
                              backgroundColor: '#f8fafc',
                              marginBottom: '24px',
                              cursor: 'pointer'
                            }}>
                              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📸</div>
                              <div style={{ fontWeight: '700', color: '#475569', marginBottom: '4px' }}>신분증 사진 업로드</div>
                              <div style={{ fontSize: '12px', color: '#94a3b8' }}>빛 반사가 없는 선명한 사진을 올려주세요.</div>
                            </div>

                            <div style={{ backgroundColor: '#f1f5f9', padding: '16px', borderRadius: '12px', marginBottom: '32px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <input type="checkbox" id="privacy" checked readOnly style={{ accentColor: 'var(--primary)' }} />
                                <label htmlFor="privacy" style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>개인정보 수집 및 이용 동의 (필수)</label>
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748b', paddingLeft: '22px' }}>
                                입력하신 정보는 신원 확인 용도로만 사용되며, <br />
                                확인 즉시 암호화되어 안전하게 보관됩니다.
                              </div>
                            </div>

                            <button 
                              onClick={() => {
                                const btn = document.getElementById('verify-btn');
                                btn.innerHTML = '✨ 신분증 스캔 중...';
                                btn.style.opacity = '0.7';
                                btn.disabled = true;
                                setTimeout(() => {
                                  setIsResidentRider(true); 
                                  setVerifyStep(3);
                                }, 2000);
                              }}
                              id="verify-btn"
                              style={{ width: '100%', padding: '18px', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '800', fontSize: '16px', cursor: 'pointer', transition: 'all 0.2s' }}
                            >인증 요청하기</button>
                          </div>
                        )}
                        {verifyStep === 3 && (
                          <div>
                            <div style={{ fontSize: '64px', marginBottom: '24px' }}>✨</div>
                            <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '16px' }}>동네 라이더 인증 완료!</h3>
                            <p style={{ color: '#64748b', marginBottom: '32px' }}>이제 이웃을 위한 배달을 시작할 수 있습니다.</p>
                            <button 
                              onClick={() => setIsDeliveryMode(true)}
                              style={{ padding: '16px 32px', borderRadius: '12px', background: '#38bdf8', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                            >배달 대시보드로 이동</button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="container" style={{ padding: '20px' }}>
            <Hero 
              onShopClick={() => {
                const grid = document.getElementById('store-grid-section');
                if (grid) grid.scrollIntoView({ behavior: 'smooth' });
              }} 
              onPromoClick={() => setActiveTab('special')} 
            />
            
            {searchQuery ? (
              <SearchResultsView 
                query={searchQuery} 
                stores={stores} 
                categories={categories.slice(1)}
                onStoreClick={setSelectedStore}
              />
            ) : (
              <div id="store-grid-section" style={{ margin: '40px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>오늘의 추천 상점</h2>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['거리순', '평점순', '배달비순'].map(sort => (
                      <button 
                        key={sort} 
                        onClick={() => showToast(`${sort}으로 정렬되었습니다.`)}
                        style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--border)', background: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>{sort}</button>
                    ))}
                  </div>
                </div>
                <div className="main-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 4fr', gap: '30px' }}>
                  <CategorySidebar 
                    selectedCategory={selectedCategory} 
                    setSelectedCategory={setSelectedCategory} 
                  />
                  <StoreGrid selectedCategory={selectedCategory} searchQuery={searchQuery} onAddToCart={onAddToCart} onStoreClick={setSelectedStore} />
                </div>
              </div>
            )}

            <div className="dashboard-widgets" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
              marginTop: '60px'
            }}>
              {/* Delivery Tracking Widget */}
              <div className="widget-card" style={{
                background: 'var(--bg-card)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>현재 배송 현황</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '14px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>주문번호: </span>
                    <span style={{ fontWeight: '600' }}>ORD202601210001</span>
                  </div>
                  <div 
                    onClick={() => setActiveTab('tracking')}
                    style={{ 
                    padding: '12px', 
                    backgroundColor: 'rgba(46, 204, 113, 0.1)', 
                    borderRadius: '8px',
                    color: 'var(--primary)',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>
                    🚲 배송 중 (예상 도착 8분 전)
                  </div>
                  <div style={{
                    height: '150px',
                    background: '#f1f5f9',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '14px'
                  }}>
                    지도 위치 표시 영역
                  </div>
                </div>
              </div>

              {/* Subscription Widget */}
              <div className="widget-card" style={{
                background: 'var(--bg-card)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>나의 구독 관리</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>우리집 필수품 구독</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>매주 수요일 / 18:00-20:00</div>
                  </div>
                  <div style={{ color: '#e67e22', fontSize: '14px', fontWeight: '600' }}>
                    📅 다음 배송 예정: 1월 28일
                  </div>
                  <button 
                    onClick={() => setActiveTab('subscription')}
                    style={{
                    marginTop: '10px',
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>
                    구독 목록 전체보기
                  </button>
                </div>
              </div>

              {/* Order History Widget */}
              <div className="widget-card" style={{
                background: 'var(--bg-card)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>주문 내역</h3>
                  <span 
                    onClick={() => { setActiveTab('mypage'); setMyPageTab('profile'); window.scrollTo(0,0); }}
                    style={{ fontSize: '12px', color: 'var(--primary)', cursor: 'pointer' }}>더보기 &gt;</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                        <div>
                          <div style={{ fontWeight: '600' }}>{order.store}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{order.date} • {order.price}</div>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>
                          {order.status}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="customer-dashboard" style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh' }}>      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#1e293b',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '24px',
          fontSize: '14px',
          fontWeight: '700',
          zIndex: 2000,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          animation: 'slideUp 0.3s ease-out'
        }}>
          ✨ {toast}
          <style>{`
            @keyframes slideUp {
              from { transform: translate(-50%, 20px); opacity: 0; }
              to { transform: translate(-50%, 0); opacity: 1; }
            }
          `}</style>
        </div>
      )}

      <Header 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isLoggedIn={isLoggedIn}
        onLogout={onLogout}
        onOpenAuth={onOpenAuth}
        cartCount={cartItems.length}
        notificationCount={notificationCount}
        isResidentRider={isResidentRider}
        isDeliveryMode={isDeliveryMode}
        onToggleDeliveryMode={() => {
          setIsDeliveryMode(!isDeliveryMode);
          setActiveTab('home');
        }}
      />
      
      {renderActiveView()}

      <Footer onTabChange={(tab) => {
        setActiveTab(tab);
        window.scrollTo(0, 0);
      }} />

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '450px', borderRadius: '24px', padding: '32px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>리뷰 작성하기</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>{selectedOrderForReview?.store}에서의 주문은 어떠셨나요?</p>
            
            <form onSubmit={handleSaveReview} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <span 
                      key={star} 
                      onClick={() => setReviewForm({ ...reviewForm, rate: star })}
                      style={{ cursor: 'pointer', color: star <= reviewForm.rate ? '#f59e0b' : '#e2e8f0' }}
                    >★</span>
                  ))}
                </div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#f59e0b' }}>
                  {['매우 아쉬워요', '아쉬워요', '보통이에요', '만족해요', '최고예요'][reviewForm.rate - 1]}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>리뷰 내용</label>
                <textarea 
                  required
                  value={reviewForm.content}
                  onChange={e => setReviewForm({ ...reviewForm, content: e.target.value })}
                  placeholder="다른 고객들에게 도움이 될 수 있도록 솔직한 리뷰를 남겨주세요."
                  style={{ width: '100%', height: '120px', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', resize: 'none', fontSize: '14px' }}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsReviewModalOpen(false)}
                  style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#f1f5f9', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                >취소</button>
                <button 
                  type="submit"
                  style={{ flex: 2, padding: '14px', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                >리뷰 등록</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .widget-card {
          transition: transform 0.3s ease;
        }
        .widget-card:hover {
          transform: translateY(-5px);
        }
      `}</style>
    </div>
  );
};

export default CustomerView;
