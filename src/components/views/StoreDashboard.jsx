import React, { useState, useEffect } from 'react';

const StoreDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [orderSubTab, setOrderSubTab] = useState('management');
  const [mgmtFilter, setMgmtFilter] = useState('unhandled');
  const [lowStockThreshold, setLowStockThreshold] = useState(10); // Changed to quantity
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [popularProductTab, setPopularProductTab] = useState('ordered'); // 'ordered' or 'subscription'
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [selectedSettlementPeriod, setSelectedSettlementPeriod] = useState('2026년 1월');
  const [isPeriodSelectorOpen, setIsPeriodSelectorOpen] = useState(false);
  const [stockAdjustValues, setStockAdjustValues] = useState({});

  // --- Restored Missing States ---
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  const [products, setProducts] = useState([
    { id: '1', name: '유기농 우유 1L', price: '3,200원', stock: 15, capacity: 50, category: '유제품', img: '🥛', isSoldOut: false },
    { id: '2', name: '신선란 10구', price: '4,500원', stock: 8, capacity: 30, category: '신선식품', img: '🥚', isSoldOut: false },
    { id: '3', name: '대추토마토 500g', price: '5,900원', stock: 20, capacity: 40, category: '채소', img: '🍅', isSoldOut: false },
    { id: '4', name: '한우 등심 300g', price: '45,000원', stock: 5, capacity: 10, category: '정육', img: '🥩', isSoldOut: false },
  ]);

  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', price: '', stock: 0, capacity: 0, category: '채소', origin: '', description: '', imageFile: null, imagePreview: null, discountRate: 0 });

  const [subscriptions, setSubscriptions] = useState([
    { id: 's1', name: '신선 채소 꾸러미', price: '19,900원/월', subscribers: 15, status: '운영중', weeklyFreq: 1, monthlyTotal: 4, deliveryDays: ['목'], selectedProducts: [{id: '3', qty: 1}], description: '매주 목요일 신선한 채소를 받아보세요.' }
  ]);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [subscriptionForm, setSubscriptionForm] = useState({ name: '', price: '', weeklyFreq: 1, monthlyTotal: 4, deliveryDays: [], description: '', selectedProducts: [] });
  const [expandedSubscriptions, setExpandedSubscriptions] = useState(new Set());
  
  const [userSubscriptions, setUserSubscriptions] = useState([
    { id: 1, userName: '김철수', productName: '신선 채소 꾸러미', startDate: '2026-01-10', status: 'APPROVED', deliveryStatus: 'DELIVERED', nextDelivery: '2026-02-01' },
    { id: 2, userName: '이영희', productName: '제철 과일 꾸러미', startDate: '2026-01-15', status: 'PENDING', deliveryStatus: 'PENDING', nextDelivery: '2026-01-28' },
    { id: 3, userName: '박민수', productName: '단백질 식단 세트', startDate: '2025-12-20', status: 'SUSPENDED', deliveryStatus: '-', nextDelivery: '-' },
    { id: 4, userName: '최지우', productName: '다이어트 샐러드 팩', startDate: '2026-01-25', status: 'REJECTED', deliveryStatus: '-', nextDelivery: '-' },
  ]);

  const [inventoryHistory, setInventoryHistory] = useState([
    { id: 'h1', type: '입고', productName: '유기농 우유 1L', amount: 20, date: '2026.01.23 09:00', remaining: 35 },
    { id: 'h2', type: '출고', productName: '신선란 10구', amount: 10, date: '2026.01.23 10:30', remaining: 8 },
  ]);

  const [reviews, setReviews] = useState([
    { id: 1, userName: '김철수', rating: 5, content: '배송이 정말 빨라요! 우유도 아주 신선합니다.', date: '2026-01-20', productName: '유기농 우유 1L', reply: null },
    { id: 2, userName: '이영희', rating: 4, content: '채소들이 싱싱해서 좋아요. 다음에도 이용할게요.', date: '2026-01-18', productName: '대추토마토 500g', reply: '구매해주셔서 감사합니다! 항상 신선한 상품으로 보답하겠습니다.' },
    { id: 3, userName: '박민수', rating: 3, content: '달걀 하나가 살짝 금이 가 있었어요. 주의 부탁드려요.', date: '2026-01-15', productName: '신선란 10구', reply: null },
  ]);
  const [replyInput, setReplyInput] = useState({});

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);
      
      setOrders(prevOrders => {
        let changed = false;
        const nowObj = new Date(now);
        // getDay(): 0(일)~6(토) -> 우리 배열은 0(월)~6(일)
        const dayIdx = nowObj.getDay() === 0 ? 6 : nowObj.getDay() - 1;
        const todayHours = businessHours[dayIdx];
        const currentTimeStr = `${String(nowObj.getHours()).padStart(2, '0')}:${String(nowObj.getMinutes()).padStart(2, '0')}`;

        const newOrders = prevOrders.map(order => {
          // 1. 영업 종료 시간 체크 (휴무일이거나 마감시간 이후인 경우)
          if (order.status === '신규' || order.status === '준비중') {
            const nowTime = nowObj.toTimeString().slice(0, 5);
            if (todayHours.isClosed || nowTime > todayHours.close) {
              changed = true;
              return { ...order, status: '거절됨', rejectionReason: '영업 종료' };
            }
          }

          // 2. 5분 초과 미응답 체크 (영업시간 내인 경우만)
          if (order.status === '신규' && order.createdAt) {
            const timeDiff = now - order.createdAt;
            const limit = 5 * 60 * 1000;
            if (timeDiff >= limit) {
              changed = true;
              return { ...order, status: '거절됨', rejectionReason: '마트 사정' };
            }
          }
          return order;
        });
        return changed ? newOrders : prevOrders;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [businessHours, setBusinessHours] = useState([
    { day: '월요일', open: '09:00', close: '22:00', lastOrder: '21:30', isClosed: false },
    { day: '화요일', open: '09:00', close: '22:00', lastOrder: '21:30', isClosed: false },
    { day: '수요일', open: '09:00', close: '22:00', lastOrder: '21:30', isClosed: false },
    { day: '목요일', open: '09:00', close: '22:00', lastOrder: '21:30', isClosed: false },
    { day: '금요일', open: '09:00', close: '22:00', lastOrder: '21:30', isClosed: false },
    { day: '토요일', open: '09:00', close: '22:00', lastOrder: '21:30', isClosed: false },
    { day: '일요일', open: '09:00', close: '22:00', lastOrder: '21:30', isClosed: true },
  ]);

  const handleBusinessHourChange = (index, field, value) => {
    const updated = [...businessHours];
    updated[index][field] = value;
    setBusinessHours(updated);
  };


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
      price: '20,000원', status: '신규', date: '2026.01.23 15:10', prepTime: 10, createdAt: Date.now() 
    },
    { 
      id: 'ORD20260123007', customer: '우영우', items: '김밥 재료 세트, 참기름', 
      itemsList: [{ name: '김밥 재료 세트', qty: 1, price: '18,500원' }, { name: '참기름', qty: 1, price: '3,500원' }],
      price: '22,000원', status: '신규', date: '2026.01.23 22:30', prepTime: 10, createdAt: Date.now() - 60000 
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
      price: '16,500원', status: '신규', date: '2026.01.23 22:38', prepTime: 10, createdAt: Date.now() - 120000 
    },
    { 
      id: 'ORD20260123011', customer: '남주혁', items: '안성탕면 멀티, 단무지', 
      itemsList: [{ name: '안성탕면 멀티', qty: 1, price: '4,500원' }, { name: '단무지', qty: 1, price: '2,300원' }],
      price: '6,800원', status: '배달완료', date: '2026.01.23 21:00', prepTime: 10 
    },
    { 
      id: 'ORD20260123012', customer: '김지원', items: '스타벅스 RTD 커피 4캔', 
      itemsList: [{ name: '스타벅스 RTD 커피 4캔', qty: 1, price: '10,800원' }],
      price: '10,800원', status: '신규', date: '2026.01.23 22:40', prepTime: 10, createdAt: Date.now() - 180000 
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

  const updateOrderStatus = (id, newStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const updatePrepTime = (id, time) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, prepTime: Number(time) } : o));
  };

  const handleToggleExpand = (id) => {
    setExpandedOrders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleOpenRejectModal = (id) => {
    const order = orders.find(o => o.id === id);
    if (order) {
      setSelectedOrder(order);
      setIsRejectModalOpen(true);
    }
  };

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState('RIDER'); // RIDER or CUSTOMER
  const [reportContent, setReportContent] = useState('');

  const handleOpenReportModal = (order) => {
    setSelectedOrder(order);
    setReportTarget('RIDER');
    setReportContent('');
    setIsReportModalOpen(true);
  };

  const handleSubmitReport = () => {
    if (!reportContent) {
      alert('신고 내용을 입력해주세요.');
      return;
    }
    alert(`${reportTarget === 'RIDER' ? '배달원' : '고객'} 신고가 접수되었습니다.`);
    setIsReportModalOpen(false);
  };

  // --- Restored Missing Functions ---

  const handleOpenProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({ ...product, imageFile: null, imagePreview: product.img });
    } else {
      setEditingProduct(null);
      setProductForm({ name: '', price: '', stock: 0, capacity: 0, category: '채소', origin: '', description: '', imageFile: null, imagePreview: null, discountRate: 0 });
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...productForm, img: productForm.imagePreview || p.img } : p));
    } else {
      const newProduct = { ...productForm, id: Date.now().toString(), img: productForm.imagePreview };
      setProducts(prev => [...prev, newProduct]);
    }
    setIsProductModalOpen(false);
  };

  const deleteProduct = (id) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const toggleSoldOut = (id) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, isSoldOut: !p.isSoldOut } : p));
  };

  const handleStockAdjust = (id, amount) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const newStock = Math.max(0, p.stock + amount);
        const type = amount > 0 ? '입고' : '출고';
        setInventoryHistory(history => [{
          id: Date.now(), type, productName: p.name, amount: Math.abs(amount), date: new Date().toLocaleString(), remaining: newStock
        }, ...history]);
        return { ...p, stock: newStock };
      }
      return p;
    }));
  };

  const handleOpenSubscriptionModal = (sub = null) => {
    if (sub) {
      setEditingSubscription(sub);
      setSubscriptionForm({ ...sub });
    } else {
      setEditingSubscription(null);
      setSubscriptionForm({ name: '', price: '', weeklyFreq: 1, monthlyTotal: 4, deliveryDays: [], description: '', selectedProducts: [] });
    }
    setIsSubscriptionModalOpen(true);
  };

  const handleSaveSubscription = (e) => {
    e.preventDefault();
    if (editingSubscription) {
      setSubscriptions(prev => prev.map(s => s.id === editingSubscription.id ? { ...s, ...subscriptionForm } : s));
    } else {
      const newSub = { ...subscriptionForm, id: Date.now().toString(), subscribers: 0, status: '운영중' };
      setSubscriptions(prev => [...prev, newSub]);
    }
    setIsSubscriptionModalOpen(false);
  };

  const deleteSubscription = (id) => {
     if(confirm('구독 상품을 삭제하시겠습니까?')) {
        setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, status: '삭제 예정' } : s));
     }
  };

  const handleToggleSubscriptionExpand = (id) => {
    setExpandedSubscriptions(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const sendSubscriptionNotification = (sub) => {
    alert(`[${sub.name}] 구독자들에게 알림을 발송했습니다.`);
  };

  const handleConfirmReject = () => {
    if (selectedOrder) {
      updateOrderStatus(selectedOrder.id, '거절됨');
      setIsRejectModalOpen(false);
      setSelectedOrder(null);
    }
  };

  const handleReplyReview = (reviewId) => {
    const reply = replyInput[reviewId];
    if (!reply || !reply.trim()) return;
    
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, reply } : r));
    setReplyInput(prev => ({ ...prev, [reviewId]: '' }));
    alert('답변이 등록되었습니다.');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case '신규': return { bg: '#fee2e2', text: '#991b1b' };
      case '준비중': return { bg: '#fff7ed', text: '#9a3412' };
      case '준비완료': return { bg: '#f0fdf4', text: '#166534' };
      case '배차 완료': return { bg: '#e0e7ff', text: '#4338ca' };
      case '픽업 대기중': return { bg: '#fef3c7', text: '#92400e' };
      case '픽업가능': return { bg: '#eff6ff', text: '#1e40af' };
      case '배달중': return { bg: '#fdf4ff', text: '#701a75' };
      case '배달완료': return { bg: '#f1f5f9', text: '#475569' };
      case '완료': return { bg: '#f1f5f9', text: '#475569' };
      case '거절됨': return { bg: '#fef2f2', text: '#ef4444' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  // Rider Allocation Simulation: '픽업가능' -> '배차 완료'
  useEffect(() => {
    const ordersReady = orders.filter(o => o.status === '픽업가능');
    if (ordersReady.length === 0) return;

    const timers = ordersReady.map(order => {
      return setTimeout(() => {
        updateOrderStatus(order.id, '배차 완료');
      }, 3000); 
    });
    return () => timers.forEach(clearTimeout);
  }, [orders]);

  // Delivery Completion Simulation: '배달중' -> '배달완료'
  useEffect(() => {
    const deliveringOrders = orders.filter(o => o.status === '배달중');
    if (deliveringOrders.length === 0) return;

    const timers = deliveringOrders.map(order => {
      return setTimeout(() => {
        updateOrderStatus(order.id, '배달완료');
      }, 5000); // 5 seconds to simulate delivery completion
    });
    return () => timers.forEach(clearTimeout);
  }, [orders]);

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
                              <button 
                                onClick={() => handleOpenReportModal(order)}
                                style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #fee2e2', background: 'white', cursor: 'pointer', fontSize: '12px', color: '#ef4444', fontWeight: '800' }}
                              >신고</button>
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
      case 'settlements':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Header with Selector */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
              <div 
                onClick={() => setIsPeriodSelectorOpen(!isPeriodSelectorOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'white', padding: '10px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', position: 'relative', zIndex: 100 }}
              >
                <span style={{ fontSize: '18px' }}>📅</span>
                <span style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>{selectedSettlementPeriod} 정산 내역</span>
                <span style={{ fontSize: '12px', color: '#94a3b8', transform: isPeriodSelectorOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                
                {isPeriodSelectorOpen && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, width: '100%', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden', zIndex: 101 }}>
                    {['2026년 1월', '2025년 12월', '2025년 11월', '2025년 10월'].map((period) => (
                      <div 
                        key={period}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSettlementPeriod(period);
                          setIsPeriodSelectorOpen(false);
                        }}
                        style={{ padding: '12px 20px', fontSize: '14px', fontWeight: '700', color: selectedSettlementPeriod === period ? 'var(--primary)' : '#475569', backgroundColor: selectedSettlementPeriod === period ? '#f0fdf4' : 'white', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}
                      >
                        {period}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ecfdf5', color: '#10b981', padding: '8px 16px', borderRadius: '30px', fontWeight: '800', fontSize: '14px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                정산 확정
              </div>
            </div>

            {/* Payment Structure Summary */}
            <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ width: '28px', height: '28px', backgroundColor: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '14px' }}>💳</div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>결제 구조 요약</h3>
              </div>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 32px 40px' }}>전체 주문 중 일반 주문과 구독 주문의 비중을 확인합니다.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '32px' }}>
                <div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', fontWeight: '700' }}>
                      <span style={{ color: '#475569' }}>매출 비중</span>
                      <div>
                        <span style={{ color: '#3b82f6' }}>● 일반 68%</span>
                        <span style={{ color: '#8b5cf6', marginLeft: '16px' }}>● 구독 32%</span>
                      </div>
                   </div>
                   <div style={{ height: '12px', width: '100%', backgroundColor: '#f1f5f9', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
                      <div style={{ width: '68%', height: '100%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }}></div>
                      <div style={{ width: '32%', height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)' }}></div>
                   </div>
                </div>
                <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                   <div style={{ fontSize: '12px', fontWeight: '700', color: '#8b5cf6', marginBottom: '8px' }}>일반 주문 수</div>
                   <div style={{ fontSize: '24px', fontWeight: '900' }}>168 <span style={{ fontSize: '14px', fontWeight: '600', color: '#94a3b8' }}>건</span></div>
                </div>
                <div style={{ backgroundColor: '#f5f3ff', padding: '20px', borderRadius: '20px', border: '1px solid #ede9fe' }}>
                   <div style={{ fontSize: '12px', fontWeight: '700', color: '#8b5cf6', marginBottom: '8px' }}>구독 주문 수</div>
                   <div style={{ fontSize: '24px', fontWeight: '900', color: '#8b5cf6' }}>80 <span style={{ fontSize: '14px', fontWeight: '600', color: '#a78bfa' }}>건</span></div>
                </div>
              </div>
            </div>

            {/* Main Financial Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
               {[
                 { label: '총 결제 금액', value: '₩18,290,500', sub: '↗12% 전월 대비', color: '#1e293b', subColor: '#10b981' },
                 { label: '플랫폼 수수료 합계', value: '-₩1,463,240', sub: '고정 8% 플랫폼 수수료 적용', color: '#ef4444', subColor: '#94a3b8' },
                 { label: '환불/취소 금액', value: '-₩342,100', sub: '4건의 취소 내역 반영', color: '#94a3b8', subColor: '#94a3b8' },
                 { label: '최종 정산 예정 금액', value: '₩16,485,160', sub: '🗓️ 2월 1일 지급 예정', color: '#ffffff', subColor: '#ffffff', highlight: true },
               ].map((card, i) => (
                 <div key={i} style={{ 
                    background: card.highlight ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'white', 
                    padding: '24px', borderRadius: '24px', 
                    border: '1px solid #f1f5f9',
                    color: card.color,
                    boxShadow: card.highlight ? '0 10px 20px rgba(37, 99, 235, 0.2)' : 'none',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '160px'
                 }}>
                   <div style={{ fontSize: '14px', fontWeight: '700', color: card.highlight ? 'rgba(255,255,255,0.8)' : '#64748b' }}>{card.label}</div>
                   <div>
                     <div style={{ fontSize: '24px', fontWeight: '900', marginBottom: '8px' }}>{card.value}</div>
                     <div style={{ fontSize: '12px', fontWeight: '600', color: card.subColor }}>{card.sub}</div>
                   </div>
                 </div>
               ))}
            </div>

            {/* Secondary Stats Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
               {[
                 { label: '총 주문 건수', value: '248 건', icon: '🛍️' },
                 { label: '환불 건수', value: '4 건', icon: '🔄' },
                 { label: '평균 주문 금액', value: '₩73,750', icon: '💳' },
                 { label: '매출 증감률', value: '+8.4%', icon: '📈' },
               ].map((stat, i) => (
                 <div key={i} style={{ background: 'white', padding: '16px 24px', borderRadius: '20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{stat.icon}</div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>{stat.label}</div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: i === 3 ? '#10b981' : '#1e293b' }}>{stat.value}</div>
                    </div>
                 </div>
               ))}
            </div>

            {/* Order Table Component */}
            <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>주문별 정산 내역</h3>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="text" 
                        placeholder="주문 번호 검색..." 
                        style={{ padding: '12px 16px 12px 40px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '280px', fontSize: '14px' }}
                      />
                      <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
                    </div>
                    <button style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <span style={{ fontSize: '18px' }}>⚖️</span>
                    </button>
                  </div>
               </div>

               <div className="table-responsive">
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '13px', fontWeight: '700' }}>
                        <th style={{ padding: '16px' }}>주문 번호</th>
                        <th style={{ padding: '16px' }}>유형</th>
                        <th style={{ padding: '16px' }}>주문 일시</th>
                        <th style={{ padding: '16px', textAlign: 'right' }}>결제 금액</th>
                        <th style={{ padding: '16px', textAlign: 'right' }}>수수료 (8%)</th>
                        <th style={{ padding: '16px', textAlign: 'center' }}>환불 여부</th>
                        <th style={{ padding: '16px', textAlign: 'center' }}>정산 반영</th>
                        <th style={{ padding: '16px', textAlign: 'right' }}>정산 금액</th>
                      </tr>
                    </thead>
                    <tbody>
                       {[
                         { id: '#ORD-2026-9901', type: '구독주문', date: '01월 28일 14:32', amount: '₩124,500', fee: '-₩9,960', refund: '해당없음', status: '반영됨', net: '₩114,540' },
                         { id: '#ORD-2026-9895', type: '일반주문', date: '01월 28일 12:15', amount: '₩86,200', fee: '-₩6,900', refund: '부분 환불', status: '반영됨', net: '₩79,300' },
                         { id: '#ORD-2026-9892', type: '구독주문', date: '01월 28일 10:44', amount: '₩210,000', fee: '-₩16,800', refund: '해당없음', status: '반영됨', net: '₩193,200' },
                       ].map((row, i) => (
                         <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px', transition: 'background 0.2s' }} className="hover-row">
                            <td style={{ padding: '16px', fontWeight: '800' }}>{row.id}</td>
                            <td style={{ padding: '16px' }}>
                               <span style={{ 
                                 backgroundColor: row.type === '구독주문' ? '#f5f3ff' : '#f1f5f9', 
                                 color: row.type === '구독주문' ? '#8b5cf6' : '#64748b', 
                                 padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' 
                               }}>{row.type}</span>
                            </td>
                            <td style={{ padding: '16px', color: '#64748b' }}>{row.date}</td>
                            <td style={{ padding: '16px', textAlign: 'right', fontWeight: '700' }}>{row.amount}</td>
                            <td style={{ padding: '16px', textAlign: 'right', color: '#ef4444', fontWeight: '600' }}>{row.fee}</td>
                            <td style={{ padding: '16px', textAlign: 'center' }}>
                               <span style={{ 
                                 backgroundColor: row.refund === '해당없음' ? '#f1f5f9' : '#fff1f2', 
                                 color: row.refund === '해당없음' ? '#94a3b8' : '#e11d48', 
                                 padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' 
                               }}>{row.refund}</span>
                            </td>
                            <td style={{ padding: '16px', textAlign: 'center' }}>
                               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#10b981', fontWeight: '800', fontSize: '12px' }}>
                                  <span style={{ fontSize: '14px' }}>✅</span> 반영됨
                               </div>
                            </td>
                            <td style={{ padding: '16px', textAlign: 'right', fontWeight: '900' }}>{row.net}</td>
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
                  <div style={{ 
                    width: '100%', 
                    height: '100px', 
                    marginBottom: '16px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    filter: product.isSoldOut ? 'grayscale(1)' : 'none',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    backgroundColor: '#f8fafc'
                  }}>
                    {product.img && (product.img.startsWith('data:image') || product.img.startsWith('http')) ? (
                      <img src={product.img} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '32px', color: '#cbd5e1' }}>📦</span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{product.category}</div>
                  <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>{product.name}</div>
                  <div style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '18px', marginBottom: '12px' }}>{product.price}</div>
                  <div style={{ 
                    fontSize: '13px', 
                    color: product.stock < lowStockThreshold ? '#ef4444' : '#64748b', 
                    marginBottom: '10px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: (product.stock < lowStockThreshold || product.isSoldOut) ? '#ef4444' : '#2ecc71' }}></span>
                    재고: {product.stock}개 <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '400' }}>/ {product.capacity}</span>
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
      case 'inventory':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Inventory Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
              {[
                { label: '전체 상품 수', value: `${products.length}종`, icon: '📦', color: '#1e293b' },
                { label: '품절 상품', value: `${products.filter(p => p.isSoldOut).length}종`, icon: '🚫', color: '#ef4444' },
                { label: '재고 부족', value: `${products.filter(p => !p.isSoldOut && p.stock < lowStockThreshold).length}종`, icon: '⚠️', color: '#f59e0b' },
                { label: '당일 입고/출고', value: `${inventoryHistory.filter(h => h.date.includes('2026.01.23')).length}건`, icon: '🔄', color: '#3b82f6' },
              ].map((stat, i) => (
                <div key={i} style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '14px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{stat.icon}</div>
                  <div>
                    <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>{stat.label}</div>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: stat.color }}>{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
              {/* Stock Management Table */}
              <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>재고 조정 및 현황</h2>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px', 
                      background: '#f8fafc', 
                      padding: '6px 12px', 
                      borderRadius: '100px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <span style={{ fontSize: '14px' }}>🔔</span>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>재고 알림 기준</span>
                      <select 
                        value={lowStockThreshold}
                        onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                        style={{ 
                          padding: '4px 12px', 
                          borderRadius: '100px', 
                          border: '1px solid #cbd5e1', 
                          fontSize: '13px', 
                          fontWeight: '800',
                          cursor: 'pointer',
                          outline: 'none',
                          background: 'white',
                          color: 'var(--primary)'
                        }}
                      >
                        <option value={5}>5개 이하</option>
                        <option value={10}>10개 이하</option>
                        <option value={20}>20개 이하</option>
                        <option value={50}>50개 이하</option>
                      </select>
                    </div>
                    <input type="text" placeholder="상품명 검색..." style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} />
                  </div>
                </div>
                <div className="table-responsive">
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '13px' }}>
                        <th style={{ padding: '12px' }}>상품</th>
                        <th style={{ padding: '12px' }}>현재고</th>
                        <th style={{ padding: '12px' }}>재고율</th>
                        <th style={{ padding: '12px' }}>품절 여부</th>
                        <th style={{ padding: '12px' }}>수량 조정</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => {
                        const stockRatio = (product.stock / product.capacity) * 100;
                        const isLow = product.stock < lowStockThreshold;
                        return (
                          <tr key={product.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '24px' }}>{product.img}</span>
                                <div style={{ fontWeight: '700' }}>{product.name}</div>
                              </div>
                            </td>
                            <td style={{ padding: '12px' }}>
                              <span style={{ fontWeight: '800', color: isLow ? '#ef4444' : '#1e293b' }}>{product.stock}개</span>
                              <span style={{ color: '#94a3b8', fontSize: '12px' }}> / {product.capacity}</span>
                            </td>
                            <td style={{ padding: '12px' }}>
                              <div style={{ width: '100px', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden', marginTop: '4px' }}>
                                <div style={{ width: `${Math.min(100, stockRatio)}%`, height: '100%', backgroundColor: isLow ? '#ef4444' : '#10b981' }}></div>
                              </div>
                            </td>
                            <td style={{ padding: '12px' }}>
                               <div 
                                onClick={() => toggleSoldOut(product.id)}
                                style={{ 
                                  display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer',
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
                            </td>
                            <td style={{ padding: '12px' }}>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input 
                                  type="number" 
                                  min="1"
                                  value={stockAdjustValues[product.id] || ''}
                                  onChange={(e) => setStockAdjustValues({ ...stockAdjustValues, [product.id]: e.target.value })}
                                  placeholder="수량"
                                  style={{ 
                                    width: '60px', 
                                    padding: '6px 8px', 
                                    borderRadius: '6px', 
                                    border: '1px solid #e2e8f0', 
                                    fontSize: '13px',
                                    outline: 'none'
                                  }}
                                />
                                <button 
                                  onClick={() => {
                                    const amount = parseInt(stockAdjustValues[product.id]);
                                    if (isNaN(amount) || amount <= 0) {
                                      alert('올바른 수량을 입력해주세요.');
                                      return;
                                    }
                                    handleStockAdjust(product.id, amount);
                                    setStockAdjustValues({ ...stockAdjustValues, [product.id]: '' });
                                  }}
                                  style={{ 
                                    padding: '6px 16px', 
                                    borderRadius: '8px', 
                                    background: 'var(--primary)', 
                                    color: 'white', 
                                    border: 'none', 
                                    fontWeight: '700', 
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                  }}
                                >입고</button>
                                <button 
                                  onClick={() => {
                                    const amount = parseInt(stockAdjustValues[product.id]);
                                    if (isNaN(amount) || amount <= 0) {
                                      alert('올바른 수량을 입력해주세요.');
                                      return;
                                    }
                                    if (amount > product.stock) {
                                      alert('현재고보다 많은 수량을 출고할 수 없습니다.');
                                      return;
                                    }
                                    handleStockAdjust(product.id, -amount);
                                    setStockAdjustValues({ ...stockAdjustValues, [product.id]: '' });
                                  }}
                                  style={{ 
                                    padding: '6px 12px', 
                                    borderRadius: '8px', 
                                    background: 'white', 
                                    color: '#64748b', 
                                    border: '1px solid #e2e8f0', 
                                    fontWeight: '700', 
                                    fontSize: '13px',
                                    cursor: 'pointer'
                                  }}
                                >출고</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Inventory History */}
              <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 24px 0' }}>최근 입출고 내역</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '500px', overflowY: 'auto', paddingRight: '8px' }}>
                  {inventoryHistory.length > 0 ? inventoryHistory.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '16px', borderBottom: '1px solid #f8fafc' }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ 
                          width: '36px', height: '36px', borderRadius: '10px', 
                          backgroundColor: item.type === '입고' ? '#ecfdf5' : '#fff1f2',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: item.type === '입고' ? '#10b981' : '#ef4444',
                          fontSize: '18px'
                        }}>
                          {item.type === '입고' ? '📥' : '📤'}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '700' }}>{item.productName}</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>{item.date}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: item.type === '입고' ? '#10b981' : '#ef4444' }}>
                          {item.type === '입고' ? '+' : '-'}{item.amount}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>잔고: {item.remaining}개</div>
                      </div>
                    </div>
                  )) : (
                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>내역이 없습니다.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 'subscriptions':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
             {/* Subscription Overview Stats */}
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                <div style={{ padding: '24px', background: 'white', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '4px solid #8b5cf6' }}>
                   <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px', fontWeight: '600' }}>전체 구독 상품</div>
                   <div style={{ fontSize: '28px', fontWeight: '800' }}>{subscriptions.length}종</div>
                </div>
                <div style={{ padding: '24px', background: 'white', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '4px solid #10b981' }}>
                   <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px', fontWeight: '600' }}>총 구독자 수</div>
                   <div style={{ fontSize: '28px', fontWeight: '800' }}>{subscriptions.reduce((acc, curr) => acc + curr.subscribers, 0)}명</div>
                </div>
                <div style={{ padding: '24px', background: 'white', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '4px solid #38bdf8' }}>
                   <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px', fontWeight: '600' }}>이번 달 예상 수익</div>
                   <div style={{ fontSize: '28px', fontWeight: '800' }}>2,450,000원</div>
                </div>
             </div>

             <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                   <div>
                      <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>구독 상품 리스트 및 관리</h2>
                      <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>구독 구성을 직접 추가하고 가격과 구성을 결정할 수 있습니다.</p>
                   </div>
                   <button 
                     onClick={() => handleOpenSubscriptionModal()}
                     style={{ padding: '12px 24px', borderRadius: '12px', background: '#8b5cf6', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' }}>+ 새 구독 상품 추가</button>
                </div>

                <div className="table-responsive">
                   <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                         <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '14px' }}>
                            <th style={{ padding: '16px', width: '40px' }}></th>
                            <th style={{ padding: '16px' }}>구독 상품명</th>
                            <th style={{ padding: '16px' }}>월 구독료</th>
                            <th style={{ padding: '16px' }}>구성 품목 수</th>
                            <th style={{ padding: '16px' }}>가입 고객</th>
                            <th style={{ padding: '16px' }}>상태</th>
                            <th style={{ padding: '16px' }}>관리</th>
                         </tr>
                      </thead>
                      <tbody>
                         {subscriptions.map((sub) => (
                            <React.Fragment key={sub.id}>
                               <tr style={{ borderBottom: expandedSubscriptions.has(sub.id) ? 'none' : '1px solid #f1f5f9', fontSize: '15px', transition: 'all 0.2s', backgroundColor: expandedSubscriptions.has(sub.id) ? 'rgba(139, 92, 246, 0.02)' : 'transparent' }}>
                                 <td style={{ padding: '16px', textAlign: 'center' }}>
                                   <button 
                                     onClick={() => handleToggleSubscriptionExpand(sub.id)}
                                     style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '12px', transform: expandedSubscriptions.has(sub.id) ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: expandedSubscriptions.has(sub.id) ? '#8b5cf6' : '#94a3b8' }}
                                   >▼</button>
                                 </td>
                                 <td style={{ padding: '16px', fontWeight: '700' }}>
                                   <div 
                                     onClick={() => handleToggleSubscriptionExpand(sub.id)}
                                     style={{ cursor: 'pointer' }}
                                   >
                                     {sub.name}
                                   </div>
                                 </td>
                                 <td style={{ padding: '16px', fontWeight: '800', color: '#8b5cf6' }}>{sub.price}</td>
                                 <td style={{ padding: '16px' }}>{(sub.selectedProducts?.length || sub.quantity)}개 품목</td>
                                 <td style={{ padding: '16px' }}>{sub.subscribers}명</td>
                                 <td style={{ padding: '16px' }}>
                                    <span style={{ 
                                      fontSize: '12px', 
                                      color: sub.status === '삭제 예정' ? '#ef4444' : '#10b981', 
                                      backgroundColor: sub.status === '삭제 예정' ? '#fee2e2' : '#ecfdf5', 
                                      padding: '4px 10px', borderRadius: '6px', fontWeight: '800' 
                                    }}>● {sub.status}</span>
                                 </td>
                                 <td style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                       <div 
                                         onClick={() => {
                                           if (sub.status === '운영중' || sub.status === '숨김') {
                                             const newStatus = sub.status === '운영중' ? '숨김' : '운영중';
                                             setSubscriptions(prev => prev.map(s => s.id === sub.id ? { ...s, status: newStatus } : s));
                                           }
                                         }}
                                         style={{ 
                                           display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer',
                                           padding: '6px 12px', borderRadius: '12px', border: '1px solid #e2e8f0',
                                           backgroundColor: sub.status === '운영중' ? '#ecfdf5' : '#f1f5f9',
                                           transition: 'all 0.2s'
                                         }}
                                       >
                                          <span style={{ fontSize: '11px', fontWeight: '800', color: sub.status === '운영중' ? '#10b981' : '#64748b' }}>노출</span>
                                          <div style={{ 
                                            width: '24px', height: '12px', borderRadius: '10px', backgroundColor: sub.status === '운영중' ? '#10b981' : '#cbd5e1', 
                                            position: 'relative'
                                          }}>
                                            <div style={{ 
                                              width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'white', position: 'absolute', top: '1px', 
                                              left: sub.status === '운영중' ? '13px' : '1px', transition: 'all 0.2s'
                                            }}></div>
                                          </div>
                                       </div>
                                       
                                       <div style={{ width: '1px', height: '16px', background: '#e2e8f0', margin: '0 4px' }}></div>
                                       
                                       <button 
                                         onClick={() => {
                                           if (sub.status === '숨김') {
                                             deleteSubscription(sub.id);
                                           } else if (sub.status === '삭제 예정') {
                                             // already scheduled
                                           } else {
                                             alert('숨김 상태의 구독만 삭제 요청이 가능합니다. 먼저 노출 상태를 숨김으로 변경해주세요.');
                                           }
                                         }}
                                         style={{ 
                                           padding: '6px 12px', 
                                           borderRadius: '8px', 
                                           border: '1px solid #fee2e2', 
                                           background: sub.status === '삭제 예정' ? '#ef4444' : 'white', 
                                           color: sub.status === '삭제 예정' ? 'white' : '#ef4444', 
                                           cursor: sub.status === '삭제 예정' ? 'default' : 'pointer', 
                                           opacity: (sub.status !== '숨김' && sub.status !== '삭제 예정') ? 0.5 : 1,
                                           fontSize: '12px', 
                                           fontWeight: '600' 
                                         }}>
                                         {sub.status === '삭제 예정' ? '삭제 예약됨' : '삭제 요청'}
                                       </button>
                                       
                                       <button 
                                         onClick={() => sendSubscriptionNotification(sub)}
                                         style={{ padding: '6px 12px', borderRadius: '8px', border: sub.status === '삭제 예정' ? '1px solid #8b5cf6' : '1px solid #e2e8f0', background: 'white', color: sub.status === '삭제 예정' ? '#8b5cf6' : '#94a3b8', cursor: 'pointer', fontSize: '12px', fontWeight: '800' }}>🔔 알림</button>
                                    </div>
                                 </td>
                               </tr>
                               {expandedSubscriptions.has(sub.id) && (
                                 <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: 'rgba(139, 92, 246, 0.02)' }}>
                                   <td colSpan="7" style={{ padding: '0 24px 24px 72px' }}>
                                     <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #ede9fe', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                                       <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                                         <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '8px' }}>주당 배송 횟수</div>
                                         <div style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>{sub.weeklyFreq || 1}회 <span style={{ fontSize: '13px', fontWeight: '500' }}>배송 / 주</span></div>
                                       </div>
                                       <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                                         <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '8px' }}>월간 총 배송 횟수</div>
                                         <div style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>{sub.monthlyTotal || 4}회 <span style={{ fontSize: '13px', fontWeight: '500' }}>배송 / 월</span></div>
                                       </div>
                                       <div style={{ backgroundColor: '#fdfaff', padding: '16px', borderRadius: '12px', border: '1px solid #f3e8ff' }}>
                                         <div style={{ fontSize: '12px', fontWeight: '700', color: '#8b5cf6', marginBottom: '8px' }}>배송 요일 설정</div>
                                         <div style={{ display: 'flex', gap: '6px' }}>
                                           {(sub.deliveryDays || ['목']).map(day => (
                                             <span key={day} style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '800' }}>{day}요일</span>
                                           ))}
                                         </div>
                                       </div>
                                       <div style={{ gridColumn: 'span 3', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                                          <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '12px' }}>구성 품목 상세</div>
                                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                                            {(sub.selectedProducts || []).map(item => {
                                              const p = products.find(p => p.id === item.id);
                                              return p ? (
                                                <div key={item.id} style={{ backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                  <span style={{ fontSize: '16px' }}>{p.img}</span>
                                                  <span style={{ fontSize: '13px', fontWeight: '600' }}>{p.name}</span>
                                                  <span style={{ fontSize: '12px', color: '#8b5cf6', fontWeight: '700' }}>x{item.qty}</span>
                                                </div>
                                              ) : null;
                                            })}
                                          </div>
                                         <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '8px' }}>상품 상세 설명</div>
                                         <div style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>{sub.description || '구성된 상품 목록 및 서비스 안내 내용이 표시됩니다.'}</div>
                                       </div>
                                     </div>
                                   </td>
                                 </tr>
                               )}
                             </React.Fragment>
                         ))}
                         {subscriptions.length === 0 && (
                            <tr><td colSpan="7" style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>등록된 구독 상품이 없습니다.</td></tr>
                         )}
                      </tbody>
                   </table>
                </div>
              </div>

              {/* Split Section: Next Delivery & Weekly Schedule */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* 1. Next Delivery Schedule & Required Status */}
                <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 24px 0' }}>다음 배송 일정 및 필요 물량</h2>
                  
                  <div style={{ marginBottom: '24px', padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '16px', border: '1px solid #bbf7d0' }}>
                     <div style={{ fontSize: '14px', fontWeight: '700', color: '#15803d', marginBottom: '8px' }}>다음 배송일</div>
                     <div style={{ fontSize: '24px', fontWeight: '900', color: '#166534' }}>2월 1일 (목) <span style={{ fontSize: '16px', fontWeight: '600', color: '#15803d' }}>- 3일 뒤</span></div>
                     <div style={{ marginTop: '12px', fontSize: '14px', fontWeight: '600', color: '#15803d' }}>총 배송 예정: 12건</div>
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 16px 0', color: '#475569' }}>준비 필요 상품 현황</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                    {[
                      { name: '신선 채소 꾸러미', count: 5, items: ['대추토마토 500g x5', '시금치 1단 x5'] },
                      { name: '제철 과일 꾸러미', count: 4, items: ['사과 2개 x4', '바나나 1송이 x4'] },
                      { name: '단백질 식단 세트', count: 3, items: ['닭가슴살 1kg x3', '두부 2모 x3'] }
                    ].map((item, idx) => (
                      <div key={idx} style={{ padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontWeight: '700', fontSize: '14px' }}>{item.name}</span>
                          <span style={{ fontWeight: '800', color: '#3b82f6' }}>{item.count}개</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                          {item.items.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Weekly Delivery Schedule (Time Unit) */}
                <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>주간 배송 일정 (시간대별)</h2>
                    <button style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontSize: '12px', fontWeight: '700', color: '#64748b', cursor: 'pointer' }}>자세히 보기 &gt;</button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* Calendar Strip */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '16px' }}>
                      {['월', '화', '수', '목', '금', '토', '일'].map((day, i) => (
                        <div key={day} style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>{day}</div>
                          <div style={{ 
                            height: '32px', width: '32px', margin: '0 auto', 
                            borderRadius: '50%', backgroundColor: i === 3 ? '#3b82f6' : 'transparent', color: i === 3 ? 'white' : '#1e293b', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px' 
                          }}>
                            {29 + i > 31 ? 29 + i - 31 : 29 + i}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Time Slots for Selected Day (Thursday Mock) */}
                    <div style={{  padding: '16px', borderRadius: '16px', backgroundColor: '#eff6ff', border: '1px solid #dbeafe', marginBottom: '16px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                          <span style={{ fontWeight: '800', color: '#1e40af' }}>2월 1일 (목) 배송 정보</span>
                          <span style={{ fontSize: '11px', backgroundColor: '#bfdbfe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>선택됨</span>
                       </div>
                       
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {[
                            { time: '06:00 - 09:00 (아침)', count: 4, area: '강남구 역삼동 외' },
                            { time: '11:00 - 14:00 (점심)', count: 6, area: '서초구 서초동 외' },
                            { time: '17:00 - 20:00 (저녁)', count: 2, area: '송파구 잠실동 외' }
                          ].map((slot, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                               <div>
                                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>{slot.time}</div>
                                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>지역: {slot.area}</div>
                               </div>
                               <div style={{ fontWeight: '800', color: '#3b82f6', fontSize: '15px' }}>{slot.count}건</div>
                            </div>
                          ))}
                       </div>
                    </div>

                    <div style={{ padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9', backgroundColor: '#f8fafc', textAlign: 'center' }}>
                       <div style={{ fontSize: '12px', color: '#64748b' }}>이 날짜에 배송될 구독 상품이 없습니다.</div>
                    </div>
                  </div>
                </div>
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

              <div>
                <label style={{ display: 'block', marginBottom: '12px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>스토어 대표 이미지 / 로고</label>
                <div 
                  onClick={() => document.getElementById('store-logo-upload').click()}
                  style={{ 
                    width: '100%', maxWidth: '400px', height: '200px', borderRadius: '16px', border: '2px dashed #cbd5e1', 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                    backgroundColor: '#f8fafc', cursor: 'pointer', overflow: 'hidden', position: 'relative'
                  }}>
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
                        reader.onloadend = () => {
                          setStoreInfo({ ...storeInfo, img: reader.result });
                        };
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
                    <div key={idx} style={{ 
                      display: 'grid', gridTemplateColumns: 'minmax(80px, 1fr) 2fr 2fr 2fr 1fr', gap: '16px', alignItems: 'center',
                      padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9',
                      backgroundColor: bh.isClosed ? '#fef2f2' : 'white',
                      transition: 'all 0.2s'
                    }}>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: bh.isClosed ? '#ef4444' : '#1e293b' }}>{bh.day}</div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8' }}>오픈</span>
                        <input 
                          type="time" 
                          disabled={bh.isClosed}
                          value={bh.open} 
                          onChange={(e) => handleBusinessHourChange(idx, 'open', e.target.value)}
                          style={{ 
                            width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px',
                            backgroundColor: bh.isClosed ? '#f1f5f9' : 'white', cursor: bh.isClosed ? 'not-allowed' : 'text'
                          }} 
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8' }}>마감</span>
                        <input 
                          type="time" 
                          disabled={bh.isClosed}
                          value={bh.close} 
                          onChange={(e) => handleBusinessHourChange(idx, 'close', e.target.value)}
                          style={{ 
                            width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px',
                            backgroundColor: bh.isClosed ? '#f1f5f9' : 'white', cursor: bh.isClosed ? 'not-allowed' : 'text'
                          }} 
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#8b5cf6' }}>라스트 오더</span>
                        <input 
                          type="time" 
                          disabled={bh.isClosed}
                          value={bh.lastOrder} 
                          onChange={(e) => handleBusinessHourChange(idx, 'lastOrder', e.target.value)}
                          style={{ 
                            width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #8b5cf6', fontSize: '13px',
                            backgroundColor: bh.isClosed ? '#f1f5f9' : 'white', cursor: bh.isClosed ? 'not-allowed' : 'text',
                            color: bh.isClosed ? '#94a3b8' : '#8b5cf6'
                          }} 
                        />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                        <input 
                          type="checkbox" 
                          id={`closed-${idx}`}
                          checked={bh.isClosed}
                          onChange={(e) => handleBusinessHourChange(idx, 'isClosed', e.target.checked)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#ef4444' }}
                        />
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
      case 'reviews':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>리뷰 관리</h2>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>고객님들이 남겨주신 소중한 리뷰에 답변을 남겨주세요.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {reviews.map((review) => (
                  <div key={review.id} style={{ padding: '24px', borderRadius: '20px', border: '1px solid #f1f5f9', backgroundColor: '#fdfdfd' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: '800', fontSize: '16px' }}>{review.userName}</span>
                        <div style={{ display: 'flex', gap: '2px', color: '#f59e0b' }}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} style={{ fontSize: '14px' }}>{i < review.rating ? '★' : '☆'}</span>
                          ))}
                        </div>
                        <span style={{ color: '#94a3b8', fontSize: '13px' }}>{review.date}</span>
                      </div>
                      <span style={{ backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', color: '#64748b', fontWeight: '700' }}>{review.productName}</span>
                    </div>
                    
                    <p style={{ fontSize: '15px', color: '#1e293b', lineHeight: '1.6', marginBottom: '20px', whiteSpace: 'pre-wrap' }}>{review.content}</p>
                    
                    {review.reply ? (
                      <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', marginBottom: '4px' }}>마트 답변</div>
                        <p style={{ fontSize: '14px', color: '#475569', margin: 0 }}>{review.reply}</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <textarea 
                          placeholder="고객님께 따뜻한 답변을 남겨주세요..."
                          value={replyInput[review.id] || ''}
                          onChange={(e) => setReplyInput(prev => ({ ...prev, [review.id]: e.target.value }))}
                          style={{ width: '100%', height: '80px', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', resize: 'none' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => handleReplyReview(review.id)}
                            style={{ padding: '8px 20px', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                          >답변 등록</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
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
                <div style={{ fontSize: '28px', fontWeight: '800' }}>{orders.filter(o => ['신규', '준비중', '배차 완료', '픽업가능', '픽업 대기중', '배달중'].includes(o.status)).length}건</div>
                <div style={{ color: '#64748b', fontSize: '12px', marginTop: '8px' }}>진행 중 {orders.filter(o => ['신규', '준비중', '배차 완료', '픽업가능', '픽업 대기중', '배달중'].includes(o.status)).length}</div>
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
                {orders.filter(o => ['신규', '준비중', '배차 완료', '픽업가능', '픽업 대기중'].includes(o.status)).length > 0 ? (
                  orders.filter(o => ['신규', '준비중', '배차 완료', '픽업가능', '픽업 대기중'].includes(o.status)).map(order => (
                    <div key={order.id} style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: order.status === '신규' ? '#fffafb' : order.status === '준비중' ? '#f0fdf4' : '#f8fafc', borderRadius: '12px', border: order.status === '신규' ? '1px solid #fee2e2' : order.status === '준비중' ? '1px solid #dcfce7' : '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <button 
                            onClick={() => handleToggleExpand(order.id)}
                            style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '12px', transform: expandedOrders.has(order.id) ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                          >
                            ▼
                          </button>
                          <div>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                               <div style={{ fontSize: '15px', fontWeight: '700' }}>{order.id}</div>
                               {order.status === '배차 완료' && (
                                 <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: '#e0e7ff', color: '#4338ca', padding: '2px 6px', borderRadius: '4px' }}>배달원 매칭 완료</span>
                               )}
                             </div>
                             <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>{order.items}</div>
                             {order.status === '거절됨' && (
                               <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: '700', marginTop: '4px' }}>
                                 사유: {order.rejectionReason}
                               </div>
                             )}
                             <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{order.date}</div>
                             {order.status === '신규' && order.createdAt && (
                               <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: '800', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                 <span style={{ fontSize: '14px' }}>⏰</span>
                                 자동 거절까지 {(() => {
                                   const remaining = Math.max(0, (5 * 60 * 1000) - (currentTime - order.createdAt));
                                   const mins = Math.floor(remaining / 60000);
                                   const secs = Math.floor((remaining % 60000) / 1000);
                                   return `${mins}분 ${secs}초`;
                                 })()} 남음
                               </div>
                             )}
                           </div>
                         </div>
                         <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                           {order.status === '신규' && (
                             <>
                               <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '8px', padding: '4px 12px', border: '1px solid #e2e8f0' }}>
                                 <select 
                                   value={order.prepTime || 10} 
                                   onChange={(e) => updatePrepTime(order.id, e.target.value)}
                                   style={{ border: 'none', background: 'transparent', textAlign: 'right', fontSize: '14px', fontWeight: '800', outline: 'none', cursor: 'pointer', color: 'var(--primary)' }}
                                 >
                                   {[5, 10, 15, 20, 25, 30, 40, 50, 60].map(t => <option key={t} value={t}>{t}</option>)}
                                 </select>
                                 <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '4px', fontWeight: '700' }}>분</span>
                               </div>
                               <button onClick={() => updateOrderStatus(order.id, '준비중')} style={{ padding: '14px 28px', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer', fontSize: '15px', boxShadow: '0 4px 12px rgba(46, 204, 113, 0.2)' }}>주문 접수</button>
                             </>
                           )}
                            {order.status === '준비중' && (
                              <button onClick={() => updateOrderStatus(order.id, '픽업가능')} style={{ padding: '14px 28px', borderRadius: '12px', background: '#38bdf8', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer', fontSize: '15px', boxShadow: '0 4px 12px rgba(56, 189, 248, 0.2)' }}>준비 완료</button>
                            )}
                            {order.status === '픽업가능' && (
                              <button disabled style={{ padding: '14px 28px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid #38bdf8', fontWeight: '800', cursor: 'wait', fontSize: '15px' }}>배차 진행중...</button>
                            )}
                            {order.status === '배차 완료' && (
                              <button disabled style={{ padding: '14px 28px', borderRadius: '12px', background: '#e0e7ff', color: '#4338ca', border: 'none', fontWeight: '800', cursor: 'default', fontSize: '15px' }}>픽업 대기중</button>
                            )}
                           {order.status === '신규' && (
                             <button 
                               onClick={() => handleOpenRejectModal(order.id)}
                               style={{ padding: '14px 24px', borderRadius: '12px', background: 'white', border: '1px solid #cbd5e1', color: '#64748b', fontWeight: '800', cursor: 'pointer', fontSize: '15px' }}>거절</button>
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
                  <button onClick={() => setActiveTab('inventory')} style={{ color: '#ef4444', border: 'none', background: 'transparent', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>관리</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {products.filter(p => p.stock < lowStockThreshold).map((product) => (
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
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => setActiveTab('inventory')}
                    style={{ marginTop: '10px', padding: '12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '700', color: '#475569', cursor: 'pointer' }}>전체 상품 현황 보기</button>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="store-dashboard" style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
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
          { id: 'inventory', label: '재고 관리', icon: '📊' },
          { id: 'subscriptions', label: '구독 관리', icon: '💎' },
          { id: 'settlements', label: '매출 및 정산', icon: '📈' },
          { id: 'reviews', label: '리뷰 관리', icon: '⭐' },
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
        
        <div style={{ marginTop: 'auto', padding: '20px', backgroundColor: '#0f172a', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>고객센터 안내</div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#38bdf8' }}>1588-0000</div>
          <div style={{ fontSize: '11px', color: '#475569' }}>평일 09:00 ~ 18:00 운영</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content" style={{ flexGrow: 1, height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
        <div style={{ padding: '40px 40px 0 40px' }}>
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
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 40px 40px 40px' }}>
          {renderActiveView()}
        </div>
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
                <label style={{ display: 'block', marginBottom: '12px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>상품 이미지</label>
                <div 
                  onClick={() => document.getElementById('product-image-upload').click()}
                  style={{ 
                    width: '100%', height: '160px', borderRadius: '16px', border: '2px dashed #cbd5e1', 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                    backgroundColor: '#f8fafc', cursor: 'pointer', overflow: 'hidden', position: 'relative'
                  }}>
                  {productForm.imagePreview ? (
                    <img src={productForm.imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <>
                      <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>이미지 업로드 (클릭)</span>
                    </>
                  )}
                  <input 
                    id="product-image-upload"
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setProductForm({ ...productForm, imageFile: file, imagePreview: reader.result });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
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
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>할인율 (%)</label>
                  <input 
                    type="number" 
                    value={productForm.discountRate}
                    onChange={e => setProductForm({...productForm, discountRate: parseInt(e.target.value) || 0})}
                    placeholder="0"
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1' }} 
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>현재 재고</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      required
                      type="number" 
                      value={productForm.stock}
                      onChange={e => setProductForm({...productForm, stock: parseInt(e.target.value)})}
                      style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1' }} 
                    />
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#64748b' }}>개</span>
                  </div>
                </div>
              </div>
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
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>원산지</label>
                <input 
                  required
                  type="text" 
                  value={productForm.origin}
                  onChange={e => setProductForm({...productForm, origin: e.target.value})}
                  placeholder="예: 국내산, 칠레산 등"
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>상품 설명</label>
                <textarea 
                  required
                  value={productForm.description}
                  onChange={e => setProductForm({...productForm, description: e.target.value})}
                  placeholder="상품에 대한 상세 정보를 입력해주세요."
                  style={{ width: '100%', height: '100px', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', resize: 'none' }} 
                />
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
      {/* Subscription Modal */}
      {isSubscriptionModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '500px', borderRadius: '24px', padding: '40px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>
              {editingSubscription ? '구독 상품 수정' : '새 구독 상품 등록'}
            </h2>
            <form onSubmit={handleSaveSubscription} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Image Upload Removed (Feedback 3) */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>구독 상품명</label>
                <input 
                  required
                  type="text" 
                  value={subscriptionForm.name}
                  onChange={e => setSubscriptionForm({...subscriptionForm, name: e.target.value})}
                  placeholder="예: 우리집 신선 야채 팩"
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>구독 설명</label>
                <textarea 
                  required
                  rows="3"
                  value={subscriptionForm.description}
                  onChange={e => setSubscriptionForm({...subscriptionForm, description: e.target.value})}
                  placeholder="구독 상품의 구성과 혜택을 상세히 입력해주세요."
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', resize: 'none', fontFamily: 'inherit' }} 
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>구독 가격</label>
                  <input 
                    required
                    type="text" 
                    value={subscriptionForm.price}
                    onChange={e => setSubscriptionForm({...subscriptionForm, price: e.target.value})}
                    placeholder="19,900원"
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1' }} 
                  />
                </div>
                  {/* 구성 품목 수량 Removed (Feedback 6) */}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>주당 배송 횟수</label>
                  <input 
                    required
                    type="number" 
                    value={subscriptionForm.weeklyFreq}
                    readOnly
                    placeholder="0"
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#64748b' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>총 배송 횟수</label>
                  <input 
                    required
                    type="number" 
                    value={subscriptionForm.monthlyTotal}
                    onChange={e => setSubscriptionForm({...subscriptionForm, monthlyTotal: e.target.value})}
                    placeholder="4"
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1' }} 
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>배송 요일 설정</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['월', '화', '수', '목', '금', '토', '일'].map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        const days = subscriptionForm.deliveryDays.includes(day)
                          ? subscriptionForm.deliveryDays.filter(d => d !== day)
                          : [...subscriptionForm.deliveryDays, day];
                        setSubscriptionForm({ ...subscriptionForm, deliveryDays: days, weeklyFreq: days.length });
                      }}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: subscriptionForm.deliveryDays.includes(day) ? '#8b5cf6' : '#cbd5e1',
                        backgroundColor: subscriptionForm.deliveryDays.includes(day) ? '#f5f3ff' : 'white',
                        color: subscriptionForm.deliveryDays.includes(day) ? '#8b5cf6' : '#64748b',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>노출 상태</label>
                <select 
                  value={subscriptionForm.status}
                  disabled={!editingSubscription}
                  onChange={e => setSubscriptionForm({...subscriptionForm, status: e.target.value})}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: !editingSubscription ? '#f1f5f9' : 'white' }}
                >
                  <option value="운영중">운영중 (노출)</option>
                  <option value="숨김">숨김 (미노출)</option>
                  <option value="중지됨">중지됨</option>
                </select>
                {!editingSubscription && <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>* 신규 등록 시 기본 운영중으로 설정되며, 등록 후 목록에서 변경 가능합니다.</p>}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '12px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>구성 품목 선택 및 수량 ({subscriptionForm.selectedProducts.length})</label>
                <div style={{ 
                  maxHeight: '220px', 
                  overflowY: 'auto', 
                  border: '1px solid #cbd5e1', 
                  borderRadius: '12px', 
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  backgroundColor: '#f8fafc'
                }}>
                  {products.map(p => {
                    const selected = subscriptionForm.selectedProducts.find(sp => sp.id === p.id);
                    return (
                    <div 
                      key={p.id} 
                      onClick={() => {
                        const isSelected = !!selected;
                        const newList = isSelected
                          ? subscriptionForm.selectedProducts.filter(sp => sp.id !== p.id)
                          : [...subscriptionForm.selectedProducts, { id: p.id, qty: 1 }];
                        setSubscriptionForm({ ...subscriptionForm, selectedProducts: newList });
                      }}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        padding: '10px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: selected ? '#8b5cf6' : '#e2e8f0',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <input 
                        type="checkbox" 
                        checked={!!selected}
                        onChange={() => {}} // Controlled by div onClick
                        style={{ width: '18px', height: '18px', accentColor: '#8b5cf6', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '20px' }}>{p.img}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{p.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{p.price}</div>
                      </div>
                      
                      {selected && (
                        <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f5f3ff', padding: '4px 8px', borderRadius: '8px', border: '1px solid #ddd6fe' }}>
                           <input 
                             type="number"
                             min="1"
                             value={selected.qty}
                             onChange={(e) => {
                               const newQty = parseInt(e.target.value) || 1;
                               setSubscriptionForm({
                                 ...subscriptionForm,
                                 selectedProducts: subscriptionForm.selectedProducts.map(sp => sp.id === p.id ? { ...sp, qty: newQty } : sp)
                               });
                             }}
                             style={{ width: '40px', border: 'none', background: 'transparent', textAlign: 'center', fontWeight: '700', color: '#8b5cf6', fontSize: '13px', outline: 'none' }}
                           />
                           <span style={{ fontSize: '11px', color: '#7c3aed', fontWeight: '700' }}>개</span>
                        </div>
                      )}
                    </div>
                  )})}
                </div>
                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>* 구독 패키지에 포함될 각 상품과 그 수량을 입력해 주세요.</p>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button 
                  type="button"
                  onClick={() => setIsSubscriptionModalOpen(false)}
                  style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#f1f5f9', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                >취소</button>
                <button 
                  type="submit"
                  style={{ flex: 2, padding: '14px', borderRadius: '12px', background: '#8b5cf6', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' }}
                >{editingSubscription ? '수정 완료' : '구성 완료'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {isRejectModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
        }} onClick={() => setIsRejectModalOpen(false)}>
          <div style={{
            background: 'white', width: '100%', maxWidth: '400px', borderRadius: '24px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>주문 거절 사유 선택</h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>주문을 거절하시는 사유를 선택해주세요. 고객에게 알림이 전송됩니다.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              {['재고 부족', '영업 종료', '배달 불가 지역', '기타 사유'].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setRejectReason(reason)}
                  style={{
                    padding: '16px', borderRadius: '12px', border: '2px solid',
                    borderColor: rejectReason === reason ? 'var(--primary)' : '#f1f5f9',
                    background: rejectReason === reason ? 'rgba(46, 204, 113, 0.05)' : 'white',
                    color: rejectReason === reason ? 'var(--primary)' : '#475569',
                    fontWeight: '700', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setIsRejectModalOpen(false)}
                style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#f1f5f9', border: 'none', fontWeight: '700', cursor: 'pointer' }}
              >취소</button>
              <button 
                onClick={handleConfirmReject}
                style={{ flex: 2, padding: '14px', borderRadius: '12px', background: '#ef4444', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}
              >거절 확정</button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {isReportModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
        }} onClick={() => setIsReportModalOpen(false)}>
          <div style={{
            background: 'white', width: '100%', maxWidth: '450px', borderRadius: '24px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>신고하기</h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
              {selectedOrder ? `주문번호 #${selectedOrder.id} 관련 신고` : '신고 내용을 입력해주세요.'}
            </p>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>신고 대상</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setReportTarget('RIDER')}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '12px', border: reportTarget === 'RIDER' ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                    background: reportTarget === 'RIDER' ? '#f0fdf4' : 'white', color: reportTarget === 'RIDER' ? 'var(--primary)' : '#64748b', fontWeight: '700', cursor: 'pointer'
                  }}
                >
                  🛵 배달원
                </button>
                <button
                  onClick={() => setReportTarget('CUSTOMER')}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '12px', border: reportTarget === 'CUSTOMER' ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                    background: reportTarget === 'CUSTOMER' ? '#f0fdf4' : 'white', color: reportTarget === 'CUSTOMER' ? 'var(--primary)' : '#64748b', fontWeight: '700', cursor: 'pointer'
                  }}
                >
                  👤 고객
                </button>
              </div>
            </div>


            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>신고 내용</label>
              <textarea
                value={reportContent}
                onChange={(e) => setReportContent(e.target.value)}
                placeholder="상세한 신고 내용을 입력해주세요."
                style={{ width: '100%', height: '100px', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setIsReportModalOpen(false)}
                style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#f1f5f9', border: 'none', fontWeight: '700', cursor: 'pointer' }}
              >취소</button>
              <button 
                onClick={handleSubmitReport}
                style={{ flex: 2, padding: '14px', borderRadius: '12px', background: '#ef4444', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}
              >🚨 신고하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreDashboard;
