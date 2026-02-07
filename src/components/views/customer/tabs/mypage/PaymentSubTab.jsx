import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { EffectCoverflow, Pagination, Navigation } from 'swiper/modules';

const PaymentSubTab = ({
  paymentMethodList,
  handleOpenPaymentModal,
  handleSetDefaultPaymentMethod,
  handleDeletePaymentMethod,
  isPaymentModalOpen,
  setIsPaymentModalOpen,
  editingPaymentMethod,
  newPaymentMethod,
  setNewPaymentMethod,
  handleSavePaymentMethod,
}) => (
  <>
    <div style={{ background: "white", padding: "24px", borderRadius: "16px", border: "1px solid var(--border)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "700" }}>결제 수단 관리</h3>
        <button onClick={() => handleOpenPaymentModal()} style={{ padding: "8px 16px", borderRadius: "8px", background: "var(--primary)", color: "white", border: "none", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>
          + 결제 수단 추가
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Swiper
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView="auto"
          coverflowEffect={{ rotate: 50, stretch: 0, depth: 100, modifier: 1, slideShadows: true }}
          pagination={true}
          navigation={true}
          initialSlide={paymentMethodList.findIndex((pm) => pm.isDefault) !== -1 ? paymentMethodList.findIndex((pm) => pm.isDefault) : 0}
          slideToClickedSlide={true}
          modules={[EffectCoverflow, Pagination, Navigation]}
          className="mySwiper"
        >
          {paymentMethodList.map((pm) => (
            <SwiperSlide key={pm.id} style={{ background: pm.color || "var(--primary)" }}>
              <div style={{ width: "100%", height: "100%", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxSizing: "border-box" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "20px", fontWeight: "800", textShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>{pm.name}</span>
                    <span style={{ fontSize: "12px", opacity: 0.9 }}>{pm.type === "card" ? "Credit Card" : "Payment Method"}</span>
                  </div>
                  <span style={{ fontSize: "28px" }}>{pm.type === "card" ? "💳" : "💰"}</span>
                </div>
                <div style={{ fontSize: "20px", letterSpacing: "3px", fontWeight: "600", textShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                  {pm.number ? pm.number : "**** **** **** ****"}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "10px", opacity: 0.7, textTransform: "uppercase" }}>Card Holder</div>
                    <div style={{ fontSize: "14px", fontWeight: "700", letterSpacing: "1px" }}>MEMBER</div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {pm.isDefault ? (
                      <div style={{ backgroundColor: "rgba(255,255,255,0.9)", color: pm.color || "black", padding: "6px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "800", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>기본 결제</div>
                    ) : (
                      <button onClick={() => handleSetDefaultPaymentMethod(pm.id)} style={{ backgroundColor: "rgba(0,0,0,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.4)", padding: "6px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>기본 설정</button>
                    )}
                    <button onClick={() => handleDeletePaymentMethod(pm.id)} style={{ backgroundColor: "rgba(239, 68, 68, 0.2)", color: "white", border: "1px solid rgba(255,255,255,0.4)", padding: "6px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>삭제</button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
          <SwiperSlide key="add-new" style={{ background: "#f8fafc", border: "2px dashed #cbd5e1", color: "#64748b" }}>
            <div onClick={() => handleOpenPaymentModal()} style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px", opacity: 0.5 }}>+</div>
              <div style={{ fontWeight: "800", fontSize: "18px" }}>결제 수단 추가</div>
              <div style={{ fontSize: "12px", marginTop: "4px", opacity: 0.7 }}>신용/체크카드, 간편결제</div>
            </div>
          </SwiperSlide>
        </Swiper>

        {isPaymentModalOpen && (
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }} onClick={() => setIsPaymentModalOpen(false)}>
            <div style={{ background: "white", width: "100%", maxWidth: "450px", borderRadius: "24px", padding: "32px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h3 style={{ fontSize: "20px", fontWeight: "800" }}>{editingPaymentMethod ? "결제 수단 수정" : "새 결제 수단 추가"}</h3>
                <button onClick={() => setIsPaymentModalOpen(false)} style={{ background: "none", border: "none", fontSize: "24px", color: "#94a3b8", cursor: "pointer" }}>✕</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "700", marginBottom: "8px", color: "#334155" }}>카드/계좌 명칭</label>
                  <input type="text" placeholder="예: 생활비 카드, 국민은행 메인" value={newPaymentMethod.name} onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, name: e.target.value })} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "700", marginBottom: "8px", color: "#334155" }}>번호</label>
                  <input type="text" placeholder="**** **** **** ****" value={newPaymentMethod.number} onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, number: e.target.value })} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "700", marginBottom: "8px", color: "#334155" }}>테마 색상</label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {["#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#1e293b"].map((c) => (
                      <div key={c} onClick={() => setNewPaymentMethod({ ...newPaymentMethod, color: c })} style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: c, cursor: "pointer", border: newPaymentMethod.color === c ? "3px solid #fff" : "none", boxShadow: newPaymentMethod.color === c ? "0 0 0 2px var(--primary)" : "none" }} />
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                  <input type="checkbox" id="def-payment" checked={newPaymentMethod.isDefault} onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, isDefault: e.target.checked })} style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }} />
                  <label htmlFor="def-payment" style={{ fontSize: "14px", color: "#475569", cursor: "pointer" }}>기본 결제 수단으로 설정</label>
                </div>
                <button onClick={handleSavePaymentMethod} style={{ width: "100%", padding: "16px", borderRadius: "12px", background: "var(--primary)", color: "white", border: "none", fontWeight: "800", fontSize: "16px", cursor: "pointer", marginTop: "12px" }}>
                  {editingPaymentMethod ? "수정 완료" : "저장하기"}
                </button>
              </div>
            </div>
          </div>
        )}

        <p style={{ marginTop: "24px", color: "#94a3b8", fontSize: "14px", textAlign: "center" }}>
          카드를 스와이프하여 관리할 수 있습니다.
          <br />
          <span style={{ fontSize: "12px", color: "#cbd5e1" }}>(결제 수단은 삭제 후 재등록만 가능합니다)</span>
        </p>
      </div>
    </div>
  </>
);

export default PaymentSubTab;
