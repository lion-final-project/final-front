import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../common/Header';
import Hero from '../../common/Hero';
import StoreGrid from '../../common/StoreGrid';
import CategorySidebar from '../../common/CategorySidebar';
import SearchResultsView from './SearchResultsView';
import CheckoutView from './CheckoutView';
import OrderTrackingView from '../rider/OrderTrackingView';
import ResidentDeliveryView from '../rider/ResidentDeliveryView';
import SupportView from '../shared/SupportView';
import PartnerPage from '../shared/PartnerPage';
import Footer from '../../common/Footer';
import { orders, reviews, stores, addresses, paymentMethods, faqs, categories, coupons, inquiries, loyaltyPoints } from '../../../data/mockData';
import CartModal from '../../features/cart/CartModal';
import StoreDetailView from './StoreDetailView';
import StoreRegistrationView from '../store/StoreRegistrationView';
import RiderRegistrationView from '../rider/RiderRegistrationView';
import OrderManagementView from '../store/OrderManagementView';
import LocationModal from '../../features/location/LocationModal';
import { API_BASE_URL, subscriptionApi } from '../../../config/api';
import * as cartAPI from '../../../api/cart.js';

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";
// import required modules
import { EffectCoverflow, Pagination, Navigation } from "swiper/modules";
import TrackingModal from '../../features/order/TrackingModal';
import PaymentSuccessModal from '../../features/order/PaymentSuccessModal';
import OrderCancelModal from '../../features/order/OrderCancelModal';
import ReviewModal from './modals/ReviewModal';
import Toast from '../../ui/Toast';
import LoginRequiredPrompt from './tabs/LoginRequiredPrompt';
import SpecialTabContent from './tabs/SpecialTabContent';
import SubscriptionTabContent from './tabs/SubscriptionTabContent';
import MypageTabContent from './tabs/MypageTabContent';

