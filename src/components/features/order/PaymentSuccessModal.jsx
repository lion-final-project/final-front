import React from 'react';

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
            주문 내역 확인하기
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

export default PaymentSuccessModal;
