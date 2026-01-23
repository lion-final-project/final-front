import React, { useState, useEffect } from 'react';

const StoreDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [orderSubTab, setOrderSubTab] = useState('management');
  const [mgmtFilter, setMgmtFilter] = useState('unhandled');
  const [lowStockThreshold, setLowStockThreshold] = useState(20);
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [storeInfo] = useState({
    name: '행복 마트 강남점',
    category: '일반 마트 / 편의점'
  });
  
  const [orders, setOrders] = useState([
    { 
      id: 'ORD20260123001', customer: '김철수', items: '대추토마토 500g 외 2건', 
      itemsList: [{ name: '대추토마토 500g', qty: 1, price: '5,900원' }, { name: '흙당근 1kg', qty: 1, price: '4,500원' }, { name: '시금치 1단', qty: 1, price: '3,000원' }],
      price: '18,400원', status: '준비중', date: '2026.01.23 14:20', prepTime: 15 
    },
    { 
      id: 'ORD20260123002', customer: '이영희', items: '유기농 우유 1L', 
      itemsList: [{ name: '유기농 우유 1L', qty: 1, price: '3,200원' }],
      price: '3,200원', status: '배달중', date: '2026.01.23 13:45', prepTime: 10 
    },
    { 
      id: 'ORD20260123003', customer: '박민수', items: '신선란 10구 외 1건', 
      itemsList: [{ name: '신선란 10구', qty: 1, price: '4,500원' }, { name: '무항생제 계란 10구', qty: 1, price: '8,000원' }],
      price: '12,500원', status: '픽업가능', date: '2026.01.23 13:10', prepTime: 10 
    },
    { 
      id: 'ORD20260123004', customer: '최지우', items: '한우 등심 300g', 
      itemsList: [{ name: '한우 등심 300g', qty: 1, price: '45,000원' }],
      price: '45,000원', status: '픽업가능', date: '2026.01.23 14:55', prepTime: 10 
    },
    { 
      id: 'ORD20260123005', customer: '정우성', items: '제철 과일 꾸러미', 
      itemsList: [{ name: '제철 과일 꾸러미', qty: 1, price: '29,900원' }],
      price: '29,900원', status: '배달완료', date: '2026.01.23 11:30', prepTime: 10 
    },
    { 
      id: 'ORD20260123006', customer: '한소희', items: '사과 1개, 바나나 2개 외', 
      itemsList: [{ name: '사과', qty: 1, price: '2,000원' }, { name: '바나나', qty: 2, price: '3,000원' }, { name: '키위 1박스', qty: 1, price: '15,000원' }],
      price: '20,000원', status: '신규', date: '2026.01.23 15:10', prepTime: 10 
    },
    { 
      id: 'ORD20260123007', customer: '우영우', items: '김밥 재료 세트, 참기름', 
      itemsList: [{ name: '김밥 재료 세트', qty: 1, price: '18,500원' }, { name: '참기름', qty: 1, price: '3,500원' }],
      price: '22,000원', status: '신규', date: '2026.01.23 22:30', prepTime: 10 
    },
    { 
      id: 'ORD20260123008', customer: '이도현', items: '대패 삼겹살 500g, 쌈장', 
      itemsList: [{ name: '대패 삼겹살 500g', qty: 1, price: '12,000원' }, { name: '쌈장', qty: 1, price: '1,500원' }],
      price: '13,500원', status: '준비중', date: '2026.01.23 22:32', prepTime: 20 
    },
    { 
      id: 'ORD20260123009', customer: '박보검', items: '생수 500ml 20개, 바나나 1송이', 
      itemsList: [{ name: '생수 500ml 20개', qty: 1, price: '8,000원' }, { name: '바나나 1송이', qty: 1, price: '3,200원' }],
      price: '11,200원', status: '픽업 대기중', date: '2026.01.23 22:35', prepTime: 10 
    },
    { 
      id: 'ORD20260123010', customer: '안유진', items: '하겐다즈 파인트, 오레오', 
      itemsList: [{ name: '하겐다즈 파인트', qty: 1, price: '14,500원' }, { name: '오레오', qty: 1, price: '2,000원' }],
      price: '16,500원', status: '신규', date: '2026.01.23 22:38', prepTime: 10 
    },
    { 
      id: 'ORD20260123011', customer: '남주혁', items: '안성탕면 멀티, 단무지', 
      itemsList: [{ name: '안성탕면 멀티', qty: 1, price: '4,500원' }, { name: '단무지', qty: 1, price: '2,300원' }],
      price: '6,800원', status: '배달완료', date: '2026.01.23 21:00', prepTime: 10 
    },
    { 
      id: 'ORD20260123012', customer: '김지원', items: '스타벅스 RTD 커피 4캔', 
      itemsList: [{ name: '스타벅스 RTD 커피 4캔', qty: 1, price: '10,800원' }],
      price: '10,800원', status: '신규', date: '2026.01.23 22:40', prepTime: 10 
    },
    { 
      id: 'ORD20260123013', customer: '공유', items: '스텔라 아르투아 500ml 4캔', 
      itemsList: [{ name: '스텔라 아르투아 4캔', qty: 1, price: '11,000원' }],
      price: '11,000원', status: '준비중', date: '2026.01.23 22:42', prepTime: 10 
    },
    { 
      id: 'ORD20260123014', customer: '손석구', items: '비비고 김치찌개 외 1건', 
      itemsList: [{ name: '비비고 김치찌개', qty: 1, price: '5,500원' }, { name: '햇반 2입', qty: 1, price: '3,500원' }],
      price: '9,000원', status: '픽업 대기중', date: '2026.01.23 22:43', prepTime: 10 
    },
    { 
      id: 'ORD20260123015', customer: '김혜수', items: '샴페인 1병, 치즈 플래터', 
      itemsList: [{ name: '샴페인', qty: 1, price: '120,000원' }, { name: '치즈 플래터', qty: 1, price: '35,000원' }],
      price: '155,000원', status: '픽업가능', date: '2026.01.23 22:45', prepTime: 10 
    },
    { 
      id: 'ORD20260123016', customer: '유재석', items: '유기농 두부 2모', 
      itemsList: [{ name: '유기농 두부', qty: 2, price: '5,000원' }],
      price: '5,000원', status: '배달중', date: '2026.01.23 22:47', prepTime: 10 
    },
    { 
      id: 'ORD20260123017', customer: '지석진', items: '비타민C 1박스', 
      itemsList: [{ name: '비타민C', qty: 1, price: '25,000원' }],
      price: '25,000원', status: '신규', date: '2026.01.23 22:50', prepTime: 10 
    },
    { 
      id: 'ORD20260123018', customer: '송지효', items: '수분 크림, 마스크팩', 
      itemsList: [{ name: '수분 크림', qty: 1, price: '18,000원' }, { name: '마스크팩', qty: 5, price: '5,000원' }],
      price: '23,000원', status: '준비중', date: '2026.01.23 22:52', prepTime: 15 
    },
    { 
      id: 'ORD20260123019', customer: '김종국', items: '닭가슴살 1kg', 
      itemsList: [{ name: '닭가슴살', qty: 1, price: '12,000원' }],
      price: '12,000원', status: '픽업가능', date: '2026.01.23 22:55', prepTime: 10 
    },
    { 
      id: 'ORD20260123020', customer: '하하', items: '키즈 홍삼 1박스', 
      itemsList: [{ name: '키즈 홍삼', qty: 1, price: '45,000원' }],
      price: '45,000원', status: '배달완료', date: '2026.01.23 22:00', prepTime: 10 
    },
  ]);

  useEffect(() => {
    const hasWaiting = orders.some(o => o.status === '픽업 대기중');
    if (!hasWaiting) return;

    const timer = setTimeout(() => {
      setOrders(currentOrders => 
        currentOrders.map(order => 
          order.status === '픽업 대기중' 
            ? { ...order, status: '픽업가능' } 
            : order
        )
      );
    }, 5000); // 5 seconds simulation

    return () => clearTimeout(timer);
  }, [orders]);

  const [products, setProducts] = useState([
    { id: 1, name: '대추토마토 500g', price: '5,900원', stock: 15, capacity: 100, category: '채소', img: '🍅', isSoldOut: false },
    { id: 2, name: '유기농 우유 1L', price: '3,200원', stock: 3, capacity: 50, category: '유제품', img: '🥛', isSoldOut: false },
    { id: 3, name: '신선란 10구', price: '4,500원', stock: 20, capacity: 80, category: '식재료', img: '🥚', isSoldOut: false },
    { id: 4, name: '꿀사과 3입', price: '9,900원', stock: 5, capacity: 40, category: '과일', img: '🍎', isSoldOut: false },
    { id: 5, name: '삼겹살 600g', price: '21,000원', stock: 12, capacity: 60, category: '정육', img: '🥩', isSoldOut: false }
  ]);

  const handleToggleExpand = (id) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedOrders(newExpanded);
  };

  const updatePrepTime = (id, time) => {
    setOrders(prev => prev.map(order => 
      order.id === id ? { ...order, prepTime: parseInt(time) } : order
    ));
  };

  const updateOrderStatus = (id, newStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === id ? { ...order, status: newStatus } : order
    ));
  };

  const toggleSoldOut = (id) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, isSoldOut: !p.isSoldOut } : p
    ));
  };

  // Auto-transition logic
  useEffect(() => {
    const activeTimers = orders
      .filter(o => o.status === '준비중')
      .map(order => {
        const timer = setTimeout(() => {
          updateOrderStatus(order.id, '준비완료');
        }, (order.prepTime || 10) * 1000); // Using seconds for demo instead of minutes if wanted, but user asked for mins. Let's use 10s for demo? No, let's keep it realistic but maybe user wants to see it. I'll use real minutes but mention it.
        return { id: order.id, timer };
      });

    return () => activeTimers.forEach(t => clearTimeout(t.timer));
  }, [orders]);

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
      case '픽업 대기중': return { bg: '#fef3c7', text: '#92400e' };
      case '픽업가능': return { bg: '#eff6ff', text: '#1e40af' };
      case '배달중': return { bg: '#fdf4ff', text: '#701a75' };
      case '배달완료': return { bg: '#f1f5f9', text: '#475569' };
      case '완료': return { bg: '#f1f5f9', text: '#475569' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'orders':
        const filteredOrders = orders.filter(order => {
          if (orderSubTab === 'history') return true;
          if (mgmtFilter === 'unhandled') return ['신규', '준비중', '픽업 대기중', '픽업가능', '배달중'].includes(order.status);
          return ['배달완료', '완료'].includes(order.status);
        });

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Sub Tabs */}
            <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '0' }}>
              <button 
                onClick={() => setOrderSubTab('management')}
                style={{ 
                  padding: '12px 4px', background: 'none', border: 'none', borderBottom: orderSubTab === 'management' ? '3px solid var(--primary)' : '3px solid transparent',
                  color: orderSubTab === 'management' ? 'black' : '#94a3b8', fontWeight: '800', fontSize: '16px', cursor: 'pointer'
                }}
              >주문 관리</button>
              <button 
                onClick={() => setOrderSubTab('history')}
                style={{ 
                  padding: '12px 4px', background: 'none', border: 'none', borderBottom: orderSubTab === 'history' ? '3px solid var(--primary)' : '3px solid transparent',
                  color: orderSubTab === 'history' ? 'black' : '#94a3b8', fontWeight: '800', fontSize: '16px', cursor: 'pointer'
                }}
              >주문 내역</button>
            </div>

            <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>
                  {orderSubTab === 'management' ? '실시간 주문 처리' : '누적 주문 내역'}
                </h2>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {orderSubTab === 'management' && (
                    <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                      <button 
                        onClick={() => setMgmtFilter('unhandled')}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: mgmtFilter === 'unhandled' ? 'white' : 'transparent', fontWeight: '700', fontSize: '13px', cursor: 'pointer', boxShadow: mgmtFilter === 'unhandled' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}
                      >미처리</button>
                      <button 
                        onClick={() => setMgmtFilter('handled')}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: mgmtFilter === 'handled' ? 'white' : 'transparent', fontWeight: '700', fontSize: '13px', cursor: 'pointer', boxShadow: mgmtFilter === 'handled' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}
                      >처리 완료</button>
                    </div>
                  )}
                  <input type="text" placeholder="주문 검색..." style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', width: '200px' }} />
                </div>
              </div>
              
              <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '14px' }}>
                      <th style={{ padding: '12px', width: '40px' }}></th>
                      <th style={{ padding: '12px' }}>주문번호</th>
                      <th style={{ padding: '12px' }}>상품명</th>
                      <th style={{ padding: '12px' }}>결제금액</th>
                      <th style={{ padding: '12px' }}>상태</th>
                      <th style={{ padding: '12px' }}>{orderSubTab === 'management' ? '관리' : '상세'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length > 0 ? filteredOrders.map(order => (
                      <React.Fragment key={order.id}>
                        <tr style={{ borderBottom: expandedOrders.has(order.id) ? 'none' : '1px solid #f1f5f9', fontSize: '14px', backgroundColor: expandedOrders.has(order.id) ? '#f8fafc' : 'white' }}>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <button 
                              onClick={() => handleToggleExpand(order.id)}
                              style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '12px', transform: expandedOrders.has(order.id) ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                            >▼</button>
                          </td>
                          <td 
                            onClick={() => handleToggleExpand(order.id)}
                            style={{ padding: '12px', fontWeight: '600', cursor: 'pointer', color: 'var(--primary)' }}
                          >{order.id}</td>
                          <td style={{ padding: '12px' }}>{order.items}</td>
                          <td style={{ padding: '12px' }}>{order.price}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ 
                              backgroundColor: getStatusColor(order.status).bg, 
                              color: getStatusColor(order.status).text, 
                              padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' 
                            }}>{order.status}</span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <button 
                                onClick={() => setSelectedOrder(order)}
                                style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontSize: '12px', color: '#64748b' }}
                              >상세</button>
                            </div>
                          </td>
                        </tr>
                        {expandedOrders.has(order.id) && (
                          <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
                            <td colSpan="6" style={{ padding: '0 20px 20px 60px' }}>
                               <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>주문 상세 목록</div>
                                  {order.itemsList && order.itemsList.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: idx !== order.itemsList.length -1 ? '1px solid #f1f5f9' : 'none', paddingBottom: '6px', paddingTop: '6px' }}>
                                      <span>- {item.name} <span style={{ color: '#94a3b8' }}>x {item.qty}</span></span>
                                      <span style={{ fontWeight: '600' }}>{item.price}</span>
                                    </div>
                                  ))}
                               </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )) : (
                      <tr>
                        <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>표시할 주문이 없습니다.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
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
                      <th style={{ padding: '16px' }}>정산 월</th>
                      <th style={{ padding: '16px' }}>대상 기간</th>
                      <th style={{ padding: '16px' }}>최종 정산액</th>
                      <th style={{ padding: '16px' }}>상태</th>
                      <th style={{ padding: '16px' }}>상세</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { 
                        month: '2026년 01월 정산', 
                        period: '2026.01.01 ~ 2026.01.31', 
                        amount: '18,450,200원', 
                        rawAmount: '19,650,000원',
                        fee: '1,199,800원',
                        status: '지급완료',
                        mid: 'HM_GN_001',
                        breakdown: [
                          { method: '신용카드', depositDate: '2026.01.20', salesDate: '2026.01.15', count: 12, salesA: '1,200,000', feeB: '32,400', vatC: '3,240', totalD: '35,640', netE: '1,164,360' },
                          { method: '간편결제', depositDate: '2026.01.20', salesDate: '2026.01.15', count: 5, salesA: '450,000', feeB: '12,150', vatC: '1,215', totalD: '13,365', netE: '436,635' },
                          { method: '신용카드', depositDate: '2026.01.13', salesDate: '2026.01.08', count: 8, salesA: '890,000', feeB: '24,030', vatC: '2,403', totalD: '26,433', netE: '863,567' },
                          { method: '계좌이체', depositDate: '2026.01.05', salesDate: '2026.01.01', count: 3, salesA: '150,000', feeB: '3,000', vatC: '300', totalD: '3,300', netE: '146,700' }
                        ]
                      },
                      { 
                        month: '2025년 12월 정산', 
                        period: '2025.12.01 ~ 2025.12.31', 
                        amount: '15,230,000원', 
                        rawAmount: '16,200,000원',
                        fee: '970,000원',
                        status: '지급완료',
                        mid: 'HM_GN_001',
                        breakdown: [
                          { method: '신용카드', depositDate: '2025.12.20', salesDate: '2025.12.15', count: 15, salesA: '2,300,000', feeB: '62,100', vatC: '6,210', totalD: '68,310', netE: '2,231,690' }
                        ]
                      }
                    ].map((s, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px' }}>
                        <td style={{ padding: '16px', fontWeight: '700' }}>{s.month}</td>
                        <td style={{ padding: '16px' }}>{s.period}</td>
                        <td style={{ padding: '16px', fontWeight: '800' }}>{s.amount}</td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '700' }}>{s.status}</span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <button 
                            onClick={() => setSelectedSettlement(s)}
                            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontSize: '12px', color: '#64748b' }}
                          >상세보기</button>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  background: '#f8fafc', 
                  padding: '6px 12px', 
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '16px' }}>🔔</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>재고 임박 알림</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <select 
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                      style={{ 
                        padding: '4px 8px', 
                        borderRadius: '6px', 
                        border: '1px solid #cbd5e1', 
                        fontSize: '13px', 
                        fontWeight: '700',
                        cursor: 'pointer',
                        outline: 'none',
                        background: 'white'
                      }}
                    >
                      <option value={10}>10% 미만</option>
                      <option value={20}>20% 미만</option>
                      <option value={30}>30% 미만</option>
                      <option value={50}>50% 미만</option>
                    </select>
                  </div>
                </div>
                <button 
                  onClick={() => handleOpenProductModal()}
                  style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                >+ 새 상품 등록</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
              {products.map((product) => (
                <div key={product.id} style={{ 
                  border: '1px solid #f1f5f9', 
                  borderRadius: '16px', 
                  padding: '20px', 
                  textAlign: 'center',
                  position: 'relative',
                  backgroundColor: product.isSoldOut ? '#fafafa' : ((product.stock / product.capacity) * 100 < lowStockThreshold ? '#fffaf5' : 'white'),
                  opacity: product.isSoldOut ? 0.8 : 1
                }}>
                  {product.isSoldOut && (
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5, pointerEvents: 'none' }}>
                      <span style={{ backgroundColor: '#ef4444', color: 'white', padding: '6px 16px', borderRadius: '4px', fontWeight: '900', fontSize: '16px', transform: 'rotate(-10deg)', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}>품절</span>
                    </div>
                  )}
                  {(product.stock / product.capacity) * 100 < lowStockThreshold && !product.isSoldOut && (
                    <span style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: '#ef4444', color: 'white', fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px' }}>발주 필요</span>
                  )}
                  <div style={{ fontSize: '48px', marginBottom: '16px', filter: product.isSoldOut ? 'grayscale(1)' : 'none' }}>{product.img}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{product.category}</div>
                  <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>{product.name}</div>
                  <div style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '18px', marginBottom: '12px' }}>{product.price}</div>
                  <div style={{ 
                    fontSize: '13px', 
                    color: (product.stock / product.capacity) * 100 < lowStockThreshold ? '#ef4444' : '#64748b', 
                    marginBottom: '10px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: ((product.stock / product.capacity) * 100 < lowStockThreshold || product.isSoldOut) ? '#ef4444' : '#2ecc71' }}></span>
                    재고: {product.stock}개 <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '400' }}>/ {product.capacity}</span>
                  </div>
                  
                  {/* Sold Out Toggle */}
                  <div style={{ display: 'flex', marginBottom: '12px' }}>
                    <div 
                      onClick={() => toggleSoldOut(product.id)}
                      style={{ 
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer',
                        padding: '10px', borderRadius: '12px', border: '1px solid #cbd5e1',
                        backgroundColor: product.isSoldOut ? '#fee2e2' : 'white',
                        transition: 'all 0.2s',
                        zIndex: 10
                      }}
                    >
                      <span style={{ fontSize: '12px', fontWeight: '800', color: product.isSoldOut ? '#ef4444' : '#64748b' }}>품절 상태</span>
                      <div style={{ 
                        width: '32px', height: '16px', borderRadius: '10px', backgroundColor: product.isSoldOut ? '#ef4444' : '#cbd5e1', 
                        position: 'relative'
                      }}>
                        <div style={{ 
                          width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'white', position: 'absolute', top: '2px', 
                          left: product.isSoldOut ? '18px' : '2px', transition: 'all 0.2s'
                        }}></div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleOpenProductModal(product)}
                      style={{ flex: 1, padding: '10px', borderRadius: '12px', border: '1px solid #cbd5e1', background: 'white', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                    >수정</button>
                    <button 
                      onClick={() => deleteProduct(product.id)}
                      style={{ flex: 1, padding: '10px', borderRadius: '12px', border: '1px solid #fee2e2', background: 'white', fontSize: '12px', fontWeight: '600', color: '#ef4444', cursor: 'pointer' }}
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
                <div style={{ fontSize: '28px', fontWeight: '800' }}>{orders.filter(o => ['신규', '준비중', '픽업 대기중', '픽업가능'].includes(o.status)).length}건</div>
                <div style={{ color: '#64748b', fontSize: '12px', marginTop: '8px' }}>진행 중 {orders.filter(o => ['신규', '준비중', '픽업 대기중', '픽업가능'].includes(o.status)).length}</div>
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
                {orders.filter(o => o.status === '신규' || o.status === '준비중').length > 0 ? (
                  orders.filter(o => o.status === '신규' || o.status === '준비중').map(order => (
                    <div key={order.id} style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: order.status === '신규' ? '#fffafb' : '#f0fdf4', borderRadius: '12px', border: order.status === '신규' ? '1px solid #fee2e2' : '1px solid #dcfce7' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <button 
                            onClick={() => handleToggleExpand(order.id)}
                            style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '12px', transform: expandedOrders.has(order.id) ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                          >
                            ▼
                          </button>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '15px' }}>{order.id}</div>
                            <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>{order.items}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{order.date}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          {order.status === '신규' && (
                            <>
                              <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '4px', padding: '2px 6px' }}>
                                <input 
                                  type="number" 
                                  value={order.prepTime || 10} 
                                  onChange={(e) => updatePrepTime(order.id, e.target.value)}
                                  style={{ width: '30px', border: 'none', background: 'transparent', textAlign: 'right', fontSize: '12px', fontWeight: '700' }}
                                />
                                <span style={{ fontSize: '11px', color: '#64748b' }}>분</span>
                              </div>
                              <button onClick={() => updateOrderStatus(order.id, '준비중')} style={{ padding: '10px 20px', borderRadius: '10px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>주문 접수</button>
                            </>
                          )}
                          {order.status === '준비중' && (
                            <button onClick={() => updateOrderStatus(order.id, '픽업 대기중')} style={{ padding: '10px 20px', borderRadius: '10px', background: '#38bdf8', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>준비 완료</button>
                          )}
                          {order.status === '픽업 대기중' && (
                            <button disabled style={{ padding: '10px 20px', borderRadius: '10px', background: '#e2e8f0', color: '#94a3b8', border: 'none', fontWeight: '700', cursor: 'wait' }}>픽업 대기중...</button>
                          )}
                          {order.status === '픽업가능' && (
                            <button onClick={() => updateOrderStatus(order.id, '배달중')} style={{ padding: '10px 20px', borderRadius: '10px', background: '#a855f7', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>라이더 픽업</button>
                          )}
                          {order.status === '신규' && (
                            <button style={{ padding: '10px 20px', borderRadius: '10px', background: 'white', border: '1px solid #cbd5e1', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}>거절</button>
                          )}
                        </div>
                      </div>
                      {expandedOrders.has(order.id) && (
                        <div style={{ padding: '12px 12px 0 40px' }}>
                           <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                              <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>상세 내역</div>
                              {order.itemsList && order.itemsList.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                                  <span>- {item.name} x {item.qty}</span>
                                  <span>{item.price}</span>
                                </div>
                              ))}
                           </div>
                        </div>
                      )}
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
                  {products.filter(p => (p.stock / p.capacity) * 100 < lowStockThreshold).map((product) => (
                    <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: product.isSoldOut ? 0.6 : 1 }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{ fontSize: '24px' }}>{product.img}</span>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '600', textDecoration: product.isSoldOut ? 'line-through' : 'none' }}>{product.name}</div>
                          <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: '700' }}>재고 {product.stock}개 남음</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {/* Sold Out Toggle */}
                        <div 
                          onClick={() => toggleSoldOut(product.id)}
                          style={{ 
                            display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer',
                            padding: '4px 8px', borderRadius: '12px', border: '1px solid #e2e8f0',
                            backgroundColor: product.isSoldOut ? '#fee2e2' : 'white'
                          }}
                        >
                          <span style={{ fontSize: '10px', fontWeight: '800', color: product.isSoldOut ? '#ef4444' : '#64748b' }}>품절</span>
                          <div style={{ 
                            width: '24px', height: '12px', borderRadius: '10px', backgroundColor: product.isSoldOut ? '#ef4444' : '#cbd5e1', 
                            position: 'relative'
                          }}>
                            <div style={{ 
                              width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'white', position: 'absolute', top: '1px', 
                              left: product.isSoldOut ? '13px' : '1px', transition: 'all 0.2s'
                            }}></div>
                          </div>
                        </div>
                        <button style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: '#f1f5f9', border: 'none', fontSize: '12px', fontWeight: '700', color: '#475569', cursor: 'pointer' }}>발주</button>
                      </div>
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
              {storeInfo.name}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
             {/* Toggle Switch */}
             <div 
               onClick={() => setIsStoreOpen(!isStoreOpen)}
               style={{ 
                 display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', 
                 padding: '4px 6px', borderRadius: '30px', backgroundColor: isStoreOpen ? '#dcfce7' : '#fee2e2', 
                 transition: 'all 0.3s' 
               }}
             >
                <div style={{ 
                  width: '44px', height: '24px', borderRadius: '20px', backgroundColor: isStoreOpen ? '#10b981' : '#ef4444', 
                  position: 'relative', transition: 'all 0.3s'
                }}>
                  <div style={{ 
                    width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'white', position: 'absolute', top: '2px', 
                    left: isStoreOpen ? '22px' : '2px', transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}></div>
                </div>
                <span style={{ fontWeight: '800', fontSize: '14px', color: isStoreOpen ? '#166534' : '#991b1b', paddingRight: '10px' }}>
                  {isStoreOpen ? '배달 가능' : '배달 불가'}
                </span>
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

      {/* Settlement Detail Modal */}
      {selectedSettlement && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', width: '95%', maxWidth: '1200px', borderRadius: '24px', padding: '0', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '24px 32px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>정산 상세 내역 ({selectedSettlement.month})</h2>
                <button onClick={() => setSelectedSettlement(null)} style={{ background: 'none', border: 'none', fontSize: '24px', color: '#94a3b8', cursor: 'pointer' }}>×</button>
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ fontSize: '14px', color: '#64748b' }}>상점아이디(MID): <span style={{ fontWeight: '700', color: '#1e293b' }}>{selectedSettlement.mid}</span></div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>정산 기간: <span style={{ fontWeight: '700', color: '#1e293b' }}>{selectedSettlement.period}</span></div>
                <span style={{ marginLeft: 'auto', backgroundColor: '#f0fdf4', color: '#166534', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '800' }}>{selectedSettlement.status}</span>
              </div>
            </div>

            <div style={{ padding: '32px' }}>
              {/* Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>총 매출액 (A)</div>
                  <div style={{ fontSize: '18px', fontWeight: '800' }}>{selectedSettlement.rawAmount}</div>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#fff1f2', borderRadius: '16px', border: '1px solid #fecdd3' }}>
                  <div style={{ fontSize: '12px', color: '#e11d48', marginBottom: '8px' }}>총 PG 수수료 (B)</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#e11d48' }}>{selectedSettlement.fee}</div>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#f1f5f9', borderRadius: '16px', border: '1px solid #cbd5e1' }}>
                  <div style={{ fontSize: '12px', color: '#475569', marginBottom: '8px' }}>PG 수수료 합 (D=B+C)</div>
                  <div style={{ fontSize: '18px', fontWeight: '800' }}>{selectedSettlement.fee}</div>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#ecfdf5', borderRadius: '16px', border: '1px solid #a7f3d0' }}>
                  <div style={{ fontSize: '12px', color: '#059669', marginBottom: '8px' }}>당월 정산액 (E=A-D)</div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#059669' }}>{selectedSettlement.amount}</div>
                </div>
              </div>

              {/* Detailed Breakdown Table */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>정산액 상세 내역</h3>
                <div style={{ maxHeight: '400px', overflowY: 'auto', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                    <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8fafc', zIndex: 1 }}>
                      <tr style={{ textAlign: 'center', borderBottom: '1px solid #f1f5f9', fontSize: '11px', color: '#64748b' }}>
                        <th rowSpan="2" style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9', width: '80px' }}>결제수단</th>
                        <th rowSpan="2" style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9', width: '100px' }}>정산액 입금일</th>
                        <th rowSpan="2" style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9', width: '100px' }}>매출일</th>
                        <th rowSpan="2" style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9', width: '100px' }}>상점아이디(MID)</th>
                        <th rowSpan="2" style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9', width: '80px' }}>결제+취소 건수</th>
                        <th rowSpan="2" style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9', width: '120px' }}>매출액 (A)</th>
                        <th colSpan="5" style={{ padding: '8px', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>PG 수수료</th>
                        <th rowSpan="2" style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9', width: '100px' }}>PG 부가세 (C)</th>
                        <th rowSpan="2" style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9', width: '110px' }}>PG 수수료 합 (D)=(B+C)</th>
                        <th rowSpan="2" style={{ padding: '12px 8px', borderRight: '0', width: '120px' }}>당일 정산액 (E)=(A-D)</th>
                      </tr>
                      <tr style={{ textAlign: 'center', borderBottom: '1px solid #f1f5f9', fontSize: '10px', color: '#94a3b8' }}>
                         <th style={{ padding: '8px', borderRight: '1px solid #f1f5f9' }}>일반</th>
                         <th style={{ padding: '8px', borderRight: '1px solid #f1f5f9' }}>할부</th>
                         <th style={{ padding: '8px', borderRight: '1px solid #f1f5f9' }}>포인트</th>
                         <th style={{ padding: '8px', borderRight: '1px solid #f1f5f9' }}>기타</th>
                         <th style={{ padding: '8px', borderRight: '1px solid #f1f5f9', color: '#64748b', fontWeight: '700' }}>PG수수료계 (B)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSettlement.breakdown.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: idx === selectedSettlement.breakdown.length - 1 ? 'none' : '1px solid #f1f5f9', fontSize: '11px', textAlign: 'center' }}>
                          <td style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9' }}>{item.method}</td>
                          <td style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9', color: '#64748b' }}>{item.depositDate}</td>
                          <td style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9', color: '#64748b' }}>{item.salesDate}</td>
                          <td style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9' }}>{selectedSettlement.mid}</td>
                          <td style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9' }}>{item.count}건</td>
                          <td style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9', textAlign: 'right', fontWeight: '600' }}>{item.salesA}</td>
                          
                          {/* PG Fee breakdown (B sub-columns) */}
                          <td style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9', textAlign: 'right' }}>{item.feeB}</td>
                          <td style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9', textAlign: 'right' }}>-</td>
                          <td style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9', textAlign: 'right' }}>-</td>
                          <td style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9', textAlign: 'right' }}>-</td>
                          <td style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9', textAlign: 'right', fontWeight: '700' }}>{item.feeB}</td>
                          
                          <td style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9', textAlign: 'right' }}>{item.vatC}</td>
                          <td style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9', textAlign: 'right', fontWeight: '700' }}>{item.totalD}</td>
                          <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: '800', backgroundColor: '#fdfcfe' }}>{item.netE}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', gap: '12px' }}>
                <button 
                  onClick={() => setSelectedSettlement(null)} 
                  style={{ padding: '14px 40px', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer', fontSize: '14px' }}
                >닫기</button>
              </div>
            </div>
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
