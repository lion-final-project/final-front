import React from 'react';

const ResidentSubTab = ({ isResidentRider, verifyStep, setVerifyStep, setUserRole, setIsResidentRider, showToast }) => (
  <div style={{ background: "white", padding: "40px", borderRadius: "24px", border: "1px solid var(--border)", textAlign: "center" }}>
    {isResidentRider ? (
      <div>
        <div style={{ fontSize: "64px", marginBottom: "24px" }}>🎉</div>
        <h3 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "16px" }}>주민라이더 파트너님, 환영합니다!</h3>
        <p style={{ color: "#64748b", marginBottom: "32px" }}>지금 바로 동네 마켓의 라이더가 되어 이웃에게 배달을 시작해보세요.</p>
        <button onClick={() => setUserRole("RIDER")} style={{ padding: "16px 32px", borderRadius: "12px", background: "var(--primary)", color: "white", border: "none", fontWeight: "700", cursor: "pointer" }}>
          라이더 앱으로 이동하기
        </button>
      </div>
    ) : (
      <>
        {verifyStep === 0 && (
          <div>
            <div style={{ fontSize: "64px", marginBottom: "24px" }}>🏘️</div>
            <h2 style={{ fontSize: "16px", color: "var(--primary)", fontWeight: "800", marginBottom: "12px" }}>파트너 모집</h2>
            <h3 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "16px" }}>주민라이더 신청</h3>
            <p style={{ color: "#64748b", lineHeight: "1.6", marginBottom: "32px" }}>
              근거리 배달로 이웃에게 따뜻함을 전달하고 소소한 수익도 얻어보세요.
              <br />오토바이가 없어도 도보나 자전거로 충분히 가능합니다!
            </p>
            <button onClick={() => setVerifyStep(1)} style={{ padding: "16px 32px", borderRadius: "12px", background: "var(--primary)", color: "white", border: "none", fontWeight: "700", cursor: "pointer" }}>
              동네 인증 시작하기
            </button>
          </div>
        )}
        {verifyStep === 1 && (
          <div>
            <div style={{ fontSize: "48px", marginBottom: "24px" }}>📍</div>
            <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "12px" }}>현재 위치를 확인합니다</h3>
            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "32px" }}>인증된 거주지 주변 1km 이내의 배달 건만 수령 가능합니다.</p>
            <div style={{ height: "180px", backgroundColor: "#f1f5f9", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "32px", border: "1px solid #e2e8f0" }}>
              <span style={{ color: "var(--primary)", fontWeight: "700" }}>[GPS 시뮬레이션: 역삼동 확인됨]</span>
            </div>
            <button onClick={() => setVerifyStep(2)} style={{ width: "100%", padding: "16px", borderRadius: "12px", background: "var(--primary)", color: "white", border: "none", fontWeight: "700", cursor: "pointer" }}>
              위치 인증 완료
            </button>
          </div>
        )}
        {verifyStep === 2 && (
          <div style={{ textAlign: "left" }}>
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🪪</div>
              <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "8px" }}>신원 확인 및 서류 등록</h3>
              <p style={{ color: "#64748b", fontSize: "14px" }}>안전한 배달 환경을 위해 신분 인증이 필요합니다.</p>
            </div>
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontWeight: "700", fontSize: "14px", marginBottom: "12px" }}>신분증 종류 선택</label>
              <div style={{ display: "flex", gap: "12px" }}>
                {["주민등록증", "운전면허증"].map((type) => (
                  <button key={type} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "1.5px solid #e2e8f0", backgroundColor: "white", fontWeight: "600", cursor: "pointer" }}>{type}</button>
                ))}
              </div>
            </div>
            <div style={{ border: "2px dashed #cbd5e1", borderRadius: "16px", padding: "40px 20px", textAlign: "center", backgroundColor: "#f8fafc", marginBottom: "24px", cursor: "pointer" }}>
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>📸</div>
              <div style={{ fontWeight: "700", color: "#475569", marginBottom: "4px" }}>신분증 사진 업로드</div>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>빛 반사가 없는 선명한 사진을 올려주세요.</div>
            </div>
            <div style={{ backgroundColor: "#f1f5f9", padding: "16px", borderRadius: "12px", marginBottom: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <input type="checkbox" id="privacy" checked readOnly style={{ accentColor: "var(--primary)" }} />
                <label htmlFor="privacy" style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>개인정보 수집 및 이용 동의 (필수)</label>
              </div>
              <div style={{ fontSize: "12px", color: "#64748b", paddingLeft: "22px" }}>입력하신 정보는 신원 확인 용도로만 사용되며, <br />확인 즉시 암호화되어 안전하게 보관됩니다.</div>
            </div>
            <button
              onClick={() => {
                const btn = document.getElementById("verify-btn");
                if (btn) { btn.innerHTML = "✨ 신분증 스캔 중..."; btn.style.opacity = "0.7"; btn.disabled = true; }
                setTimeout(() => { setIsResidentRider(true); setVerifyStep(3); }, 2000);
              }}
              id="verify-btn"
              style={{ width: "100%", padding: "18px", borderRadius: "12px", background: "var(--primary)", color: "white", border: "none", fontWeight: "800", fontSize: "16px", cursor: "pointer", transition: "all 0.2s" }}
            >
              인증 요청하기
            </button>
          </div>
        )}
        {verifyStep === 3 && (
          <div>
            <div style={{ fontSize: "64px", marginBottom: "24px" }}>✨</div>
            <h3 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "16px" }}>동네 라이더 인증 완료!</h3>
            <p style={{ color: "#64748b", marginBottom: "32px" }}>이제 이웃을 위한 배달을 시작할 수 있습니다. 라이더 앱으로 이동합니다.</p>
            <button onClick={() => setUserRole("RIDER")} style={{ padding: "16px 32px", borderRadius: "12px", background: "var(--primary)", color: "white", border: "none", fontWeight: "700", cursor: "pointer" }}>
              라이더 앱으로 이동
            </button>
          </div>
        )}
      </>
    )}
  </div>
);

export default ResidentSubTab;
