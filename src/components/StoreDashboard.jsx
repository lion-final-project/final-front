import React, { useState } from 'react';

const StoreDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [orders, setOrders] = useState([
    { id: 'ORD20260121001', items: '대추토마토 500g 외 2건', price: '18,400원', status: '신규', date: '2026.01.21 14:20' },
    { id: 'ORD20260121002', items: '유기농 우유 1L', price: '3,200원', status: '준비중', date: '2026.01.21 13:45' },
    { id: 'ORD20260121003', items: '신선란 10구 외 1건', price: '12,500원', status: '준비완료', date: '2026.01.21 13:10' },
    { id: 'ORD20260121004', items: '한우 등심 300g', price: '45,000원', status: '신규', date: '2026.01.21 14:55' },
    { id: 'ORD20260121005', items: '제철 과일 꾸러미', price: '29,900원', status: '완료', date: '2026.01.21 11:30' }
  ]);

  const [products, setProducts] = useState([
    { id: 1, name: '대추토마토 500g', price: '5,900원', stock: 15, category: '채소', img: '🍅' },
    { id: 2, name: '유기농 우유 1L', price: '3,200원', stock: 3, category: '유제품', img: '🥛' },
    { id: 3, name: '신선란 10구', price: '4,500원', stock: 20, category: '식재료', img: '🥚' },
    { id: 4, name: '꿀사과 3입', price: '9,900원', stock: 5, category: '과일', img: '🍎' },
    { id: 5, name: '삼겹살 600g', price: '21,000원', stock: 12, category: '정육', img: '🥩' }
  ]);

  const updateOrderStatus = (id, newStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === id ? { ...order, status: newStatus } : order
    ));
  };

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    stock: '',
    category: '채소',
    img: '📦'
  });

  const handleOpenProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({ ...product });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        price: '',
        stock: '',
        category: '채소',
        img: '📦'
      });
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...productForm, id: p.id } : p));
    } else {
      setProducts(prev => [...prev, { ...productForm, id: Date.now() }]);
    }
    setIsProductModalOpen(false);
  };

  const deleteProduct = (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case '신규': return { bg: '#fee2e2', text: '#991b1b' };
      case '준비중': return { bg: '#fff7ed', text: '#9a3412' };
      case '준비완료': return { bg: '#f0fdf4', text: '#166534' };
      case '완료': return { bg: '#f1f5f9', text: '#475569' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'orders':
        return (
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>전체 주문 관리</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" placeholder="주문번호 검색..." style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                <select style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}>
                  <option>전체 상태</option>
                  <option>신규</option>
                  <option>준비중</option>
                  <option>준비완료</option>
                  <option>완료</option>
                </select>
              </div>
            </div>
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '14px' }}>
                    <th style={{ padding: '12px' }}>주문번호</th>
                    <th style={{ padding: '12px' }}>상품명</th>
                    <th style={{ padding: '12px' }}>결제금액</th>
                    <th style={{ padding: '12px' }}>상태</th>
                    <th style={{ padding: '12px' }}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px' }}>
                      <td style={{ padding: '12px', fontWeight: '600' }}>{order.id}</td>
                      <td style={{ padding: '12px' }}>{order.items}</td>
                      <td style={{ padding: '12px' }}>{order.price}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          backgroundColor: getStatusColor(order.status).bg, 
                          color: getStatusColor(order.status).text, 
                          padding: '4px 8px', 
                          borderRadius: '4px', 
                          fontSize: '12px', 
                          fontWeight: '600' 
                        }}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px', display: 'flex', gap: '4px' }}>
                        {order.status === '신규' && (
                          <button onClick={() => updateOrderStatus(order.id, '준비중')} style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>수락</button>
                        )}
                        {order.status === '준비중' && (
                          <button onClick={() => updateOrderStatus(order.id, '준비완료')} style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: '#38bdf8', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>준비완료</button>
                        )}
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontSize: '12px' }}
                        >상세</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'sales':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
              {[
                { label: '오늘 매출', value: '485,200원', grow: '+12.5%', icon: '💰' },
                { label: '어제 매출', value: '425,000원', grow: '-2.1%', icon: '📅' },
                { label: '이번 달 누적', value: '12,450,000원', grow: '+5.4%', icon: '📈' },
                { label: '정산 예정액', value: '3,240,000원', grow: '', icon: '🏦' }
              ].map((stat, i) => (
                <div key={i} style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '24px' }}>{stat.icon}</span>
                    {stat.grow && <span style={{ fontSize: '12px', fontWeight: '800', color: stat.grow.startsWith('+') ? '#10b981' : '#ef4444' }}>{stat.grow}</span>}
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>{stat.label}</div>
                  <div style={{ fontSize: '20px', fontWeight: '900' }}>{stat.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
              <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '32px' }}>최근 7일 매출 추이</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', padding: '0 20px' }}>
                  {[
                    { day: '월', val: 65 }, { day: '화', val: 45 }, { day: '수', val: 80 }, 
                    { day: '목', val: 55 }, { day: '금', val: 95 }, { day: '토', val: 100 }, { day: '일', val: 75 }
                  ].map((d, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '40px' }}>
                      <div className="card-hover" style={{ 
                        width: '100%', 
                        height: `${d.val}%`, 
                        background: i === 5 ? 'var(--primary)' : 'linear-gradient(to top, #e2e8f0, #cbd5e1)', 
                        borderRadius: '8px 8px 0 0',
                        transition: 'height 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                      }}></div>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>{d.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px' }}>인기 상품 순위</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { name: '대추토마토 500g', count: 124, rank: 1 },
                    { name: '삼겹살 600g', count: 98, rank: 2 },
                    { name: '신선란 10구', count: 85, rank: 3 }
                  ].map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontSize: '18px', fontWeight: '900', color: i === 0 ? 'var(--primary)' : '#94a3b8', width: '20px' }}>{p.rank}</span>
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '700' }}>{p.name}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{p.count}회 주문</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px' }}>정산 내역</h3>
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '14px', textAlign: 'left' }}>
                      <th style={{ padding: '16px' }}>정산일</th>
                      <th style={{ padding: '16px' }}>정산 기간</th>
                      <th style={{ padding: '16px' }}>정산 금액</th>
                      <th style={{ padding: '16px' }}>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { date: '2026.01.15', period: '01.01 ~ 01.14', amount: '8,450,200원', status: '지급완료' },
                      { date: '2026.01.01', period: '12.15 ~ 12.31', amount: '7,230,000원', status: '지급완료' }
                    ].map((s, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px' }}>
                        <td style={{ padding: '16px', fontWeight: '700' }}>{s.date}</td>
                        <td style={{ padding: '16px' }}>{s.period}</td>
                        <td style={{ padding: '16px', fontWeight: '800' }}>{s.amount}</td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '700' }}>{s.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'products':
        return (
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>상품 관리</h2>
              <button 
                onClick={() => handleOpenProductModal()}
                style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}
              >+ 새 상품 등록</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
              {products.map((product) => (
                <div key={product.id} style={{ 
                  border: '1px solid #f1f5f9', 
                  borderRadius: '16px', 
                  padding: '20px', 
                  textAlign: 'center',
                  position: 'relative',
                  backgroundColor: product.stock < 10 ? '#fffaf5' : 'white'
                }}>
                  {product.stock < 10 && (
                    <span style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: '#ef4444', color: 'white', fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px' }}>발주 필요</span>
                  )}
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>{product.img}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{product.category}</div>
                  <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>{product.name}</div>
                  <div style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '18px', marginBottom: '12px' }}>{product.price}</div>
                  <div style={{ 
                    fontSize: '13px', 
                    color: product.stock < 5 ? '#ef4444' : '#64748b', 
                    marginBottom: '20px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: product.stock < 5 ? '#ef4444' : '#2ecc71' }}></span>
                    재고: {product.stock}개
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleOpenProductModal(product)}
                      style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                    >수정</button>
                    <button 
                      onClick={() => deleteProduct(product.id)}
                      style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #fee2e2', background: 'white', fontSize: '12px', fontWeight: '600', color: '#ef4444', cursor: 'pointer' }}
                    >삭제</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'settings':
        return (
          <div style={{ background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxWidth: '800px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '32px' }}>마트 운영 설정</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>마트 상호명</label>
                  <input type="text" defaultValue="행복 마트 강남점" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>업종 카테고리</label>
                  <select style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px' }}>
                    <option>일반 마트 / 편의점</option>
                    <option>청과 / 과일</option>
                    <option>정육 / 고기</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>영업 시작 시간</label>
                  <input type="time" defaultValue="09:00" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>영업 종료 시간</label>
                  <input type="time" defaultValue="22:00" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontWeight: '700', fontSize: '14px', color: '#475569' }}>배달 가능 반경</label>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)' }}>3.5 km</span>
                </div>
                <input type="range" min="1" max="10" step="0.5" defaultValue="3.5" style={{ width: '100%', accentColor: 'var(--primary)' }} />
              </div>
              <button style={{ marginTop: '20px', padding: '18px', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '800', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)' }}>
                운영 설정 완료
              </button>
            </div>
          </div>
        );
      default:
        return (
          <>
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
              <div className="stat-card" style={{ padding: '24px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '4px solid #38bdf8' }}>
                <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px', fontWeight: '600' }}>오늘의 총 매출</div>
                <div style={{ fontSize: '28px', fontWeight: '800' }}>1,245,000원</div>
                <div style={{ color: '#10b981', fontSize: '12px', marginTop: '8px', fontWeight: '700' }}>↑ 어제보다 12.4% 상승</div>
              </div>
              <div className="stat-card" style={{ padding: '24px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '4px solid #10b981' }}>
                <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px', fontWeight: '600' }}>대응 필요 주문</div>
                <div style={{ fontSize: '28px', fontWeight: '800' }}>{orders.filter(o => o.status === '신규' || o.status === '준비중').length}건</div>
                <div style={{ color: '#64748b', fontSize: '12px', marginTop: '8px' }}>신규 {orders.filter(o => o.status === '신규').length} | 진행 {orders.filter(o => o.status === '준비중').length}</div>
              </div>
              <div className="stat-card" style={{ padding: '24px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '4px solid #f59e0b' }}>
                <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px', fontWeight: '600' }}>현재 구독 회원</div>
                <div style={{ fontSize: '28px', fontWeight: '800' }}>156명</div>
                <div style={{ color: '#f59e0b', fontSize: '12px', marginTop: '8px', fontWeight: '700' }}>이번 주 5명 신규 유입</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
              {/* Recent Orders Overview */}
              <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>신규 주문 현황</h2>
                  <button onClick={() => setActiveTab('orders')} style={{ color: 'var(--primary)', border: 'none', background: 'transparent', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>전체 보기 &gt;</button>
                </div>
                {orders.filter(o => o.status === '신규').length > 0 ? (
                  orders.filter(o => o.status === '신규').map(order => (
                    <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#fffafb', borderRadius: '12px', marginBottom: '12px', border: '1px solid #fee2e2' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '15px' }}>{order.id}</div>
                        <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>{order.items}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{order.date}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => updateOrderStatus(order.id, '준비중')} style={{ padding: '10px 20px', borderRadius: '10px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>주문 접수</button>
                        <button style={{ padding: '10px 20px', borderRadius: '10px', background: 'white', border: '1px solid #cbd5e1', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}>거절</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    새로운 주문이 없습니다.
                  </div>
                )}
              </div>

              {/* Quick Stock Actions */}
              <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>재고 부족 알림</h2>
                  <button onClick={() => setActiveTab('products')} style={{ color: '#ef4444', border: 'none', background: 'transparent', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>관리</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {products.filter(p => p.stock < 10).map((product) => (
                    <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{ fontSize: '24px' }}>{product.img}</span>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '600' }}>{product.name}</div>
                          <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: '700' }}>재고 {product.stock}개 남음</div>
                        </div>
                      </div>
                      <button style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: '#f1f5f9', border: 'none', fontSize: '12px', fontWeight: '700', color: '#475569', cursor: 'pointer' }}>발주</button>
                    </div>
                  ))}
                  <button 
                    onClick={() => setActiveTab('products')}
                    style={{ marginTop: '10px', padding: '12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '700', color: '#475569', cursor: 'pointer' }}>전체 상품 현황 보기</button>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="store-dashboard" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar */}
      <div className="sidebar" style={{
        width: '280px',
        backgroundColor: '#1e293b',
        color: 'white',
        padding: '40px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        position: 'sticky',
        top: 0,
        height: '100vh',
        boxShadow: '4px 0 10px rgba(0,0,0,0.1)'
      }}>
        <div 
          onClick={() => setActiveTab('dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '24px', fontWeight: '900', marginBottom: '40px', color: '#38bdf8', cursor: 'pointer', letterSpacing: '-1px' }}>
          <span style={{ fontSize: '32px' }}>🏪</span> 동네마켓 Store
        </div>
        {[
          { id: 'dashboard', label: '대시보드', icon: '🏠' },
          { id: 'orders', label: '주문 관리', icon: '📦' },
          { id: 'products', label: '상품 관리', icon: '🍎' },
          { id: 'sales', label: '매출 및 정산', icon: '📊' },
          { id: 'settings', label: '운영 설정', icon: '⚙️' }
        ].map((item) => (
          <div 
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`} 
            onClick={() => setActiveTab(item.id)}
            style={{ 
              padding: '14px 18px', 
              borderRadius: '12px', 
              backgroundColor: activeTab === item.id ? '#334155' : 'transparent', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '15px',
              fontWeight: activeTab === item.id ? '700' : '500',
              color: activeTab === item.id ? '#38bdf8' : '#94a3b8',
              transition: 'all 0.2s'
            }}>
            <span>{item.icon}</span> {item.label}
          </div>
        ))}
        
        <div style={{ marginTop: 'auto', padding: '20px', backgroundColor: '#0f172a', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>도움이 필요하신가요?</div>
          <button style={{ padding: '10px', borderRadius: '8px', background: '#334155', color: 'white', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>고객센터 연결</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content" style={{ flexGrow: 1, padding: '40px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '4px' }}>반갑습니다, 사장님!</div>
            <h1 style={{ fontSize: '32px', fontWeight: '900', margin: 0, letterSpacing: '-1px' }}>
              행복 마트 강남점
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              padding: '8px 16px',
              backgroundColor: isStoreOpen ? '#f0fdf4' : '#fee2e2',
              borderRadius: '30px',
              border: `1px solid ${isStoreOpen ? '#dcfce7' : '#fecaca'}`
            }}>
              <span style={{ width: '10px', height: '10px', backgroundColor: isStoreOpen ? '#2ecc71' : '#ef4444', borderRadius: '50%', boxShadow: `0 0 10px ${isStoreOpen ? '#2ecc71' : '#ef4444'}` }}></span>
              <span style={{ fontWeight: '800', fontSize: '14px', color: isStoreOpen ? '#166534' : '#991b1b' }}>{isStoreOpen ? '영업 중' : '영업 종료'}</span>
              <button 
                onClick={() => setIsStoreOpen(!isStoreOpen)}
                style={{ 
                  marginLeft: '10px',
                  padding: '6px 16px', 
                  borderRadius: '20px', 
                  border: 'none', 
                  background: isStoreOpen ? 'var(--primary-dark)' : 'var(--danger)', 
                  color: 'white', 
                  fontSize: '11px', 
                  fontWeight: '900', 
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isStoreOpen ? '0 0 15px rgba(16, 185, 129, 0.4)' : '0 0 15px rgba(239, 68, 68, 0.4)'
                }}>
                {isStoreOpen ? '마감하기' : '영업시작'}
              </button>
            </div>
          </div>
        </header>

        {renderActiveView()}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '450px', borderRadius: '24px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>주문 상세 내역</h2>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', fontSize: '24px', color: '#94a3b8', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>주문번호</div>
              <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '12px' }}>{selectedOrder.id}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>주문상품</div>
              <div style={{ fontWeight: '600' }}>{selectedOrder.items}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>결제액</div>
                <div style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '18px' }}>{selectedOrder.price}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>주문시간</div>
                <div style={{ fontSize: '14px' }}>{selectedOrder.date}</div>
              </div>
            </div>
            <button onClick={() => setSelectedOrder(null)} style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer' }}>확인</button>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {isProductModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'white',
            width: '100%',
            maxWidth: '500px',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>
              {editingProduct ? '상품 수정' : '새 상품 등록'}
            </h2>
            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>상품명</label>
                <input 
                  required
                  type="text" 
                  value={productForm.name}
                  onChange={e => setProductForm({...productForm, name: e.target.value})}
                  placeholder="예: 대추토마토 500g"
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1' }} 
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>가격</label>
                  <input 
                    required
                    type="text" 
                    value={productForm.price}
                    onChange={e => setProductForm({...productForm, price: e.target.value})}
                    placeholder="5,900원"
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>초기 재고</label>
                  <input 
                    required
                    type="number" 
                    value={productForm.stock}
                    onChange={e => setProductForm({...productForm, stock: parseInt(e.target.value)})}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1' }} 
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>카테고리</label>
                  <select 
                    value={productForm.category}
                    onChange={e => setProductForm({...productForm, category: e.target.value})}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1' }}
                  >
                    {['채소', '과일', '식재료', '정육', '유제품', '생활용품'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>아이콘 (이모지)</label>
                  <input 
                    type="text" 
                    value={productForm.img}
                    onChange={e => setProductForm({...productForm, img: e.target.value})}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', textAlign: 'center', fontSize: '20px' }} 
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button 
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#f1f5f9', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                >취소</button>
                <button 
                  type="submit"
                  style={{ flex: 2, padding: '14px', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                >{editingProduct ? '수정 완료' : '등록 완료'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreDashboard;
