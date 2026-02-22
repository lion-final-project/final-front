import React from 'react';

const LoginRequiredPrompt = ({ icon = "👤", title, onLogin, onBack, backLabel = "홈으로 돌아가기" }) => {
  return (
    <div
      style={{
        padding: "100px 0",
        textAlign: "center",
        maxWidth: "400px",
        margin: "0 auto",
      }}
    >
      <div style={{ fontSize: "64px", marginBottom: "24px" }}>{icon}</div>
      <h2
        style={{
          fontSize: "24px",
          fontWeight: "700",
          marginBottom: "16px",
        }}
      >
        {title}
      </h2>
      <p
        style={{
          color: "var(--text-muted)",
          marginBottom: "32px",
          lineHeight: "1.6",
        }}
      >
        회원가입 후 동네마켓의 신선한 상품들과 <br /> 다양한 혜택을 만나보세요!
      </p>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {onLogin && (
          <button
            onClick={onLogin}
            className="btn-primary"
            style={{ padding: "16px", fontSize: "16px" }}
          >
            간편 로그인 / 회원가입
          </button>
        )}
        {onBack && (
          <button
            onClick={onBack}
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
            {backLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default LoginRequiredPrompt;
