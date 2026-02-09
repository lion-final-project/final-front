import React from 'react';

const UserProfileSubTab = ({ userInfo = {}, subscriptionList, onLogout }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
    <div
      style={{
        background: "white",
        padding: "32px",
        borderRadius: "24px",
        border: "1px solid var(--border)",
      }}
    >
      <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "24px" }}>내 정보 관리</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {[
          { label: "이름", value: userInfo.name },
          { label: "이메일", value: userInfo.email },
          { label: "연락처", value: userInfo.phone },
          { label: "생년월일", value: userInfo.birth },
          { label: "가입일", value: userInfo.joinDate },
        ].map((item, i) => (
          <div
            key={i}
            style={{ display: "grid", gridTemplateColumns: "120px 1fr", alignItems: "center" }}
          >
            <label style={{ fontSize: "14px", color: "#64748b", fontWeight: "700" }}>{item.label}</label>
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
        <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "12px" }}>
          * 개인정보 보호를 위해 정보 수정은 고객센터를 통해 가능합니다.
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
      <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#ef4444", marginBottom: "16px" }}>회원 탈퇴</h3>
      <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6", marginBottom: "24px" }}>
        탈퇴 시 모든 적립금, 쿠폰, 주문 내역이 삭제되며 복구가 불가능합니다.
        <br />
        신중하게 결정해 주시기 바랍니다.
      </p>
      <button
        onClick={() => {
          const hasActiveSub = subscriptionList.some((sub) => sub.status !== "해지됨");
          if (hasActiveSub) {
            alert("현재 이용 중이거나 해지 예정인 구독 상품이 있습니다. 구독 상품을 모두 해지(종료)하신 후에만 탈퇴가 가능합니다.");
            return;
          }
          if (window.confirm("탈퇴 시 모든 적립금, 쿠폰, 주문 내역이 즉시 삭제되며 복구가 불가능합니다. 정말 탈퇴하시겠습니까?")) {
            if (window.confirm("마지막 확인입니다. 동네마켓을 탈퇴하시겠습니까?")) {
              alert("탈퇴 처리가 완료되었습니다. 그동안 이용해주셔서 감사합니다.");
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
);

export default UserProfileSubTab;
