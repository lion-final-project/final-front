import React from 'react';

const SubscriptionTabContent = ({ subscriptionList, onToast }) => {
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
        {subscriptionList.map((sub) => (
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
                    sub.status === "구독중" ? "#f0fdf4" : "#f1f5f9",
                  color:
                    sub.status === "구독중"
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
              <span style={{ color: "var(--primary)", fontWeight: "600" }}>
                {sub.price}
              </span>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() =>
                  onToast?.("구독 구성 변경 모달을 준비 중입니다.")
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
                  onToast?.("이번 주 배송을 건너뛰었습니다.")
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
};

export default SubscriptionTabContent;
