import React, { useState, useEffect } from "react";
import Header from "../common/Header";
import Hero from "../common/Hero";
import StoreGrid from "../common/StoreGrid";
import CategorySidebar from "../common/CategorySidebar";
import SearchResultsView from "./SearchResultsView";
import CheckoutView from "./CheckoutView";
import OrderTrackingView from "./OrderTrackingView";
import ResidentDeliveryView from "./ResidentDeliveryView";
import SupportView from "./SupportView";
import PartnerPage from "./PartnerPage";
import Footer from "../common/Footer";
import {
  orders,
  subscriptions,
  reviews,
  stores,
  addresses,
  paymentMethods,
  faqs,
  categories,
  coupons,
  inquiries,
  loyaltyPoints,
  subscriptionPayments,
} from "../../data/mockData";
import CartModal from "../modals/CartModal";
import StoreDetailView from "./StoreDetailView";
import StoreRegistrationView from "./StoreRegistrationView";
import RiderRegistrationView from "./RiderRegistrationView";
import OrderManagementView from "./OrderManagementView";
import LocationModal from "../modals/LocationModal";
import * as cartAPI from "../../api/cart.js";

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";
// import required modules
import { EffectCoverflow, Pagination, Navigation } from "swiper/modules";

const TrackingModal = ({ isOpen, onClose, orderId }) => {
  if (!isOpen) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1100,
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          height: "80vh",
          backgroundColor: "white",
          borderRadius: "24px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ fontSize: "18px", fontWeight: "800" }}>배송 현황</h3>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              fontSize: "24px",
              color: "#94a3b8",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ flexGrow: 1, overflowY: "auto" }}>
          <OrderTrackingView
            orderId={orderId}
            onBack={onClose}
            isModal={true}
          />
        </div>
      </div>
    </div>
  );
};

