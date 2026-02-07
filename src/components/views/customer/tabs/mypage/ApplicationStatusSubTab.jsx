import React from 'react';
import { API_BASE_URL } from '../../../../../config/api';

const ApplicationStatusSubTab = ({
  storeRegistrationStatus,
  storeRegistrationStoreName,
  setStoreRegistrationStatus,
  setStoreRegistrationStoreName,
  setActiveTab,
  isResidentRider,
  verifyStep,
  setVerifyStep,
  showToast,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
    <div style={{ background: "white", padding: "32px", borderRadius: "24px", border: "1px solid var(--border)" }}>
      <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "24px" }}>파트너 신청 현황</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ padding: "24px", borderRadius: "20px", backgroundColor: "#f8fafc", border: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "24px" }}>🏢</span>
              <div>
                <div style={{ fontWeight: "800", fontSize: "16px" }}>마트 입점 신청</div>
                <div style={{ fontSize: storeRegistrationStoreName ? "15px" : "12px", fontWeight: storeRegistrationStoreName ? "600" : "400", color: storeRegistrationStoreName ? "#334155" : "#94a3b8", marginTop: "2px" }}>
                  {storeRegistrationStoreName ? `신청 상호명: ${storeRegistrationStoreName}` : "Neighborhood Mart Partner"}
                </div>
              </div>
            </div>
            <div
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "800",
                backgroundColor: storeRegistrationStatus === "APPROVED" ? "rgba(16, 185, 129, 0.1)" : storeRegistrationStatus && storeRegistrationStatus !== "NONE" ? "rgba(245, 158, 11, 0.1)" : "#f1f5f9",
                color: storeRegistrationStatus === "APPROVED" ? "#10b981" : storeRegistrationStatus && storeRegistrationStatus !== "NONE" ? "#f59e0b" : "#94a3b8",
              }}
            >
              {storeRegistrationStatus === "APPROVED" ? "승인 완료" : storeRegistrationStatus && storeRegistrationStatus !== "NONE" ? "심사 중" : "미신청"}
            </div>
          </div>
          {storeRegistrationStatus && storeRegistrationStatus !== "NONE" ? (
            <div>
              <div style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6", marginBottom: storeRegistrationStatus !== "APPROVED" ? "12px" : "0" }}>
                {storeRegistrationStatus === "APPROVED"
                  ? "축하합니다! 마트 입점 승인이 완료되었습니다. 이제 상품을 등록하고 판매를 시작해보세요."
                  : "제출하신 서류를 관리자가 검토 중입니다. 결과는 영업일 기준 3일 이내에 알림으로 안내해 드립니다."}
              </div>
              {storeRegistrationStatus !== "APPROVED" && (
                <button
                  onClick={async () => {
                    if (!window.confirm("마트 입점 신청을 취소하시겠습니까?")) return;
                    try {
                      const res = await fetch(`${API_BASE_URL}/api/stores/registration`, { method: "DELETE", credentials: "include" });
                      const json = await res.json().catch(() => ({}));
                      if (!res.ok) throw new Error(json?.error?.message || json?.message || "입점 신청 취소에 실패했습니다.");
                      setStoreRegistrationStatus("NONE");
                      setStoreRegistrationStoreName?.(null);
                      showToast("마트 입점 신청이 취소되었습니다.");
                    } catch (err) {
                      alert(err.message || "입점 신청 취소에 실패했습니다.");
                    }
                  }}
                  style={{ padding: "6px 12px", borderRadius: "8px", background: "white", border: "1px solid #fee2e2", color: "#ef4444", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                >
                  신청 취소
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", color: "#94a3b8" }}>아직 신청 내역이 없습니다.</span>
              <button
                onClick={() => { setActiveTab("partner"); window.scrollTo(0, 0); }}
                style={{ padding: "8px 16px", borderRadius: "10px", background: "white", border: "1.5px solid #e2e8f0", color: "#475569", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}
              >
                입점 신청하기
              </button>
            </div>
          )}
        </div>

        <div style={{ padding: "24px", borderRadius: "20px", backgroundColor: "#f8fafc", border: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "24px" }}>🛵</span>
              <div>
                <div style={{ fontWeight: "800", fontSize: "16px" }}>라이더 등록 현황</div>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>Neighborhood Delivery Partner</div>
              </div>
            </div>
            <div
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "800",
                backgroundColor: isResidentRider ? "rgba(16, 185, 129, 0.1)" : verifyStep > 0 ? "rgba(245, 158, 11, 0.1)" : "#f1f5f9",
                color: isResidentRider ? "#10b981" : verifyStep > 0 ? "#f59e0b" : "#94a3b8",
              }}
            >
              {isResidentRider ? "활동 중" : verifyStep > 0 ? "인증 대기" : "미신청"}
            </div>
          </div>
          {isResidentRider || verifyStep > 0 ? (
            <div>
              <div style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6", marginBottom: !isResidentRider ? "12px" : "0" }}>
                {isResidentRider ? "라이더 파트너로 등록되어 활동 중입니다. 라이더 전용 대시보드에서 배달을 수락할 수 있습니다." : "주민라이더 동네 인증 및 서류 제출이 완료되었습니다. 최종 승인 후 활동이 가능합니다."}
              </div>
              {!isResidentRider && verifyStep > 0 && (
                <button
                  onClick={() => { if (window.confirm("라이더 신청을 취소하시겠습니까?")) { setVerifyStep(0); showToast("라이더 신청이 취소되었습니다."); } }}
                  style={{ padding: "6px 12px", borderRadius: "8px", background: "white", border: "1px solid #fee2e2", color: "#ef4444", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                >
                  신청 취소
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", color: "#94a3b8" }}>아직 신청 내역이 없습니다.</span>
              <button
                onClick={() => { setActiveTab("partner"); window.scrollTo(0, 0); }}
                style={{ padding: "8px 16px", borderRadius: "10px", background: "white", border: "1.5px solid #e2e8f0", color: "#475569", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}
              >
                라이더 신청하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>

    <div style={{ background: "#f0fdf4", padding: "20px", borderRadius: "20px", border: "1px solid rgba(46, 204, 113, 0.2)" }}>
      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
        <span style={{ fontSize: "20px" }}>📢</span>
        <div>
          <div style={{ fontSize: "14px", fontWeight: "800", color: "#166534", marginBottom: "4px" }}>파트너 페이지 이용 안내</div>
          <div style={{ fontSize: "13px", color: "#166534", opacity: 0.8, lineHeight: "1.6" }}>
            승인 완료 후에는 상단 '[판매자/라이더 메뉴]'를 통해 전용 대시보드로 이동하실 수 있습니다. <br />
            기타 문의 사항은 고객센터(1588-0000)를 이용해 주세요.
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ApplicationStatusSubTab;
