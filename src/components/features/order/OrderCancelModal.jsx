import React from 'react';

const OrderCancelModal = ({
  isOpen,
  onClose,
  cancelReason,
  setCancelReason,
  cancelDetail,
  setCancelDetail,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
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
      onClick={onClose}
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
            • 취소 완료 후 결제 수단에 따라 환불까지 1~3영업일이 소요될 수 있습니다.
            <br />
            • 일부 상품의 경우 발주 단계에 따라 취소가 거절될 수 있습니다.
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={onClose}
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
              onClick={onSubmit}
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
  );
};

export default OrderCancelModal;
