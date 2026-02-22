import React from 'react';
import { getWithdrawalEligibility, deleteWithdrawal } from '../../../../../api/userApi';

/**
 * 탈퇴 가능 여부 조회 결과(blockedReasons)로 알림에 쓸 문구 배열을 만든다.
 * @param {{ canWithdraw: boolean, blockedReasons?: Array<{code: string, message: string}> }} check
 * @returns {string[]}
 */
function getWithdrawalBlockAlertMessages(check) {
  const reasons = check.blockedReasons ?? [];
  if (reasons.length === 0) {
    return [check.canWithdraw ? '' : '탈퇴할 수 없는 상태입니다.'];
  }
  return reasons.map((r) => r.message || r.code).filter(Boolean);
}

/** API의 joinedAt(ISO 문자열) 또는 joinDate를 가입일 표시용으로 포맷 (예: 2026. 02. 16.) */
function formatJoinDate(joinedAt, joinDate) {
  const raw = joinedAt ?? joinDate;
  if (!raw) return '';
  try {
    const d = typeof raw === 'string' ? new Date(raw) : raw;
    if (Number.isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}. ${m}. ${day}.`;
  } catch {
    return raw;
  }
}

const UserProfileSubTab = ({ userInfo = {}, subscriptionList, onLogout }) => {
  const handleWithdraw = async () => {
    try {
      const check = await getWithdrawalEligibility();
      if (!check.canWithdraw) {
        const messages = getWithdrawalBlockAlertMessages(check);
        alert(messages.filter(Boolean).join('\n') || '탈퇴할 수 없는 상태입니다.');
        return;
      }
      if (!window.confirm('탈퇴 시 모든 적립금, 쿠폰, 주문 내역이 즉시 삭제되며 복구가 불가능합니다. 정말 탈퇴하시겠습니까?')) {
        return;
      }
      if (!window.confirm('마지막 확인입니다. 동네마켓을 탈퇴하시겠습니까?')) {
        return;
      }
      await deleteWithdrawal();
      alert('탈퇴가 완료되었습니다. 그동안 이용해 주셔서 감사합니다.');
      onLogout();
    } catch (err) {
      const data = err.response?.data;
      const errorBody = data?.error;
      const details = errorBody?.details;
      if (err.response?.status === 409 && details?.length > 0) {
        const messages = details.map((d) => d.message).filter(Boolean);
        alert(messages.join('\n') || errorBody?.message || '탈퇴가 제한되었습니다.');
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
          { label: "이름", value: userInfo.name ?? '' },
          { label: "이메일", value: userInfo.email ?? '' },
          { label: "연락처", value: userInfo.phone ?? '' },
          { label: "가입일", value: formatJoinDate(userInfo.joinedAt, userInfo.joinDate) },
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
