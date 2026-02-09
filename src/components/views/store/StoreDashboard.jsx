import React, { useState, useEffect } from 'react';
import { subscriptionProductApi } from '../../../config/api';
import {
  KO_TO_NUM,
  STATUS_TO_KO,
  KO_TO_STATUS,
  mapApiToSub,
  getSubscriptionHeaders,
  parsePriceValue,
  formatCurrency,
  getPriceDisplay,
  getApiBase,
  getStatusColor,
} from './utils/storeDashboardUtils';
import OrdersTab from './tabs/OrdersTab';
import DashboardTab from './tabs/DashboardTab';
import SettlementsTab from './tabs/SettlementsTab';
import ProductsTab from './tabs/ProductsTab';
import InventoryTab from './tabs/InventoryTab';
import SubscriptionsTab from './tabs/SubscriptionsTab';
import SettingsTab from './tabs/SettingsTab';
import ReviewsTab from './tabs/ReviewsTab';
import OrderDetailModal from './modals/OrderDetailModal';
import SettlementDetailModal from './modals/SettlementDetailModal';
import ProductModal from './modals/ProductModal';
import SubscriptionModal from './modals/SubscriptionModal';
import RejectModal from './modals/RejectModal';
import ReportModal from './modals/ReportModal';

const StoreDashboard = ({ userInfo = { userId: 2 } }) => {
  const createEmptyProductForm = () => ({
    name: '',
    price: '',
    capacity: 0,
    categoryId: 1,
    category: '채소',
    origin: '',
    description: '',
    imageFile: null,
    imagePreview: null,
    discountRate: 0,
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [productsLoading, setProductsLoading] = useState(false);
  const [inventoryStats, setInventoryStats] = useState(null);
  const [inventoryHistory, setInventoryHistory] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [productError, setProductError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [canEditProduct, setCanEditProduct] = useState(true);
  const [canEditReason, setCanEditReason] = useState('');
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [orderSubTab, setOrderSubTab] = useState('management');
  const [mgmtFilter, setMgmtFilter] = useState('unhandled');
  const [lowStockThreshold, setLowStockThreshold] = useState(10); // Changed to quantity
  const [inventorySearchKeyword, setInventorySearchKeyword] = useState('');
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [popularProductTab, setPopularProductTab] = useState('ordered'); // 'ordered' or 'subscription'
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [selectedSettlementPeriod, setSelectedSettlementPeriod] = useState('2026년 1월');
  const [isPeriodSelectorOpen, setIsPeriodSelectorOpen] = useState(false);
  const [stockAdjustValues, setStockAdjustValues] = useState({});

  // --- Restored Missing States ---
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  const [products, setProducts] = useState([]);

  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState(() => createEmptyProductForm());

  const [subscriptions, setSubscriptions] = useState([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);
  const [subscriptionsError, setSubscriptionsError] = useState(null);
  const [deliverySchedule, setDeliverySchedule] = useState(null);
  const [deliveryScheduleLoading, setDeliveryScheduleLoading] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [subscriptionForm, setSubscriptionForm] = useState({ name: '', price: '', weeklyFreq: 1, monthlyTotal: 4, deliveryDays: [], description: '', selectedProducts: [] });
  const [expandedSubscriptions, setExpandedSubscriptions] = useState(new Set());
  
  const [userSubscriptions, setUserSubscriptions] = useState([
    { id: 1, userName: '김철수', productName: '신선 채소 꾸러미', startDate: '2026-01-10', status: 'APPROVED', deliveryStatus: 'DELIVERED', nextDelivery: '2026-02-01' },
    { id: 2, userName: '이영희', productName: '제철 과일 꾸러미', startDate: '2026-01-15', status: 'PENDING', deliveryStatus: 'PENDING', nextDelivery: '2026-01-28' },
    { id: 3, userName: '박민수', productName: '단백질 식단 세트', startDate: '2025-12-20', status: 'SUSPENDED', deliveryStatus: '-', nextDelivery: '-' },
    { id: 4, userName: '최지우', productName: '다이어트 샐러드 팩', startDate: '2026-01-25', status: 'REJECTED', deliveryStatus: '-', nextDelivery: '-' },
  ]);

  const [reviews, setReviews] = useState([
    { id: 1, userName: '김철수', rating: 5, content: '배송이 정말 빨라요! 우유도 아주 신선합니다.', date: '2026-01-20', productName: '유기농 우유 1L', reply: null },
    { id: 2, userName: '이영희', rating: 4, content: '채소들이 싱싱해서 좋아요. 다음에도 이용할게요.', date: '2026-01-18', productName: '대추토마토 500g', reply: '구매해주셔서 감사합니다! 항상 신선한 상품으로 보답하겠습니다.' },
    { id: 3, userName: '박민수', rating: 3, content: '달걀 하나가 살짝 금이 가 있었어요. 주의 부탁드려요.', date: '2026-01-15', productName: '신선란 10구', reply: null },
  ]);
  const [replyInput, setReplyInput] = useState({});

  const mapProductFromApi = (p) => {
    if (!p || (p.productId == null && p.product_id == null)) return null;
    const id = p.productId ?? p.product_id;
    const stock = p.stock ?? 0;
    const capacity = Math.max(stock, 100);
    return {
      id,
      name: p.productName ?? p.product_name ?? '',
      price: p.price ?? 0,
      stock,
      capacity,
      category: p.categoryName ?? p.category_name ?? '',
      categoryId: p.categoryId ?? p.category_id,
      img: p.productImageUrl ?? p.product_image_url ?? null,
      isSoldOut: (p.isActive ?? p.is_active ?? p.active) === false,
      discountRate: p.discountRate ?? p.discount_rate ?? 0,
      origin: p.origin ?? '',
      description: p.description ?? '',
    };
  };

  const fetchMyProducts = async () => {
    setProductsLoading(true);
    setProductError(null);
    try {
      const base = getApiBase();
      const res = await fetch(`${base}/api/products/my?page=0&size=100`, { credentials: 'include' });
      if (!res.ok) throw new Error('상품 목록 조회 실패');
      const json = await res.json();
      const raw = json.data;
      const list = Array.isArray(raw) ? raw : (raw?.content ?? []);
      const arr = Array.isArray(list) ? list : [];
      setProducts(arr.map(mapProductFromApi).filter(Boolean));
    } catch (e) {
      setProductError(e.message || '상품 목록을 불러오지 못했습니다.');
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchInventoryStats = async () => {
    setInventoryLoading(true);
    try {
      const base = getApiBase();
      const res = await fetch(`${base}/api/products/my/stats`, { credentials: 'include' });
      if (!res.ok) throw new Error('통계 조회 실패');
      const json = await res.json();
      setInventoryStats(json.data);
    } catch {
      setInventoryStats(null);
    } finally {
      setInventoryLoading(false);
    }
  };

  const fetchStockHistories = async () => {
    try {
      const base = getApiBase();
      const res = await fetch(`${base}/api/products/my/stock-histories?page=0&size=50`, { credentials: 'include' });
      if (!res.ok) return;
      const json = await res.json();
      const content = json.data?.content ?? json.data ?? [];
      const list = Array.isArray(content) ? content : [];
      setInventoryHistory(list.map((h) => ({
        id: h.historyId,
        type: h.eventType === 'IN' ? '입고' : '출고',
        productName: h.productName,
        amount: h.quantity,
        date: h.createdAt ? new Date(h.createdAt).toLocaleString('ko-KR') : '',
        remaining: h.stockAfter,
      })));
    } catch {
      setInventoryHistory([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const base = getApiBase();
      const res = await fetch(`${base}/api/products/categories`);
      if (!res.ok) return;
      const json = await res.json();
      const list = json.data;
      setCategories(Array.isArray(list) ? list : []);
    } catch {
      setCategories([]);
    }
  };

  const fetchProductDetail = async (productId) => {
    try {
      const base = getApiBase();
      const res = await fetch(`${base}/api/products/${productId}`);
      if (!res.ok) throw new Error('상품 상세 조회 실패');
      const json = await res.json();
      return json.data;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const fetchCanEditProduct = async () => {
    try {
      const base = getApiBase();
      const res = await fetch(`${base}/api/products/my/can-edit`, { credentials: 'include' });
      if (!res.ok) return;
      const json = await res.json();
      const d = json.data;
      if (d && typeof d.canEdit === 'boolean') {
        setCanEditProduct(d.canEdit);
        setCanEditReason(d.reason ?? '');
      }
    } catch {
      setCanEditProduct(true);
      setCanEditReason('');
    }
  };

  useEffect(() => {
    fetchMyProducts();
    fetchCategories();
    fetchCanEditProduct();
  }, []);

  useEffect(() => {
    const base = getApiBase();
    fetch(`${base}/api/stores/my`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(json => {
        const d = json?.data;
        if (d?.storeName != null) {
          setStoreInfo(prev => ({ ...prev, name: d.storeName, category: d.categoryName || prev.category }));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTab === 'inventory') {
      fetchInventoryStats();
      fetchStockHistories();
    }
    if (activeTab === 'products') {
      fetchCanEditProduct();
    }
  }, [activeTab]);

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

  const fetchSubscriptions = async () => {
    setSubscriptionsLoading(true);
    setSubscriptionsError(null);
    try {
      const res = await fetch(subscriptionProductApi.list(), {
        credentials: 'include',
        headers: getSubscriptionHeaders(),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message || json?.message || '구독 목록 조회 실패');
      }
      const list = Array.isArray(json.data) ? json.data : [];
      setSubscriptions(list.map(mapApiToSub));
    } catch (e) {
      const msg = e?.message || '';
      const isConnectionError = /failed to fetch|network error|connection refused|err_connection_refused/i.test(msg) || e?.name === 'TypeError';
      setSubscriptionsError(
        isConnectionError
          ? '서버에 연결할 수 없습니다. 백엔드 서버(localhost:8080)가 실행 중인지 확인해 주세요.'
          : (msg || '구독 목록을 불러오지 못했습니다.')
      );
      setSubscriptions([]);
    } finally {
      setSubscriptionsLoading(false);
    }
  };

  const fetchDeliverySchedule = async () => {
    setDeliveryScheduleLoading(true);
    try {
      const res = await fetch(subscriptionProductApi.deliverySchedule(), {
        credentials: 'include',
        headers: getSubscriptionHeaders(),
      });
      const json = await res.json();
      if (res.ok && json.success) setDeliverySchedule(json.data);
      else setDeliverySchedule(null);
    } catch {
      setDeliverySchedule(null);
    } finally {
      setDeliveryScheduleLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'subscriptions') {
      fetchSubscriptions();
      fetchDeliverySchedule();
    }
  }, [activeTab]);

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


  const [storeInfo, setStoreInfo] = useState({
    name: '상점',
    category: '',
    img: null
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

  const updateOrderStatus = (id, newStatus, rejectionReason = null) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus, ...(rejectionReason != null && { rejectionReason }) } : o));
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

  const handleOpenProductModal = async (product = null) => {
    setProductError(null);
    await fetchCategories();
    if (product) {
      setEditingProduct(product);
      const detail = await fetchProductDetail(product.id);
      if (detail) {
        setProductForm({
          name: detail.productName || '',
          price: detail.price ?? '',
          capacity: product.capacity || 0,
          categoryId: detail.categoryId ?? product.categoryId ?? 1,
          category: detail.categoryName || product.category || '채소',
          origin: detail.origin || '',
          description: detail.description || '',
          imageFile: null,
          imagePreview: detail.productImageUrl || product.img || null,
          discountRate: detail.discountRate ?? 0,
        });
      } else {
        setProductForm({
          name: product.name || '',
          price: product.price ?? '',
          capacity: product.capacity || 0,
          categoryId: product.categoryId ?? 1,
          category: product.category || '채소',
          origin: product.origin || '',
          description: product.description || '',
          imageFile: null,
          imagePreview: product.img || null,
          discountRate: product.discountRate ?? 0,
        });
      }
    } else {
      setEditingProduct(null);
      setProductForm(createEmptyProductForm());
    }
    setIsProductModalOpen(true);
  };

  const uploadProductImage = async (file) => {
    const base = getApiBase();
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${base}/api/storage/store/image?type=PRODUCT`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok) {
      const message = json?.error?.message || json?.message || json?.data?.message || '이미지 업로드 실패';
      throw new Error(message);
    }
    return json.data;
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (editingProduct && !canEditProduct) {
      alert(canEditReason || '현재는 상품 수정, 삭제가 불가합니다. (운영시간 종료 후 가능)');
      return;
    }
    const base = getApiBase();
    const priceNum = parsePriceValue(productForm.price);

    let imageUrl = '';
    if (productForm.imageFile) {
      try {
        imageUrl = await uploadProductImage(productForm.imageFile);
      } catch (err) {
        alert(err.message || '이미지 업로드에 실패했습니다.');
        return;
      }
    } else if (editingProduct && productForm.imagePreview && productForm.imagePreview.startsWith('http')) {
      imageUrl = productForm.imagePreview;
    }

    const body = {
      productName: productForm.name,
      description: productForm.description || '',
      price: priceNum,
      discountRate: productForm.discountRate ?? 0,
      origin: productForm.origin || '',
      productImageUrl: imageUrl,
    };
    if (editingProduct) {
      body.categoryId = productForm.categoryId;
      try {
        const res = await fetch(`${base}/api/products/${editingProduct.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          credentials: 'include',
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || json.code || '상품 수정 실패');
        await fetchMyProducts();
        setIsProductModalOpen(false);
      } catch (err) {
        alert(err.message || '상품 수정에 실패했습니다.');
      }
    } else {
      body.categoryId = productForm.categoryId;
      try {
        const res = await fetch(`${base}/api/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          credentials: 'include',
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || json.message || json.error?.code || '상품 등록 실패');
        await fetchMyProducts();
        setIsProductModalOpen(false);
      } catch (err) {
        alert(err.message || '상품 등록에 실패했습니다.');
      }
    }
  };

  const deleteProduct = async (id) => {
    if (!canEditProduct) {
      alert(canEditReason || '현재는 상품 수정, 삭제가 불가합니다. (운영시간 종료 후 가능)');
      return;
    }
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const base = getApiBase();
    try {
      const res = await fetch(`${base}/api/products/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || '삭제 실패');
      }
      await fetchMyProducts();
    } catch (err) {
      alert(err.message || '삭제에 실패했습니다.');
    }
  };

  const toggleSoldOut = async (id) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const nextActive = product.isSoldOut;
    const base = getApiBase();
    try {
      const res = await fetch(`${base}/api/products/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextActive }),
        credentials: 'include',
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || '판매 상태 변경 실패');
      }
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isSoldOut: !nextActive } : p)));
      await fetchMyProducts();
      await fetchInventoryStats();
    } catch (err) {
      alert(err.message || '판매 상태 변경에 실패했습니다.');
    }
  };

  const handleStockAdjust = async (id, amount) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    if (amount < 0 && Math.abs(amount) > product.stock) {
      alert('현재고보다 많은 수량을 출고할 수 없습니다.');
      return;
    }
    const base = getApiBase();
    const isIn = amount > 0;
    try {
      const res = await fetch(`${base}/api/products/${id}/${isIn ? 'stock-in' : 'stock-out'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: Math.abs(amount) }),
        credentials: 'include',
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || (isIn ? '입고' : '출고') + ' 실패');
      }
      await fetchMyProducts();
      if (activeTab === 'inventory') {
        await fetchStockHistories();
        await fetchInventoryStats();
      }
    } catch (err) {
      alert(err.message || (isIn ? '입고' : '출고') + '에 실패했습니다.');
    }
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

  const handleSaveSubscription = async (e) => {
    e.preventDefault();
    const priceNum = parseInt(String(subscriptionForm.price).replace(/[^0-9]/g, ''), 10) || 0;
    const items = (subscriptionForm.selectedProducts || []).map((sp) => ({
      productId: Number(sp.id),
      quantity: sp.qty || 1,
    }));
    if (items.length === 0) {
      alert('구성 품목을 1개 이상 선택해주세요.');
      return;
    }
    const deliveryDays = subscriptionForm.deliveryDays || [];
    const daysOfWeek = deliveryDays.map((d) => KO_TO_NUM[d]).filter((n) => n !== undefined);
    const body = {
      name: subscriptionForm.name,
      description: subscriptionForm.description || '',
      price: priceNum,
      totalDeliveryCount: (subscriptionForm.weeklyFreq ?? (subscriptionForm.deliveryDays || []).length ?? 0) * 4 || 4,
      items,
      daysOfWeek,
    };
    try {
      const url = editingSubscription
        ? subscriptionProductApi.update(editingSubscription.id)
        : subscriptionProductApi.create();
      const method = editingSubscription ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: getSubscriptionHeaders(),
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message || json?.message || (editingSubscription ? '수정' : '등록') + ' 실패');
      }
      const saved = mapApiToSub(json.data);
      setSubscriptions((prev) => {
        if (editingSubscription) {
          return prev.map((s) => (s.id === editingSubscription.id ? saved : s));
        }
        return [saved, ...prev];
      });
      setIsSubscriptionModalOpen(false);
    } catch (err) {
      alert(err.message || '처리 중 오류가 발생했습니다.');
    }
  };

  const deleteSubscription = async (sub) => {
    const id = sub?.id ?? sub;
    if (sub?.status === '삭제 예정' && sub?.subscribers === 0) {
      if (!confirm('구독자가 없습니다. 즉시 삭제하시겠습니까?')) return;
      try {
        const res = await fetch(subscriptionProductApi.deleteImmediately(id), {
          method: 'DELETE',
          credentials: 'include',
          headers: getSubscriptionHeaders(),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json?.error?.message || json?.message || '삭제 실패');
        setSubscriptions((prev) => prev.filter((s) => s.id !== id));
      } catch (err) {
        alert(err.message || '삭제 중 오류가 발생했습니다.');
      }
      return;
    }
    if (sub?.status !== '숨김') return;
    if (!confirm('구독 상품을 삭제하시겠습니까? (구독자가 있으면 삭제 예정으로 전환됩니다)')) return;
    try {
      const res = await fetch(subscriptionProductApi.requestDeletion(id), {
        method: 'PATCH',
        credentials: 'include',
        headers: getSubscriptionHeaders(),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error?.message || json?.message || '삭제 요청 실패');
      if (json.data == null) {
        setSubscriptions((prev) => prev.filter((s) => s.id !== id));
      } else {
        setSubscriptions((prev) => prev.map((s) => (s.id === id ? mapApiToSub(json.data) : s)));
      }
    } catch (err) {
      alert(err.message || '삭제 요청 중 오류가 발생했습니다.');
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

  const sendSubscriptionNotification = async (sub) => {
    if (sub.status !== '삭제 예정') {
      alert('구독자 알림은 삭제 예정 상태인 구독 상품에만 발송할 수 있습니다.');
      return;
    }
    try {
      const res = await fetch(subscriptionProductApi.notifySubscribers(sub.id), {
        method: 'POST',
        credentials: 'include',
        headers: getSubscriptionHeaders(),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error?.message || json?.message || '알림 발송 실패');
      const count = json?.data?.notifiedCount ?? 0;
      alert(`[${sub.name}] 구독자 ${count}명에게 삭제 예정 알림(SSE)을 발송했습니다.`);
    } catch (err) {
      alert(err.message || '알림 발송 중 오류가 발생했습니다.');
    }
  };

  const handleConfirmReject = () => {
    if (selectedOrder) {
      updateOrderStatus(selectedOrder.id, '거절됨', rejectReason || '기타 사유');
      setIsRejectModalOpen(false);
      setSelectedOrder(null);
      setRejectReason('');
    }
  };

  const handleReplyReview = (reviewId) => {
    const reply = replyInput[reviewId];
    if (!reply || !reply.trim()) return;
    
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, reply } : r));
    setReplyInput(prev => ({ ...prev, [reviewId]: '' }));
    alert('답변이 등록되었습니다.');
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
        return (
          <OrdersTab
            orders={orders}
            orderSubTab={orderSubTab}
            setOrderSubTab={setOrderSubTab}
            mgmtFilter={mgmtFilter}
            setMgmtFilter={setMgmtFilter}
            expandedOrders={expandedOrders}
            onToggleExpand={handleToggleExpand}
            onSelectOrder={setSelectedOrder}
            onOpenReportModal={handleOpenReportModal}
          />
        );
      case 'settlements':
        return (
          <SettlementsTab
            selectedSettlementPeriod={selectedSettlementPeriod}
            setSelectedSettlementPeriod={setSelectedSettlementPeriod}
            isPeriodSelectorOpen={isPeriodSelectorOpen}
            setIsPeriodSelectorOpen={setIsPeriodSelectorOpen}
          />
        );
      case 'products':
        return (
          <ProductsTab
            products={products}
            productsLoading={productsLoading}
            productError={productError}
            canEditProduct={canEditProduct}
            canEditReason={canEditReason}
            lowStockThreshold={lowStockThreshold}
            handleOpenProductModal={handleOpenProductModal}
            fetchMyProducts={fetchMyProducts}
            deleteProduct={deleteProduct}
          />
        );
      case 'inventory':
        return (
          <InventoryTab
            products={products}
            inventoryStats={inventoryStats}
            inventoryHistory={inventoryHistory}
            inventoryLoading={inventoryLoading}
            lowStockThreshold={lowStockThreshold}
            inventorySearchKeyword={inventorySearchKeyword}
            stockAdjustValues={stockAdjustValues}
            setLowStockThreshold={setLowStockThreshold}
            setInventorySearchKeyword={setInventorySearchKeyword}
            setStockAdjustValues={setStockAdjustValues}
            handleStockAdjust={handleStockAdjust}
            toggleSoldOut={toggleSoldOut}
          />
        );
      case 'subscriptions':
        return (
          <SubscriptionsTab
            subscriptions={subscriptions}
            subscriptionsLoading={subscriptionsLoading}
            subscriptionsError={subscriptionsError}
            deliverySchedule={deliverySchedule}
            deliveryScheduleLoading={deliveryScheduleLoading}
            fetchDeliverySchedule={fetchDeliverySchedule}
            products={products}
            expandedSubscriptions={expandedSubscriptions}
            handleToggleSubscriptionExpand={handleToggleSubscriptionExpand}
            handleOpenSubscriptionModal={handleOpenSubscriptionModal}
            deleteSubscription={deleteSubscription}
            sendSubscriptionNotification={sendSubscriptionNotification}
            setSubscriptions={setSubscriptions}
            fetchSubscriptions={fetchSubscriptions}
          />
        );
      case 'settings':
        return (
          <SettingsTab
            storeInfo={storeInfo}
            setStoreInfo={setStoreInfo}
            businessHours={businessHours}
            handleBusinessHourChange={handleBusinessHourChange}
          />
        );
      case 'reviews':
        return (
          <ReviewsTab
            reviews={reviews}
            replyInput={replyInput}
            setReplyInput={setReplyInput}
            handleReplyReview={handleReplyReview}
          />
        );
      default:
        return (
          <DashboardTab
            orders={orders}
            products={products}
            lowStockThreshold={lowStockThreshold}
            expandedOrders={expandedOrders}
            currentTime={currentTime}
            setActiveTab={setActiveTab}
            handleToggleExpand={handleToggleExpand}
            updateOrderStatus={updateOrderStatus}
            updatePrepTime={updatePrepTime}
            handleOpenRejectModal={handleOpenRejectModal}
            toggleSoldOut={toggleSoldOut}
          />
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

      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}

      {selectedSettlement && (
        <SettlementDetailModal settlement={selectedSettlement} onClose={() => setSelectedSettlement(null)} />
      )}

      {isProductModalOpen && (
        <ProductModal
          editingProduct={editingProduct}
          productForm={productForm}
          setProductForm={setProductForm}
          categories={categories}
          canEditProduct={canEditProduct}
          onSave={handleSaveProduct}
          onClose={() => setIsProductModalOpen(false)}
        />
      )}

      {isSubscriptionModalOpen && (
        <SubscriptionModal
          editingSubscription={editingSubscription}
          subscriptionForm={subscriptionForm}
          setSubscriptionForm={setSubscriptionForm}
          products={products}
          onSave={handleSaveSubscription}
          onClose={() => setIsSubscriptionModalOpen(false)}
        />
      )}

      {isRejectModalOpen && (
        <RejectModal
          rejectReason={rejectReason}
          setRejectReason={setRejectReason}
          onConfirm={handleConfirmReject}
          onClose={() => setIsRejectModalOpen(false)}
        />
      )}

      {isReportModalOpen && (
        <ReportModal
          order={selectedOrder}
          reportTarget={reportTarget}
          setReportTarget={setReportTarget}
          reportContent={reportContent}
          setReportContent={setReportContent}
          onSubmit={handleSubmitReport}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}
    </div>
  );
};

export default StoreDashboard;
