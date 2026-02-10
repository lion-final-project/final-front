import React from 'react';
import { API_BASE_URL } from '../../../../../config/api';

const ApplicationStatusSubTab = ({
  storeRegistrationStatus,
  storeRegistrationStoreName,
  setStoreRegistrationStatus,
  riderRegistrationStatus,
  riderRegistrationApprovalId,
  setStoreRegistrationStoreName,
  setActiveTab,
  refreshRiderRegistration,
  isResidentRider,
  verifyStep,
  setVerifyStep,
  showToast,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
    <div style={{ background: "white", padding: "32px", borderRadius: "24px", border: "1px solid var(--border)" }}>
      <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "24px" }}>??? ?? ??</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ padding: "24px", borderRadius: "20px", backgroundColor: "#f8fafc", border: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "24px" }}>??</span>
              <div>
                <div style={{ fontWeight: "800", fontSize: "16px" }}>?? ?? ??</div>
                <div style={{ fontSize: storeRegistrationStoreName ? "15px" : "12px", fontWeight: storeRegistrationStoreName ? "600" : "400", color: storeRegistrationStoreName ? "#334155" : "#94a3b8", marginTop: "2px" }}>
                  {storeRegistrationStoreName ? `?? ??? ${storeRegistrationStoreName}` : "Neighborhood Mart Partner"}
                </div>
              </div>
            </div>
            <div
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "800",
                backgroundColor: storeRegistrationStatus === "APPROVED"
                  ? "rgba(16, 185, 129, 0.1)"
                  : storeRegistrationStatus && storeRegistrationStatus !== "NONE"
                    ? "rgba(245, 158, 11, 0.1)"
                    : "#f1f5f9",
                color: storeRegistrationStatus === "APPROVED"
                  ? "#10b981"
                  : storeRegistrationStatus && storeRegistrationStatus !== "NONE"
                    ? "#f59e0b"
                    : "#94a3b8",
              }}
            >
              {storeRegistrationStatus === "APPROVED"
                ? "?? ??"
                : storeRegistrationStatus && storeRegistrationStatus !== "NONE"
                  ? "?? ?"
                  : "???"}
            </div>
          </div>
          {storeRegistrationStatus && storeRegistrationStatus !== "NONE" ? (
            <div>
              <div style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6", marginBottom: storeRegistrationStatus !== "APPROVED" ? "12px" : "0" }}>
                {storeRegistrationStatus === "APPROVED"
                  ? "?????. ?? ?? ??? ???????. ?? ??? ???? ??? ??????."
                  : "???? ??? ???? ?? ????. ??? ??? ?? 3? ??? ??????."}
              </div>
              {storeRegistrationStatus !== "APPROVED" && (
                <button
                  onClick={async () => {
                    if (!window.confirm("?? ?? ??? ?????????")) return;
                    try {
                      const res = await fetch(`${API_BASE_URL}/api/stores/registration`, { method: "DELETE", credentials: "include" });
                      const json = await res.json().catch(() => ({}));
                      if (!res.ok) throw new Error(json?.error?.message || json?.message || "?? ?? ??? ??????.");
                      setStoreRegistrationStatus("NONE");
                      setStoreRegistrationStoreName?.(null);
                      showToast("?? ?? ??? ???????.");
                    } catch (err) {
                      alert(err.message || "?? ?? ??? ??????.");
                    }
                  }}
                  style={{ padding: "6px 12px", borderRadius: "8px", background: "white", border: "1px solid #fee2e2", color: "#ef4444", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                >
                  ?? ??
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", color: "#94a3b8" }}>?? ?? ??? ????.</span>
              <button
                onClick={() => { setActiveTab("partner"); window.scrollTo(0, 0); }}
                style={{ padding: "8px 16px", borderRadius: "10px", background: "white", border: "1.5px solid #e2e8f0", color: "#475569", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}
              >
                ?? ????
              </button>
            </div>
          )}
        </div>

        <div style={{ padding: "24px", borderRadius: "20px", backgroundColor: "#f8fafc", border: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "24px" }}>??</span>
              <div>
                <div style={{ fontWeight: "800", fontSize: "16px" }}>??? ?? ??</div>
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
              {isResidentRider
                ? "?? ?"
                : verifyStep > 0
                  ? "?? ??"
                  : "???"}
            </div>
          </div>
          {isResidentRider || riderRegistrationStatus !== "NONE" ? (
            <div>
              <div style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6", marginBottom: !isResidentRider ? "12px" : "0" }}>
                {isResidentRider
                  ? "???? ???? ?? ????. ??? ?? ???? ?? ??? ??? ? ????."
                  : "?? ??? ???????. ?? ??? ??????."}
              </div>
              {!isResidentRider && (riderRegistrationStatus === "PENDING" || riderRegistrationStatus === "HELD") && (
                <button
                  onClick={async () => {
                    if (!window.confirm("??? ??? ?????????")) return;
                    if (!riderRegistrationApprovalId) {
                      alert("?? ID? ????. ?? ?? ? ?? ??????.");
                      return;
                    }
                    try {
                      const res = await fetch(`${API_BASE_URL}/api/riders/approvals/${riderRegistrationApprovalId}`, {
                        method: "DELETE",
                        credentials: "include",
                      });
                      const json = await res.json().catch(() => ({}));
                      if (!res.ok) throw new Error(json?.error?.message || json?.message || "??? ?? ??? ??????.");
                      setVerifyStep(0);
                      refreshRiderRegistration?.();
                      showToast("??? ??? ???????.");
                    } catch (err) {
                      alert(err.message || "??? ?? ??? ??????.");
                    }
                  }}
                  style={{ padding: "6px 12px", borderRadius: "8px", background: "white", border: "1px solid #fee2e2", color: "#ef4444", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                >
                  ?? ??
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", color: "#94a3b8" }}>?? ?? ??? ????.</span>
              <button
                onClick={() => { setActiveTab("partner"); window.scrollTo(0, 0); }}
                style={{ padding: "8px 16px", borderRadius: "10px", background: "white", border: "1.5px solid #e2e8f0", color: "#475569", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}
              >
                ??? ????
              </button>
            </div>
          )}
        </div>
      </div>
    </div>

    <div style={{ background: "#f0fdf4", padding: "20px", borderRadius: "20px", border: "1px solid rgba(46, 204, 113, 0.2)" }}>
      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
        <span style={{ fontSize: "20px" }}>??</span>
        <div>
          <div style={{ fontSize: "14px", fontWeight: "800", color: "#166534", marginBottom: "4px" }}>??? ?? ??</div>
          <div style={{ fontSize: "13px", color: "#166534", opacity: 0.8, lineHeight: "1.6" }}>
            ?? ?? ?? ?? '[???/??? ??]'?? ?? ??? ???? ? ????. <br />
            ?? ?? ??? ????(1588-0000)? ??????.
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ApplicationStatusSubTab;
