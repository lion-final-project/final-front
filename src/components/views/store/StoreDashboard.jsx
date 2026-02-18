import React, { useState, useEffect, useRef } from 'react';
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
  mapStoreOrderToDisplay,
  mapCompletedStoreOrderToDisplay,
} from './utils/storeDashboardUtils';
import { getNewOrders, getCompletedOrders, getOrderHistory, acceptOrder, completePreparation, rejectOrder, getMonthlySales } from '../../../api/storeOrderApi';
import { getBusinessHours, updateBusinessHours, updateDeliveryAvailable } from '../../../api/storeApi';
import OrdersTab from './tabs/OrdersTab';
import DashboardTab from './tabs/DashboardTab';
import SettlementsTab from './tabs/SettlementsTab';
import ProductsTab from './tabs/ProductsTab';
import InventoryTab from './tabs/InventoryTab';
import SubscriptionsTab from './tabs/SubscriptionsTab';
import SettingsTab from './tabs/SettingsTab';
import ReviewsTab from './tabs/ReviewsTab';
import SettlementDetailModal from './modals/SettlementDetailModal';
import ProductModal from './modals/ProductModal';
import SubscriptionModal from './modals/SubscriptionModal';
import RejectModal from './modals/RejectModal';
import ReportModal from './modals/ReportModal';

