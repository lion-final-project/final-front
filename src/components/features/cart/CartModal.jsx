import React, { useState, useEffect } from "react";

const CartModal = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveFromCart,
  onCheckout,
  isLoggedIn,
  onOpenAuth,
  onGoHome,
}) => {
  const [selectedStores, setSelectedStores] = useState(new Set());

  // Automatically select new stores that appear in the cart
  useEffect(() => {
    if (isOpen) {
      const currentItemStores = new Set(
        cartItems.map((item) => item.storeName),
      );
      setSelectedStores((prev) => {
        const next = new Set(prev);
        // Only add stores that aren't already there (to avoid overwriting manual unselection)
        // and remove stores that no longer exist in cartItems
        let changed = false;

        // Remove stale stores
        for (const store of next) {
          if (!currentItemStores.has(store)) {
            next.delete(store);
            changed = true;
          }
        }

        // Add new stores (optional: could just leave them unselected, but usually better to select them)
        // If it's the first time opening with items, select all
        if (prev.size === 0 && currentItemStores.size > 0) {
          currentItemStores.forEach((s) => next.add(s));
          changed = true;
        }

        return changed ? next : prev;
      });
    }
  }, [isOpen, cartItems]);

  if (!isOpen) return null;

  // cartItems가 없거나 배열이 아닌 경우 처리
  if (!cartItems || !Array.isArray(cartItems)) {
    return null;
  }

  // Group items by store
  const groupedItems = cartItems.reduce((acc, item) => {
    if (!item) return acc;
    const store = item.storeName || "Unknown Store";
    if (!acc[store]) acc[store] = [];
    acc[store].push(item);
    return acc;
  }, {});

  const toggleStore = (storeName) => {
    const newSelected = new Set(selectedStores);
    if (newSelected.has(storeName)) {
      newSelected.delete(storeName);
    } else {
      newSelected.add(storeName);
    }
    setSelectedStores(newSelected);
  };

  // Calculate totals for SELECTED stores
  const selectedItems = cartItems.filter((item) =>
    selectedStores.has(item.storeName),
  );
  const productPrice = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // Calculate shipping price using deliveryFee from backend for each selected store
  const storeDeliveryFees = new Map();
  selectedItems.forEach(item => {
    const storeName = item.storeName;
    if (!storeDeliveryFees.has(storeName)) {
      // 백엔드에서 받은 deliveryFee 사용 (없으면 3000원 기본값)
      storeDeliveryFees.set(storeName, item.deliveryFee || 3000);
    }
  });
  const activeSelectedStoreCount = storeDeliveryFees.size;
  const shippingPrice = Array.from(storeDeliveryFees.values()).reduce(
    (sum, fee) => sum + fee,
    0
  );
  const totalPrice = productPrice + shippingPrice;

  // 재고 부족 체크: 품절이거나 수량이 재고보다 많은 경우
  const hasOutOfStockInSelection = selectedItems.some((item) => {
    const stock = item.stock ?? 999;
    return stock <= 0 || item.quantity > stock;
  });

  // 재고 부족 상품 목록 (사용자에게 표시용)
  const insufficientStockItems = selectedItems.filter((item) => {
    const stock = item.stock ?? 999;
    return stock > 0 && item.quantity > stock;
  });

  // 선택된 상품 중 배달 불가 마트가 있는지
  const hasDeliveryUnavailableInSelection = selectedItems.some(
    (item) => item.isDeliveryAvailable === false
  );
  const deliveryUnavailableStoreNames = [
    ...new Set(
      selectedItems
        .filter((item) => item.isDeliveryAvailable === false)
        .map((item) => item.storeName)
    ),
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          width: "100%",
          maxWidth: "560px",
          height: "85vh",
          borderRadius: "24px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ fontSize: "22px", fontWeight: "800" }}>장바구니</h2>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              fontSize: "24px",
              cursor: "pointer",
              color: "#94a3b8",
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flexGrow: 1,
            overflowY: "auto",
            padding: "20px",
            backgroundColor: "#f8fafc",
          }}
        >
          {!isLoggedIn ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: "48px", marginBottom: "24px" }}>🛒</div>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  marginBottom: "12px",
                }}
              >
                로그인이 필요합니다
              </h3>
              <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>
                장바구니를 확인하시려면 로그인해주세요.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="btn-primary"
                style={{ padding: "12px 24px", fontSize: "14px" }}
              >
                로그인하기
              </button>
            </div>
          ) : cartItems.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: "48px", marginBottom: "24px" }}>🛒</div>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "16px",
                  marginBottom: "24px",
                }}
              >
                장바구니가 비어있습니다.
              </p>
              <button
                onClick={onClose}
                style={{
                  padding: "12px 24px",
                  borderRadius: "12px",
                  background: "var(--primary)",
                  color: "white",
                  border: "none",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                쇼핑 계속하기
              </button>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              {Object.entries(groupedItems).map(([storeName, items]) => (
                <div
                  key={storeName}
                  style={{
                    backgroundColor: "white",
                    borderRadius: "16px",
                    overflow: "hidden",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  {/* Store Header with Checkbox */}
                  <div
                    onClick={() => toggleStore(storeName)}
                    style={{
                      padding: "14px 18px",
                      borderBottom: "1px solid #f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      cursor: "pointer",
                      backgroundColor: selectedStores.has(storeName)
                        ? "#f0fdf4"
                        : "white",
                      transition: "background-color 0.2s",
                    }}
                  >
                    <div
                      style={{
                        width: "26px",
                        height: "26px",
                        borderRadius: "50%",
                        border: selectedStores.has(storeName)
                          ? "none"
                          : "2px solid #cbd5e1",
                        backgroundColor: selectedStores.has(storeName)
                          ? "var(--primary)"
                          : "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "15px",
                      }}
                    >
                      {selectedStores.has(storeName) && "✓"}
                    </div>
                    <div style={{ flexGrow: 1, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                      <span
                        style={{
                          fontWeight: "700",
                          fontSize: "17px",
                          color: items[0]?.isDeliveryAvailable === false ? "#991b1b" : "#1e293b",
                        }}
                      >
                        {storeName}
                        {items[0]?.isDeliveryAvailable === false && (
                          <span
                            style={{
                              marginLeft: "8px",
                              fontSize: "12px",
                              fontWeight: "800",
                              color: "#dc2626",
                              backgroundColor: "#fee2e2",
                              padding: "2px 8px",
                              borderRadius: "20px",
                            }}
                          >
                            배달 불가
                          </span>
                        )}
                      </span>
                      {selectedStores.has(storeName) && items.length > 0 && items[0]?.isDeliveryAvailable !== false && (
                        <span
                          style={{
                            fontSize: "14px",
                            color: "#64748b",
                            fontWeight: "600",
                          }}
                        >
                          배송비 {items[0].deliveryFee?.toLocaleString() || '3,000'}원
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Items List */}
                  <div
                    style={{
                      padding: "16px 18px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    {items.map((item) => {
                      const stock = item.stock ?? 999;
                      const isOutOfStock = stock <= 0;
                      const isLowStock = stock > 0 && stock <= 5;
                      const isInsufficientStock = stock > 0 && item.quantity > stock;
                      
                      return (
                      <div
                        key={item.id}
                        style={{ 
                          display: "flex", 
                          gap: "14px",
                          alignItems: "center",
                        }}
                      >
                        <img
                          src={item.img}
                          alt={item.name}
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YxZjVmOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTRhM2I4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
                          }}
                          style={{
                            width: "80px",
                            height: "80px",
                            borderRadius: "12px",
                            objectFit: "cover",
                            backgroundColor: "#f1f5f9",
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ flexGrow: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "6px", justifyContent: "center" }}>
                          <div
                            style={{
                              fontSize: "16px",
                              fontWeight: "600",
                              color: "#334155",
                              lineHeight: "1.4",
                            }}
                          >
                            {item.name}
                          </div>
                          <div
                            style={{
                              fontSize: "16px",
                              fontWeight: "800",
                              color: "#1e293b",
                            }}
                          >
                            {item.price.toLocaleString()}원
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: "8px",
                            flexShrink: 0,
                            justifyContent: "flex-start",
                          }}
                        >
                          {/* X 버튼 - 맨 위 */}
                          <button
                            onClick={() => onRemoveFromCart(item.id)}
                            style={{
                              border: "none",
                              background: "none",
                              color: "#94a3b8",
                              cursor: "pointer",
                              padding: "2px",
                              fontSize: "18px",
                              lineHeight: "1",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            ✕
                          </button>
                          {/* 재고 상태 표시 - 중간 (품절/품절임박만 표시, 재고 부족은 Footer에서 표시) */}
                          {isOutOfStock ? (
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#ef4444",
                                fontWeight: "700",
                                background: "#fef2f2",
                                padding: "5px 10px",
                                borderRadius: "6px",
                                border: "1px solid #fee2e2",
                                whiteSpace: "nowrap",
                              }}
                            >
                              품절
                            </div>
                          ) : isLowStock && !isInsufficientStock ? (
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#f59e0b",
                                fontWeight: "700",
                                background: "#fffbeb",
                                padding: "5px 10px",
                                borderRadius: "6px",
                                border: "1px solid #fef3c7",
                                whiteSpace: "nowrap",
                              }}
                            >
                              품절임박
                            </div>
                          ) : null}
                          {/* 수량 조절 바 - 맨 아래 */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              backgroundColor: "#f1f5f9",
                              padding: "5px 10px",
                              borderRadius: "24px",
                              opacity: isOutOfStock ? 0.5 : 1,
                            }}
                          >
                            <button
                              disabled={item.stock <= 0}
                              onClick={() => onUpdateQuantity(item.id, -1)}
                              style={{
                                border: "none",
                                background: "transparent",
                                cursor:
                                  item.stock <= 0 ? "not-allowed" : "pointer",
                                fontWeight: "800",
                                width: "24px",
                                fontSize: "18px",
                              }}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (isNaN(val) || val < 0) return;
                                const diff = val - item.quantity;
                                if (val === 0) {
                                  onRemoveFromCart(item.id);
                                } else {
                                  // 재고보다 많아도 수량을 줄이는 것은 허용
                                  onUpdateQuantity(item.id, diff);
                                }
                              }}
                              disabled={item.stock <= 0}
                              style={{
                                width: "45px",
                                textAlign: "center",
                                fontWeight: "700",
                                border: "none",
                                background: "transparent",
                                fontSize: "15px",
                                outline: "none",
                                cursor: item.stock <= 0 ? "not-allowed" : "text",
                                MozAppearance: "textfield",
                              }}
                              onWheel={(e) => e.target.blur()}
                            />
                            <style>{`
                              input[type="number"]::-webkit-inner-spin-button,
                              input[type="number"]::-webkit-outer-spin-button {
                                -webkit-appearance: none;
                                margin: 0;
                              }
                            `}</style>
                            <button
                              disabled={
                                item.stock <= 0 || item.quantity >= item.stock
                              }
                              onClick={() => onUpdateQuantity(item.id, 1)}
                              style={{
                                border: "none",
                                background: "transparent",
                                cursor:
                                  item.stock <= 0 || item.quantity >= item.stock
                                    ? "not-allowed"
                                    : "pointer",
                                fontWeight: "800",
                                width: "24px",
                                fontSize: "18px",
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {isLoggedIn && cartItems.length > 0 && (
          <div
            style={{
              padding: "20px 24px",
              borderTop: "1px solid #f1f5f9",
              background: "white",
            }}
          >
            {/* 배달 불가 마트 경고 */}
            {hasDeliveryUnavailableInSelection && deliveryUnavailableStoreNames.length > 0 && (
              <div
                style={{
                  padding: "10px 12px",
                  marginBottom: "12px",
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#991b1b",
                  lineHeight: "1.5",
                }}
              >
                <div style={{ fontWeight: "700", marginBottom: "4px" }}>
                  🚫 배달 불가능한 매장
                </div>
                <div>
                  {deliveryUnavailableStoreNames.join(", ")} — 현재 배달이 불가능합니다. 해당 상품을 제거하거나 나중에 주문해 주세요.
                </div>
              </div>
            )}
            {/* 재고 부족 경고 */}
            {insufficientStockItems.length > 0 && (
              <div
                style={{
                  padding: "10px 12px",
                  marginBottom: "12px",
                  backgroundColor: "#fffbeb",
                  border: "1px solid #fef3c7",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#92400e",
                  lineHeight: "1.5",
                }}
              >
                <div style={{ fontWeight: "700", marginBottom: "4px" }}>
                  ⚠️ 재고 부족 상품
                </div>
                {insufficientStockItems.map((item) => (
                  <div key={item.id} style={{ marginTop: "2px" }}>
                    · {item.name}: 재고 {item.stock}개 (담은 수량: {item.quantity}개)
                  </div>
                ))}
              </div>
            )}
            
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
                color: "#64748b",
                fontSize: "15px",
              }}
            >
              <span>선택 상품 금액</span>
              <span>{productPrice.toLocaleString()}원</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "14px",
                color: "#64748b",
                fontSize: "15px",
              }}
            >
              <span>배송비</span>
              <span>{shippingPrice.toLocaleString()}원</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "16px",
                paddingTop: "14px",
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <span style={{ fontWeight: "700", fontSize: "18px" }}>
                총 결제금액
              </span>
              <span
                style={{
                  fontWeight: "800",
                  fontSize: "20px",
                  color: "var(--primary)",
                }}
              >
                {totalPrice.toLocaleString()}원
              </span>
            </div>
            <button
              onClick={() => {
                if (activeSelectedStoreCount === 0) {
                  alert("결제할 상품이 포함된 상점을 선택해주세요.");
                  return;
                }
                if (hasDeliveryUnavailableInSelection) {
                  alert("배달 불가능한 매장이 포함되어 있습니다. 해당 상품을 제거하거나 나중에 주문해 주세요.");
                  return;
                }
                if (hasOutOfStockInSelection) {
                  if (insufficientStockItems.length > 0) {
                    alert(
                      `재고가 부족한 상품이 있습니다.\n\n${insufficientStockItems.map(item => `· ${item.name}: 재고 ${item.stock}개 (담은 수량: ${item.quantity}개)`).join('\n')}\n\n수량을 조절해주세요.`
                    );
                  } else {
                    alert(
                      "품절된 상품이 포함되어 있습니다. 해당 상품을 삭제해주세요."
                    );
                  }
                  return;
                }
                onClose();
                onCheckout(selectedItems);
              }}
              disabled={activeSelectedStoreCount === 0 || hasOutOfStockInSelection || hasDeliveryUnavailableInSelection}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "10px",
                background:
                  activeSelectedStoreCount > 0 && !hasOutOfStockInSelection && !hasDeliveryUnavailableInSelection
                    ? "var(--primary)"
                    : "#cbd5e1",
                color: "white",
                border: "none",
                fontWeight: "700",
                fontSize: "15px",
                cursor:
                  activeSelectedStoreCount > 0 && !hasOutOfStockInSelection
                    ? "pointer"
                    : "not-allowed",
                boxShadow:
                  activeSelectedStoreCount > 0 && !hasOutOfStockInSelection
                    ? "0 4px 14px rgba(16, 185, 129, 0.4)"
                    : "none",
                transition: "all 0.2s",
              }}
            >
              {hasOutOfStockInSelection
                ? insufficientStockItems.length > 0
                  ? "재고 부족 상품 수량 조절 필요"
                  : "품절 상품 포함됨"
                : `${activeSelectedStoreCount}개 상점 결제하기`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