const CustomerView = ({
  userRole,
  setUserRole,
  isLoggedIn,
  cartRefreshTrigger = 0,
  onLogout,
  onOpenAuth,
  onOpenNotifications,
  isResidentRider,
  setIsResidentRider,
  notificationCount,
  storeRegistrationStatus,
  setStoreRegistrationStatus,
  storeRegistrationStoreName,
  setStoreRegistrationStoreName,
  riderRegistrationStatus,
  riderRegistrationApprovalId,
  refreshRiderRegistration,
  riderInfo,
  setRiderInfo,
  userInfo,
  isNotificationOpen,
  notifications,
  onMarkAsRead,
  onClearAll,
  onCloseNotifications,
}) => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [myStoreId, setMyStoreId] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null); // Local state for full page view
  const [cartItems, setCartItems] = useState([]);
  /** 장바구니에서 "결제하기" 시 선택한 매장·상품만 결제창으로 전달. null이면 전체 장바구니 사용 */
  const [checkoutCartItems, setCheckoutCartItems] = useState(null);
  const [toast, setToast] = useState(null);
  const [currentLocation, setCurrentLocation] = useState("서울특별시 중구 세종대로 110");
  const [coords, setCoords] = useState({ lat: 37.5665, lon: 126.9780 }); // Default: Seoul City Hall
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [orderList, setOrderList] = useState(orders);
  const [subscriptionList, setSubscriptionList] = useState([]);
  const [subscriptionListLoading, setSubscriptionListLoading] = useState(false);
  const [subscriptionListError, setSubscriptionListError] = useState(null);
  const [subscriptionPayments, setSubscriptionPayments] = useState([]); // 백엔드 결제 내역 API 연동 전 빈 배열

  const [hasStore, setHasStore] = useState(false);

  const hasStoreRole = isLoggedIn && (
    userInfo?.roles && Array.isArray(userInfo.roles) && (
      userInfo.roles.includes('STORE_OWNER') || userInfo.roles.includes('ROLE_STORE_OWNER') || userInfo.roles.some(r => String(r).toUpperCase().endsWith('STORE_OWNER'))
    )
  );

  // 토스 페이먼츠 결제/카드 등록 완료 후 돌아왔을 때 적절한 탭으로 이동
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentKey = urlParams.get('paymentKey');
    const paymentStatus = urlParams.get('payment');
    const billingStatus = urlParams.get('billing');
    const pendingCheckout = sessionStorage.getItem('pendingCheckout');
    
    // 카드 등록 관련 URL 파라미터가 있으면 mypage 탭으로 이동
    if (billingStatus) {
      setActiveTab('mypage');
      // URL 파라미터는 PaymentSubTab에서 처리하므로 여기서는 제거하지 않음
    }
    // 결제 관련 URL 파라미터가 있거나 pendingCheckout 플래그가 있으면 checkout 탭으로 이동
    else if (paymentKey || paymentStatus || pendingCheckout === 'true') {
      setActiveTab('checkout');
      // URL 파라미터는 CheckoutView에서 처리하므로 여기서는 제거하지 않음
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setMyStoreId(null);
      setHasStore(false);
      return;
    }
    fetch(`${API_BASE_URL}/api/stores/my`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(json => {
        const data = json?.data;
        if (data?.storeId != null) {
          setMyStoreId(data.storeId);
          setHasStore(true);
        } else {
          setMyStoreId(null);
          setHasStore(false);
        }
      })
      .catch(() => {
        setMyStoreId(null);
        setHasStore(false);
      });
  }, [isLoggedIn]);

  useEffect(() => {
    const fetchCart = async () => {
      if (!isLoggedIn) {
        setCartItems([]);
        return;
      }
      const result = await cartAPI.getCart();
      setCartItems(Array.isArray(result?.items) ? result.items : []);
    };

    fetchCart();
  }, [isLoggedIn, cartRefreshTrigger]);

  const fetchAddresses = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/me/addresses`, {
        credentials: "include",
      });
      if (response.ok) {
        const json = await response.json();
        const list = (json.data || []).map((addr) => ({
          id: addr.addressId,
          label: addr.addressName,
          address: addr.addressLine1,
          detail: addr.addressLine2,
          contact: addr.contact,
          isDefault: addr.isDefault,
          latitude: addr.latitude,
          longitude: addr.longitude,
          postalCode: addr.postalCode,
        }));
        setAddressList(list);

        // Update currentLocation if there is a default address
        const defaultAddr = list.find((a) => a.isDefault);
        if (defaultAddr) {
          setCurrentLocation(`${defaultAddr.address} ${defaultAddr.detail}`);
          setCoords({ lat: defaultAddr.latitude, lon: defaultAddr.longitude });
        }
      }
    } catch (err) {
      console.error("배송지 목록 조회 실패:", err);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  /** API-SUB-002: 내 구독 목록 조회. 백엔드 응답을 UI 형식으로 매핑 */
  const fetchSubscriptions = useCallback(async () => {
    if (!isLoggedIn) {
      setSubscriptionList([]);
      return;
    }
    setSubscriptionListLoading(true);
    setSubscriptionListError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/subscriptions`, {
        credentials: 'include',
      });
      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody?.message || `구독 목록 조회 실패 (${response.status})`);
      }
      const json = await response.json();
      const rawList = json?.data ?? [];
      const mapped = rawList.map((d) => {
        const statusMap = {
          ACTIVE: '구독중',
          PAUSED: '일시정지',
          CANCELLATION_PENDING: '해지 예정',
          CANCELLED: '해지됨',
        };
        const statusLabel = statusMap[d.status] ?? d.status;
        const period = d.deliveryTimeSlot
          ? d.deliveryTimeSlot
          : d.storeName
            ? `${d.storeName} 정기배달`
            : '정기배달';
        const totalDelivery = d.totalDeliveryCount ?? 0;
        const completedDelivery = d.completedDeliveryCount ?? 0;
        const remainingDelivery = Math.max(0, totalDelivery - completedDelivery);
        return {
          id: d.subscriptionId,
          name: d.subscriptionProductName ?? '',
          period,
          price: `${(d.totalAmount ?? 0).toLocaleString()}원/월`,
          status: statusLabel,
          img: '📦',
          nextPayment: d.nextPaymentDate
            ? d.nextPaymentDate.replace(/-/g, '.')
            : '-',
          monthlyCount: totalDelivery ? ` ${totalDelivery}회` : '—',
          daysOfWeek: d.daysOfWeek ?? [],
          includedItems: d.items?.map((i) => `${i.productName} ${i.quantity}개`) ?? [],
          totalDeliveryCount: totalDelivery,
          completedDeliveryCount: completedDelivery,
          remainingDeliveryCount: remainingDelivery,
          _rawStatus: d.status,
        };
      });
      setSubscriptionList(mapped);
    } catch (err) {
      console.error('구독 목록 조회 실패:', err);
      setSubscriptionListError(err.message || '구독 목록을 불러오지 못했습니다.');
      setSubscriptionList([]);
    } finally {
      setSubscriptionListLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  // Kakao Maps SDK Manual Initialization
  useEffect(() => {
    if (window.kakao && window.kakao.maps && !window.kakao.maps.Geocoder) {
      window.kakao.maps.load(() => {
        console.log("Kakao Maps SDK loaded manually");
      });
    }
  }, []);

  // Show toast feedback for interactions
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };
  const [trackingOrderId] = useState("202601210001"); // trackingOrderId is read, setTrackingOrderId is not.

  const [myPageTab, setMyPageTab] = useState("profile");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rate: 5, content: "" });
  const [verifyStep, setVerifyStep] = useState(0); // 0: intro, 1: location, 2: id, 3: success

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [subscriptionFilter, setSubscriptionFilter] = useState("전체"); // 전체, 구독중, 해지 예정
  const [expandedSubId, setExpandedSubId] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState("simple_change");
  const [cancelDetail, setCancelDetail] = useState("");

  /* Address Management State */
  const [addressList, setAddressList] = useState([]);
  const [paymentMethodList, setPaymentMethodList] = useState([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState(null);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    name: "",
    number: "",
    color: "#10b981",
    type: "card",
    isDefault: false,
  });
  const [editingAddress, setEditingAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    label: "",
    contact: "",
    address: "",
    detail: "",
    entranceType: "FREE", // FREE: 자율출입, LOCKED: 공동현관비번
    entrancePassword: "",
    isDefault: false,
    latitude: null,
    longitude: null,
    postalCode: "", // 추가: 우편번호
  });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [viewingReview, setViewingReview] = useState(null);

  const handleOpenAddressModal = (addr = null) => {
    if (addr) {
      setEditingAddress(addr);
      setNewAddress({ ...addr });
    } else {
      setEditingAddress(null);
      setNewAddress({
        label: "",
        contact: "",
        address: "",
        detail: "",
        entranceType: "FREE",
        entrancePassword: "",
        isDefault: false,
        latitude: null,
        longitude: null,
        postalCode: "", // 추가
      });
    }
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async () => {
    if (
      !newAddress.label ||
      !newAddress.contact ||
      !newAddress.address ||
      !newAddress.detail
    ) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    try {
      const isEdit = !!editingAddress;
      const url = isEdit
        ? `${API_BASE_URL}/api/users/me/addresses/${editingAddress.id}`
        : `${API_BASE_URL}/api/users/me/addresses`;
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressName: newAddress.label,
          addressLine1: newAddress.address,
          addressLine2: newAddress.detail,
          contact: newAddress.contact,
          latitude: newAddress.latitude,
          longitude: newAddress.longitude,
          postalCode: newAddress.postalCode,
          isDefault: newAddress.isDefault,
        }),
      });

      if (!response.ok) {
        throw new Error("배송지 저장에 실패했습니다.");
      }

      showToast(
        isEdit ? "배송 정보가 수정되었습니다." : "새 배송지가 추가되었습니다.",
      );
      fetchAddresses();

      setIsAddressModalOpen(false);
      setEditingAddress(null);
      setNewAddress({
        label: "",
        contact: "",
        address: "",
        detail: "",
        entranceType: "FREE",
        entrancePassword: "",
        isDefault: false,
        latitude: null,
        longitude: null,
        postalCode: "",
      });
    } catch (error) {
      console.error("배송지 저장 실패:", error);
      alert("배송지 저장 중 오류가 발생했습니다.");
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/me/addresses/${id}/default`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );
      if (response.ok) {
        showToast("기본 배송지로 변경되었습니다.");
        fetchAddresses();
      } else {
        throw new Error();
      }
    } catch (error) {
      console.error("기본 배송지 변경 실패:", error);
      alert("기본 배송지 변경에 실패했습니다.");
    }
  };

  const handleDeleteAddress = async (addrId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/me/addresses/${addrId}`,
        { method: "DELETE", credentials: "include" },
      );
      if (response.ok) {
        showToast("배송지가 삭제되었습니다.");
        fetchAddresses();
      } else {
        throw new Error();
      }
    } catch (err) {
      console.error("배송지 삭제 실패:", err);
      alert("배송지 삭제에 실패했습니다.");
    }
  };

  const handleOpenReviewModal = (order) => {
    setSelectedOrderForReview(order);
    setReviewForm({ rate: 5, content: "" });
    setIsReviewModalOpen(true);
  };
  const handleSaveReview = (e) => {
    e.preventDefault();
    if (viewingReview) {
      alert("리뷰가 수정되었습니다.");
    } else {
      alert("리뷰가 등록되었습니다! 소중한 의견 감사합니다.");
    }
    setIsReviewModalOpen(false);
    setViewingReview(null);
  };

  const handleEditReview = () => {
    setReviewForm({ rate: viewingReview.rate, content: viewingReview.content });
    setViewingReview(null); // Switch to edit mode in the same modal
  };

  const handleDeleteReview = () => {
    if (window.confirm("작성하신 리뷰를 삭제하시겠습니까?")) {
      alert("리뷰가 삭제되었습니다.");
      setIsReviewModalOpen(false);
      setViewingReview(null);
    }
  };

  const handleCancelOrder = (orderId) => {
    setCancellingOrderId(orderId);
    setCancelReason("simple_change");
    setCancelDetail("");
    setIsCancelModalOpen(true);
  };

  const submitCancelOrder = () => {
    if (!cancelReason) {
      alert("취소 사유를 선택해주세요.");
      return;
    }
    setOrderList((prev) =>
      prev.map((order) =>
        order.id === cancellingOrderId
          ? { ...order, status: "주문 취소됨" }
          : order,
      ),
    );
    setIsCancelModalOpen(false);
    alert("취소가 완료되었습니다.");
    showToast("주문이 성공적으로 취소되었습니다.");
  };

  const handleCancelSubscription = async (subId) => {
    const sub = subscriptionList.find((s) => s.id === subId);
    if (!sub) return;

    // 5-b: 남은 배송건·결제 종료일 안내 후 해지 예정으로 변경 (5-a: 취소 선택 시 기존 상태 유지)
    const hasRemaining = (sub.remainingDeliveryCount ?? 0) > 0;
    const nextPay = sub.nextPayment && sub.nextPayment !== '-' ? sub.nextPayment : null;
    let confirmMsg = '정말 이 구독을 해지하시겠습니까?';
    if (hasRemaining || nextPay) {
      confirmMsg += '\n\n';
      if (hasRemaining) confirmMsg += `· 남은 배송: ${sub.remainingDeliveryCount}건\n`;
      if (nextPay) confirmMsg += `· 결제 종료일: ${nextPay}\n`;
      confirmMsg += '위 기간까지 혜택이 유지되며, 이후 해지 예정으로 전환됩니다.';
    } else {
      confirmMsg += '\n남은 배송 및 다음 결제 예정일까지는 혜택이 제공될 수 있습니다.';
    }
    const confirmed = window.confirm(confirmMsg);
    if (!confirmed) {
      showToast('구독 해지가 취소되었습니다.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/subscriptions/${subId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        showToast(json?.message || '구독 해지 요청에 실패했습니다.');
        return;
      }
      await fetchSubscriptions();
      if (hasRemaining || nextPay) {
        const parts = [];
        if (hasRemaining) parts.push(`남은 배송 ${sub.remainingDeliveryCount}건`);
        if (nextPay) parts.push(`결제 종료일 ${nextPay}`);
        showToast(`${parts.join(', ')}까지 혜택이 유지되며, 해지 예정으로 전환되었습니다.`);
      } else {
        showToast('구독 해지가 요청되었습니다.');
      }
    } catch (err) {
      console.error('구독 해지 요청 실패:', err);
      showToast('구독 해지 요청에 실패했습니다.');
    }
  };

  const resumeSubscription = async (subId) => {
    const sub = subscriptionList.find((s) => s.id === subId);
    if (!sub) return;
    if (sub._rawStatus === 'CANCELLATION_PENDING') {
      try {
        const response = await fetch(`${API_BASE_URL}/api/subscriptions/${subId}/cancellation/cancel`, {
          method: 'PATCH',
          credentials: 'include',
        });
        const json = await response.json().catch(() => ({}));
        if (!response.ok) {
          showToast(json?.message || '구독 해지 취소에 실패했습니다.');
          return;
        }
        await fetchSubscriptions();
        showToast('구독 해지가 취소되었습니다. 계속해서 혜택을 누리실 수 있습니다!');
      } catch (err) {
        console.error('구독 해지 취소 실패:', err);
        showToast('구독 해지 취소에 실패했습니다.');
      }
      return;
    }
    if (sub._rawStatus === 'PAUSED') {
      try {
        const response = await fetch(`${API_BASE_URL}/api/subscriptions/${subId}/resume`, {
          method: 'PATCH',
          credentials: 'include',
        });
        const json = await response.json().catch(() => ({}));
        if (!response.ok) {
          showToast(json?.message || '구독 재개에 실패했습니다.');
          return;
        }
        await fetchSubscriptions();
        showToast('구독이 재개되었습니다.');
      } catch (err) {
        console.error('구독 재개 실패:', err);
        showToast('구독 재개에 실패했습니다.');
      }
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedStore(null);
    window.scrollTo(0, 0);
  };

  const onAddToCart = async (product, store) => {
    if (!isLoggedIn) {
      showToast("로그인이 필요합니다.");
      onOpenAuth();
      return;
    }

    try {
      // 기존 장바구니에서 같은 상품 찾기
      const existingItem = cartItems.find(
        (item) => item.productId === product.id,
      );
      const newQuantity = existingItem ? existingItem.quantity + 1 : 1;

      const result = await cartAPI.addToCart(product.id, newQuantity);
      setCartItems(result.items);
      showToast(`${product.name}이(가) 장바구니에 담겼습니다.`);
    } catch (error) {
      console.error("장바구니 추가 실패:", error);
      showToast(error.message || "장바구니 추가에 실패했습니다.");
    }
  };

  const onUpdateQuantity = async (id, delta) => {
    if (!isLoggedIn) {
      return;
    }

    try {
      // cartProductId로 아이템 찾기
      const item = cartItems.find(
        (item) => item.id === id || item.cartProductId === id,
      );
      if (!item) {
        console.error("장바구니 아이템을 찾을 수 없습니다.");
        return;
      }

      const newQuantity = item.quantity + delta;

      // 수량이 0 이하가 되면 삭제 API 호출
      if (newQuantity <= 0) {
        await onRemoveFromCart(id);
        return;
      }

      // 수량을 줄이는 경우(delta < 0)이고 현재 수량이 재고보다 많은 경우,
      // 재고 검증을 건너뛰기 위해 먼저 로컬 상태를 업데이트하고 API 호출
      const isDecreasing = delta < 0;
      const currentStock = item.stock ?? 999;
      const isOverStock = item.quantity > currentStock;

      // 수량을 줄이는 경우이거나, 재고보다 적거나 같은 수량으로 변경하는 경우에만 API 호출
      if (isDecreasing || newQuantity <= currentStock) {
        const result = await cartAPI.updateCartQuantity(
          item.productId,
          newQuantity,
        );
        setCartItems(result.items);
      } else {
        // 재고보다 많은 수량으로 증가하려는 경우는 에러 표시
        showToast(`재고가 부족합니다. (재고: ${currentStock}개)`);
      }
    } catch (error) {
      console.error("수량 업데이트 실패:", error);
      // 수량을 줄이는 경우에는 재고 부족 에러를 무시하고 로컬 상태만 업데이트
      if (delta < 0) {
        const item = cartItems.find(
          (item) => item.id === id || item.cartProductId === id,
        );
        if (item) {
          const newQuantity = item.quantity + delta;
          if (newQuantity > 0) {
            // 로컬 상태만 업데이트 (재고보다 많아도 수량을 줄이는 것은 허용)
            setCartItems(prevItems =>
              prevItems.map(cartItem =>
                (cartItem.id === id || cartItem.cartProductId === id)
                  ? { ...cartItem, quantity: newQuantity }
                  : cartItem
              )
            );
            // 백엔드 동기화를 위해 다시 시도 (재고보다 적거나 같은 수량이 될 때까지)
            if (newQuantity <= (item.stock ?? 999)) {
              try {
                const result = await cartAPI.updateCartQuantity(
                  item.productId,
                  newQuantity,
                );
                setCartItems(result.items);
              } catch (retryError) {
                // 재시도 실패해도 로컬 상태는 이미 업데이트됨
                console.error("재시도 실패:", retryError);
              }
            }
          }
        }
      } else {
        showToast(error.message || "수량 업데이트에 실패했습니다.");
      }
    }
  };

  const onRemoveFromCart = async (id) => {
    if (!isLoggedIn) {
      return;
    }

    try {
      // cartProductId로 아이템 찾기
      const item = cartItems.find(
        (item) => item.id === id || item.cartProductId === id,
      );
      if (!item) {
        console.error("장바구니 아이템을 찾을 수 없습니다.");
        return;
      }

      const result = await cartAPI.removeFromCart(item.productId);
      setCartItems(result.items);
      showToast("장바구니에서 상품이 삭제되었습니다.");
    } catch (error) {
      console.error("상품 삭제 실패:", error);
      showToast(error.message || "상품 삭제에 실패했습니다.");
    }
  };

  const clearCart = async () => {
    if (!isLoggedIn) {
      setCartItems([]);
      return;
    }

    try {
      await cartAPI.clearCart();
      setCartItems([]);
    } catch (error) {
      console.error("장바구니 비우기 실패:", error);
      showToast(error.message || "장바구니 비우기에 실패했습니다.");
    }
  };

  const handleDeletePaymentMethod = (id) => {
    if (window.confirm("이 결제 수단을 삭제하시겠습니까?")) {
      const updatedList = paymentMethodList.filter((pm) => pm.id !== id);
      // If the deleted one was default, make the first one default
      if (
        paymentMethodList.find((pm) => pm.id === id)?.isDefault &&
        updatedList.length > 0
      ) {
        updatedList[0].isDefault = true;
      }
      setPaymentMethodList(updatedList);
      showToast("결제 수단이 삭제되었습니다.");
    }
  };

  const handleSetDefaultPaymentMethod = (id) => {
    const updatedList = paymentMethodList.map((pm) => ({
      ...pm,
      isDefault: pm.id === id,
    }));
    setPaymentMethodList(updatedList);
    showToast("기본 결제 수단으로 설정되었습니다.");
  };

  const handleOpenPaymentModal = (pm = null) => {
    if (pm) {
      setEditingPaymentMethod(pm);
      setNewPaymentMethod({ ...pm });
    } else {
      setEditingPaymentMethod(null);
      setNewPaymentMethod({
        name: "",
        number: "",
        color: "#10b981",
        type: "card",
        isDefault: false,
      });
    }
    setIsPaymentModalOpen(true);
  };

  const handleSavePaymentMethod = () => {
    if (!newPaymentMethod.name || !newPaymentMethod.number) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    let updatedList = [...paymentMethodList];
    if (newPaymentMethod.isDefault) {
      updatedList = updatedList.map((pm) => ({ ...pm, isDefault: false }));
    }

    if (editingPaymentMethod) {
      updatedList = updatedList.map((pm) =>
        pm.id === editingPaymentMethod.id ? { ...newPaymentMethod } : pm,
      );
      setPaymentMethodList(updatedList);
      showToast("결제 수단이 수정되었습니다.");
    } else {
      const newId = Date.now();
      updatedList.push({
        id: newId,
        ...newPaymentMethod,
        isDefault: updatedList.length === 0 || newPaymentMethod.isDefault,
      });
      setPaymentMethodList(updatedList);
      showToast("새 결제 수단이 추가되었습니다.");
    }
    setIsPaymentModalOpen(false);
  };

  const handleCardRegistered = (newPaymentMethod) => {
    const updatedList = [...paymentMethodList];
    updatedList.push({
      ...newPaymentMethod,
      isDefault: updatedList.length === 0 || newPaymentMethod.isDefault,
    });
    setPaymentMethodList(updatedList);
    showToast("카드가 등록되었습니다.");
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case "special":
        return <SpecialTabContent onToast={showToast} />;
      case "subscription":
        return (
          <SubscriptionTabContent
            subscriptionList={subscriptionList}
            onToast={showToast}
          />
        );
      case "cart": {
        if (!isLoggedIn) {
          return (
            <LoginRequiredPrompt
              icon="🛒"
              title={<>장바구니 확인을 위해 <br /> 로그인이 필요합니다</>}
              onLogin={() => { setActiveTab("home"); onOpenAuth(); }}
            />
          );
        }
        // Redirect to modal if cart tab is somehow active, or just show empty div as it's handled by modal
        setTimeout(() => {
          setActiveTab("home");
          setIsCartOpen(true);
        }, 0);
        return null;
      }
      case "checkout":
        return (
          <CheckoutView
            cartItems={checkoutCartItems != null && checkoutCartItems.length > 0 ? checkoutCartItems : cartItems}
            addresses={addressList}
            paymentMethods={paymentMethodList}
            onBack={() => {
              setCheckoutCartItems(null);
              setActiveTab("home");
            }}
            onComplete={(success, orderId) => {
              if (success) {
                setCheckoutCartItems(null);
                setIsSuccessModalOpen(true);
                clearCart();
              } else {
                setCheckoutCartItems(null);
                setActiveTab("home");
                showToast("결제에 실패하였습니다. 장바구니 상품이 유지됩니다.");
              }
            }}
          />
        );
      case "tracking":
        // Redirect to modal if tracking tab is somehow active
        setTimeout(() => {
          setActiveTab("home");
          setIsTrackingOpen(true);
        }, 0);
        return null;

      case "store_registration":
        return (
          <StoreRegistrationView
            onBack={() => setActiveTab("partner")}
            status={storeRegistrationStatus}
            setStatus={setStoreRegistrationStatus}
            setStoreRegistrationStoreName={setStoreRegistrationStoreName}
            userId={userInfo?.userId}
          />
        );
      case "rider_registration":
        return (
          <RiderRegistrationView
            userInfo={userInfo}
            onBack={() => setActiveTab("partner")}
            onRefreshStatus={refreshRiderRegistration}
            onComplete={(data) => {
              setRiderInfo(data);
              setUserRole("RIDER");
              setActiveTab("home");
              window.scrollTo(0, 0);
            }}
          />
        );
      case "support":
        return <SupportView isLoggedIn={isLoggedIn} onOpenAuth={onOpenAuth} />;
      case "partner":
        return (
          <PartnerPage
            onBack={() => setActiveTab("home")}
            isLoggedIn={isLoggedIn}
            onOpenAuth={onOpenAuth}
            onRegister={(role) => {
              if (role === "RESIDENT") {
                setActiveTab("rider_registration");
                window.scrollTo(0, 0);
                return;
              }
              if (role === "STORE_APPLICATION") {
                setActiveTab("store_registration");
                window.scrollTo(0, 0);
                return;
              }
              if (role === "RIDER") {
                setActiveTab("rider_registration");
                window.scrollTo(0, 0);
                return;
              }
              setUserRole(role);
              setActiveTab("home");
              window.scrollTo(0, 0);
            }}
          />
        );
      case "mypage":
        if (!isLoggedIn) {
          return (
            <LoginRequiredPrompt
              icon="👤"
              title={<>마이페이지 확인을 위해 <br /> 로그인이 필요합니다</>}
              onLogin={onOpenAuth}
              onBack={() => setActiveTab("home")}
            />
          );
        }
        return (
          <MypageTabContent
            isLoggedIn={isLoggedIn}
            loyaltyPoints={loyaltyPoints}
            coupons={coupons}
            myPageTab={myPageTab}
            setMyPageTab={setMyPageTab}
            isResidentRider={isResidentRider}
            verifyStep={verifyStep}
            setVerifyStep={setVerifyStep}
            setActiveTab={setActiveTab}
            onLogout={onLogout}
            orderList={orderList}
            reviews={reviews}
            userInfo={userInfo}
            subscriptionList={subscriptionList}
            subscriptionListLoading={subscriptionListLoading}
            subscriptionListError={subscriptionListError}
            subscriptionPayments={subscriptionPayments}
            subscriptionFilter={subscriptionFilter}
            setSubscriptionFilter={setSubscriptionFilter}
            expandedSubId={expandedSubId}
            setExpandedSubId={setExpandedSubId}
            addressList={addressList}
            paymentMethodList={paymentMethodList}
            storeRegistrationStatus={storeRegistrationStatus}
            storeRegistrationStoreName={storeRegistrationStoreName}
            setStoreRegistrationStatus={setStoreRegistrationStatus}
            setStoreRegistrationStoreName={setStoreRegistrationStoreName}
            riderRegistrationStatus={riderRegistrationStatus}
            riderRegistrationApprovalId={riderRegistrationApprovalId}
            refreshRiderRegistration={refreshRiderRegistration}
            setIsResidentRider={setIsResidentRider}
            inquiries={inquiries}
            userRole={userRole}
            setUserRole={setUserRole}
            onOpenAuth={onOpenAuth}
            setIsTrackingOpen={setIsTrackingOpen}
            handleOpenReviewModal={handleOpenReviewModal}
            handleCancelOrder={handleCancelOrder}
            setViewingReview={setViewingReview}
            setSelectedOrderForReview={setSelectedOrderForReview}
            setIsReviewModalOpen={setIsReviewModalOpen}
            handleCancelSubscription={handleCancelSubscription}
            resumeSubscription={resumeSubscription}
            fetchSubscriptions={fetchSubscriptions}
            fetchAddresses={fetchAddresses}
            showToast={showToast}
            handleOpenAddressModal={handleOpenAddressModal}
            handleSaveAddress={handleSaveAddress}
            handleDeleteAddress={handleDeleteAddress}
            handleSetDefaultAddress={handleSetDefaultAddress}
            handleOpenPaymentModal={handleOpenPaymentModal}
            handleSavePaymentMethod={handleSavePaymentMethod}
            handleDeletePaymentMethod={handleDeletePaymentMethod}
            handleSetDefaultPaymentMethod={handleSetDefaultPaymentMethod}
            onCardRegistered={handleCardRegistered}
            isAddressModalOpen={isAddressModalOpen}
            setIsAddressModalOpen={setIsAddressModalOpen}
            isPaymentModalOpen={isPaymentModalOpen}
            setIsPaymentModalOpen={setIsPaymentModalOpen}
            editingAddress={editingAddress}
            newAddress={newAddress}
            setNewAddress={setNewAddress}
            editingPaymentMethod={editingPaymentMethod}
            newPaymentMethod={newPaymentMethod}
            setNewPaymentMethod={setNewPaymentMethod}
          />
        );

      default:
        return (
          <>
            <Hero
              onShopClick={() => {
                const grid = document.getElementById("store-grid-section");
                if (grid) grid.scrollIntoView({ behavior: "smooth" });
              }}
              onPromoClick={() => setActiveTab("special")}
            />

            <div
              className="container"
              id="store-grid-section"
              style={{ margin: "80px auto" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "32px",
                }}
              >
                <h2 style={{ fontSize: "28px", fontWeight: "800", margin: 0 }}>
                  오늘의 추천 상점
                </h2>
                <div
                  style={{ display: "flex", gap: "12px", alignItems: "center" }}
                >
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="가게명, 상품명 검색"
                      value={localSearchTerm}
                      onChange={(e) => {
                        if (e.target.value.length <= 8) {
                          setLocalSearchTerm(e.target.value);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (localSearchTerm.length < 2) {
                            alert("검색어는 2자 이상 입력해주세요.");
                            return;
                          }
                          setSearchQuery(localSearchTerm);
                          showToast(`'${localSearchTerm}' 검색 결과입니다.`);
                        }
                      }}
                      style={{
                        padding: "10px 16px",
                        paddingLeft: "38px",
                        borderRadius: "24px",
                        border: "2px solid var(--border)",
                        fontSize: "14px",
                        width: "200px",
                        outline: "none",
                        backgroundColor: "white",
                        transition: "all 0.2s",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                      }}
                      onFocus={(e) =>
                        (e.target.style.borderColor = "var(--primary)")
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = "var(--border)")
                      }
                    />
                    <span
                      style={{
                        position: "absolute",
                        left: "14px",
                        color: "#94a3b8",
                        fontSize: "16px",
                      }}
                    >
                      🔍
                    </span>
                  </div>

                  <button
                    onClick={() => setIsLocationModalOpen(true)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      border: "2px solid var(--primary)",
                      background: "rgba(46, 204, 113, 0.05)",
                      color: "var(--primary)",
                      fontSize: "13px",
                      fontWeight: "800",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      whiteSpace: "nowrap",
                      animation:
                        isLoggedIn && addressList.length === 0
                          ? "pulse-highlight 2s infinite"
                          : "none",
                      boxShadow:
                        isLoggedIn && addressList.length === 0
                          ? "0 0 0 0 rgba(46, 204, 113, 0.7)"
                          : "none",
                    }}
                  >
                    📍{" "}
                    {isLoggedIn && addressList.find((a) => a.isDefault)?.address
                      ? addressList.find((a) => a.isDefault).address
                      : currentLocation || "배송지 설정하기"}
                  </button>
                  {["주문 많은 순", "거리순", "평점순", "배달비순"].map(
                    (sort) => (
                      <button
                        key={sort}
                        onClick={() => showToast(`${sort}으로 정렬되었습니다.`)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "20px",
                          border: "1px solid var(--border)",
                          background: "white",
                          fontSize: "13px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        {sort}
                      </button>
                    ),
                  )}
                </div>
              </div>
              <div
                className="main-layout"
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(200px, 1fr) 4fr",
                  gap: "30px",
                }}
              >
                <CategorySidebar
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                />
                <StoreGrid
                  selectedCategory={selectedCategory}
                  searchQuery={searchQuery}
                  coords={coords}
                  onAddToCart={onAddToCart}
                  onStoreClick={(store) => {
                    setSelectedStore(store);
                    window.scrollTo(0, 0);
                  }}
                />
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div
      className="customer-dashboard"
      style={{ backgroundColor: "var(--bg-main)", minHeight: "100vh" }}
    >
      <Toast message={toast} />
      <OrderCancelModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        cancelReason={cancelReason}
        setCancelReason={setCancelReason}
        cancelDetail={cancelDetail}
        setCancelDetail={setCancelDetail}
        onSubmit={submitCancelOrder}
      />
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isLoggedIn={isLoggedIn}
        onLogout={onLogout}
        onOpenAuth={onOpenAuth}
        onOpenNotifications={onOpenNotifications}
        cartCount={cartItems.length}
        notificationCount={notificationCount}
        isResidentRider={isResidentRider}
        isNotificationOpen={isNotificationOpen}
        notifications={notifications}
        onMarkAsRead={onMarkAsRead}
        onClearAll={onClearAll}
        onCloseNotifications={onCloseNotifications}
        hasStoreRole={hasStoreRole}
        onGoToStoreDashboard={() => setUserRole('STORE')}
        storeId={myStoreId}
      />
      <div style={{ minHeight: "calc(100vh - 200px)" }}>
        {selectedStore ? (
          <div
            style={{
              animation: "fadeInLayer 0.3s ease-out",
            }}
          >
            <StoreDetailView
              store={selectedStore}
              onBack={() => {
                setSelectedStore(null);
                window.scrollTo(0, 0);
              }}
              onAddToCart={onAddToCart}
              onSubscribeCheckout={async (subProduct) => {
                const deliveryTimeSlot = subProduct.deliveryTimeSlot ?? subProduct.deliveryTime;
                const subscriptionProductId = subProduct.id != null ? Number(subProduct.id) : null;
                const isNumericId = subscriptionProductId != null && !Number.isNaN(subscriptionProductId);

                if (!deliveryTimeSlot || !isNumericId) {
                  showToast("배송 시간대를 선택해 주세요. (실제 구독 상품이 있는 마트에서만 구독 신청이 가능합니다.)");
                  return;
                }
                if (addressList.length === 0) {
                  showToast("배송지를 먼저 등록해 주세요.");
                  return;
                }

                try {
                  const addr = addressList.find((a) => a.isDefault) || addressList[0];
                  const deliveryDays = Array.isArray(subProduct.daysOfWeek) && subProduct.daysOfWeek.length > 0
                    ? subProduct.daysOfWeek.map((d) => (typeof d === 'number' ? d : Number(d)))
                    : [1];
                  const res = await fetch(subscriptionApi.create(), {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      subscriptionProductId,
                      addressId: addr.id,
                      paymentMethodId: null,
                      deliveryDays,
                      deliveryTimeSlot,
                    }),
                  });
                  const json = await res.json();
                  if (!res.ok) throw new Error(json?.error?.message || json?.message || "구독 신청에 실패했습니다.");
                  setSelectedStore(null);
                  showToast("구독이 신청되었습니다. 마이페이지 > 구독 관리에서 확인하실 수 있습니다.");
                  await fetchSubscriptions();
                  setActiveTab("mypage");
                  setMyPageTab("subscription");
                  window.scrollTo(0, 0);
                } catch (err) {
                  showToast(err.message || "구독 신청에 실패했습니다.");
                }
              }}
            />
          </div>
        ) : (
          renderActiveView()
        )}
        <style>{`
          @keyframes fadeInLayer {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse-highlight {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.7); }
            70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(46, 204, 113, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(46, 204, 113, 0); }
          }
        `}</style>
      </div>
      <Footer onTabChange={handleTabChange} />
      {isReviewModalOpen && (
        <ReviewModal
          viewingReview={viewingReview}
          selectedOrderForReview={selectedOrderForReview}
          reviewForm={reviewForm}
          setReviewForm={setReviewForm}
          onSave={handleSaveReview}
          onEdit={handleEditReview}
          onDelete={handleDeleteReview}
          onClose={() => {
            setIsReviewModalOpen(false);
            setViewingReview(null);
          }}
        />
      )}
      <style>{`
        .widget-card {
          transition: transform 0.3s ease;
        }
        .widget-card:hover {
          transform: translateY(-5px);
        }
      `}</style>
      {/* Floating Action Buttons */}
      <div
        style={{
          position: "fixed",
          bottom: "30px",
          right: "120px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          zIndex: 1000,
        }}
      >
        <button
          onClick={() => setIsTrackingOpen(true)}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            border: "none",
            backgroundColor: "white",
            color: "var(--primary)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            position: "relative",
          }}
          title="배송 조회"
        >
          🚲
        </button>
        <button
          onClick={() => setIsCartOpen(true)}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            border: "none",
            backgroundColor: "var(--primary)",
            color: "white",
            boxShadow: "0 4px 20px rgba(16, 185, 129, 0.4)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            position: "relative",
          }}
          title="장바구니"
        >
          🛒
          {cartItems.length > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                backgroundColor: "#ef4444",
                color: "white",
                fontSize: "12px",
                fontWeight: "800",
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid white",
              }}
            >
              {cartItems.length}
            </span>
          )}
        </button>
      </div>
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={onUpdateQuantity}
        onRemoveFromCart={onRemoveFromCart}
        onCheckout={(selectedItems) => {
          setCheckoutCartItems(selectedItems && selectedItems.length > 0 ? selectedItems : null);
          setIsCartOpen(false);
          setActiveTab("checkout");
        }}
        isLoggedIn={isLoggedIn}
        onOpenAuth={onOpenAuth}
      />
      <TrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        orderId={trackingOrderId}
      />
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={currentLocation}
        coords={coords}
        onSetLocation={(loc, newCoords) => {
          setCurrentLocation(loc);
          if (newCoords) setCoords(newCoords);
          showToast(`주소가 '${loc}'으로 설정되었습니다.`);
        }}
      />
      <PaymentSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false);
          clearCart();
          setActiveTab("home");
        }}
        onViewOrder={() => {
          setIsSuccessModalOpen(false);
          clearCart();
          setActiveTab("mypage");
          setMyPageTab("profile");
        }}
      />
    </div>
  );
};

export default CustomerView;