const DAY_NAMES = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
const FRONTEND_DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // 프론트 표시 순서: 월~일 → dayOfWeek

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
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const settlementPeriodLabel = (y, m) => `${y}년 ${m}월`;
  const defaultPeriod = settlementPeriodLabel(currentYear, currentMonth);
  const [selectedSettlementPeriod, setSelectedSettlementPeriod] = useState(defaultPeriod);
  const [isPeriodSelectorOpen, setIsPeriodSelectorOpen] = useState(false);
  const [salesData, setSalesData] = useState(null);
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesError, setSalesError] = useState(null);
  const settlementPeriodOptions = (() => {
    const list = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(currentYear, currentMonth - 1 - i, 1);
      list.push(settlementPeriodLabel(d.getFullYear(), d.getMonth() + 1));
    }
    return list;
  })();
  const [stockAdjustValues, setStockAdjustValues] = useState({});

  // --- Restored Missing States ---
  const [acceptingOrderId, setAcceptingOrderId] = useState(null);
  const [completingOrderId, setCompletingOrderId] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [customRejectReason, setCustomRejectReason] = useState('');
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
  const [subscriptionForm, setSubscriptionForm] = useState({
    name: '',
    price: '',
    weeklyFreq: 1,
    monthlyTotal: 4,
    deliveryDays: [],
    description: '',
    selectedProducts: [],
    imageFile: null,
    imagePreview: null,
  });
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

  const fetchNewOrders = async () => {
    setOrdersLoading(true);
    try {
      const list = await getNewOrders();
      const mapped = list.map(mapStoreOrderToDisplay);
      setOrders(mapped);
    } catch (e) {
      console.error('신규 주문 조회 실패:', e);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchCompletedOrders = async () => {
    setCompletedOrdersLoading(true);
    try {
      const list = await getCompletedOrders();
      const mapped = list.map(mapCompletedStoreOrderToDisplay);
      setCompletedOrders(mapped);
    } catch (e) {
      console.error('완료 주문 조회 실패:', e);
      setCompletedOrders([]);
    } finally {
      setCompletedOrdersLoading(false);
    }
  };

  const fetchHistoryOrders = async (page = 0) => {
    setHistoryLoading(true);
    try {
      const result = await getOrderHistory(page, 20);
      const mapped = (result.content ?? []).map(mapCompletedStoreOrderToDisplay);
      setHistoryOrders(mapped);
      setHistoryPage(result.number ?? 0);
      setHistoryTotalPages(result.totalPages ?? 0);
      setHistoryTotalElements(result.totalElements ?? 0);
    } catch (e) {
      console.error('주문 내역 조회 실패:', e);
      setHistoryOrders([]);
    } finally {
      setHistoryLoading(false);
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
        if (d?.isDeliveryAvailable !== undefined) {
          setIsStoreOpen(!!d.isDeliveryAvailable);
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
    if (activeTab === 'dashboard') {
      fetchNewOrders();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'orders' && mgmtFilter === 'handled') {
      fetchCompletedOrders();
    }
  }, [activeTab, mgmtFilter]);

  useEffect(() => {
    if (activeTab === 'orders' && orderSubTab === 'history') {
      fetchHistoryOrders(0);
    }
  }, [activeTab, orderSubTab]);

  const fetchMonthlySales = React.useCallback(async () => {
    const match = selectedSettlementPeriod && selectedSettlementPeriod.match(/(\d+)\s*년\s*(\d+)\s*월/);
    if (!match) return;
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    setSalesLoading(true);
    setSalesError(null);
    try {
      const data = await getMonthlySales(year, month);
      setSalesData(data);
    } catch (err) {
      console.error('월별 매출 조회 실패:', err);
      setSalesError(err?.response?.data?.error?.message || err?.message || '매출 정보를 불러오지 못했습니다.');
      setSalesData(null);
    } finally {
      setSalesLoading(false);
    }
  }, [selectedSettlementPeriod]);

  useEffect(() => {
    if (activeTab === 'settlements') {
      fetchMonthlySales();
    }
  }, [activeTab, fetchMonthlySales]);

  // currentTime만 갱신 (자동 거절 / 준비시간 카운트다운 표시용). 실제 자동 거절은 백엔드 스케줄러에서 처리.
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // SSE 신규 주문 수신 시 목록 실시간 갱신
  const fetchNewOrdersRef = useRef(fetchNewOrders);
  fetchNewOrdersRef.current = fetchNewOrders;
  useEffect(() => {
    const handler = () => {
      fetchNewOrdersRef.current();
    };
    window.addEventListener('store-order-created', handler);
    window.addEventListener('store-order-updated', handler);
    return () => {
      window.removeEventListener('store-order-created', handler);
      window.removeEventListener('store-order-updated', handler);
    };
  }, []);

  // SSE 누락 대비: 탭 포커스 시 대시보드면 신규 주문 재조회
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && activeTabRef.current === 'dashboard') {
        fetchNewOrdersRef.current();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  // SSE 누락 대비: 대시보드 탭일 때 60초마다 신규 주문 목록 폴링
  const POLL_INTERVAL_MS = 60 * 1000;
  useEffect(() => {
    if (activeTab !== 'dashboard') return;
    const timer = setInterval(() => {
      fetchNewOrdersRef.current();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [activeTab]);

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
  const [businessHoursLoading, setBusinessHoursLoading] = useState(false);
  const [businessHoursSaving, setBusinessHoursSaving] = useState(false);

  useEffect(() => {
    if (activeTab !== 'settings') return;
    let cancelled = false;
    setBusinessHoursLoading(true);
    getBusinessHours()
      .then((list) => {
        if (cancelled || !Array.isArray(list) || list.length === 0) return;
        const byDay = list.reduce((acc, bh) => {
          acc[bh.dayOfWeek] = bh;
          return acc;
        }, {});
        const ordered = FRONTEND_DAY_ORDER.map((dayOfWeek) => {
          const bh = byDay[dayOfWeek];
          const dayName = DAY_NAMES[dayOfWeek];
          if (!bh) return { day: dayName, open: '09:00', close: '22:00', lastOrder: '21:30', isClosed: false };
          return {
            day: dayName,
            open: bh.openTime || '09:00',
            close: bh.closeTime || '22:00',
            lastOrder: '21:30',
            isClosed: bh.isClosed ?? false,
          };
        });
        setBusinessHours(ordered);
      })
      .catch(() => { if (!cancelled) setBusinessHours([]); })
      .finally(() => { if (!cancelled) setBusinessHoursLoading(false); });
    return () => { cancelled = true; };
  }, [activeTab]);

  const handleBusinessHourChange = (index, field, value) => {
    const updated = [...businessHours];
    updated[index] = { ...updated[index], [field]: value };
    setBusinessHours(updated);
  };

  const handleSaveBusinessHours = async () => {
    setBusinessHoursSaving(true);
    try {
      const payload = businessHours.map((bh, idx) => ({
        dayOfWeek: FRONTEND_DAY_ORDER[idx],
        openTime: bh.open || '09:00',
        closeTime: bh.close || '22:00',
        isClosed: bh.isClosed ?? false,
      }));
      await updateBusinessHours(payload);
      alert('영업시간이 저장되었습니다.');
    } catch (e) {
      const msg = e?.response?.data?.error?.message ?? e?.message ?? '영업시간 저장에 실패했습니다.';
      alert(msg);
    } finally {
      setBusinessHoursSaving(false);
    }
  };


  const [storeInfo, setStoreInfo] = useState({
    name: '상점',
    category: '',
    img: null
  });
  
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [completedOrdersLoading, setCompletedOrdersLoading] = useState(false);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyTotalPages, setHistoryTotalPages] = useState(0);
  const [historyTotalElements, setHistoryTotalElements] = useState(0);

  // TTL 기반: 상태 변경은 백엔드에서 처리. 카운트다운 0 되면 목록만 재조회(오차 보정)
  const countdownZeroFetchedRef = React.useRef(new Set());
  useEffect(() => {
    if (activeTab !== 'dashboard') return;
    const now = Date.now();
    let shouldFetch = false;
    for (const o of orders) {
      const alreadyFetched = countdownZeroFetchedRef.current.has(o.id);
      const rejectDeadline = o.status === '신규' && o.createdAt != null && o.createdAt + 5 * 60 * 1000 <= now;
      const readyDeadline = o.status === '준비중' && o.readyAt != null && o.readyAt <= now;
      if ((rejectDeadline || readyDeadline) && !alreadyFetched) {
        countdownZeroFetchedRef.current.add(o.id);
        shouldFetch = true;
      }
    }
    if (shouldFetch) {
      fetchNewOrdersRef.current();
    }
  }, [activeTab, orders, currentTime]);

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

  const handleAcceptOrder = async (storeOrderId, prepTime) => {
    const prep = Math.min(25, Math.max(5, Number(prepTime) || 10));
    setAcceptingOrderId(storeOrderId);
    try {
      await acceptOrder(storeOrderId, prep);
      await fetchNewOrders();
    } catch (e) {
      const msg = e?.response?.data?.error?.message ?? e?.message ?? '주문 접수에 실패했습니다.';
      alert(msg);
    } finally {
      setAcceptingOrderId(null);
    }
  };

  const handleCompletePreparation = async (storeOrderId) => {
    setCompletingOrderId(storeOrderId);
    try {
      await completePreparation(storeOrderId);
      await fetchNewOrders();
    } catch (e) {
      const msg = e?.response?.data?.error?.message ?? e?.message ?? '준비 완료 처리에 실패했습니다.';
      alert(msg);
    } finally {
      setCompletingOrderId(null);
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
      setSubscriptionForm({
        ...sub,
        imageFile: null,
        imagePreview: sub.imageUrl ?? null,
      });
    } else {
      setEditingSubscription(null);
      setSubscriptionForm({
        name: '',
        price: '',
        weeklyFreq: 1,
        monthlyTotal: 4,
        deliveryDays: [],
        description: '',
        selectedProducts: [],
        imageFile: null,
        imagePreview: null,
      });
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

    // 이미지 업로드 처리
    let imageUrl = '';
    if (subscriptionForm.imageFile) {
      try {
        imageUrl = await uploadProductImage(subscriptionForm.imageFile);
      } catch (err) {
        alert(err.message || '이미지 업로드에 실패했습니다.');
        return;
      }
    } else if (editingSubscription && subscriptionForm.imagePreview && subscriptionForm.imagePreview.startsWith('http')) {
      imageUrl = subscriptionForm.imagePreview;
    }

    const body = {
      name: subscriptionForm.name,
      description: subscriptionForm.description || '',
      price: priceNum,
      totalDeliveryCount: (subscriptionForm.weeklyFreq ?? (subscriptionForm.deliveryDays || []).length ?? 0) * 4 || 4,
      items,
      daysOfWeek,
      imageUrl,
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

  const handleConfirmReject = async () => {
    if (!selectedOrder) return;
    const reason =
      rejectReason === '기타 사유'
        ? (customRejectReason?.trim() || '기타 사유')
        : (rejectReason || '기타 사유');
    try {
      await rejectOrder(selectedOrder.id, reason);
      await fetchNewOrders();
      setIsRejectModalOpen(false);
      setSelectedOrder(null);
      setRejectReason('');
      setCustomRejectReason('');
    } catch (e) {
      const msg = e?.response?.data?.error?.message ?? e?.message ?? '주문 거절에 실패했습니다.';
      alert(msg);
    }
  };

  const handleReplyReview = (reviewId) => {
    const reply = replyInput[reviewId];
    if (!reply || !reply.trim()) return;
    
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, reply } : r));
    setReplyInput(prev => ({ ...prev, [reviewId]: '' }));
    alert('답변이 등록되었습니다.');
  };

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
            ordersLoading={ordersLoading}
            completedOrders={completedOrders}
            completedOrdersLoading={completedOrdersLoading}
            historyOrders={historyOrders}
            historyLoading={historyLoading}
            historyPage={historyPage}
            historyTotalPages={historyTotalPages}
            historyTotalElements={historyTotalElements}
            onHistoryPageChange={fetchHistoryOrders}
            orderSubTab={orderSubTab}
            setOrderSubTab={setOrderSubTab}
            mgmtFilter={mgmtFilter}
            setMgmtFilter={setMgmtFilter}
            expandedOrders={expandedOrders}
            onToggleExpand={handleToggleExpand}
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
            periodOptions={settlementPeriodOptions}
            sales={salesData}
            salesLoading={salesLoading}
            salesError={salesError}
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
            onSaveBusinessHours={handleSaveBusinessHours}
            businessHoursSaving={businessHoursSaving}
            businessHoursLoading={businessHoursLoading}
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
            ordersLoading={ordersLoading}
            products={products}
            lowStockThreshold={lowStockThreshold}
            expandedOrders={expandedOrders}
            currentTime={currentTime}
            setActiveTab={setActiveTab}
            handleToggleExpand={handleToggleExpand}
            updatePrepTime={updatePrepTime}
            handleAcceptOrder={handleAcceptOrder}
            acceptingOrderId={acceptingOrderId}
            handleCompletePreparation={handleCompletePreparation}
            completingOrderId={completingOrderId}
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
               {/* Toggle Switch - 배달 가능 on/off (서버 반영) */}
               <div 
                 onClick={async () => {
                   const next = !isStoreOpen;
                   try {
                     await updateDeliveryAvailable(next);
                     setIsStoreOpen(next);
                   } catch (e) {
                     const msg = e?.response?.data?.error?.message ?? e?.message ?? '배달 가능 여부 변경에 실패했습니다.';
                     alert(msg);
                   }
                 }}
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
          customRejectReason={customRejectReason}
          setCustomRejectReason={setCustomRejectReason}
          onConfirm={handleConfirmReject}
          onClose={() => {
            setIsRejectModalOpen(false);
            setCustomRejectReason('');
          }}
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
