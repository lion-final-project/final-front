import React from 'react';

const AddressSubTab = ({
  addressList,
  handleOpenAddressModal,
  handleSetDefaultAddress,
  handleDeleteAddress,
  isAddressModalOpen,
  setIsAddressModalOpen,
  editingAddress,
  newAddress,
  setNewAddress,
  handleSaveAddress,
  showToast,
}) => (
  <>
    <div
      style={{
        background: "white",
        padding: "24px",
        borderRadius: "16px",
        border: "1px solid var(--border)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "700" }}>배송지 관리</h3>
        <button
          onClick={() => handleOpenAddressModal()}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            background: "var(--primary)",
            color: "white",
            border: "none",
            fontWeight: "700",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          + 새 배송지 추가
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {addressList.map((addr) => (
          <div
            key={addr.id}
            onClick={() => !addr.isDefault && handleSetDefaultAddress(addr.id)}
            style={{
              padding: "20px",
              borderRadius: "16px",
              border: `1px solid ${addr.isDefault ? "var(--primary)" : "#f1f5f9"}`,
              backgroundColor: addr.isDefault ? "rgba(46, 204, 113, 0.05)" : "white",
              cursor: addr.isDefault ? "default" : "pointer",
              transition: "all 0.2s",
              position: "relative",
            }}
            onMouseOver={(e) => { if (!addr.isDefault) e.currentTarget.style.borderColor = "var(--primary-light)"; }}
            onMouseOut={(e) => { if (!addr.isDefault) e.currentTarget.style.borderColor = "#f1f5f9"; }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontWeight: "800", fontSize: "16px" }}>{addr.label}</span>
                {addr.isDefault && (
                  <span style={{ fontSize: "10px", backgroundColor: "var(--primary)", color: "white", padding: "2px 6px", borderRadius: "4px", fontWeight: "800" }}>
                    기본배송지
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: "12px", fontSize: "13px", color: "#94a3b8" }}>
                <span onClick={(e) => { e.stopPropagation(); handleOpenAddressModal(addr); }} style={{ cursor: "pointer", zIndex: 1 }}>수정</span>
                <span
                  onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr.id); }}
                  style={{ cursor: "pointer", color: addressList.length <= 1 ? "#cbd5e1" : "#ef4444" }}
                >
                  삭제
                </span>
              </div>
            </div>
            <div style={{ fontSize: "15px", color: "#1e293b", marginBottom: "4px" }}>
              {addr.postalCode && `[${addr.postalCode}] `}{addr.address}
            </div>
            <div style={{ fontSize: "14px", color: "#64748b", marginBottom: "4px" }}>{addr.detail}</div>
            <div style={{ fontSize: "13px", color: "#94a3b8" }}>{addr.contact}</div>
          </div>
        ))}
      </div>
    </div>

    {isAddressModalOpen && (
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 1200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(4px)",
        }}
        onClick={() => setIsAddressModalOpen(false)}
      >
        <div
          style={{
            background: "white",
            width: "100%",
            maxWidth: "500px",
            borderRadius: "24px",
            padding: "32px",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: "800" }}>{editingAddress ? "배송지 수정" : "새 배송지 추가"}</h3>
            <button onClick={() => setIsAddressModalOpen(false)} style={{ background: "none", border: "none", fontSize: "24px", color: "#94a3b8", cursor: "pointer" }}>✕</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "700", marginBottom: "8px", color: "#334155" }}>배송지 별칭</label>
              <input
                type="text"
                placeholder="예: 회사, 본가, 친구집"
                value={newAddress.label}
                onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "700", marginBottom: "8px", color: "#334155" }}>연락처</label>
              <input
                type="text"
                placeholder="010-0000-0000"
                value={newAddress.contact}
                onChange={(e) => setNewAddress({ ...newAddress, contact: e.target.value })}
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "700", marginBottom: "8px", color: "#334155" }}>주소</label>
              <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                <input type="text" placeholder="우편번호" value={newAddress.postalCode} readOnly style={{ width: "100px", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", color: "#64748b" }} />
                <input type="text" placeholder="주소 검색" value={newAddress.address} readOnly style={{ flexGrow: 1, padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", color: "#64748b" }} />
                <button
                  onClick={() => {
                    if (!window.kakao?.Postcode) { alert("주소 서비스가 로딩 중입니다. 잠시 후 다시 시도해주세요."); return; }
                    new window.kakao.Postcode({
                      oncomplete: (data) => {
                        let fullAddress = data.roadAddress;
                        let extraAddress = "";
                        if (data.bname !== "" && /[동|로|가]$/g.test(data.bname)) extraAddress += data.bname;
                        if (data.buildingName !== "" && data.apartment === "Y") extraAddress += extraAddress !== "" ? ", " + data.buildingName : data.buildingName;
                        fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
                        const performGeocoding = () => {
                          if (!window.kakao?.maps?.services?.Geocoder) {
                            setNewAddress((prev) => ({ ...prev, address: fullAddress, postalCode: data.zonecode, latitude: null, longitude: null }));
                            showToast("주소가 입력되었습니다.");
                            return;
                          }
                          const geocoder = new window.kakao.maps.services.Geocoder();
                          geocoder.addressSearch(data.roadAddress, (result, status) => {
                            if (status === window.kakao.maps.services.Status.OK && result?.[0]) {
                              setNewAddress((prev) => ({ ...prev, address: fullAddress, postalCode: data.zonecode, latitude: parseFloat(result[0].y), longitude: parseFloat(result[0].x) }));
                            } else {
                              setNewAddress((prev) => ({ ...prev, address: fullAddress, postalCode: data.zonecode, latitude: null, longitude: null }));
                            }
                            showToast("주소가 입력되었습니다.");
                          });
                        };
                        if (window.kakao?.maps?.services?.Geocoder) performGeocoding();
                        else if (window.kakao?.maps?.load) window.kakao.maps.load(performGeocoding);
                        else { setNewAddress((prev) => ({ ...prev, address: fullAddress, postalCode: data.zonecode, latitude: null, longitude: null })); showToast("주소가 입력되었습니다."); }
                      },
                    }).open();
                  }}
                  style={{ padding: "0 16px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "white", fontWeight: "600", cursor: "pointer", fontSize: "13px" }}
                >
                  검색
                </button>
              </div>
              <input
                type="text"
                placeholder="상세 주소를 입력해주세요"
                value={newAddress.detail}
                onChange={(e) => setNewAddress({ ...newAddress, detail: e.target.value })}
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
              <input type="checkbox" id="def-addr" checked={newAddress.isDefault} onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })} style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }} />
              <label htmlFor="def-addr" style={{ fontSize: "14px", color: "#475569", cursor: "pointer" }}>기본 배송지로 설정</label>
            </div>
            <button
              onClick={handleSaveAddress}
              style={{ width: "100%", padding: "16px", borderRadius: "12px", background: "var(--primary)", color: "white", border: "none", fontWeight: "800", fontSize: "16px", cursor: "pointer", marginTop: "12px" }}
            >
              저장하기
            </button>
          </div>
        </div>
      </div>
    )}
  </>
);

export default AddressSubTab;
