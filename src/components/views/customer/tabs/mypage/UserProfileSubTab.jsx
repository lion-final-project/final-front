import React from 'react';
import { getWithdrawalCheck, postWithdrawal } from '../../../../../api/userApi';

/** 탈퇴 불가 사유별 알림 문구 (프론트 연결용) */
const WITHDRAWAL_BLOCK_MESSAGES = {
  subscription: '진행중인 구독상품이 있어 탈퇴가 불가합니다.',
  payment: '결제 대기중인 상품이 있어 탈퇴가 불가합니다.',
  order: '진행중인 주문이 존재해 탈퇴가 불가합니다.',
  inactive: '이미 탈퇴했거나 비활성화된 계정입니다.',
};

/**
 * 탈퇴 가능 여부 조회 결과로 알림에 쓸 문구 배열을 만든다.
 * @param {{ withdrawable: boolean, reasons?: string[], activeSubscriptionCount?: number, pendingPaymentCount?: number, inProgressOrderCount?: number }} check
 * @returns {string[]}
 */
function getWithdrawalBlockAlertMessages(check) {
  const messages = [];
  if (check.activeSubscriptionCount > 0) {
    messages.push(WITHDRAWAL_BLOCK_MESSAGES.subscription);
  }
  if (check.pendingPaymentCount > 0) {
    messages.push(WITHDRAWAL_BLOCK_MESSAGES.payment);
  }
  if (check.inProgressOrderCount > 0) {
    messages.push(WITHDRAWAL_BLOCK_MESSAGES.order);
  }
  if (check.reasons?.some((r) => r.includes('비활성') || r.includes('탈퇴했거나'))) {
    messages.push(WITHDRAWAL_BLOCK_MESSAGES.inactive);
  }
  return messages.length > 0 ? messages : [check.reasons?.join('\n') || '탈퇴할 수 없는 상태입니다.'];
}

const UserProfileSubTab = ({ userInfo = {}, subscriptionList, onLogout }) => {
  const handleWithdraw = async () => {
    try {
      const check = await getWithdrawalCheck();
      if (!check.withdrawable) {
        const messages = getWithdrawalBlockAlertMessages(check);
        alert(messages.join('\n'));
        return;
      }
      if (!window.confirm('탈퇴 시 모든 적립금, 쿠폰, 주문 내역이 즉시 삭제되며 복구가 불가능합니다. 정말 탈퇴하시겠습니까?')) {
        return;
      }
      if (!window.confirm('마지막 확인입니다. 동네마켓을 탈퇴하시겠습니까?')) {
        return;
      }
      await postWithdrawal();
      alert('탈퇴가 완료되었습니다. 그동안 이용해 주셔서 감사합니다.');
      onLogout();
    } catch (err) {
      const data = err.response?.data;
      const errorBody = data?.error;
      const details = errorBody?.details;
      // 409 탈퇴 불가 시: 사유를 프론트 문구로 매핑해 알림
      if (err.response?.status === 409 && details?.length > 0) {
        const checkLike = {
          reasons: details.map((d) => d.message),
          activeSubscriptionCount: 0,
          pendingPaymentCount: 0,
          inProgressOrderCount: 0,
        };
        details.forEach((d) => {
          if (d.message?.includes('구독')) checkLike.activeSubscriptionCount = 1;
          if (d.message?.includes('결제 대기') || d.message?.includes('PENDING')) checkLike.pendingPaymentCount = 1;
          if (d.message?.includes('주문')) checkLike.inProgressOrderCount = 1;
        });
        const messages = getWithdrawalBlockAlertMessages(checkLike);
        alert(messages.join('\n'));
        return;
      }
      const message = errorBody?.message || data?.message || err.message || '탈퇴 처리 중 오류가 발생했습니다.';
      const detailText = details?.length ? '\n' + details.map((d) => d.message).join('\n') : '';
      alert(message + detailText);
    }
  };

  return (
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
        onClick={handleWithdraw}
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
};

export default UserProfileSubTab;
