import React, { useState, useEffect, useCallback, useRef } from "react";
import Header from "../../common/Header";
import Hero from "../../common/Hero";
import StoreGrid from "../../common/StoreGrid";
import CategorySidebar from "../../common/CategorySidebar";
import SearchResultsView from "./SearchResultsView";
import CheckoutView from "./CheckoutView";
import OrderTrackingView from "../rider/OrderTrackingView";
import ResidentDeliveryView from "../rider/ResidentDeliveryView";
import SupportView from "../shared/SupportView";
import PartnerPage from "../shared/PartnerPage";
import Footer from "../../common/Footer";
import {
  orders,
  reviews,
  stores,
  addresses,
  paymentMethods,
  faqs,
  categories,
  inquiries,
} from "../../../data/mockData";
import CartModal from "../../features/cart/CartModal";
import StoreDetailView from "./StoreDetailView";
import StoreRegistrationView from "../store/StoreRegistrationView";
import RiderRegistrationView from "../rider/RiderRegistrationView";
import OrderManagementView from "../store/OrderManagementView";
import LocationModal from "../../features/location/LocationModal";
import { API_BASE_URL, subscriptionApi } from "../../../config/api";
import * as cartAPI from "../../../api/cart.js";
import {
  getMyPaymentMethods,
  setDefaultPaymentMethod,
  deletePaymentMethod,
} from "../../../api/billingApi";
import * as storeApi from "../../../api/storeApi";
import { getOrderList, cancelStoreOrder, requestRefund, getStoreOrderDetail } from "../../../api/orderApi";
import {
  createReview,
  getReviewDetail,
  updateReview,
  deleteReview
} from "../../../api/reviewApi";

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";
// import required modules
import { EffectCoverflow, Pagination, Navigation } from "swiper/modules";
import TrackingModal from "../../features/order/TrackingModal";
import PaymentSuccessModal from "../../features/order/PaymentSuccessModal";
import OrderCancelModal from "../../features/order/OrderCancelModal";
import OrderRefundModal from "../../features/order/OrderRefundModal";
import ReviewModal from "./modals/ReviewModal";
import Toast from "../../ui/Toast";
import LoginRequiredPrompt from "./tabs/LoginRequiredPrompt";
import SpecialTabContent from "./tabs/SpecialTabContent";
import SubscriptionTabContent from "./tabs/SubscriptionTabContent";
import MypageTabContent from "./tabs/MypageTabContent";

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
  // sessionStorage에서 탭 정보 복원 (새로고침 시 현재 탭 유지)
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = sessionStorage.getItem("activeTab");
    return savedTab || "home";
  });
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [storeCategories, setStoreCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [myStoreId, setMyStoreId] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null); // Local state for full page view
  const [cartItems, setCartItems] = useState([]);
  /** 장바구니에서 "결제하기" 시 선택한 매장·상품만 결제창으로 전달. null이면 전체 장바구니 사용 */
  const [checkoutCartItems, setCheckoutCartItems] = useState(null);
  const [toast, setToast] = useState(null);
  const [currentLocation, setCurrentLocation] =
    useState("서울특별시 중구 세종대로 110");
  const [coords, setCoords] = useState({ lat: 37.5665, lon: 126.978 }); // Default: Seoul City Hall
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // 환불 요청 모달 상태
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundingOrderId, setRefundingOrderId] = useState(null);
  const [refundReason, setRefundReason] = useState("simple_change");
  const [refundDetail, setRefundDetail] = useState("");
  const [isRefunding, setIsRefunding] = useState(false);

  const [isSubscriptionOrder, setIsSubscriptionOrder] = useState(false);
  const [orderList, setOrderList] = useState([]);
  const [orderListLoading, setOrderListLoading] = useState(false);
  const [orderCurrentPage, setOrderCurrentPage] = useState(0);
  const [orderTotalPages, setOrderTotalPages] = useState(0);
  const [orderDateFilter, setOrderDateFilter] = useState(null);
  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const [subscriptionList, setSubscriptionList] = useState([]);
  const [subscriptionListLoading, setSubscriptionListLoading] = useState(false);
  const [subscriptionListError, setSubscriptionListError] = useState(null);
  const [subscriptionPayments, setSubscriptionPayments] = useState([]); // 백엔드 결제 내역 API 연동 전 빈 배열

  const [hasStore, setHasStore] = useState(false);

  const hasStoreRole =
    isLoggedIn &&
    userInfo?.roles &&
    Array.isArray(userInfo.roles) &&
    (userInfo.roles.includes("STORE_OWNER") ||
      userInfo.roles.includes("ROLE_STORE_OWNER") ||
      userInfo.roles.some((r) =>
        String(r).toUpperCase().endsWith("STORE_OWNER"),
      ));

  // 토스 페이먼츠 결제/카드 등록 완료 후 돌아왔을 때 적절한 탭으로 이동
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentKey = urlParams.get("paymentKey");
    const paymentStatus = urlParams.get("payment");
    const billingStatus = urlParams.get("billing");
    const pendingBilling = sessionStorage.getItem("pendingBilling");
    const pendingSubscriptionCheckout = sessionStorage.getItem(
      "pendingSubscriptionCheckout",
    );

    // 마이페이지에서 카드 등록한 경우 (구독 결제창이 아닌 경우) mypage에 머물기 - 가장 우선순위
    if (
      (billingStatus || pendingBilling === "true") &&
      !pendingSubscriptionCheckout
    ) {
      // 이미 mypage에 있으면 그대로 유지, 아니면 mypage로 이동
      if (activeTab !== "mypage") {
        setActiveTab("mypage");
        sessionStorage.setItem("activeTab", "mypage");
      }
      setMyPageTab("payment");
      sessionStorage.setItem("myPageTab", "payment");
      // URL 파라미터는 PaymentSubTab에서 처리하므로 여기서는 제거하지 않음
      // pendingBilling 플래그는 PaymentSubTab에서 처리 완료 후 제거되므로 여기서는 유지
      return;
    }

    // 구독 결제창에서 카드 등록한 경우 결제창에 머물기
    if (
      pendingSubscriptionCheckout &&
      (billingStatus || pendingBilling === "true")
    ) {
      setActiveTab("checkout");
      // URL 파라미터는 CheckoutView에서 처리하도록 함
      return;
    }

    // 결제 관련 URL 파라미터가 있으면 checkout 탭으로 이동
    // pendingCheckout 플래그만으로는 이동하지 않음 (새로고침 시 모든 페이지에서 결제창으로 이동하는 문제 방지)
    if (paymentKey || paymentStatus) {
      setActiveTab("checkout");
      sessionStorage.setItem("activeTab", "checkout");
      // URL 파라미터는 CheckoutView에서 처리하므로 여기서는 제거하지 않음
      return;
    }

    // URL 파라미터가 없으면 sessionStorage에서 탭 정보 복원 (새로고침 시 현재 탭 유지)
    const savedTab = sessionStorage.getItem("activeTab");
    const savedMyPageTab = sessionStorage.getItem("myPageTab");
    if (savedTab && activeTab !== savedTab) {
      setActiveTab(savedTab);
    }
    if (savedMyPageTab && myPageTab !== savedMyPageTab) {
      setMyPageTab(savedMyPageTab);
    }
  }, []);

  // activeTab이 변경되지 않도록 보호 (마이페이지에서 카드 등록 중에는 mypage 유지)
  useEffect(() => {
    const pendingBilling = sessionStorage.getItem("pendingBilling");
    const pendingSubscriptionCheckout = sessionStorage.getItem(
      "pendingSubscriptionCheckout",
    );

    // 마이페이지에서 카드 등록 중이면 mypage에 머물기 (결제창으로 이동하지 않도록)
    // pendingSubscriptionCheckout이 없거나 제거된 경우 mypage에 머물기
    if (pendingBilling === "true" && !pendingSubscriptionCheckout) {
      if (activeTab === "mypage") {
        // 이미 mypage에 있으면 그대로 유지
        setMyPageTab("payment");
        sessionStorage.setItem("myPageTab", "payment");
        return;
      } else {
        // 다른 탭에 있으면 mypage로 이동 (checkout으로 이동하지 않도록 강제)
        setActiveTab("mypage");
        sessionStorage.setItem("activeTab", "mypage");
        setMyPageTab("payment");
        sessionStorage.setItem("myPageTab", "payment");
        return;
      }
    }

    // 마이페이지에서 카드 등록 중인데 checkout으로 이동하려고 하면 막기
    if (
      pendingBilling === "true" &&
      !pendingSubscriptionCheckout &&
      activeTab === "checkout"
    ) {
      setActiveTab("mypage");
      sessionStorage.setItem("activeTab", "mypage");
      setMyPageTab("payment");
      sessionStorage.setItem("myPageTab", "payment");
    }
  }, [activeTab]);

  useEffect(() => {
    if (!isLoggedIn) {
      setMyStoreId(null);
      setHasStore(false);
      return;
    }
    fetch(`${API_BASE_URL}/api/stores/my`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
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

  const fetchCart = useCallback(async () => {
    if (!isLoggedIn) {
      setCartItems([]);
      return;
    }
    try {
      const result = await cartAPI.getCart();
      setCartItems(Array.isArray(result?.items) ? result.items : []);
    } catch (error) {
      console.error("장바구니 조회 실패:", error);
      setCartItems([]);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart, cartRefreshTrigger]);

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

  const convertOrderStatus = (orderStatus, storeOrderStatus) => {
    // StoreOrder 상태가 취소/거절/환불인 경우 최우선으로 반환
    if (storeOrderStatus === "CANCELLED" || storeOrderStatus === "REJECTED") {
      return "주문 취소됨";
    } else if (storeOrderStatus === "REFUND_REQUESTED") {
      return "환불 요청";
    } else if (storeOrderStatus === "REFUNDED") {
      return "환불됨";
    }

    // 전체 주문이 취소된 경우 (단, 위에서 개별 환불건 등은 이미 걸러짐)
    if (orderStatus === "CANCELLED") {
      return "주문 취소됨";
    }

    // 그 외 StoreOrder 정상 진행 상태에 따라 변환
    if (storeOrderStatus === "PENDING") {
      return "주문 접수 중";
    } else if (
      storeOrderStatus === "ACCEPTED" ||
      storeOrderStatus === "READY"
    ) {
      return "준비 중";
    } else if (
      storeOrderStatus === "PICKED_UP" ||
      storeOrderStatus === "DELIVERING"
    ) {
      return "배송 중";
    } else if (storeOrderStatus === "DELIVERED") {
      return "배송 완료";
    }

    return "주문 접수 중";
  };

  // 백엔드 StoreOrder 데이터를 프론트엔드 형식으로 변환
  const transformStoreOrderData = (storeOrderData) => {
    console.log("transformStoreOrderData 입력:", storeOrderData);

    if (!storeOrderData) {
      console.log("storeOrderData가 null입니다");
      return null;
    }

    if (!storeOrderData.order) {
      console.log("storeOrderData.order가 없습니다:", storeOrderData);
      return null;
    }

    const products = storeOrderData.products || [];
    console.log("products:", products);

    // 상품이 없어도 StoreOrder는 표시 (상품 정보는 기본값 사용)
    const mainProduct = products[0];
    const productName = mainProduct?.productNameSnapshot || "상품 정보 없음";
    const productCount = products.length;
    const itemsText =
      productCount > 1
        ? `${productName} 외 ${productCount - 1}건`
        : productCount === 1
          ? productName
          : "상품 정보 없음";

    // 날짜 포맷 변환 (2024-01-23T10:30:00 -> 2024.01.23)
    const orderedDate = new Date(storeOrderData.order.orderedAt);
    const dateStr = `${orderedDate.getFullYear()}.${String(orderedDate.getMonth() + 1).padStart(2, "0")}.${String(orderedDate.getDate()).padStart(2, "0")}`;

    // 주문번호에서 날짜 부분 추출 (ORD-20240123-001 -> 20240123-001)
    const orderNumber = storeOrderData.order.orderNumber || "";
    const orderId =
      orderNumber.replace("ORD-", "") ||
      storeOrderData.order.orderId?.toString() ||
      "";

    // 가격 포맷 (12500 -> '12,500원')
    const priceStr = `${storeOrderData.finalPrice?.toLocaleString() || 0}원`;

    // 이미지 URL (상품 이미지 우선, 없으면 매장 이미지)
    const imgUrl =
      mainProduct?.productImageUrl ||
      storeOrderData.storeImageUrl ||
      "https://images.unsplash.com/photo-1550583724-125581f77833?w=120&q=80";

    // 상태 변환
    const status = convertOrderStatus(
      storeOrderData.order.orderStatus,
      storeOrderData.status,
    );

    return {
      id: `${orderId}-${storeOrderData.storeOrderId}`, // StoreOrder ID 포함
      orderId: storeOrderData.order.orderId, // 실제 주문 ID 저장
      orderNumber: orderNumber, // 실제 주문번호 저장
      storeOrderId: storeOrderData.storeOrderId, // StoreOrder ID 저장
      date: dateStr,
      store: storeOrderData.storeName,
      items: itemsText,
      product: productName,
      price: priceStr,
      status: status,
      img: imgUrl,
      reviewWritten: storeOrderData.reviewWritten || false,
      reviewId: storeOrderData.reviewId || null,
      storeOrder: storeOrderData, // 전체 StoreOrder 정보 저장
    };
  };

  // 기간 필터에 따른 날짜 계산
  const getDateRange = (period) => {
    const now = new Date();
    const endDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
    );
    let startDate = new Date();

    switch (period) {
      case "today":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          0,
          0,
          0,
        );
        break;
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          now.getDate(),
        );
        break;
      case "6months":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 6,
          now.getDate(),
        );
        break;
      case "year":
        startDate = new Date(
          now.getFullYear() - 1,
          now.getMonth(),
          now.getDate(),
        );
        break;
      case "2years":
        startDate = new Date(
          now.getFullYear() - 2,
          now.getMonth(),
          now.getDate(),
        );
        break;
      case "3years":
        startDate = new Date(
          now.getFullYear() - 3,
          now.getMonth(),
          now.getDate(),
        );
        break;
      default:
        return { startDate: null, endDate: null };
    }

    // 로컬 시간대 유지 (UTC 변환 방지)
    const toLocalISOString = (date) => {
      const offset = date.getTimezoneOffset() * 60000;
      return new Date(date.getTime() - offset).toISOString().slice(0, 19);
    };

    return {
      startDate: toLocalISOString(startDate),
      endDate: toLocalISOString(endDate),
    };
  };

  // 주문 목록 조회
  const fetchOrders = useCallback(
    async (page = 0, period = null, searchTerm = "") => {
      if (!isLoggedIn) {
        setOrderList([]);
        return;
      }

      setOrderListLoading(true);
      try {
        const dateRange = period
          ? getDateRange(period)
          : { startDate: null, endDate: null };

        // 검색어를 백엔드에 전달 (서버 사이드 검색)
        // 검색어가 비어있거나 공백만 있으면 null로 전달
        const trimmedSearchTerm =
          searchTerm && searchTerm.trim() ? searchTerm.trim() : null;
        const result = await getOrderList(
          page,
          10,
          dateRange.startDate,
          dateRange.endDate,
          trimmedSearchTerm,
        );

        console.log("=== 주문 목록 조회 결과 ===");
        console.log("전체 응답:", JSON.stringify(result, null, 2));

        // StoreOrder 단위로 변환
        const storeOrders =
          result?.storeOrders || result?.data?.storeOrders || [];
        console.log("추출된 storeOrders:", storeOrders);
        console.log("storeOrders 개수:", storeOrders.length);

        if (storeOrders.length === 0) {
          console.warn("⚠️ 주문 내역이 없습니다.");
          console.warn("result 구조:", Object.keys(result || {}));
          console.warn(
            "result.data 구조:",
            result?.data ? Object.keys(result.data) : "없음",
          );
        }

        const transformedOrders = storeOrders
          .map((storeOrder, index) => {
            try {
              const transformed = transformStoreOrderData(storeOrder);
              if (!transformed) {
                console.warn(`변환 실패 [${index}]:`, storeOrder);
              }
              return transformed;
            } catch (error) {
              console.error(`변환 중 에러 [${index}]:`, error, storeOrder);
              return null;
            }
          })
          .filter((order) => order !== null);

        console.log("최종 변환된 주문:", transformedOrders);
        console.log("변환된 주문 개수:", transformedOrders.length);

        setOrderList(transformedOrders);
        setOrderTotalPages(result?.totalPages || 0);
        setOrderCurrentPage(result?.currentPage || 0);
      } catch (error) {
        console.error("주문 목록 조회 실패:", error);
        setOrderList([]);
        setOrderTotalPages(0);
        setOrderCurrentPage(0);
      } finally {
        setOrderListLoading(false);
      }
    },
    [isLoggedIn],
  );

  useEffect(() => {
    if (isLoggedIn) {
      fetchOrders(orderCurrentPage, orderDateFilter, orderSearchTerm);
    }
  }, [isLoggedIn, orderCurrentPage, orderDateFilter]);

  // 기간 필터 변경 핸들러
  const handleOrderDateFilterChange = (period) => {
    setOrderDateFilter(period);
    setOrderCurrentPage(0); // 필터 변경 시 첫 페이지로
    setOrderSearchTerm(""); // 기간 필터 변경 시 검색어 초기화
  };

  // 페이지 변경 핸들러
  const handleOrderPageChange = (page) => {
    setOrderCurrentPage(page);
  };

  // 검색 핸들러 (검색 버튼 클릭 시에만 실행)
  const handleOrderSearch = (searchTerm) => {
    const trimmedSearchTerm = searchTerm ? searchTerm.trim() : "";
    setOrderSearchTerm(trimmedSearchTerm);
    setOrderCurrentPage(0); // 검색 시 첫 페이지로
    // 검색어가 변경되면 즉시 조회
    fetchOrders(0, orderDateFilter, trimmedSearchTerm);
  };

  // 카드사별 색상 매핑
  const getCardColor = useCallback((cardCompany) => {
    if (!cardCompany) return "#10b981";

    const colorMap = {
      현대카드: "#000000",
      신한카드: "#0046ff",
      삼성카드: "#1428a0",
      KB카드: "#e60012",
      롯데카드: "#ed1c24",
      하나카드: "#009490",
      우리카드: "#bcbcbc",
      NH카드: "#0075c8",
      BC카드: "#0064b7",
      카카오뱅크: "#fee500",
      토스뱅크: "#0064ff",
    };

    // 카드사 이름에 포함된 키워드로 매칭
    for (const [key, color] of Object.entries(colorMap)) {
      if (cardCompany.includes(key.replace("카드", "").replace("뱅크", ""))) {
        return color;
      }
    }

    // 매칭되지 않으면 랜덤 색상 (미리 정의된 색상 배열에서 선택)
    const defaultColors = [
      "#10b981",
      "#3b82f6",
      "#8b5cf6",
      "#ec4899",
      "#f97316",
      "#06b6d4",
      "#84cc16",
    ];
    const hash = cardCompany
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return defaultColors[hash % defaultColors.length];
  }, []);

  // 결제 수단 목록 조회
  const fetchPaymentMethodsRef = useRef(null);
  const fetchPaymentMethods = useCallback(
    async (immediate = false) => {
      if (!isLoggedIn) return Promise.resolve();

      // 즉시 호출하는 경우 (카드 등록 후 등) 디바운싱 없이 바로 실행
      if (immediate) {
        try {
          const methods = await getMyPaymentMethods();
          const list = (methods || []).map((method) => ({
            id: `card_${method.id}`,
            name: method.cardCompany || "등록된 카드",
            type:
              method.methodType === "CARD"
                ? "card"
                : method.methodType.toLowerCase(),
            number: method.cardNumberMasked || "****",
            color: getCardColor(method.cardCompany),
            isDefault: method.isDefault || false,
          }));
          setPaymentMethodList(list);
          return Promise.resolve(list);
        } catch (err) {
          console.error("결제 수단 목록 조회 실패:", err);
          setPaymentMethodList([]);
          return Promise.resolve([]);
        }
      }

      // 일반 호출의 경우 디바운싱 적용
      // 이미 진행 중인 요청이 있으면 취소
      if (fetchPaymentMethodsRef.current) {
        clearTimeout(fetchPaymentMethodsRef.current);
      }

      // Promise를 반환하도록 수정
      return new Promise((resolve) => {
        // 디바운싱: 300ms 내에 여러 번 호출되면 마지막 호출만 실행
        fetchPaymentMethodsRef.current = setTimeout(async () => {
          try {
            const methods = await getMyPaymentMethods();
            const list = (methods || []).map((method) => ({
              id: `card_${method.id}`,
              name: method.cardCompany || "등록된 카드",
              type:
                method.methodType === "CARD"
                  ? "card"
                  : method.methodType.toLowerCase(),
              number: method.cardNumberMasked || "****",
              color: getCardColor(method.cardCompany),
              isDefault: method.isDefault || false,
            }));
            setPaymentMethodList(list);
            resolve(list);
          } catch (err) {
            console.error("결제 수단 목록 조회 실패:", err);
            setPaymentMethodList([]);
            resolve([]);
          } finally {
            fetchPaymentMethodsRef.current = null;
          }
        }, 300);
      });
    },
    [isLoggedIn, getCardColor],
  );

  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

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
        credentials: "include",
      });
      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(
          errBody?.message || `구독 목록 조회 실패 (${response.status})`,
        );
      }
      const json = await response.json();
      const rawList = json?.data ?? [];
      const mapped = rawList.map((d) => {
        const statusMap = {
          ACTIVE: "구독중",
          PAUSED: "일시정지",
          CANCELLATION_PENDING: "해지 예정",
          CANCELLED: "해지됨",
        };
        const statusLabel = statusMap[d.status] ?? d.status;
        const period = d.deliveryTimeSlot
          ? d.deliveryTimeSlot
          : d.storeName
            ? `${d.storeName} 정기배달`
            : "정기배달";
        const totalDelivery = d.totalDeliveryCount ?? 0;
        const completedDelivery = d.completedDeliveryCount ?? 0;
        const remainingDelivery = Math.max(
          0,
          totalDelivery - completedDelivery,
        );
        return {
          id: d.subscriptionId,
          name: d.subscriptionProductName ?? "",
          period,
          price: `${(d.totalAmount ?? 0).toLocaleString()}원/월`,
          status: statusLabel,
          img: "📦",
          nextPayment: d.nextPaymentDate
            ? d.nextPaymentDate.replace(/-/g, ".")
            : "-",
          monthlyCount: totalDelivery ? ` ${totalDelivery}회` : "—",
          daysOfWeek: d.daysOfWeek ?? [],
          includedItems:
            d.items?.map((i) => `${i.productName} ${i.quantity}개`) ?? [],
          totalDeliveryCount: totalDelivery,
          completedDeliveryCount: completedDelivery,
          remainingDeliveryCount: remainingDelivery,
          _rawStatus: d.status,
        };
      });
      setSubscriptionList(mapped);
    } catch (err) {
      console.error("구독 목록 조회 실패:", err);
      setSubscriptionListError(
        err.message || "구독 목록을 불러오지 못했습니다.",
      );
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
  const [trackingTarget, setTrackingTarget] = useState(null);

  // sessionStorage에서 마이페이지 탭 정보 복원 (새로고침 시 현재 탭 유지)
  const [myPageTab, setMyPageTab] = useState(() => {
    const savedMyPageTab = sessionStorage.getItem("myPageTab");
    return savedMyPageTab || "profile";
  });

  // 마이페이지 > 결제수단 탭 진입 시 최신 목록으로 동기화 (새로고침 없이 반영)
  useEffect(() => {
    if (!isLoggedIn) return;
    if (activeTab === "mypage" && myPageTab === "payment") {
      fetchPaymentMethods();
    }
  }, [activeTab, myPageTab, isLoggedIn, fetchPaymentMethods]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 1, content: "" });
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
  const [isEditing, setIsEditing] = useState(false);

  const openTrackingModal = (order = null) => {
    setTrackingTarget(order || null);
    setIsTrackingOpen(true);
  };

  const fetchStoreCategories = useCallback(async () => {
    try {
      const data = await storeApi.getStoreCategories();
      // "전체" 카테고리 추가
      setStoreCategories([{ id: "all", categoryName: "전체" }, ...data]);
    } catch (err) {
      console.error("카테고리 로직 실패:", err);
      // 실패 시 기본 카테고리라도 표시 (fallback)
      setStoreCategories([{ id: "all", categoryName: "전체" }]);
    }
  }, []);

  useEffect(() => {
    fetchStoreCategories();
  }, [fetchStoreCategories]);

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

  const handleOpenReviewModal = async (order) => {
    setSelectedOrderForReview(order);
    if (order.reviewWritten) {
      try {
        const reviewData = await getReviewDetail(order.reviewId);
        setViewingReview(reviewData);
        setIsEditing(false); // 보기 모드로 열기
      } catch (error) {
        console.error("리뷰 조회 실패:", error);
        alert("리뷰 정보를 불러오는데 실패했습니다.");
        return;
      }
    } else {
      setViewingReview(null);
      setReviewForm({ rating: 1, content: "" });
      setIsEditing(false); // 작성 모드는 isEditing과 무관하지만 초기화
    }
    setIsReviewModalOpen(true);
  };

  const handleSaveReview = async (e) => {
    e.preventDefault();

    try {
      if (viewingReview) {
        // 수정 모드
        await updateReview(
          viewingReview.reviewId,
          reviewForm.content,
          reviewForm.rating,
        );
        showToast("리뷰가 수정되었습니다.");
        setViewingReview({
          ...viewingReview,
          content: reviewForm.content,
          rating: reviewForm.rating,
        });
        setIsEditing(false);
      } else {
        // 생성 모드
        await createReview(selectedOrderForReview.storeOrderId, {
          rating: reviewForm.rating,
          content: reviewForm.content,
        });
        showToast("리뷰가 등록되었습니다!");
      }
      setIsReviewModalOpen(false);
      // 목록 갱신
      fetchOrders(orderCurrentPage, orderDateFilter, orderSearchTerm);
    } catch (error) {
      console.error("리뷰 저장 실패:", error);
      alert("리뷰 저장에 실패했습니다.");
    }
  };

  const handleDeleteReview = async () => {
    if (!window.confirm("정말 리뷰를 삭제하시겠습니까?")) return;
    try {
      await deleteReview(viewingReview.reviewId);
      showToast("리뷰가 삭제되었습니다.");
      setIsReviewModalOpen(false);
      setViewingReview(null);
      // 목록 갱신 - await를 사용하여 완료될 때까지 대기
      await fetchOrders(orderCurrentPage, orderDateFilter, orderSearchTerm);
    } catch (error) {
      console.error("리뷰 삭제 실패:", error);
      alert("리뷰 삭제에 실패했습니다.");
    }
  };

  const handleEditReview = () => {
    setReviewForm({ rating: viewingReview.rating, content: viewingReview.content });
    setViewingReview(null); // Switch to edit mode in the same modal
  };



  const handleCancelOrder = (orderId) => {
    setCancellingOrderId(orderId);
    setCancelReason("simple_change");
    setCancelDetail("");
    setIsCancelModalOpen(true);
  };

  const submitCancelOrder = async () => {
    if (!cancelReason) {
      alert("취소 사유를 선택해주세요.");
      return;
    }

    const finalReason =
      cancelReason === "other" && cancelDetail ? cancelDetail : cancelReason;

    setIsCancelling(true);
    try {
      await cancelStoreOrder(cancellingOrderId, finalReason);

      // 로컬 상태 업데이트
      setOrderList((prev) =>
        prev.map((order) =>
          order.storeOrderId === cancellingOrderId
            ? { ...order, status: "주문 취소됨" }
            : order,
        ),
      );

      setIsCancelModalOpen(false);
      showToast("주문이 성공적으로 취소되었습니다.");

      // 주문 목록 다시 가져오기
      await fetchOrders(orderCurrentPage, orderDateFilter, orderSearchTerm);
    } catch (error) {
      console.error("주문 취소 실패:", error);
      alert(error.response?.data?.message || "주문 취소에 실패했습니다.");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRefundOrder = (orderId) => {
    setRefundingOrderId(orderId);
    setRefundReason("simple_change");
    setRefundDetail("");
    setIsRefundModalOpen(true);
  };

  const submitRefundOrder = async () => {
    if (!refundReason) {
      alert("환불 사유를 선택해주세요.");
      return;
    }

    const finalReason =
      refundReason === "other" && refundDetail ? refundDetail : refundReason;

    setIsRefunding(true);
    try {
      await requestRefund(refundingOrderId, finalReason);
      setIsRefundModalOpen(false);
      showToast("환불 요청이 성공적으로 접수되었습니다.");
      await fetchOrders(orderCurrentPage, orderDateFilter, orderSearchTerm);
    } catch (error) {
      console.error("환불 요청 실패:", error);
      alert(error.response?.data?.message || "환불 요청에 실패했습니다.");
    } finally {
      setIsRefunding(false);
    }
  };

  const handleAddToCartFromOrder = async (storeOrderId) => {
    try {
      showToast("장바구니 담는 중...");
      const detail = await getStoreOrderDetail(storeOrderId);
      if (detail && detail.products) {
        for (const item of detail.products) {
          await cartAPI.addToCart(item.productId, item.quantity);
        }
        showToast("장바구니에 다시 담았습니다.");
        fetchCart();
      }
    } catch (error) {
      console.error("장바구니 담기 실패:", error);
      alert("장바구니 담기에 실패했습니다.");
    }
  };

  const handleCancelSubscription = async (subId) => {
    const sub = subscriptionList.find((s) => s.id === subId);
    if (!sub) return;

    // 5-b: 남은 배송건·결제 종료일 안내 후 해지 예정으로 변경 (5-a: 취소 선택 시 기존 상태 유지)
    const hasRemaining = (sub.remainingDeliveryCount ?? 0) > 0;
    const nextPay =
      sub.nextPayment && sub.nextPayment !== "-" ? sub.nextPayment : null;
    let confirmMsg = "정말 이 구독을 해지하시겠습니까?";
    if (hasRemaining || nextPay) {
      confirmMsg += "\n\n";
      if (hasRemaining)
        confirmMsg += `· 남은 배송: ${sub.remainingDeliveryCount}건\n`;
      if (nextPay) confirmMsg += `· 결제 종료일: ${nextPay}\n`;
      confirmMsg +=
        "위 기간까지 혜택이 유지되며, 이후 해지 예정으로 전환됩니다.";
    } else {
      confirmMsg +=
        "\n남은 배송 및 다음 결제 예정일까지는 혜택이 제공될 수 있습니다.";
    }
    const confirmed = window.confirm(confirmMsg);
    if (!confirmed) {
      showToast("구독 해지가 취소되었습니다.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/subscriptions/${subId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        },
      );
      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        showToast(json?.message || "구독 해지 요청에 실패했습니다.");
        return;
      }
      await fetchSubscriptions();
      if (hasRemaining || nextPay) {
        const parts = [];
        if (hasRemaining)
          parts.push(`남은 배송 ${sub.remainingDeliveryCount}건`);
        if (nextPay) parts.push(`결제 종료일 ${nextPay}`);
        showToast(
          `${parts.join(", ")}까지 혜택이 유지되며, 해지 예정으로 전환되었습니다.`,
        );
      } else {
        showToast("구독 해지가 요청되었습니다.");
      }
    } catch (err) {
      console.error("구독 해지 요청 실패:", err);
      showToast("구독 해지 요청에 실패했습니다.");
    }
  };

  const resumeSubscription = async (subId) => {
    const sub = subscriptionList.find((s) => s.id === subId);
    if (!sub) return;
    if (sub._rawStatus === "CANCELLATION_PENDING") {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/subscriptions/${subId}/cancellation/cancel`,
          {
            method: "PATCH",
            credentials: "include",
          },
        );
        const json = await response.json().catch(() => ({}));
        if (!response.ok) {
          showToast(json?.message || "구독 해지 취소에 실패했습니다.");
          return;
        }
        await fetchSubscriptions();
        showToast(
          "구독 해지가 취소되었습니다. 계속해서 혜택을 누리실 수 있습니다!",
        );
      } catch (err) {
        console.error("구독 해지 취소 실패:", err);
        showToast("구독 해지 취소에 실패했습니다.");
      }
      return;
    }
    if (sub._rawStatus === "PAUSED") {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/subscriptions/${subId}/resume`,
          {
            method: "PATCH",
            credentials: "include",
          },
        );
        const json = await response.json().catch(() => ({}));
        if (!response.ok) {
          showToast(json?.message || "구독 재개에 실패했습니다.");
          return;
        }
        await fetchSubscriptions();
        showToast("구독이 재개되었습니다.");
      } catch (err) {
        console.error("구독 재개 실패:", err);
        showToast("구독 재개에 실패했습니다.");
      }
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // sessionStorage에 현재 탭 저장 (새로고침 시 복원용)
    sessionStorage.setItem("activeTab", tab);
    setSelectedStore(null);
    window.scrollTo(0, 0);
  };

  const onAddToCart = async (product, store, quantity = 1) => {
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
      const addQty = Math.max(1, Number(quantity) || 1);
      const newQuantity = existingItem ? existingItem.quantity + addQty : addQty;

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
            setCartItems((prevItems) =>
              prevItems.map((cartItem) =>
                cartItem.id === id || cartItem.cartProductId === id
                  ? { ...cartItem, quantity: newQuantity }
                  : cartItem,
              ),
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
      const item = cartItems.find(
        (item) => item.id === id || item.cartProductId === id,
      );
      if (!item) {
        console.error("장바구니 아이템을 찾을 수 없습니다.");
        return;
      }

      await cartAPI.removeFromCart(item.productId);
      // 삭제 후 서버 장바구니를 다시 조회해 목록/결제창과 항상 동기화
      const fresh = await cartAPI.getCart();
      setCartItems(Array.isArray(fresh?.items) ? fresh.items : []);
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

  const handleDeletePaymentMethod = async (id) => {
    if (!window.confirm("이 결제 수단을 삭제하시겠습니까?")) {
      return;
    }

    try {
      // id 형식이 "card_123"이므로 숫자 부분만 추출
      const paymentMethodId =
        typeof id === "string" && id.startsWith("card_")
          ? parseInt(id.replace("card_", ""), 10)
          : id;

      console.log("삭제 시도:", { 원본ID: id, 파싱된ID: paymentMethodId });

      if (!paymentMethodId || isNaN(paymentMethodId)) {
        throw new Error("유효하지 않은 결제 수단 ID입니다.");
      }

      // 백엔드 API 호출
      await deletePaymentMethod(paymentMethodId);

      console.log("삭제 성공, 목록 갱신 중...");

      // 최신 목록으로 동기화
      await fetchPaymentMethods();

      showToast("결제 수단이 삭제되었습니다.");
    } catch (err) {
      console.error("결제 수단 삭제 실패:", err);
      console.error("에러 상세:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
      });
      const message =
        err.response?.data?.message ||
        err.message ||
        "결제 수단 삭제에 실패했습니다.";
      alert(message);
    }
  };

  const handleSetDefaultPaymentMethod = async (id) => {
    try {
      // id 형식이 "card_123"이므로 숫자 부분만 추출
      const paymentMethodId =
        typeof id === "string" && id.startsWith("card_")
          ? parseInt(id.replace("card_", ""), 10)
          : id;

      if (!paymentMethodId || isNaN(paymentMethodId)) {
        throw new Error("유효하지 않은 결제 수단 ID입니다.");
      }

      // 백엔드 API 호출
      await setDefaultPaymentMethod(paymentMethodId);

      // 최신 목록으로 동기화
      await fetchPaymentMethods();

      showToast("기본 결제 수단으로 설정되었습니다.");
    } catch (err) {
      console.error("기본 결제 수단 설정 실패:", err);
      const message =
        err.response?.data?.message ||
        err.message ||
        "기본 결제 수단 설정에 실패했습니다.";
      alert(message);
    }
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
    // 카드 등록 완료 후 서버에서 최신 목록을 가져옴 (로컬 상태 추가 없이)
    fetchPaymentMethods();
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
              title={
                <>
                  장바구니 확인을 위해 <br /> 로그인이 필요합니다
                </>
              }
              onLogin={() => {
                setActiveTab("home");
                onOpenAuth();
              }}
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
            cartItems={
              checkoutCartItems != null && checkoutCartItems.length > 0
                ? checkoutCartItems
                : cartItems
            }
            addresses={addressList}
            paymentMethods={paymentMethodList}
            onBack={() => {
              setCheckoutCartItems(null);
              setActiveTab("home");
            }}
            onComplete={(success, orderId, isSubscription = false) => {
              if (success) {
                setCheckoutCartItems(null);
                setIsSubscriptionOrder(isSubscription);
                setIsSuccessModalOpen(true);
                clearCart();
              } else {
                setCheckoutCartItems(null);
                setActiveTab("home");
                showToast("결제에 실패하였습니다. 장바구니 상품이 유지됩니다.");
              }
            }}
            onRefreshPaymentMethods={fetchPaymentMethods}
            onNavigateToPaymentManagement={() => {
              setActiveTab("mypage");
              setMyPageTab("payment");
              sessionStorage.setItem("myPageTab", "payment");
            }}
          />
        );
      case "tracking":
        // Redirect to modal if tracking tab is somehow active
        setTimeout(() => {
          setActiveTab("home");
          openTrackingModal();
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
              title={
                <>
                  마이페이지 확인을 위해 <br /> 로그인이 필요합니다
                </>
              }
              onLogin={onOpenAuth}
              onBack={() => setActiveTab("home")}
            />
          );
        }
        return (
          <MypageTabContent
            isLoggedIn={isLoggedIn}
            myPageTab={myPageTab}
            setMyPageTab={setMyPageTab}
            isResidentRider={isResidentRider}
            verifyStep={verifyStep}
            setVerifyStep={setVerifyStep}
            setActiveTab={setActiveTab}
            onLogout={onLogout}
            orderList={orderList}
            orderCurrentPage={orderCurrentPage}
            orderTotalPages={orderTotalPages}
            onOrderDateFilterChange={handleOrderDateFilterChange}
            onOrderPageChange={handleOrderPageChange}
            onOrderSearch={handleOrderSearch}
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
            openTrackingModal={openTrackingModal}
            handleOpenReviewModal={handleOpenReviewModal}
            handleCancelOrder={handleCancelOrder}
            handleRefundOrder={handleRefundOrder}
            handleAddToCartFromOrder={handleAddToCartFromOrder}
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
            onRefreshPaymentMethods={fetchPaymentMethods}
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
                        paddingRight: "40px",
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
                    {localSearchTerm && (
                      <button
                        onClick={() => {
                          setLocalSearchTerm("");
                          setSearchQuery("");
                          showToast("검색어가 초기화되었습니다.");
                        }}
                        style={{
                          position: "absolute",
                          right: "12px",
                          background: "#f1f5f9",
                          border: "none",
                          borderRadius: "50%",
                          width: "20px",
                          height: "20px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "10px",
                          color: "#64748b",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.background = "#e2e8f0")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.background = "#f1f5f9")
                        }
                        title="검색어 초기화"
                      >
                        ✕
                      </button>
                    )}
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
                  categories={storeCategories}
                />
                <StoreGrid
                  selectedCategory={selectedCategory}
                  searchQuery={searchQuery}
                  coords={coords}
                  onAddToCart={onAddToCart}
                  onStoreClick={(store) => {
                    if (store.isOpen === false) {
                      showToast("현재 배달이 불가능한 매장입니다.");
                      return;
                    }
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
        onClose={() => !isCancelling && setIsCancelModalOpen(false)}
        reason={cancelReason}
        setReason={setCancelReason}
        detail={cancelDetail}
        setDetail={setCancelDetail}
        onConfirm={submitCancelOrder}
        isProcessing={isCancelling}
      />
      <OrderRefundModal
        isOpen={isRefundModalOpen}
        onClose={() => !isRefunding && setIsRefundModalOpen(false)}
        reason={refundReason}
        setReason={setRefundReason}
        detail={refundDetail}
        setDetail={setRefundDetail}
        onConfirm={submitRefundOrder}
        isProcessing={isRefunding}
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
        onGoToStoreDashboard={() => setUserRole("STORE")}
        storeId={myStoreId}
        onCartClick={async () => {
          await fetchCart();
          setIsCartOpen(true);
        }}
      />
      <div style={{ minHeight: "calc(100vh - 200px)" }}>
        {selectedStore ? (
          selectedStore.isOpen === false ? (
            <div
              style={{
                padding: "40px 24px",
                textAlign: "center",
                backgroundColor: "var(--bg-card)",
                borderRadius: "var(--radius)",
                margin: "24px",
                boxShadow: "var(--shadow)",
              }}
            >
              <p style={{ fontSize: "18px", fontWeight: "700", color: "#64748b", marginBottom: "24px" }}>
                현재 배달이 불가능한 매장입니다.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedStore(null);
                  window.scrollTo(0, 0);
                }}
                style={{
                  padding: "12px 24px",
                  borderRadius: "12px",
                  border: "none",
                  background: "var(--primary)",
                  color: "white",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                목록으로 돌아가기
              </button>
            </div>
          ) : (
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
                  const deliveryTimeSlot =
                    subProduct.deliveryTimeSlot ?? subProduct.deliveryTime;
                  const subscriptionProductId =
                    subProduct.id != null ? Number(subProduct.id) : null;
                  const isNumericId =
                    subscriptionProductId != null &&
                    !Number.isNaN(subscriptionProductId);

                  if (!deliveryTimeSlot || !isNumericId) {
                    showToast(
                      "배송 시간대를 선택해 주세요. (실제 구독 상품이 있는 마트에서만 구독 신청이 가능합니다.)",
                    );
                    return;
                  }
                  if (addressList.length === 0) {
                    showToast("배송지를 먼저 등록해 주세요.");
                    return;
                  }

                  // 구독 상품 정보를 sessionStorage에 저장하고 결제창으로 이동
                  const subscriptionData = {
                    subscriptionProductId,
                    deliveryTimeSlot,
                    daysOfWeek: subProduct.daysOfWeek || [],
                    price: subProduct.price,
                    name: subProduct.name,
                    desc: subProduct.desc,
                    img: subProduct.img,
                    totalDeliveryCount: subProduct.totalDeliveryCount,
                  };
                  sessionStorage.setItem(
                    "pendingSubscriptionCheckout",
                    JSON.stringify(subscriptionData),
                  );

                  // 결제창으로 이동
                  setSelectedStore(null);
                  setActiveTab("checkout");
                  window.scrollTo(0, 0);
                }}
              />
            </div>
          )
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
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setViewingReview(null);
          }}
          viewingReview={viewingReview}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          selectedOrderForReview={selectedOrderForReview}
          reviewForm={reviewForm}
          setReviewForm={setReviewForm}
          onSave={handleSaveReview}
          onDelete={handleDeleteReview}
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
          onClick={() => openTrackingModal()}
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
          onClick={async () => {
            await fetchCart();
            setIsCartOpen(true);
          }}
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
        onCheckout={(itemsToCheckout) => {
          sessionStorage.removeItem("pendingSubscriptionCheckout");
          setIsCartOpen(false);
          setSelectedStore(null);
          // 선택한 상품만 결제창으로 전달 (없으면 전체 장바구니)
          setCheckoutCartItems(
            Array.isArray(itemsToCheckout) && itemsToCheckout.length > 0
              ? itemsToCheckout
              : null,
          );
          setActiveTab("checkout");
        }}
        isLoggedIn={isLoggedIn}
        onOpenAuth={onOpenAuth}
      />
      <TrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        trackingTarget={trackingTarget}
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
        onClose={async () => {
          setIsSuccessModalOpen(false);
          setIsSubscriptionOrder(false);
          clearCart();
          setActiveTab("home");
          // 주문 목록 갱신
          await fetchOrders();
        }}
        onViewOrder={async () => {
          setIsSuccessModalOpen(false);
          clearCart();
          setActiveTab("mypage");
          sessionStorage.setItem("activeTab", "mypage");
          // 주문 목록 갱신
          await fetchOrders();
          if (isSubscriptionOrder) {
            setMyPageTab("subscription");
            sessionStorage.setItem("myPageTab", "subscription");
            // 구독 목록 새로고침
            fetchSubscriptions();
            // 탭 전환 후 스크롤을 맨 위로 이동 (약간의 지연 필요)
            setTimeout(() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }, 100);
            setTimeout(() => {
              window.scrollTo({ top: 0, behavior: "auto" });
            }, 500);
          } else {
            setMyPageTab("profile");
            sessionStorage.setItem("myPageTab", "profile");
          }
          setIsSubscriptionOrder(false);
        }}
      />
    </div>
  );
};

export default CustomerView;