const CustomerView = ({
  userRole,
  setUserRole,
  isLoggedIn,
  onLogout,
  onOpenAuth,
  onOpenNotifications,
  isResidentRider,
  setIsResidentRider,
  notificationCount,
  storeRegistrationStatus,
  setStoreRegistrationStatus,
  riderInfo,
  setRiderInfo,
  userInfo,
  isNotificationOpen,
  notifications,
  onMarkAsRead,
  onClearAll,
  onCloseNotifications,
}) => {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStore, setSelectedStore] = useState(null); // Local state for full page view

  const [cartItems, setCartItems] = useState([]);
  const [toast, setToast] = useState(null);
  const [currentLocation, setCurrentLocation] = useState("역삼동 123-45");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [orderList, setOrderList] = useState(orders);
  const [subscriptionList, setSubscriptionList] = useState(subscriptions);

  useEffect(() => {
    const fetchCart = async () => {
      if (isLoggedIn) {
        try {
          const result = await cartAPI.getCart();
          setCartItems(result.items);
        } catch (error) {
          console.error("장바구니 조회 실패:", error);
          // 에러 발생 시 빈 배열로 설정
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
    };

    fetchCart();
  }, [isLoggedIn]);

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
  const [addressList, setAddressList] = useState(addresses);
  const [paymentMethodList, setPaymentMethodList] = useState(paymentMethods);
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
      });
    }
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = () => {
    if (
      !newAddress.label ||
      !newAddress.contact ||
      !newAddress.address ||
      !newAddress.detail
    ) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    let updatedList = [...addressList];

    // If new address is default, unset previous default
    if (newAddress.isDefault) {
      updatedList = updatedList.map((addr) => ({ ...addr, isDefault: false }));
    }

    if (editingAddress) {
      updatedList = updatedList.map((addr) =>
        addr.id === editingAddress.id ? { ...newAddress } : addr,
      );
      setAddressList(updatedList);
      showToast("배송 정보가 수정되었습니다.");
    } else {
      const newId = Date.now();
      // If it's the first address, make it default automatically
      const isFirst = updatedList.length === 0;

      updatedList.push({
        id: newId,
        ...newAddress,
        isDefault: isFirst || newAddress.isDefault,
      });
      setAddressList(updatedList);
      showToast("새 배송지가 추가되었습니다.");
    }

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
    });
  };

  const handleSetDefaultAddress = (id) => {
    setAddressList((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      })),
    );
    showToast("기본 배송지로 변경되었습니다.");
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

  const handleCancelSubscription = (subId) => {
    const sub = subscriptionList.find((s) => s.id === subId);
    if (!sub) return;

    if (sub.nextPayment && sub.nextPayment !== "-") {
      setSubscriptionList((prev) =>
        prev.map((item) =>
          item.id === subId ? { ...item, status: "해지 예정" } : item,
        ),
      );
      alert(
        `남은 배송 일정이 있어 ${sub.nextPayment}일에 정기 결제가 종료되며 '해지 예정' 상태로 변경되었습니다. 마지막 배송까지 정성을 다하겠습니다.`,
      );
    } else {
      setSubscriptionList((prev) =>
        prev.map((item) =>
          item.id === subId
            ? { ...item, status: "해지됨", nextPayment: "-" }
            : item,
        ),
      );
      alert(
        "남은 배송 일정이 없어 즉시 '해지됨' 상태로 변경되었습니다. 그동안 이용해 주셔서 감사합니다.",
      );
    }
  };

  const resumeSubscription = (subId) => {
    setSubscriptionList((prev) =>
      prev.map((item) =>
        item.id === subId ? { ...item, status: "구독중" } : item,
      ),
    );
    showToast(
      "구독 해지가 취소되었습니다. 계속해서 혜택을 누리실 수 있습니다!",
    );
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

  const renderActiveView = () => {
    switch (activeTab) {
      case "special":
        return (
          <div style={{ padding: "20px" }}>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "800",
                marginBottom: "24px",
              }}
            >
              진행 중인 기획전
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "24px",
              }}
            >
              {[
                {
                  title: "겨울철 비타민 충전!",
                  desc: "제철 과일 20% 할인",
                  color:
                    "linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)",
                },
                {
                  title: "따끈따끈 밀키트",
                  desc: "우리집이 맛집! 전품목 15%",
                  color: "linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)",
                },
                {
                  title: "우리동네 정육점 특가",
                  desc: "한우/한돈 최대 30% 할인",
                  color:
                    "linear-gradient(to right, #f78ca0 0%, #f9748f 19%, #fd868c 60%, #fe9a8b 100%)",
                },
                {
                  title: "유기농 야채 새벽배송",
                  desc: "신규 구독 시 첫 주 무료",
                  color: "linear-gradient(to top, #0ba360 0%, #3cba92 100%)",
                },
              ].map((special, i) => (
                <div
                  key={i}
                  style={{
                    height: "200px",
                    borderRadius: "20px",
                    background: special.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    padding: "20px",
                    textAlign: "center",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: "20px",
                        fontWeight: "700",
                        marginBottom: "8px",
                      }}
                    >
                      {special.title}
                    </h3>
                    <p style={{ fontSize: "14px" }}>{special.desc}</p>
                    <button
                      onClick={() =>
                        showToast("상세 기획전 페이지로 이동합니다. (데모)")
                      }
                      style={{
                        marginTop: "16px",
                        padding: "8px 16px",
                        borderRadius: "20px",
                        background: "white",
                        color: "#333",
                        border: "none",
                        fontWeight: "700",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      자세히 보기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "subscription":
        return (
          <div style={{ padding: "20px" }}>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "800",
                marginBottom: "24px",
              }}
            >
              나의 구독 관리
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "24px",
              }}
            >
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  style={{
                    background: "white",
                    padding: "24px",
                    borderRadius: "16px",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "16px",
                    }}
                  >
                    <div style={{ fontSize: "32px" }}>{sub.img}</div>
                    <div
                      style={{
                        backgroundColor:
                          sub.status === "이용 중" ? "#f0fdf4" : "#f1f5f9",
                        color:
                          sub.status === "이용 중"
                            ? "var(--primary)"
                            : "var(--text-muted)",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "700",
                      }}
                    >
                      {sub.status}
                    </div>
                  </div>
                  <div
                    style={{
                      fontWeight: "700",
                      fontSize: "18px",
                      marginBottom: "8px",
                    }}
                  >
                    {sub.name}
                  </div>
                  <div
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "14px",
                      marginBottom: "20px",
                    }}
                  >
                    {sub.period} |{" "}
                    <span
                      style={{ color: "var(--primary)", fontWeight: "600" }}
                    >
                      {sub.price}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() =>
                        showToast("구독 구성 변경 모달을 준비 중입니다.")
                      }
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        background: "white",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      구성 변경
                    </button>
                    <button
                      onClick={() =>
                        showToast("이번 주 배송을 건너뛰었습니다.")
                      }
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        background: "white",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      건너뛰기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "cart": {
        if (!isLoggedIn) {
          return (
            <div
              style={{
                padding: "100px 0",
                textAlign: "center",
                maxWidth: "400px",
                margin: "0 auto",
              }}
            >
              <div style={{ fontSize: "64px", marginBottom: "24px" }}>🛒</div>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  marginBottom: "16px",
                }}
              >
                장바구니 확인을 위해 <br /> 로그인이 필요합니다
              </h2>
              <button
                onClick={() => {
                  setActiveTab("home");
                  onOpenAuth();
                }}
                className="btn-primary"
                style={{ padding: "12px 24px" }}
              >
                로그인하기
              </button>
            </div>
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
            cartItems={cartItems}
            onComplete={(success) => {
              if (success) {
                setIsSuccessModalOpen(true);
                // clearCart() will be called when modal closes or immediately
                clearCart();
              } else {
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
          />
        );
      case "rider_registration":
        return (
          <RiderRegistrationView
            userInfo={userInfo}
            onBack={() => setActiveTab("partner")}
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
            <div
              style={{
                padding: "100px 0",
                textAlign: "center",
                maxWidth: "400px",
                margin: "0 auto",
              }}
            >
              <div style={{ fontSize: "64px", marginBottom: "24px" }}>👤</div>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  marginBottom: "16px",
                }}
              >
                마이페이지 확인을 위해 <br /> 로그인이 필요합니다
              </h2>
              <p
                style={{
                  color: "var(--text-muted)",
                  marginBottom: "32px",
                  lineHeight: "1.6",
                }}
              >
                회원가입 후 동네마켓의 신선한 상품들과 <br /> 다양한 혜택을
                만나보세요!
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <button
                  onClick={onOpenAuth}
                  className="btn-primary"
                  style={{ padding: "16px", fontSize: "16px" }}
                >
                  간편 로그인 / 회원가입
                </button>
                <button
                  onClick={() => setActiveTab("home")}
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    background: "#f1f5f9",
                    color: "#475569",
                    border: "none",
                    fontWeight: "700",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  홈으로 돌아가기
                </button>
              </div>
            </div>
          );
        }
        return (
          <div style={{ padding: "20px" }}>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "800",
                marginBottom: "24px",
              }}
            >
              마이 페이지
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "260px 1fr",
                gap: "24px",
              }}
            >
              <div
                style={{
                  background: "white",
                  padding: "24px",
                  borderRadius: "16px",
                  border: "1px solid var(--border)",
                  height: "fit-content",
                }}
              >
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      backgroundColor: "#f1f5f9",
                      margin: "0 auto 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "32px",
                    }}
                  >
                    {isLoggedIn ? "👤" : "👣"}
                  </div>
                  <div style={{ fontWeight: "700", fontSize: "18px" }}>
                    {isLoggedIn ? "사용자 님" : "비회원 님"}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    {isLoggedIn
                      ? "님은 'VIP' 등급입니다."
                      : "로그인하고 혜택을 받으세요."}
                  </div>
                  <div
                    style={{
                      marginTop: "12px",
                      display: "flex",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "#fdf2f8",
                        color: "#db2777",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: "800",
                      }}
                    >
                      P {loyaltyPoints.toLocaleString()}
                    </div>
                    <div
                      style={{
                        backgroundColor: "#fff7ed",
                        color: "#c2410c",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: "800",
                      }}
                    >
                      쿠폰 {coupons.length}장
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {[
                    { id: "profile", label: "주문/리뷰 관리", icon: "📝" },
                    { id: "user_profile", label: "내 정보 관리", icon: "👤" },
                    { id: "subscription", label: "구독 관리", icon: "📅" },
                    { id: "address", label: "배송지 관리", icon: "📍" },
                    { id: "payment", label: "결제 수단 관리", icon: "💳" },
                    { id: "coupon", label: "쿠폰함", icon: "🎫" },
                    { id: "help", label: "고객지원", icon: "📞" },
                    {
                      id: "application_status",
                      label: "신청 현황",
                      icon: "📋",
                    },
                    {
                      id: "resident",
                      label: "주민라이더",
                      icon: "🛵",
                      visible: isResidentRider || verifyStep > 0,
                    },
                  ]
                    .filter((tab) => tab.visible !== false)
                    .map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setMyPageTab(tab.id)}
                        style={{
                          textAlign: "left",
                          padding: "12px 16px",
                          borderRadius: "12px",
                          border: "none",
                          background:
                            myPageTab === tab.id
                              ? "rgba(46, 204, 113, 0.1)"
                              : "transparent",
                          color:
                            myPageTab === tab.id ? "var(--primary)" : "#475569",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          transition: "all 0.2s",
                        }}
                        onMouseOver={(e) => {
                          if (myPageTab !== tab.id)
                            e.currentTarget.style.backgroundColor = "#f8fafc";
                        }}
                        onMouseOut={(e) => {
                          if (myPageTab !== tab.id)
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                        }}
                      >
                        <span style={{ fontSize: "18px" }}>{tab.icon}</span>
                        <span style={{ whiteSpace: "nowrap" }}>
                          {tab.label}
                        </span>
                      </button>
                    ))}
                  <div
                    style={{
                      height: "1px",
                      background: "#f1f5f9",
                      margin: "12px 0",
                    }}
                  ></div>
                  <button
                    onClick={onLogout}
                    style={{
                      textAlign: "left",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: "none",
                      background: "transparent",
                      fontWeight: "700",
                      color: "#94a3b8",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <span>🚪</span>
                    로그아웃
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
                {myPageTab === "profile" && (
                  <OrderManagementView
                    orders={orderList}
                    onTracking={(order) => {
                      setIsTrackingOpen(true);
                    }}
                    onWriteReview={(order) => {
                      setViewingReview(null);
                      handleOpenReviewModal(order);
                    }}
                    onCancelOrder={handleCancelOrder}
                    onViewReview={(order) => {
                      const review = reviews.find(
                        (r) => r.store === order.store,
                      ) || {
                        rate: 5,
                        content:
                          "정말 신선하고 배송도 빨라요! 재구매 의사 있습니다.",
                        store: order.store,
                      };
                      setViewingReview(review);
                      setSelectedOrderForReview(order);
                      setIsReviewModalOpen(true);
                    }}
                    onBack={() => setActiveTab("home")}
                  />
                )}

                {myPageTab === "user_profile" && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "24px",
                    }}
                  >
                    <div
                      style={{
                        background: "white",
                        padding: "32px",
                        borderRadius: "24px",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "18px",
                          fontWeight: "800",
                          marginBottom: "24px",
                        }}
                      >
                        내 정보 관리
                      </h3>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "20px",
                        }}
                      >
                        {[
                          { label: "이름", value: userInfo.name },
                          { label: "이메일", value: userInfo.email },
                          { label: "연락처", value: userInfo.phone },
                          { label: "생년월일", value: userInfo.birth },
                          { label: "가입일", value: userInfo.joinDate },
                        ].map((item, i) => (
                          <div
                            key={i}
                            style={{
                              display: "grid",
                              gridTemplateColumns: "120px 1fr",
                              alignItems: "center",
                            }}
                          >
                            <label
                              style={{
                                fontSize: "14px",
                                color: "#64748b",
                                fontWeight: "700",
                              }}
                            >
                              {item.label}
                            </label>
                            <input
                              type="text"
                              value={item.value}
                              readOnly
                              style={{
                                padding: "12px 16px",
                                borderRadius: "10px",
                                border: "1px solid #f1f5f9",
                                backgroundColor: "#f8fafc",
                                color: "#1e293b",
                                fontSize: "14px",
                                fontWeight: "600",
                                outline: "none",
                              }}
                            />
                          </div>
                        ))}
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#94a3b8",
                            marginTop: "12px",
                          }}
                        >
                          * 개인정보 보호를 위해 정보 수정은 고객센터를 통해
                          가능합니다.
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        background: "white",
                        padding: "32px",
                        borderRadius: "24px",
                        border: "1px solid #fee2e2",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "18px",
                          fontWeight: "800",
                          color: "#ef4444",
                          marginBottom: "16px",
                        }}
                      >
                        회원 탈퇴
                      </h3>
                      <p
                        style={{
                          fontSize: "14px",
                          color: "#64748b",
                          lineHeight: "1.6",
                          marginBottom: "24px",
                        }}
                      >
                        탈퇴 시 모든 적립금, 쿠폰, 주문 내역이 삭제되며 복구가
                        불가능합니다.
                        <br />
                        신중하게 결정해 주시기 바랍니다.
                      </p>

                      <button
                        onClick={() => {
                          const hasActiveSub = subscriptionList.some(
                            (sub) => sub.status !== "해지됨",
                          );
                          if (hasActiveSub) {
                            alert(
                              "현재 이용 중이거나 해지 예정인 구독 상품이 있습니다. 구독 상품을 모두 해지(종료)하신 후에만 탈퇴가 가능합니다.",
                            );
                            return;
                          }

                          if (
                            window.confirm(
                              "탈퇴 시 모든 적립금, 쿠폰, 주문 내역이 즉시 삭제되며 복구가 불가능합니다. 정말 탈퇴하시겠습니까?",
                            )
                          ) {
                            if (
                              window.confirm(
                                "마지막 확인입니다. 동네마켓을 탈퇴하시겠습니까?",
                              )
                            ) {
                              alert(
                                "탈퇴 처리가 완료되었습니다. 그동안 이용해주셔서 감사합니다.",
                              );
                              onLogout();
                            }
                          }
                        }}
                        style={{
                          padding: "12px 24px",
                          borderRadius: "10px",
                          background: "white",
                          border: "1px solid #ef4444",
                          color: "#ef4444",
                          fontWeight: "800",
                          fontSize: "14px",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = "#ef4444";
                          e.currentTarget.style.color = "white";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = "white";
                          e.currentTarget.style.color = "#ef4444";
                        }}
                      >
                        회원 탈퇴하기
                      </button>
                    </div>
                  </div>
                )}

                {myPageTab === "subscription" && (
                  <div
                    style={{
                      background: "white",
                      padding: "24px",
                      borderRadius: "16px",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "24px",
                      }}
                    >
                      <h3 style={{ fontSize: "18px", fontWeight: "700" }}>
                        나의 구독 관리
                      </h3>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          backgroundColor: "#f8fafc",
                          padding: "4px",
                          borderRadius: "10px",
                        }}
                      >
                        {["전체", "구독중", "해지 예정"].map((f) => (
                          <button
                            key={f}
                            onClick={() => setSubscriptionFilter(f)}
                            style={{
                              padding: "6px 14px",
                              borderRadius: "8px",
                              border: "none",
                              fontSize: "12px",
                              fontWeight: "700",
                              background:
                                subscriptionFilter === f
                                  ? "var(--primary)"
                                  : "transparent",
                              color:
                                subscriptionFilter === f ? "white" : "#64748b",
                              cursor: "pointer",
                            }}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        marginBottom: "40px",
                      }}
                    >
                      {subscriptionList
                        .filter(
                          (s) =>
                            subscriptionFilter === "전체" ||
                            s.status === subscriptionFilter,
                        )
                        .map((sub) => (
                          <div
                            key={sub.id}
                            style={{
                              background: "white",
                              borderRadius: "16px",
                              border: "1px solid var(--border)",
                              overflow: "hidden",
                              transition: "all 0.3s ease",
                            }}
                          >
                            {/* List Item Header */}
                            <div
                              onClick={() =>
                                setExpandedSubId(
                                  expandedSubId === sub.id ? null : sub.id,
                                )
                              }
                              style={{
                                padding: "20px 24px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                cursor: "pointer",
                                backgroundColor:
                                  expandedSubId === sub.id
                                    ? "#f8fafc"
                                    : "white",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "16px",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: "24px",
                                    width: "44px",
                                    height: "44px",
                                    backgroundColor: "#f1f5f9",
                                    borderRadius: "12px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  {sub.img}
                                </div>
                                <div>
                                  <div
                                    style={{
                                      fontWeight: "800",
                                      fontSize: "16px",
                                      color: "#1e293b",
                                    }}
                                  >
                                    {sub.name}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "12px",
                                      color: "#64748b",
                                      marginTop: "2px",
                                    }}
                                  >
                                    {sub.period} • {sub.price}
                                  </div>
                                </div>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "12px",
                                }}
                              >
                                <div
                                  style={{
                                    backgroundColor:
                                      sub.status === "구독중"
                                        ? "rgba(16, 185, 129, 0.1)"
                                        : sub.status === "해지 예정"
                                          ? "rgba(245, 158, 11, 0.1)"
                                          : "#f1f5f9",
                                    color:
                                      sub.status === "구독중"
                                        ? "var(--primary)"
                                        : sub.status === "해지 예정"
                                          ? "#f59e0b"
                                          : "#94a3b8",
                                    padding: "4px 10px",
                                    borderRadius: "6px",
                                    fontSize: "11px",
                                    fontWeight: "800",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {sub.status}
                                </div>
                                <span
                                  style={{
                                    fontSize: "18px",
                                    color: "#94a3b8",
                                    transform:
                                      expandedSubId === sub.id
                                        ? "rotate(180deg)"
                                        : "rotate(0)",
                                    transition: "transform 0.3s",
                                  }}
                                >
                                  ▾
                                </span>
                              </div>
                            </div>

                            {/* Expandable Content (Dropdown) */}
                            {expandedSubId === sub.id && (
                              <div
                                style={{
                                  padding: "0 24px 24px",
                                  borderTop: "1px solid #f1f5f9",
                                  backgroundColor: "#f8fafc",
                                  animation: "slideDown 0.3s ease-out",
                                }}
                              >
                                <div style={{ paddingTop: "20px" }}>
                                  {/* Plan Detail Summary */}
                                  <div
                                    style={{
                                      padding: "20px",
                                      backgroundColor: "white",
                                      borderRadius: "16px",
                                      border: "1px solid #e2e8f0",
                                      marginBottom: "20px",
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginBottom: "16px",
                                      }}
                                    >
                                      <span
                                        style={{
                                          fontSize: "14px",
                                          fontWeight: "800",
                                          color: "#1e293b",
                                        }}
                                      >
                                        구독 상품 구성
                                      </span>
                                      <span
                                        style={{
                                          fontSize: "13px",
                                          fontWeight: "700",
                                          color: "var(--primary)",
                                          backgroundColor:
                                            "rgba(46, 204, 113, 0.1)",
                                          padding: "2px 8px",
                                          borderRadius: "4px",
                                        }}
                                      >
                                        월 {sub.monthlyCount} 배송
                                      </span>
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: "8px",
                                      }}
                                    >
                                      {sub.includedItems?.map((item, idx) => (
                                        <span
                                          key={idx}
                                          style={{
                                            fontSize: "12px",
                                            padding: "6px 12px",
                                            backgroundColor: "#f1f5f9",
                                            color: "#475569",
                                            borderRadius: "8px",
                                            border: "1px solid #e2e8f0",
                                          }}
                                        >
                                          {item}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  {sub.status === "구독중" ? (
                                    <>
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                          marginBottom: "20px",
                                          padding: "16px",
                                          backgroundColor: "white",
                                          borderRadius: "12px",
                                          border: "1px solid #e2e8f0",
                                        }}
                                      >
                                        <span
                                          style={{
                                            fontSize: "13px",
                                            color: "#64748b",
                                          }}
                                        >
                                          다음 결제 예정일
                                        </span>
                                        <span
                                          style={{
                                            fontSize: "14px",
                                            fontWeight: "800",
                                            color: "var(--primary)",
                                          }}
                                        >
                                          {sub.nextPayment}
                                        </span>
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCancelSubscription(sub.id);
                                        }}
                                        style={{
                                          width: "100%",
                                          padding: "14px",
                                          borderRadius: "12px",
                                          border: "1px solid #fee2e2",
                                          background: "white",
                                          color: "#ef4444",
                                          fontWeight: "700",
                                          fontSize: "14px",
                                          cursor: "pointer",
                                        }}
                                      >
                                        구독 해지하기
                                      </button>
                                    </>
                                  ) : sub.status === "해지 예정" ? (
                                    <div
                                      style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "12px",
                                      }}
                                    >
                                      <div
                                        style={{
                                          padding: "16px",
                                          backgroundColor: "#fff7ed",
                                          borderRadius: "12px",
                                          border: "1px solid #ffedd5",
                                          color: "#9a3412",
                                          fontSize: "13px",
                                          lineHeight: "1.6",
                                        }}
                                      >
                                        이미 해지 신청이 완료된 상품입니다. 남은
                                        구독 기간까지는 혜택이 유지되며, 이후
                                        자동으로 종료됩니다.
                                      </div>
                                      <button
                                        onClick={() =>
                                          resumeSubscription(sub.id)
                                        }
                                        style={{
                                          width: "100%",
                                          padding: "14px",
                                          borderRadius: "12px",
                                          background: "var(--primary)",
                                          color: "white",
                                          border: "none",
                                          fontWeight: "800",
                                          fontSize: "14px",
                                          cursor: "pointer",
                                        }}
                                      >
                                        구독 유지하기 (다시 구독)
                                      </button>
                                    </div>
                                  ) : (
                                    <div
                                      style={{
                                        padding: "16px",
                                        backgroundColor: "#f1f5f9",
                                        borderRadius: "12px",
                                        border: "1px solid #e2e8f0",
                                        color: "#64748b",
                                        fontSize: "13px",
                                        textAlign: "center",
                                      }}
                                    >
                                      해지된 구독 상품입니다. 다시 이용하시려면
                                      상점에서 신청해 주세요.
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      <style>{`
                        @keyframes slideDown {
                          from { opacity: 0; transform: translateY(-10px); }
                          to { opacity: 1; transform: translateY(0); }
                        }
                      `}</style>
                    </div>

                    <div
                      style={{
                        borderTop: "1px solid #f1f5f9",
                        paddingTop: "32px",
                      }}
                    >
                      <h4
                        style={{
                          fontSize: "16px",
                          fontWeight: "800",
                          marginBottom: "20px",
                        }}
                      >
                        구독 결제 내역
                      </h4>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                        }}
                      >
                        {subscriptionPayments.map((p) => (
                          <div
                            key={p.id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "16px 20px",
                              backgroundColor: "#f8fafc",
                              borderRadius: "12px",
                              border: "1px solid #f1f5f9",
                            }}
                          >
                            <div>
                              <div
                                style={{
                                  fontSize: "14px",
                                  fontWeight: "700",
                                  marginBottom: "2px",
                                }}
                              >
                                {p.name}
                              </div>
                              <div
                                style={{ fontSize: "12px", color: "#94a3b8" }}
                              >
                                {p.date} • {p.id}
                              </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div
                                style={{
                                  fontSize: "14px",
                                  fontWeight: "800",
                                  color: "var(--primary)",
                                }}
                              >
                                {p.amount}
                              </div>
                              <div
                                style={{
                                  fontSize: "11px",
                                  color: "#10b981",
                                  fontWeight: "600",
                                }}
                              >
                                {p.status}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {myPageTab === "coupon" && (
                  <div
                    style={{
                      background: "white",
                      padding: "24px",
                      borderRadius: "16px",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "18px",
                        fontWeight: "700",
                        marginBottom: "20px",
                      }}
                    >
                      나의 쿠폰함
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                      }}
                    >
                      {coupons.map((coupon) => (
                        <div
                          key={coupon.id}
                          style={{
                            display: "flex",
                            border: "1px solid #f1f5f9",
                            borderRadius: "16px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: "100px",
                              backgroundColor: "var(--primary)",
                              color: "white",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "10px",
                            }}
                          >
                            <div
                              style={{ fontSize: "12px", fontWeight: "600" }}
                            >
                              DISCOUNT
                            </div>
                            <div
                              style={{ fontSize: "20px", fontWeight: "800" }}
                            >
                              {coupon.discount}
                            </div>
                          </div>
                          <div
                            style={{
                              flexGrow: 1,
                              padding: "16px",
                              position: "relative",
                            }}
                          >
                            <div
                              style={{
                                fontWeight: "700",
                                fontSize: "16px",
                                marginBottom: "4px",
                              }}
                            >
                              {coupon.name}
                            </div>
                            <div
                              style={{
                                fontSize: "13px",
                                color: "#64748b",
                                marginBottom: "12px",
                              }}
                            >
                              {coupon.minOrder}
                            </div>
                            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                              ~{coupon.expiry} 까지
                            </div>
                            <div
                              style={{
                                position: "absolute",
                                top: "16px",
                                right: "16px",
                                color: "var(--primary)",
                                fontWeight: "700",
                                fontSize: "12px",
                              }}
                            >
                              {coupon.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {myPageTab === "address" && (
                  <div
                    style={{
                      background: "white",
                      padding: "24px",
                      borderRadius: "16px",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px",
                      }}
                    >
                      <h3 style={{ fontSize: "18px", fontWeight: "700" }}>
                        배송지 관리
                      </h3>
                      <button
                        onClick={() => handleOpenAddressModal()}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "8px",
                          background: "var(--primary)",
                          color: "white",
                          border: "none",
                          fontWeight: "700",
                          fontSize: "13px",
                          cursor: "pointer",
                        }}
                      >
                        + 새 배송지 추가
                      </button>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                      }}
                    >
                      {addressList.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() =>
                            !addr.isDefault && handleSetDefaultAddress(addr.id)
                          }
                          style={{
                            padding: "20px",
                            borderRadius: "16px",
                            border: `1px solid ${addr.isDefault ? "var(--primary)" : "#f1f5f9"}`,
                            backgroundColor: addr.isDefault
                              ? "rgba(46, 204, 113, 0.05)"
                              : "white",
                            cursor: addr.isDefault ? "default" : "pointer",
                            transition: "all 0.2s",
                            position: "relative",
                          }}
                          onMouseOver={(e) => {
                            if (!addr.isDefault)
                              e.currentTarget.style.borderColor =
                                "var(--primary-light)";
                          }}
                          onMouseOut={(e) => {
                            if (!addr.isDefault)
                              e.currentTarget.style.borderColor = "#f1f5f9";
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "8px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <span
                                style={{ fontWeight: "800", fontSize: "16px" }}
                              >
                                {addr.label}
                              </span>
                              {addr.isDefault && (
                                <span
                                  style={{
                                    fontSize: "10px",
                                    backgroundColor: "var(--primary)",
                                    color: "white",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    fontWeight: "800",
                                  }}
                                >
                                  기본배송지
                                </span>
                              )}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                gap: "12px",
                                fontSize: "13px",
                                color: "#94a3b8",
                              }}
                            >
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenAddressModal(addr);
                                }}
                                style={{ cursor: "pointer", zIndex: 1 }}
                              >
                                수정
                              </span>
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (
                                    window.confirm("정말 삭제하시겠습니까?")
                                  ) {
                                    if (addressList.length <= 1) {
                                      alert(
                                        "최소 1개의 배송지는 등록되어 있어야 합니다.",
                                      );
                                      return;
                                    }
                                    setAddressList((prev) =>
                                      prev.filter((a) => a.id !== addr.id),
                                    );
                                    showToast("배송지가 삭제되었습니다.");
                                  }
                                }}
                                style={{
                                  cursor: "pointer",
                                  color:
                                    addressList.length <= 1
                                      ? "#cbd5e1"
                                      : "#ef4444",
                                }}
                              >
                                삭제
                              </span>
                            </div>
                          </div>
                          <div
                            style={{
                              fontSize: "15px",
                              color: "#1e293b",
                              marginBottom: "4px",
                            }}
                          >
                            {addr.address}
                          </div>
                          <div
                            style={{
                              fontSize: "14px",
                              color: "#64748b",
                              marginBottom: "4px",
                            }}
                          >
                            {addr.detail}
                          </div>
                          <div style={{ fontSize: "13px", color: "#94a3b8" }}>
                            {addr.contact}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Address Modal */}
                {isAddressModalOpen && (
                  <div
                    style={{
                      position: "fixed",
                      inset: 0,
                      backgroundColor: "rgba(0,0,0,0.5)",
                      zIndex: 1200,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backdropFilter: "blur(4px)",
                    }}
                    onClick={() => setIsAddressModalOpen(false)}
                  >
                    <div
                      style={{
                        background: "white",
                        width: "100%",
                        maxWidth: "500px",
                        borderRadius: "24px",
                        padding: "32px",
                        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "24px",
                        }}
                      >
                        <h3 style={{ fontSize: "20px", fontWeight: "800" }}>
                          {editingAddress ? "배송지 수정" : "새 배송지 추가"}
                        </h3>
                        <button
                          onClick={() => setIsAddressModalOpen(false)}
                          style={{
                            background: "none",
                            border: "none",
                            fontSize: "24px",
                            color: "#94a3b8",
                            cursor: "pointer",
                          }}
                        >
                          ✕
                        </button>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "20px",
                        }}
                      >
                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: "14px",
                              fontWeight: "700",
                              marginBottom: "8px",
                              color: "#334155",
                            }}
                          >
                            배송지 별칭
                          </label>
                          <input
                            type="text"
                            placeholder="예: 회사, 본가, 친구집"
                            value={newAddress.label}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                label: e.target.value,
                              })
                            }
                            style={{
                              width: "100%",
                              padding: "12px",
                              borderRadius: "8px",
                              border: "1px solid #e2e8f0",
                            }}
                          />
                        </div>
                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: "14px",
                              fontWeight: "700",
                              marginBottom: "8px",
                              color: "#334155",
                            }}
                          >
                            연락처
                          </label>
                          <input
                            type="text"
                            placeholder="010-0000-0000"
                            value={newAddress.contact}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                contact: e.target.value,
                              })
                            }
                            style={{
                              width: "100%",
                              padding: "12px",
                              borderRadius: "8px",
                              border: "1px solid #e2e8f0",
                            }}
                          />
                        </div>
                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: "14px",
                              fontWeight: "700",
                              marginBottom: "8px",
                              color: "#334155",
                            }}
                          >
                            주소
                          </label>
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              marginBottom: "8px",
                            }}
                          >
                            <input
                              type="text"
                              placeholder="주소 검색"
                              value={newAddress.address}
                              readOnly
                              style={{
                                flexGrow: 1,
                                padding: "12px",
                                borderRadius: "8px",
                                border: "1px solid #e2e8f0",
                                backgroundColor: "#f8fafc",
                                color: "#64748b",
                              }}
                            />
                            <button
                              onClick={() => {
                                setNewAddress({
                                  ...newAddress,
                                  address:
                                    "서울시 강남구 테헤란로 123 (역삼동)",
                                }); // Mock address search
                                showToast("주소가 검색되었습니다.");
                              }}
                              style={{
                                padding: "0 16px",
                                borderRadius: "8px",
                                border: "1px solid #cbd5e1",
                                background: "white",
                                fontWeight: "600",
                                cursor: "pointer",
                                fontSize: "13px",
                              }}
                            >
                              검색
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="상세 주소를 입력해주세요"
                            value={newAddress.detail}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                detail: e.target.value,
                              })
                            }
                            style={{
                              width: "100%",
                              padding: "12px",
                              borderRadius: "8px",
                              border: "1px solid #e2e8f0",
                            }}
                          />
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginTop: "4px",
                          }}
                        >
                          <input
                            type="checkbox"
                            id="def-addr"
                            checked={newAddress.isDefault}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                isDefault: e.target.checked,
                              })
                            }
                            style={{
                              width: "18px",
                              height: "18px",
                              accentColor: "var(--primary)",
                            }}
                          />
                          <label
                            htmlFor="def-addr"
                            style={{
                              fontSize: "14px",
                              color: "#475569",
                              cursor: "pointer",
                            }}
                          >
                            기본 배송지로 설정
                          </label>
                        </div>

                        <button
                          onClick={handleSaveAddress}
                          style={{
                            width: "100%",
                            padding: "16px",
                            borderRadius: "12px",
                            background: "var(--primary)",
                            color: "white",
                            border: "none",
                            fontWeight: "800",
                            fontSize: "16px",
                            cursor: "pointer",
                            marginTop: "12px",
                          }}
                        >
                          저장하기
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {myPageTab === "payment" && (
                  <div
                    style={{
                      background: "white",
                      padding: "24px",
                      borderRadius: "16px",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px",
                      }}
                    >
                      <h3 style={{ fontSize: "18px", fontWeight: "700" }}>
                        결제 수단 관리
                      </h3>
                      <button
                        onClick={() => handleOpenPaymentModal()}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "8px",
                          background: "var(--primary)",
                          color: "white",
                          border: "none",
                          fontWeight: "700",
                          fontSize: "13px",
                          cursor: "pointer",
                        }}
                      >
                        + 결제 수단 추가
                      </button>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <Swiper
                        effect={"coverflow"}
                        grabCursor={true}
                        centeredSlides={true}
                        slidesPerView={"auto"}
                        coverflowEffect={{
                          rotate: 50,
                          stretch: 0,
                          depth: 100,
                          modifier: 1,
                          slideShadows: true,
                        }}
                        pagination={true}
                        navigation={true}
                        initialSlide={
                          paymentMethodList.findIndex((pm) => pm.isDefault) !==
                          -1
                            ? paymentMethodList.findIndex((pm) => pm.isDefault)
                            : 0
                        }
                        slideToClickedSlide={true}
                        modules={[EffectCoverflow, Pagination, Navigation]}
                        className="mySwiper"
                      >
                        {paymentMethodList.map((pm) => (
                          <SwiperSlide
                            key={pm.id}
                            style={{ background: pm.color || "var(--primary)" }}
                          >
                            <div
                              style={{
                                width: "100%",
                                height: "100%",
                                padding: "24px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                boxSizing: "border-box",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: "20px",
                                      fontWeight: "800",
                                      textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                    }}
                                  >
                                    {pm.name}
                                  </span>
                                  <span
                                    style={{ fontSize: "12px", opacity: 0.9 }}
                                  >
                                    {pm.type === "card"
                                      ? "Credit Card"
                                      : "Payment Method"}
                                  </span>
                                </div>
                                <span style={{ fontSize: "28px" }}>
                                  {pm.type === "card" ? "💳" : "💰"}
                                </span>
                              </div>

                              <div
                                style={{
                                  fontSize: "20px",
                                  letterSpacing: "3px",
                                  fontWeight: "600",
                                  textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                }}
                              >
                                {pm.number ? pm.number : "**** **** **** ****"}
                              </div>

                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <div>
                                  <div
                                    style={{
                                      fontSize: "10px",
                                      opacity: 0.7,
                                      textTransform: "uppercase",
                                    }}
                                  >
                                    Card Holder
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "14px",
                                      fontWeight: "700",
                                      letterSpacing: "1px",
                                    }}
                                  >
                                    MEMBER
                                  </div>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "8px",
                                    alignItems: "center",
                                  }}
                                >
                                  {pm.isDefault ? (
                                    <div
                                      style={{
                                        backgroundColor:
                                          "rgba(255,255,255,0.9)",
                                        color: pm.color || "black",
                                        padding: "6px 12px",
                                        borderRadius: "20px",
                                        fontSize: "11px",
                                        fontWeight: "800",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                      }}
                                    >
                                      기본 결제
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        handleSetDefaultPaymentMethod(pm.id)
                                      }
                                      style={{
                                        backgroundColor: "rgba(0,0,0,0.2)",
                                        color: "white",
                                        border:
                                          "1px solid rgba(255,255,255,0.4)",
                                        padding: "6px 12px",
                                        borderRadius: "20px",
                                        fontSize: "11px",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                      }}
                                    >
                                      기본 설정
                                    </button>
                                  )}

                                  <button
                                    onClick={() =>
                                      handleDeletePaymentMethod(pm.id)
                                    }
                                    style={{
                                      backgroundColor: "rgba(239, 68, 68, 0.2)",
                                      color: "white",
                                      border: "1px solid rgba(255,255,255,0.4)",
                                      padding: "6px 12px",
                                      borderRadius: "20px",
                                      fontSize: "11px",
                                      fontWeight: "600",
                                      cursor: "pointer",
                                    }}
                                  >
                                    삭제
                                  </button>
                                </div>
                              </div>
                            </div>
                          </SwiperSlide>
                        ))}
                        <SwiperSlide
                          key="add-new"
                          style={{
                            background: "#f8fafc",
                            border: "2px dashed #cbd5e1",
                            color: "#64748b",
                          }}
                        >
                          <div
                            onClick={() => handleOpenPaymentModal()}
                            style={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "48px",
                                marginBottom: "12px",
                                opacity: 0.5,
                              }}
                            >
                              +
                            </div>
                            <div
                              style={{ fontWeight: "800", fontSize: "18px" }}
                            >
                              결제 수단 추가
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                marginTop: "4px",
                                opacity: 0.7,
                              }}
                            >
                              신용/체크카드, 간편결제
                            </div>
                          </div>
                        </SwiperSlide>
                      </Swiper>

                      {/* Payment Modal */}
                      {isPaymentModalOpen && (
                        <div
                          style={{
                            position: "fixed",
                            inset: 0,
                            backgroundColor: "rgba(0,0,0,0.5)",
                            zIndex: 1200,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backdropFilter: "blur(4px)",
                          }}
                          onClick={() => setIsPaymentModalOpen(false)}
                        >
                          <div
                            style={{
                              background: "white",
                              width: "100%",
                              maxWidth: "450px",
                              borderRadius: "24px",
                              padding: "32px",
                              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "24px",
                              }}
                            >
                              <h3
                                style={{ fontSize: "20px", fontWeight: "800" }}
                              >
                                {editingPaymentMethod
                                  ? "결제 수단 수정"
                                  : "새 결제 수단 추가"}
                              </h3>
                              <button
                                onClick={() => setIsPaymentModalOpen(false)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  fontSize: "24px",
                                  color: "#94a3b8",
                                  cursor: "pointer",
                                }}
                              >
                                ✕
                              </button>
                            </div>

                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "20px",
                              }}
                            >
                              <div>
                                <label
                                  style={{
                                    display: "block",
                                    fontSize: "14px",
                                    fontWeight: "700",
                                    marginBottom: "8px",
                                    color: "#334155",
                                  }}
                                >
                                  카드/계좌 명칭
                                </label>
                                <input
                                  type="text"
                                  placeholder="예: 생활비 카드, 국민은행 메인"
                                  value={newPaymentMethod.name}
                                  onChange={(e) =>
                                    setNewPaymentMethod({
                                      ...newPaymentMethod,
                                      name: e.target.value,
                                    })
                                  }
                                  style={{
                                    width: "100%",
                                    padding: "12px",
                                    borderRadius: "8px",
                                    border: "1px solid #e2e8f0",
                                  }}
                                />
                              </div>
                              <div>
                                <label
                                  style={{
                                    display: "block",
                                    fontSize: "14px",
                                    fontWeight: "700",
                                    marginBottom: "8px",
                                    color: "#334155",
                                  }}
                                >
                                  번호
                                </label>
                                <input
                                  type="text"
                                  placeholder="**** **** **** ****"
                                  value={newPaymentMethod.number}
                                  onChange={(e) =>
                                    setNewPaymentMethod({
                                      ...newPaymentMethod,
                                      number: e.target.value,
                                    })
                                  }
                                  style={{
                                    width: "100%",
                                    padding: "12px",
                                    borderRadius: "8px",
                                    border: "1px solid #e2e8f0",
                                  }}
                                />
                              </div>
                              <div>
                                <label
                                  style={{
                                    display: "block",
                                    fontSize: "14px",
                                    fontWeight: "700",
                                    marginBottom: "8px",
                                    color: "#334155",
                                  }}
                                >
                                  테마 색상
                                </label>
                                <div style={{ display: "flex", gap: "10px" }}>
                                  {[
                                    "#10b981",
                                    "#3b82f6",
                                    "#8b5cf6",
                                    "#ec4899",
                                    "#f97316",
                                    "#1e293b",
                                  ].map((c) => (
                                    <div
                                      key={c}
                                      onClick={() =>
                                        setNewPaymentMethod({
                                          ...newPaymentMethod,
                                          color: c,
                                        })
                                      }
                                      style={{
                                        width: "32px",
                                        height: "32px",
                                        borderRadius: "50%",
                                        backgroundColor: c,
                                        cursor: "pointer",
                                        border:
                                          newPaymentMethod.color === c
                                            ? "3px solid #fff"
                                            : "none",
                                        boxShadow:
                                          newPaymentMethod.color === c
                                            ? "0 0 0 2px var(--primary)"
                                            : "none",
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>

                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  marginTop: "4px",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  id="def-payment"
                                  checked={newPaymentMethod.isDefault}
                                  onChange={(e) =>
                                    setNewPaymentMethod({
                                      ...newPaymentMethod,
                                      isDefault: e.target.checked,
                                    })
                                  }
                                  style={{
                                    width: "18px",
                                    height: "18px",
                                    accentColor: "var(--primary)",
                                  }}
                                />
                                <label
                                  htmlFor="def-payment"
                                  style={{
                                    fontSize: "14px",
                                    color: "#475569",
                                    cursor: "pointer",
                                  }}
                                >
                                  기본 결제 수단으로 설정
                                </label>
                              </div>

                              <button
                                onClick={handleSavePaymentMethod}
                                style={{
                                  width: "100%",
                                  padding: "16px",
                                  borderRadius: "12px",
                                  background: "var(--primary)",
                                  color: "white",
                                  border: "none",
                                  fontWeight: "800",
                                  fontSize: "16px",
                                  cursor: "pointer",
                                  marginTop: "12px",
                                }}
                              >
                                {editingPaymentMethod
                                  ? "수정 완료"
                                  : "저장하기"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      <p
                        style={{
                          marginTop: "24px",
                          color: "#94a3b8",
                          fontSize: "14px",
                          textAlign: "center",
                        }}
                      >
                        카드를 스와이프하여 관리할 수 있습니다.
                        <br />
                        <span style={{ fontSize: "12px", color: "#cbd5e1" }}>
                          (결제 수단은 삭제 후 재등록만 가능합니다)
                        </span>
                      </p>
                    </div>
                  </div>
                )}
                {myPageTab === "help" && (
                  <SupportView
                    userRole={userRole}
                    isLoggedIn={isLoggedIn}
                    onOpenAuth={onOpenAuth}
                    isEmbedded={true}
                  />
                )}

                {myPageTab === "resident" && (
                  <div
                    style={{
                      background: "white",
                      padding: "40px",
                      borderRadius: "24px",
                      border: "1px solid var(--border)",
                      textAlign: "center",
                    }}
                  >
                    {isResidentRider ? (
                      <div>
                        <div style={{ fontSize: "64px", marginBottom: "24px" }}>
                          🎉
                        </div>
                        <h3
                          style={{
                            fontSize: "24px",
                            fontWeight: "800",
                            marginBottom: "16px",
                          }}
                        >
                          주민라이더 파트너님, 환영합니다!
                        </h3>
                        <p style={{ color: "#64748b", marginBottom: "32px" }}>
                          지금 바로 동네 마켓의 라이더가 되어 이웃에게 배달을
                          시작해보세요.
                        </p>
                        <button
                          onClick={() => setUserRole("RIDER")}
                          style={{
                            padding: "16px 32px",
                            borderRadius: "12px",
                            background: "var(--primary)",
                            color: "white",
                            border: "none",
                            fontWeight: "700",
                            cursor: "pointer",
                          }}
                        >
                          라이더 앱으로 이동하기
                        </button>
                      </div>
                    ) : (
                      <>
                        {verifyStep === 0 && (
                          <div>
                            <div
                              style={{ fontSize: "64px", marginBottom: "24px" }}
                            >
                              🏘️
                            </div>
                            <h2
                              style={{
                                fontSize: "16px",
                                color: "var(--primary)",
                                fontWeight: "800",
                                marginBottom: "12px",
                              }}
                            >
                              파트너 모집
                            </h2>
                            <h3
                              style={{
                                fontSize: "24px",
                                fontWeight: "800",
                                marginBottom: "16px",
                              }}
                            >
                              주민라이더 신청
                            </h3>
                            <p
                              style={{
                                color: "#64748b",
                                lineHeight: "1.6",
                                marginBottom: "32px",
                              }}
                            >
                              근거리 배달로 이웃에게 따뜻함을 전달하고 소소한
                              수익도 얻어보세요.
                              <br />
                              오토바이가 없어도 도보나 자전거로 충분히
                              가능합니다!
                            </p>
                            <button
                              onClick={() => setVerifyStep(1)}
                              style={{
                                padding: "16px 32px",
                                borderRadius: "12px",
                                background: "var(--primary)",
                                color: "white",
                                border: "none",
                                fontWeight: "700",
                                cursor: "pointer",
                              }}
                            >
                              동네 인증 시작하기
                            </button>
                          </div>
                        )}
                        {verifyStep === 1 && (
                          <div>
                            <div
                              style={{ fontSize: "48px", marginBottom: "24px" }}
                            >
                              📍
                            </div>
                            <h3
                              style={{
                                fontSize: "20px",
                                fontWeight: "800",
                                marginBottom: "12px",
                              }}
                            >
                              현재 위치를 확인합니다
                            </h3>
                            <p
                              style={{
                                color: "#64748b",
                                fontSize: "14px",
                                marginBottom: "32px",
                              }}
                            >
                              인증된 거주지 주변 1km 이내의 배달 건만 수령
                              가능합니다.
                            </p>
                            <div
                              style={{
                                height: "180px",
                                backgroundColor: "#f1f5f9",
                                borderRadius: "16px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: "32px",
                                border: "1px solid #e2e8f0",
                              }}
                            >
                              <span
                                style={{
                                  color: "var(--primary)",
                                  fontWeight: "700",
                                }}
                              >
                                [GPS 시뮬레이션: 역삼동 확인됨]
                              </span>
                            </div>
                            <button
                              onClick={() => setVerifyStep(2)}
                              style={{
                                width: "100%",
                                padding: "16px",
                                borderRadius: "12px",
                                background: "var(--primary)",
                                color: "white",
                                border: "none",
                                fontWeight: "700",
                                cursor: "pointer",
                              }}
                            >
                              위치 인증 완료
                            </button>
                          </div>
                        )}
                        {verifyStep === 2 && (
                          <div style={{ textAlign: "left" }}>
                            <div
                              style={{
                                textAlign: "center",
                                marginBottom: "32px",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "48px",
                                  marginBottom: "16px",
                                }}
                              >
                                🪪
                              </div>
                              <h3
                                style={{
                                  fontSize: "20px",
                                  fontWeight: "800",
                                  marginBottom: "8px",
                                }}
                              >
                                신원 확인 및 서류 등록
                              </h3>
                              <p style={{ color: "#64748b", fontSize: "14px" }}>
                                안전한 배달 환경을 위해 신분 인증이 필요합니다.
                              </p>
                            </div>

                            <div style={{ marginBottom: "24px" }}>
                              <label
                                style={{
                                  display: "block",
                                  fontWeight: "700",
                                  fontSize: "14px",
                                  marginBottom: "12px",
                                }}
                              >
                                신분증 종류 선택
                              </label>
                              <div style={{ display: "flex", gap: "12px" }}>
                                {["주민등록증", "운전면허증"].map((type) => (
                                  <button
                                    key={type}
                                    style={{
                                      flex: 1,
                                      padding: "12px",
                                      borderRadius: "12px",
                                      border: "1.5px solid #e2e8f0",
                                      backgroundColor: "white",
                                      fontWeight: "600",
                                      cursor: "pointer",
                                    }}
                                  >
                                    {type}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div
                              style={{
                                border: "2px dashed #cbd5e1",
                                borderRadius: "16px",
                                padding: "40px 20px",
                                textAlign: "center",
                                backgroundColor: "#f8fafc",
                                marginBottom: "24px",
                                cursor: "pointer",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "32px",
                                  marginBottom: "12px",
                                }}
                              >
                                📸
                              </div>
                              <div
                                style={{
                                  fontWeight: "700",
                                  color: "#475569",
                                  marginBottom: "4px",
                                }}
                              >
                                신분증 사진 업로드
                              </div>
                              <div
                                style={{ fontSize: "12px", color: "#94a3b8" }}
                              >
                                빛 반사가 없는 선명한 사진을 올려주세요.
                              </div>
                            </div>

                            <div
                              style={{
                                backgroundColor: "#f1f5f9",
                                padding: "16px",
                                borderRadius: "12px",
                                marginBottom: "32px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  marginBottom: "8px",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  id="privacy"
                                  checked
                                  readOnly
                                  style={{ accentColor: "var(--primary)" }}
                                />
                                <label
                                  htmlFor="privacy"
                                  style={{
                                    fontSize: "13px",
                                    fontWeight: "600",
                                    color: "#475569",
                                  }}
                                >
                                  개인정보 수집 및 이용 동의 (필수)
                                </label>
                              </div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#64748b",
                                  paddingLeft: "22px",
                                }}
                              >
                                입력하신 정보는 신원 확인 용도로만 사용되며,{" "}
                                <br />
                                확인 즉시 암호화되어 안전하게 보관됩니다.
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                const btn =
                                  document.getElementById("verify-btn");
                                btn.innerHTML = "✨ 신분증 스캔 중...";
                                btn.style.opacity = "0.7";
                                btn.disabled = true;
                                setTimeout(() => {
                                  setIsResidentRider(true);
                                  setVerifyStep(3);
                                }, 2000);
                              }}
                              id="verify-btn"
                              style={{
                                width: "100%",
                                padding: "18px",
                                borderRadius: "12px",
                                background: "var(--primary)",
                                color: "white",
                                border: "none",
                                fontWeight: "800",
                                fontSize: "16px",
                                cursor: "pointer",
                                transition: "all 0.2s",
                              }}
                            >
                              인증 요청하기
                            </button>
                          </div>
                        )}
                        {verifyStep === 3 && (
                          <div>
                            <div
                              style={{ fontSize: "64px", marginBottom: "24px" }}
                            >
                              ✨
                            </div>
                            <h3
                              style={{
                                fontSize: "24px",
                                fontWeight: "800",
                                marginBottom: "16px",
                              }}
                            >
                              동네 라이더 인증 완료!
                            </h3>
                            <p
                              style={{ color: "#64748b", marginBottom: "32px" }}
                            >
                              이제 이웃을 위한 배달을 시작할 수 있습니다. 라이더
                              앱으로 이동합니다.
                            </p>
                            <button
                              onClick={() => setUserRole("RIDER")}
                              style={{
                                padding: "16px 32px",
                                borderRadius: "12px",
                                background: "var(--primary)",
                                color: "white",
                                border: "none",
                                fontWeight: "700",
                                cursor: "pointer",
                              }}
                            >
                              라이더 앱으로 이동
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {myPageTab === "application_status" && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "24px",
                    }}
                  >
                    <div
                      style={{
                        background: "white",
                        padding: "32px",
                        borderRadius: "24px",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "18px",
                          fontWeight: "800",
                          marginBottom: "24px",
                        }}
                      >
                        파트너 신청 현황
                      </h3>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "16px",
                        }}
                      >
                        {/* Mart Status */}
                        <div
                          style={{
                            padding: "24px",
                            borderRadius: "20px",
                            backgroundColor: "#f8fafc",
                            border: "1px solid #f1f5f9",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "16px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                              }}
                            >
                              <span style={{ fontSize: "24px" }}>🏢</span>
                              <div>
                                <div
                                  style={{
                                    fontWeight: "800",
                                    fontSize: "16px",
                                  }}
                                >
                                  마트 입점 신청
                                </div>
                                <div
                                  style={{
                                    fontSize: "12px",
                                    color: "#94a3b8",
                                    marginTop: "2px",
                                  }}
                                >
                                  Neighborhood Mart Partner
                                </div>
                              </div>
                            </div>
                            <div
                              style={{
                                padding: "6px 14px",
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: "800",
                                backgroundColor:
                                  storeRegistrationStatus === "APPROVED"
                                    ? "rgba(16, 185, 129, 0.1)"
                                    : storeRegistrationStatus &&
                                        storeRegistrationStatus !== "NONE"
                                      ? "rgba(245, 158, 11, 0.1)"
                                      : "#f1f5f9",
                                color:
                                  storeRegistrationStatus === "APPROVED"
                                    ? "#10b981"
                                    : storeRegistrationStatus &&
                                        storeRegistrationStatus !== "NONE"
                                      ? "#f59e0b"
                                      : "#94a3b8",
                              }}
                            >
                              {storeRegistrationStatus === "APPROVED"
                                ? "승인 완료"
                                : storeRegistrationStatus &&
                                    storeRegistrationStatus !== "NONE"
                                  ? "심사 중"
                                  : "미신청"}
                            </div>
                          </div>
                          {storeRegistrationStatus &&
                          storeRegistrationStatus !== "NONE" ? (
                            <div>
                              <div
                                style={{
                                  fontSize: "14px",
                                  color: "#64748b",
                                  lineHeight: "1.6",
                                  marginBottom:
                                    storeRegistrationStatus !== "APPROVED"
                                      ? "12px"
                                      : "0",
                                }}
                              >
                                {storeRegistrationStatus === "APPROVED"
                                  ? "축하합니다! 마트 입점 승인이 완료되었습니다. 이제 상품을 등록하고 판매를 시작해보세요."
                                  : "제출하신 서류를 관리자가 검토 중입니다. 결과는 영업일 기준 3일 이내에 알림으로 안내해 드립니다."}
                              </div>
                              {storeRegistrationStatus !== "APPROVED" && (
                                <button
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        "마트 입점 신청을 취소하시겠습니까?",
                                      )
                                    ) {
                                      setStoreRegistrationStatus("NONE");
                                      showToast(
                                        "마트 입점 신청이 취소되었습니다.",
                                      );
                                    }
                                  }}
                                  style={{
                                    padding: "6px 12px",
                                    borderRadius: "8px",
                                    background: "white",
                                    border: "1px solid #fee2e2",
                                    color: "#ef4444",
                                    fontSize: "12px",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                  }}
                                >
                                  신청 취소
                                </button>
                              )}
                            </div>
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <span
                                style={{ fontSize: "14px", color: "#94a3b8" }}
                              >
                                아직 신청 내역이 없습니다.
                              </span>
                              <button
                                onClick={() => {
                                  setActiveTab("partner");
                                  window.scrollTo(0, 0);
                                }}
                                style={{
                                  padding: "8px 16px",
                                  borderRadius: "10px",
                                  background: "white",
                                  border: "1.5px solid #e2e8f0",
                                  color: "#475569",
                                  fontWeight: "700",
                                  fontSize: "13px",
                                  cursor: "pointer",
                                }}
                              >
                                입점 신청하기
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Rider Status */}
                        <div
                          style={{
                            padding: "24px",
                            borderRadius: "20px",
                            backgroundColor: "#f8fafc",
                            border: "1px solid #f1f5f9",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "16px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                              }}
                            >
                              <span style={{ fontSize: "24px" }}>🛵</span>
                              <div>
                                <div
                                  style={{
                                    fontWeight: "800",
                                    fontSize: "16px",
                                  }}
                                >
                                  라이더 등록 현황
                                </div>
                                <div
                                  style={{
                                    fontSize: "12px",
                                    color: "#94a3b8",
                                    marginTop: "2px",
                                  }}
                                >
                                  Neighborhood Delivery Partner
                                </div>
                              </div>
                            </div>
                            <div
                              style={{
                                padding: "6px 14px",
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: "800",
                                backgroundColor: isResidentRider
                                  ? "rgba(16, 185, 129, 0.1)"
                                  : verifyStep > 0
                                    ? "rgba(245, 158, 11, 0.1)"
                                    : "#f1f5f9",
                                color: isResidentRider
                                  ? "#10b981"
                                  : verifyStep > 0
                                    ? "#f59e0b"
                                    : "#94a3b8",
                              }}
                            >
                              {isResidentRider
                                ? "활동 중"
                                : verifyStep > 0
                                  ? "인증 대기"
                                  : "미신청"}
                            </div>
                          </div>
                          {isResidentRider || verifyStep > 0 ? (
                            <div>
                              <div
                                style={{
                                  fontSize: "14px",
                                  color: "#64748b",
                                  lineHeight: "1.6",
                                  marginBottom: !isResidentRider ? "12px" : "0",
                                }}
                              >
                                {isResidentRider
                                  ? "라이더 파트너로 등록되어 활동 중입니다. 라이더 전용 대시보드에서 배달을 수락할 수 있습니다."
                                  : "주민라이더 동네 인증 및 서류 제출이 완료되었습니다. 최종 승인 후 활동이 가능합니다."}
                              </div>
                              {!isResidentRider && verifyStep > 0 && (
                                <button
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        "라이더 신청을 취소하시겠습니까?",
                                      )
                                    ) {
                                      setVerifyStep(0);
                                      showToast(
                                        "라이더 신청이 취소되었습니다.",
                                      );
                                    }
                                  }}
                                  style={{
                                    padding: "6px 12px",
                                    borderRadius: "8px",
                                    background: "white",
                                    border: "1px solid #fee2e2",
                                    color: "#ef4444",
                                    fontSize: "12px",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                  }}
                                >
                                  신청 취소
                                </button>
                              )}
                            </div>
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <span
                                style={{ fontSize: "14px", color: "#94a3b8" }}
                              >
                                아직 신청 내역이 없습니다.
                              </span>
                              <button
                                onClick={() => {
                                  setActiveTab("partner");
                                  window.scrollTo(0, 0);
                                }}
                                style={{
                                  padding: "8px 16px",
                                  borderRadius: "10px",
                                  background: "white",
                                  border: "1.5px solid #e2e8f0",
                                  color: "#475569",
                                  fontWeight: "700",
                                  fontSize: "13px",
                                  cursor: "pointer",
                                }}
                              >
                                라이더 신청하기
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        background: "#f0fdf4",
                        padding: "20px",
                        borderRadius: "20px",
                        border: "1px solid rgba(46, 204, 113, 0.2)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          alignItems: "flex-start",
                        }}
                      >
                        <span style={{ fontSize: "20px" }}>📢</span>
                        <div>
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: "800",
                              color: "#166534",
                              marginBottom: "4px",
                            }}
                          >
                            파트너 페이지 이용 안내
                          </div>
                          <div
                            style={{
                              fontSize: "13px",
                              color: "#166534",
                              opacity: 0.8,
                              lineHeight: "1.6",
                            }}
                          >
                            승인 완료 후에는 상단 '[판매자/라이더 메뉴]'를 통해
                            전용 대시보드로 이동하실 수 있습니다. <br />
                            기타 문의 사항은 고객센터(1588-0000)를 이용해
                            주세요.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
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

                  {isLoggedIn && (
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
                          addressList.length === 0
                            ? "pulse-highlight 2s infinite"
                            : "none",
                        boxShadow:
                          addressList.length === 0
                            ? "0 0 0 0 rgba(46, 204, 113, 0.7)"
                            : "none",
                      }}
                    >
                      📍{" "}
                      {addressList.find((a) => a.isDefault)?.address ||
                        currentLocation ||
                        "배송지 등록하기"}
                    </button>
                  )}
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
      {" "}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "100px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#1e293b",
            color: "white",
            padding: "12px 24px",
            borderRadius: "24px",
            fontSize: "14px",
            fontWeight: "700",
            zIndex: 2000,
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            animation: "slideUp 0.3s ease-out",
          }}
        >
          ✨ {toast}
          <style>{`
            @keyframes slideUp {
              from { transform: translate(-50%, 20px); opacity: 0; }
              to { transform: translate(-50%, 0); opacity: 1; }
            }
          `}</style>
        </div>
      )}
      {/* Order Cancel Modal */}
      {isCancelModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1200,
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setIsCancelModalOpen(false)}
        >
          <div
            style={{
              background: "white",
              width: "90%",
              maxWidth: "450px",
              borderRadius: "24px",
              padding: "32px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "800",
                marginBottom: "8px",
              }}
            >
              주문 취소
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: "#64748b",
                marginBottom: "24px",
              }}
            >
              주문을 취소하시는 사유를 알려주세요.
            </p>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "700",
                    marginBottom: "8px",
                    color: "#334155",
                  }}
                >
                  취소 사유 선택
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    outline: "none",
                  }}
                >
                  <option value="simple_change">단순 변심</option>
                  <option value="delivery_delay">배송 지연</option>
                  <option value="product_out_of_stock">상품 품절</option>
                  <option value="wrong_order">주문 실수</option>
                  <option value="other">직접 입력</option>
                </select>
              </div>

              {cancelReason === "other" && (
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "700",
                      marginBottom: "8px",
                      color: "#334155",
                    }}
                  >
                    사유 직접 입력
                  </label>
                  <textarea
                    value={cancelDetail}
                    onChange={(e) => setCancelDetail(e.target.value)}
                    placeholder="취소 사유를 자세히 입력해주세요. (부적절한 언어 사용 시 제재될 수 있습니다.)"
                    style={{
                      width: "100%",
                      height: "100px",
                      padding: "12px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      outline: "none",
                      resize: "none",
                    }}
                  />
                </div>
              )}

              <div
                style={{
                  padding: "16px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "12px",
                  fontSize: "13px",
                  color: "#64748b",
                  lineHeight: "1.6",
                }}
              >
                • 취소 완료 후 결제 수단에 따라 환불까지 1~3영업일이 소요될 수
                있습니다.
                <br />• 일부 상품의 경우 발주 단계에 따라 취소가 거절될 수
                있습니다.
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => setIsCancelModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: "14px",
                    borderRadius: "12px",
                    background: "#f1f5f9",
                    border: "none",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  닫기
                </button>
                <button
                  onClick={submitCancelOrder}
                  style={{
                    flex: 1,
                    padding: "14px",
                    borderRadius: "12px",
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    fontWeight: "800",
                    cursor: "pointer",
                  }}
                >
                  취소 확정
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
              onSubscribeCheckout={(subProduct) => {
                // Subscription directly goes to checkout
                setSelectedStore(null);
                setCartItems([
                  {
                    ...subProduct,
                    quantity: 1,
                    storeName: selectedStore.name,
                    isSubscription: true,
                  },
                ]);
                setActiveTab("checkout");
                window.scrollTo(0, 0);
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
      {/* Review Modal */}
      {isReviewModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              background: "white",
              width: "100%",
              maxWidth: "450px",
              borderRadius: "24px",
              padding: "32px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            }}
          >
            {viewingReview ? (
              // Read-only View
              <>
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "800",
                    marginBottom: "8px",
                  }}
                >
                  내가 쓴 리뷰
                </h2>
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--text-muted)",
                    marginBottom: "24px",
                  }}
                >
                  {selectedOrderForReview?.store}
                </p>
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                  <div
                    style={{
                      fontSize: "32px",
                      color: "#f59e0b",
                      marginBottom: "8px",
                    }}
                  >
                    {"★".repeat(viewingReview.rate)}
                    {"☆".repeat(5 - viewingReview.rate)}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      color: "#f59e0b",
                    }}
                  >
                    {
                      [
                        "매우 아쉬워요",
                        "아쉬워요",
                        "보통이에요",
                        "만족해요",
                        "최고예요",
                      ][viewingReview.rate - 1]
                    }
                  </div>
                </div>
                <div
                  style={{
                    background: "#f8fafc",
                    padding: "20px",
                    borderRadius: "12px",
                    fontSize: "15px",
                    color: "#334155",
                    lineHeight: "1.6",
                    marginBottom: "32px",
                  }}
                >
                  {viewingReview.content}
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={handleEditReview}
                    style={{
                      flex: 1,
                      padding: "14px",
                      borderRadius: "12px",
                      background: "white",
                      border: "1px solid #e2e8f0",
                      fontWeight: "700",
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                  >
                    리뷰 수정
                  </button>
                  <button
                    onClick={handleDeleteReview}
                    style={{
                      flex: 1,
                      padding: "14px",
                      borderRadius: "12px",
                      background: "white",
                      border: "1px solid #fee2e2",
                      color: "#ef4444",
                      fontWeight: "700",
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                  >
                    삭제하기
                  </button>
                </div>
                <button
                  onClick={() => {
                    setIsReviewModalOpen(false);
                    setViewingReview(null);
                  }}
                  style={{
                    width: "100%",
                    marginTop: "16px",
                    padding: "14px",
                    background: "transparent",
                    border: "none",
                    color: "#94a3b8",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  닫기
                </button>
              </>
            ) : (
              // Write View
              <>
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "800",
                    marginBottom: "8px",
                  }}
                >
                  리뷰 작성하기
                </h2>
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--text-muted)",
                    marginBottom: "24px",
                  }}
                >
                  {selectedOrderForReview?.store}에서의 주문은 어떠셨나요?
                </p>

                <form
                  onSubmit={handleSaveReview}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "24px",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "32px",
                        display: "flex",
                        justifyContent: "center",
                        gap: "8px",
                        marginBottom: "8px",
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          onClick={() =>
                            setReviewForm({ ...reviewForm, rate: star })
                          }
                          style={{
                            cursor: "pointer",
                            color:
                              star <= reviewForm.rate ? "#f59e0b" : "#e2e8f0",
                          }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "#f59e0b",
                      }}
                    >
                      {
                        [
                          "매우 아쉬워요",
                          "아쉬워요",
                          "보통이에요",
                          "만족해요",
                          "최고예요",
                        ][reviewForm.rate - 1]
                      }
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "700",
                        fontSize: "14px",
                        color: "#475569",
                      }}
                    >
                      리뷰 내용
                    </label>
                    <textarea
                      required
                      value={reviewForm.content}
                      onChange={(e) =>
                        setReviewForm({
                          ...reviewForm,
                          content: e.target.value,
                        })
                      }
                      placeholder="다른 고객들에게 도움이 될 수 있도록 솔직한 리뷰를 남겨주세요. (비속어, 타인 비방 등 부적절한 언어 사용 시 서비스 이용에 제재를 받을 수 있습니다.)"
                      style={{
                        width: "100%",
                        height: "120px",
                        padding: "16px",
                        borderRadius: "12px",
                        border: "1px solid #cbd5e1",
                        resize: "none",
                        fontSize: "14px",
                      }}
                    ></textarea>
                  </div>

                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      type="button"
                      onClick={() => setIsReviewModalOpen(false)}
                      style={{
                        flex: 1,
                        padding: "14px",
                        borderRadius: "12px",
                        background: "#f1f5f9",
                        border: "none",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      style={{
                        flex: 2,
                        padding: "14px",
                        borderRadius: "12px",
                        background: "var(--primary)",
                        color: "white",
                        border: "none",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      리뷰 등록
                    </button>
                  </div>
                </form>
              </>
            )}
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
        onCheckout={() => {
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
        onSetLocation={(loc) => {
          setCurrentLocation(loc);
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

const PaymentSuccessModal = ({ isOpen, onClose, onViewOrder }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 3000,
        backdropFilter: "blur(8px)",
        animation: "fadeIn 0.3s ease-out",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          width: "90%",
          maxWidth: "400px",
          borderRadius: "32px",
          padding: "40px",
          textAlign: "center",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          position: "relative",
          animation: "slideUp 0.3s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "#f0fdf4",
            margin: "0 auto 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "40px",
          }}
        >
          🎉
        </div>

        <h2
          style={{
            fontSize: "24px",
            fontWeight: "800",
            marginBottom: "12px",
            color: "#1e293b",
          }}
        >
          결제가 완료되었습니다!
        </h2>
        <p
          style={{ color: "#64748b", lineHeight: "1.6", marginBottom: "32px" }}
        >
          주문하신 상품이 곧 준비될 예정입니다.
          <br />
          잠시만 기다려주세요!
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            onClick={onViewOrder}
            style={{
              padding: "16px",
              borderRadius: "16px",
              background: "var(--primary)",
              color: "white",
              border: "none",
              fontWeight: "800",
              fontSize: "16px",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)",
            }}
          >
            주문서 확인하기
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "16px",
              borderRadius: "16px",
              background: "#f1f5f9",
              color: "#475569",
              border: "none",
              fontWeight: "800",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            홈으로 이동
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerView;
