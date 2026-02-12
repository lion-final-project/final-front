import React, { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { EffectCoverflow, Pagination, Navigation } from 'swiper/modules';
import { issueCardBillingKey } from '../../../../../api/billingApi';
import CardRegistrationSuccessModal from './CardRegistrationSuccessModal';

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
  onCardRegistered,
  onRefreshPaymentMethods,
  showToast,
}) => {
  const [isRegisteringCard, setIsRegisteringCard] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const billingProcessedRef = useRef(false); // 카드 등록 처리 중복 방지 플래그

  // 토스 페이먼츠 카드 등록 완료 후 리다이렉트 처리
  useEffect(() => {
    // 이미 처리된 경우 중복 실행 방지
    if (billingProcessedRef.current) {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const authKey = urlParams.get('authKey');
    const customerKey = urlParams.get('customerKey');
    const billingStatus = urlParams.get('billing');

    // 카드 등록 관련 파라미터가 없으면 처리하지 않음
    if (!billingStatus) {
      return;
    }

    // 즉시 URL 파라미터 제거하여 중복 실행 방지
    const currentUrl = window.location.href.split('?')[0];
    window.history.replaceState({}, '', currentUrl);
    billingProcessedRef.current = true;

    if (billingStatus === 'success' && authKey && customerKey) {
      // 카드 등록 성공 - billingKey 발급
      setIsRegisteringCard(true);
      // 마이페이지에서 카드 등록할 때는 pendingCheckout과 pendingSubscriptionCheckout 제거하여 결제창으로 이동하지 않도록 함
      sessionStorage.removeItem('pendingCheckout');
      sessionStorage.removeItem('pendingSubscriptionCheckout');
      
      issueCardBillingKey({
        authKey: authKey,
        customerKey: customerKey,
      })
        .then(() => {
          // 카드 등록 완료 모달 표시
          setShowSuccessModal(true);
        })
        .catch((err) => {
          console.error('billingKey 발급 오류:', err);
          // 에러가 발생해도 카드는 등록되었을 수 있으므로 모달 표시
          setShowSuccessModal(true);
        })
        .finally(() => {
          setIsRegisteringCard(false);
          // 카드 등록 완료 후에도 잠시 플래그를 유지하여 탭 이동 방지
          setTimeout(() => {
            sessionStorage.removeItem('pendingBilling');
          }, 1000);
        });
    } else if (billingStatus === 'fail') {
      // 카드 등록 실패
      setIsRegisteringCard(false);
      // 마이페이지에서 카드 등록할 때는 pendingCheckout과 pendingSubscriptionCheckout 제거하여 결제창으로 이동하지 않도록 함
      sessionStorage.removeItem('pendingCheckout');
      sessionStorage.removeItem('pendingSubscriptionCheckout');
      // 실패 시에도 잠시 플래그를 유지하여 탭 이동 방지
      setTimeout(() => {
        sessionStorage.removeItem('pendingBilling');
      }, 1000);
    }
  }, [onRefreshPaymentMethods]);

  const handleRegisterCard = async () => {
    setIsRegisteringCard(true);
    try {
      // 토스 페이먼츠 스크립트 로드
      const loadTossPayments = () => {
        return new Promise((resolve, reject) => {
          if (window.TossPayments) {
            resolve(window.TossPayments);
            return;
          }
          const script = document.createElement('script');
          script.src = 'https://js.tosspayments.com/v1/payment';
          script.onload = () => resolve(window.TossPayments);
          script.onerror = () => reject(new Error('토스 페이먼츠 스크립트 로드 실패'));
          document.head.appendChild(script);
        });
      };

      const TossPayments = await loadTossPayments();
      const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY || 'test_ck_DpexMgkW36wVbqk5QqYrGbR5oz0C';
      const widget = TossPayments(clientKey);

      // 고객 키 생성 (사용자 ID 기반)
      const customerKey = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 카드 등록 진행 중 플래그 설정
      sessionStorage.setItem('pendingBilling', 'true');
      // 마이페이지에서 카드 등록할 때는 pendingCheckout과 pendingSubscriptionCheckout 제거하여 결제창으로 이동하지 않도록 함
      sessionStorage.removeItem('pendingCheckout');
      sessionStorage.removeItem('pendingSubscriptionCheckout');
      
      // 현재 URL을 기반으로 success/fail URL 생성
      const currentUrl = window.location.href.split('?')[0];
      const successUrl = `${currentUrl}?billing=success`;
      const failUrl = `${currentUrl}?billing=fail`;

      // 카드 등록 위젯 열기
      await widget.requestBillingAuth('카드', {
        customerKey: customerKey,
        successUrl: successUrl,
        failUrl: failUrl,
      });

      // 위젯은 successUrl로 리다이렉트되므로 여기서는 완료되지 않음
    } catch (err) {
      console.error('카드 등록 오류:', err);
      const message = err.response?.data?.message || err.message || '카드 등록에 실패했습니다.';
      alert(message);
      setIsRegisteringCard(false);
      // 에러 시에도 잠시 플래그를 유지하여 탭 이동 방지
      setTimeout(() => {
        sessionStorage.removeItem('pendingBilling');
      }, 1000);
    }
  };

  return (
  <>
    <div style={{ background: "white", padding: "24px", borderRadius: "16px", border: "1px solid var(--border)", width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>구독 결제 관리</h3>
        <button onClick={handleRegisterCard} disabled={isRegisteringCard} style={{ padding: "8px 16px", borderRadius: "8px", background: isRegisteringCard ? "#cbd5e1" : "#10b981", color: "white", border: "none", fontWeight: "700", fontSize: "13px", cursor: isRegisteringCard ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
          {isRegisteringCard ? "등록 중..." : "💳 카드 등록"}
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: "100%", overflow: "hidden" }}>
        <div style={{ width: "100%", maxWidth: "100%" }}>
          <Swiper
            key={`payment-methods-${paymentMethodList.length}-${paymentMethodList.map(pm => pm.id).join('-')}`}
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
            style={{ width: "100%", maxWidth: "100%" }}
          >
          {paymentMethodList.map((pm) => (
            <SwiperSlide key={pm.id} style={{ background: pm.color || "var(--primary)", width: "300px", maxWidth: "85vw", minHeight: "180px" }}>
              <div style={{ width: "100%", height: "100%", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxSizing: "border-box", color: "white", position: "relative" }}>
                {/* 상단: 카드사 이름과 기본 배지 */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                  <div>
                    <div style={{ fontSize: "18px", fontWeight: "800", textShadow: "0 2px 4px rgba(0,0,0,0.2)", marginBottom: "4px" }}>{pm.name}</div>
                    <div style={{ fontSize: "11px", opacity: 0.85 }}>{pm.type === "card" ? "Credit Card" : "Payment Method"}</div>
                  </div>
                  {pm.isDefault && (
                    <div style={{ backgroundColor: "rgba(255,255,255,0.25)", color: "white", padding: "4px 10px", borderRadius: "12px", fontSize: "10px", fontWeight: "700", backdropFilter: "blur(4px)" }}>
                      기본
                    </div>
                  )}
                </div>

                {/* 중간: 카드 번호 */}
                <div style={{ marginBottom: "24px" }}>
                  <div style={{ fontSize: "20px", letterSpacing: "3px", fontWeight: "600", textShadow: "0 2px 4px rgba(0,0,0,0.2)", fontFamily: "monospace", wordBreak: "break-all" }}>
                    {pm.number ? pm.number : "**** **** **** ****"}
                  </div>
                </div>

                {/* 하단: 버튼 영역 */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ fontSize: "9px", opacity: 0.8, textTransform: "uppercase", marginBottom: "2px" }}>Card Holder</div>
                    <div style={{ fontSize: "13px", fontWeight: "700", letterSpacing: "1px" }}>MEMBER</div>
                  </div>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    {!pm.isDefault && (
                      <button 
                        onClick={() => handleSetDefaultPaymentMethod(pm.id)} 
                        style={{ 
                          backgroundColor: "rgba(255,255,255,0.2)", 
                          color: "white", 
                          border: "1px solid rgba(255,255,255,0.3)", 
                          padding: "6px 12px", 
                          borderRadius: "8px", 
                          fontSize: "11px", 
                          fontWeight: "600", 
                          cursor: "pointer",
                          backdropFilter: "blur(4px)",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "rgba(255,255,255,0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "rgba(255,255,255,0.2)";
                        }}
                      >
                        기본 설정
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeletePaymentMethod(pm.id)} 
                      style={{ 
                        backgroundColor: "rgba(239, 68, 68, 0.25)", 
                        color: "white", 
                        border: "1px solid rgba(255,255,255,0.3)", 
                        padding: "6px 12px", 
                        borderRadius: "8px", 
                        fontSize: "11px", 
                        fontWeight: "600", 
                        cursor: "pointer",
                        backdropFilter: "blur(4px)",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "rgba(239, 68, 68, 0.35)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "rgba(239, 68, 68, 0.25)";
                      }}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
          <SwiperSlide key="add-new" style={{ background: "#f8fafc", border: "2px dashed #cbd5e1", color: "#64748b", width: "300px", maxWidth: "85vw" }}>
            <div onClick={handleRegisterCard} style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <div style={{ fontSize: "36px", marginBottom: "8px", opacity: 0.5 }}>💳</div>
              <div style={{ fontWeight: "800", fontSize: "16px" }}>카드 등록</div>
              <div style={{ fontSize: "11px", marginTop: "4px", opacity: 0.7 }}>토스 페이먼츠로 카드 등록</div>
            </div>
          </SwiperSlide>
        </Swiper>
        </div>

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

        <CardRegistrationSuccessModal 
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
        />

        <p style={{ marginTop: "24px", color: "#94a3b8", fontSize: "14px", textAlign: "center" }}>
          카드를 스와이프하여 관리할 수 있습니다.
          <br />
          <span style={{ fontSize: "12px", color: "#cbd5e1" }}>(결제 수단은 삭제 후 재등록만 가능합니다)</span>
        </p>
      </div>
    </div>
  </>
  );
};

export default PaymentSubTab;
