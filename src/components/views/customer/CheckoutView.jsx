import React, { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCube, Pagination } from 'swiper/modules';
import { addresses as defaultAddresses, paymentMethods as defaultPaymentMethods } from '../../../data/mockData';
import { getCheckout } from '../../../api/checkoutApi';
import { createOrder } from '../../../api/orderApi';
import { getAvailableCoupons } from '../../../api/couponApi';
import { preparePayment, confirmPayment } from '../../../api/paymentApi';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-cube';
import 'swiper/css/pagination';

const AddressModal = ({ isOpen, onClose, addresses, onSelect, currentAddressId }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(4px)'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'white',
        width: '90%',
        maxWidth: '500px',
        borderRadius: '24px',
        padding: '32px',
        maxHeight: '80vh',
        overflowY: 'auto',
        position: 'relative'
      }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'none',
          border: 'none',
          fontSize: '20px',
          cursor: 'pointer',
          color: '#64748b'
        }}>✕</button>

        <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>배송지 선택</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {addresses.map(addr => (
            <div 
              key={addr.id}
              onClick={() => {
                onSelect(addr);
                onClose();
              }}
              style={{
                padding: '20px',
                borderRadius: '16px',
                border: `2px solid ${currentAddressId === addr.id ? 'var(--primary)' : '#e2e8f0'}`,
                backgroundColor: currentAddressId === addr.id ? 'var(--primary-light)' : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ 
                  backgroundColor: currentAddressId === addr.id ? 'var(--primary)' : '#94a3b8', 
                  color: 'white', 
                  fontSize: '10px', 
                  padding: '2px 6px', 
                  borderRadius: '4px', 
                  fontWeight: '800' 
                }}>
                  {addr.label}
                </span>
                <span style={{ fontWeight: '700' }}>{addr.contact}</span>
              </div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>{addr.address}</div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>{addr.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CheckoutView = ({ cartItems, onComplete, onBack, addresses: addressesProp, paymentMethods: paymentMethodsProp }) => {
  const addresses = addressesProp && addressesProp.length > 0 ? addressesProp : defaultAddresses;
  const paymentMethods = paymentMethodsProp && paymentMethodsProp.length > 0 ? paymentMethodsProp : defaultPaymentMethods;
  const [selectedAddress, setSelectedAddress] = useState(addresses.find(a => a.isDefault) || addresses[0]);
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods.find(p => p.isDefault) || paymentMethods[0]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [deliveryRequest, setDeliveryRequest] = useState('');
  const [customRequest, setCustomRequest] = useState(false);
  const [requestInput, setRequestInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [usePointsInput, setUsePointsInput] = useState(0);
  const [selectedCouponId, setSelectedCouponId] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const paymentProcessedRef = useRef(false); // 결제 처리 중복 방지 플래그

  const cartItemIds = (cartItems || []).map((i) => i.cartProductId ?? i.id).filter(Boolean);

  useEffect(() => {
    const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
    if (defaultAddr && defaultAddr.id !== selectedAddress?.id) {
      setSelectedAddress(defaultAddr);
    }
  }, [addresses]);

  useEffect(() => {
    const defaultPay = paymentMethods.find((p) => p.isDefault) || paymentMethods[0];
    if (defaultPay && defaultPay.id !== selectedPayment?.id) {
      setSelectedPayment(defaultPay);
    }
  }, [paymentMethods]);

  useEffect(() => {
    let cancelled = false;
    getAvailableCoupons()
      .then((list) => { if (!cancelled) setAvailableCoupons(list); })
      .catch(() => { if (!cancelled) setAvailableCoupons([]); });
    return () => { cancelled = true; };
  }, []);

  // 토스 페이먼츠 결제 완료 후 리다이렉트 처리
  useEffect(() => {
    // 이미 처리된 경우 중복 실행 방지
    if (paymentProcessedRef.current) {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const paymentKey = urlParams.get('paymentKey');
    const orderId = urlParams.get('orderId');
    const errorCode = urlParams.get('code');
    const errorMessage = urlParams.get('message');
    const paymentStatus = urlParams.get('payment'); // 커스텀 파라미터 (fail 케이스용)

    // 결제 관련 파라미터가 없으면 처리하지 않음
    if (!paymentKey && !orderId && !paymentStatus && !errorCode) {
      return;
    }

    // 즉시 URL 파라미터 제거하여 중복 실행 방지
    const currentUrl = window.location.href.split('?')[0];
    window.history.replaceState({}, '', currentUrl);
    paymentProcessedRef.current = true;

    // 토스 페이먼츠는 successUrl에 paymentKey와 orderId를 전달함
    if (paymentKey && orderId) {
      // 결제 성공 - confirm API 호출
      const pendingPaymentId = sessionStorage.getItem('pendingPaymentId');
      if (!pendingPaymentId) {
        alert('결제 정보를 찾을 수 없습니다.');
        sessionStorage.removeItem('pendingCheckout');
        return;
      }

      setIsProcessing(true);
      confirmPayment({
        paymentId: Number(pendingPaymentId),
        paymentKey: paymentKey,
      })
        .then(() => {
          const pendingOrderId = sessionStorage.getItem('pendingOrderId');
          sessionStorage.removeItem('pendingPaymentId');
          sessionStorage.removeItem('pendingOrderId');
          sessionStorage.removeItem('pendingCheckout');
          onComplete(true, pendingOrderId ? Number(pendingOrderId) : null);
        })
        .catch((err) => {
          console.error('결제 확인 오류:', err);
          const message = err.response?.data?.message || err.message || '결제 확인에 실패했습니다.';
          alert(message);
          sessionStorage.removeItem('pendingPaymentId');
          sessionStorage.removeItem('pendingOrderId');
          // pendingCheckout은 유지하여 checkout 탭에 머물도록 함
          // 결제 확인 실패 시에도 checkout 탭 유지
          // onComplete(false); // 주석 처리하여 메인으로 이동하지 않도록 함
        })
        .finally(() => {
          setIsProcessing(false);
        });
    } else if (paymentStatus === 'fail' || errorCode) {
      // 결제 실패
      setIsProcessing(false);
      const errorMsg = errorMessage || errorCode || '결제에 실패했습니다.';
      alert(errorMsg);
      sessionStorage.removeItem('pendingPaymentId');
      sessionStorage.removeItem('pendingOrderId');
      // pendingCheckout은 유지하여 checkout 탭에 머물도록 함
      // onComplete를 호출하지 않아서 checkout 탭에 머물도록 함
      // onComplete(false); // 주석 처리하여 메인으로 이동하지 않도록 함
    }
  }, [onComplete]);

  useEffect(() => {
    if (cartItemIds.length === 0) {
      setCheckoutData(null);
      return;
    }
    let cancelled = false;
    setCheckoutLoading(true);
    const usePoints = typeof usePointsInput === 'number' && usePointsInput >= 0 ? usePointsInput : 0;
    const couponId = selectedCouponId === '' || selectedCouponId == null ? undefined : Number(selectedCouponId);
    getCheckout(cartItemIds, selectedAddress?.id ?? undefined, { couponId: couponId ?? null, usePoints })
      .then((data) => {
        if (!cancelled) setCheckoutData(data);
      })
      .catch(() => {
        if (!cancelled) setCheckoutData(null);
      })
      .finally(() => {
        if (!cancelled) setCheckoutLoading(false);
      });
    return () => { cancelled = true; };
  }, [cartItemIds.join(','), selectedAddress?.id, usePointsInput, selectedCouponId]);

  const availablePoints = checkoutData?.availablePoints ?? 0;
  useEffect(() => {
    if (availablePoints > 0 && usePointsInput > availablePoints) {
      setUsePointsInput(availablePoints);
    }
  }, [availablePoints]);

  const requestOptions = [
    '배송 전 연락바랍니다',
    '부재 시 경비실에 맡겨주세요',
    '문 앞에 놓아주세요',
    '벨을 누르지 말아주세요',
    '직접 입력'
  ];

  const handleRequestChange = (e) => {
    const value = e.target.value;
    setDeliveryRequest(value);
    if (value === '직접 입력') {
      setCustomRequest(true);
    } else {
      setCustomRequest(false);
    }
  };

  const summary = checkoutData?.priceSummary;
  const totalPrice = summary?.productTotal ?? cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = summary?.deliveryTotal ?? 3000;
  const discount = summary?.discount ?? 0;
  const points = summary?.points ?? 0;
  const finalPrice = summary?.finalTotal ?? totalPrice + deliveryFee - discount - points;

  const effectivePaymentMethodId = checkoutData?.payment?.defaultPaymentMethodId ?? selectedPayment?.id;

  const handlePayment = async () => {
    if (!selectedAddress?.id || effectivePaymentMethodId == null || !cartItemIds.length) {
      alert('배송지와 결제 수단을 선택하고, 장바구니에 상품이 있어야 합니다.');
      return;
    }
    
    // 토스 페이먼츠를 선택하지 않은 경우 기존 로직 사용
    const isTossPayment = selectedPayment?.type === 'toss' || selectedPayment?.name === 'Toss 스타일 간편결제';
    
    if (!isTossPayment) {
      setIsProcessing(true);
      try {
        const deliveryRequestText = deliveryRequest === '직접 입력' ? requestInput : (deliveryRequest || '');
        const availablePoints = checkoutData?.availablePoints ?? 0;
        const usePoints = Math.min(
          typeof usePointsInput === 'number' && usePointsInput >= 0 ? usePointsInput : 0,
          availablePoints
        );
        const couponId = selectedCouponId === '' || selectedCouponId == null ? null : Number(selectedCouponId);
        const data = await createOrder({
          addressId: selectedAddress.id,
          paymentMethodId: effectivePaymentMethodId,
          deliveryRequest: deliveryRequestText,
          cartItemIds,
          couponId,
          usePoints,
        });
        onComplete(true, data?.orderId ?? null);
      } catch (err) {
        const message = err.response?.data?.message ?? err.message ?? '주문 생성에 실패했습니다.';
        alert(message);
        // 에러 발생 시에도 checkout 탭에 머물도록 함 (onComplete 호출 안 함)
        // onComplete(false); // 주석 처리하여 메인으로 이동하지 않도록 함
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // 토스 페이먼츠 결제 플로우
    setIsProcessing(true);
    try {
      const deliveryRequestText = deliveryRequest === '직접 입력' ? requestInput : (deliveryRequest || '');
      
      // cartItems를 productQuantities Map으로 변환
      const productQuantities = {};
      cartItems.forEach(item => {
        const productId = item.productId || item.id;
        if (productId) {
          productQuantities[productId] = item.quantity || 1;
        }
      });

      // 1. 결제 준비 API 호출
      const prepareResponse = await preparePayment({
        productQuantities,
        paymentMethod: 'TOSS_PAY',
        deliveryAddress: selectedAddress.address + (selectedAddress.detail ? ' ' + selectedAddress.detail : ''),
        deliveryRequest: deliveryRequestText,
      });

      if (!prepareResponse?.paymentId || !prepareResponse?.pgOrderId || !prepareResponse?.amount) {
        throw new Error('결제 준비에 실패했습니다.');
      }

      // paymentId를 세션 스토리지에 저장 (confirm 단계에서 사용)
      sessionStorage.setItem('pendingPaymentId', prepareResponse.paymentId.toString());
      sessionStorage.setItem('pendingOrderId', prepareResponse.orderId?.toString() || '');
      // checkout 탭 유지를 위해 플래그 저장
      sessionStorage.setItem('pendingCheckout', 'true');

      // 2. 토스 페이먼츠 결제 창 띄우기
      // 동적으로 토스 페이먼츠 스크립트 로드
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
      
      // 클라이언트 키는 환경 변수나 설정에서 가져와야 합니다
      // 테스트용 키: test_ck_... (실제로는 백엔드에서 받아오거나 환경 변수로 관리)
      const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY || 'test_ck_DpexMgkW36wVbqk5QqYrGbR5oz0C';
      
      const widget = TossPayments(clientKey);
      
      // 현재 전체 URL을 기반으로 success/fail URL 생성 (쿼리 파라미터 포함)
      const currentUrl = window.location.href.split('?')[0]; // 기존 쿼리 파라미터 제거
      const successUrl = `${currentUrl}?payment=success`;
      const failUrl = `${currentUrl}?payment=fail`;
      
      // 결제 위젯 열기
      await widget.requestPayment('카드', {
        amount: prepareResponse.amount,
        orderId: prepareResponse.pgOrderId,
        orderName: `주문 ${prepareResponse.orderId}`,
        customerName: selectedAddress.contact || '고객',
        successUrl: successUrl,
        failUrl: failUrl,
      });

      // 결제 위젯은 successUrl로 리다이렉트되므로, 여기서는 완료되지 않음
      // successUrl에서 paymentKey를 받아서 confirm을 호출해야 함
      
    } catch (err) {
      console.error('결제 처리 오류:', err);
      const message = err.response?.data?.message || err.message || '결제 처리에 실패했습니다.';
      alert(message);
      setIsProcessing(false);
      sessionStorage.removeItem('pendingPaymentId');
      sessionStorage.removeItem('pendingOrderId');
      sessionStorage.removeItem('pendingCheckout');
      // 에러 발생 시에도 checkout 탭에 머물도록 함 (onComplete 호출 안 함)
      // onComplete(false); // 주석 처리하여 메인으로 이동하지 않도록 함
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>주문/결제</h2>
        {typeof onBack === 'function' && (
          <button
            type="button"
            onClick={onBack}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              background: 'white',
              fontWeight: '700',
              cursor: 'pointer',
              color: '#475569',
            }}
          >
            ← 뒤로
          </button>
        )}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Address Section */}
          <section style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>배송지 정보</h3>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ backgroundColor: 'var(--primary)', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>
                  {selectedAddress.label}
                </span>
                <span style={{ fontWeight: '700' }}>{selectedAddress.contact}</span>
              </div>
              <div style={{ fontSize: '15px', color: '#1e293b', marginBottom: '4px' }}>{selectedAddress.address}</div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>{selectedAddress.detail}</div>
            </div>

            {/* 일반결제: 배달 시간대 선택 없음(주문 즉시 배달). 구독결제 시 constants/deliveryTimeSlots 사용 */}

            {/* Delivery Request Box */}
            <div style={{ marginTop: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', marginBottom: '8px', color: '#475569' }}>배송 요청사항</label>
              <select 
                value={deliveryRequest}
                onChange={handleRequestChange}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  borderRadius: '10px', 
                  border: '1px solid #e2e8f0', 
                  fontSize: '14px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  marginBottom: customRequest ? '12px' : '0'
                }}
              >
                <option value="">요청사항을 선택해주세요</option>
                {requestOptions.map((opt, idx) => (
                  <option key={idx} value={opt}>{opt}</option>
                ))}
              </select>
              
              {customRequest && (
                <textarea 
                  placeholder="배송 요청사항을 직접 입력해주세요"
                  value={requestInput}
                  onChange={(e) => setRequestInput(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    borderRadius: '10px', 
                    border: '1px solid #e2e8f0', 
                    fontSize: '14px',
                    minHeight: '80px',
                    resize: 'none',
                    outline: 'none'
                  }}
                />
              )}
            </div>
          </section>

          <AddressModal 
            isOpen={isAddressModalOpen} 
            onClose={() => setIsAddressModalOpen(false)}
            addresses={addresses}
            onSelect={setSelectedAddress}
            currentAddressId={selectedAddress.id}
          />

          {/* Order Summary Section - Grouped by Store */}
          <section style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>주문 예상 상품</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {Object.entries(cartItems.reduce((acc, item) => {
                const store = item.storeName || '우리 동네 마트';
                if (!acc[store]) acc[store] = [];
                acc[store].push(item);
                return acc;
              }, {})).map(([storeName, items]) => (
                <div key={storeName} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🏪 {storeName}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {items.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                        <span style={{ color: '#475569' }}>{item.name} x {item.quantity}</span>
                        <span style={{ fontWeight: '600' }}>{(item.price * item.quantity).toLocaleString()}원</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>배송료 3,000원 대기</span>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                      소계: {(items.reduce((s, i) => s + i.price * i.quantity, 0) + 3000).toLocaleString()}원
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Payment Method Section */}
          <section style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px' }}>결제 수단</h3>
            
            <div style={{ width: '100%', maxWidth: '300px', margin: '0 auto', padding: '20px 0 40px' }}>
              <Swiper
                effect={'cube'}
                grabCursor={true}
                cubeEffect={{
                  shadow: true,
                  slideShadows: true,
                  shadowOffset: 20,
                  shadowScale: 0.94,
                }}
                pagination={true}
                modules={[EffectCube, Pagination]}
                onSlideChange={(swiper) => {
                  if (swiper.activeIndex < paymentMethods.length) {
                    setSelectedPayment(paymentMethods[swiper.activeIndex]);
                  } else if (swiper.activeIndex === paymentMethods.length) {
                    // 마지막 슬라이드: 토스 스타일 간편결제
                    setSelectedPayment({
                      id: 'toss',
                      name: 'Toss 스타일 간편결제',
                      type: 'toss',
                      color: '#f8fafc'
                    });
                  }
                }}
                className="paymentSwiper"
              >
                {paymentMethods.map(method => (
                  <SwiperSlide key={method.id}>
                    <div style={{ 
                      width: '100%',
                      height: '180px',
                      borderRadius: '16px',
                      background: method.type === 'card' 
                        ? `linear-gradient(135deg, ${method.color}, ${method.color}cc)` 
                        : method.color,
                      padding: '24px',
                      color: 'white',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      {/* Card Chip Decoration */}
                      <div style={{ 
                        width: '40px', 
                        height: '30px', 
                        background: 'rgba(255,255,255,0.2)', 
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.3)'
                      }} />
                      
                      <div>
                        <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '4px' }}>{method.type === 'card' ? 'Credit Card' : 'Digital Wallet'}</div>
                        <div style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '1px' }}>{method.name}</div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div style={{ fontSize: '16px', fontWeight: '500', fontFamily: 'monospace' }}>
                          {method.number || 'PAYMENT MODE'}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          fontWeight: '900', 
                          padding: '4px 8px', 
                          background: 'rgba(255,255,255,0.2)', 
                          borderRadius: '4px' 
                        }}>
                          {method.type === 'card' ? 'VISA / MASTER' : 'N / K'}
                        </div>
                      </div>

                      {/* Sparkle background decoration */}
                      <div style={{
                        position: 'absolute',
                        top: '-20px',
                        right: '-20px',
                        width: '100px',
                        height: '100px',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                        borderRadius: '50%'
                      }} />
                    </div>
                  </SwiperSlide>
                ))}
                <SwiperSlide key="add-new">
                  <div 
                    onClick={() => alert('토스페이먼츠 연동 창이 활성화됩니다.\n카드 번호를 입력하거나 앱에서 결제를 승인해주세요.')}
                    style={{ 
                      width: '100%',
                      height: '180px',
                      borderRadius: '16px',
                      background: '#f8fafc',
                      border: '2px dashed #cbd5e1',
                      color: '#64748b',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxSizing: 'border-box'
                    }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.5 }}>📱</div>
                    <div style={{ fontWeight: '800', fontSize: '16px' }}>Toss 스타일 간편결제</div>
                    <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.6 }}>토스페이 / 카드 빠른 등록</div>
                  </div>
                </SwiperSlide>
              </Swiper>
            </div>

            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <div style={{ fontSize: '15px', fontWeight: '700' }}>선택된 결제수단: {selectedPayment.name}</div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>카드를 좌우로 밀어서 선택해주세요</div>
            </div>
          </section>

          <style>{`
            .paymentSwiper {
              width: 100%;
              padding-bottom: 30px;
            }
            .paymentSwiper .swiper-pagination-bullet-active {
              background: var(--primary) !important;
            }
          `}</style>

        </div>

        {/* Right Sidebar - Final Payment */}
        <div style={{ height: 'fit-content', position: 'sticky', top: '100px' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>최종 결제 금액</h3>
            {checkoutLoading && (
              <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>주문서 금액 조회 중...</div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>상품 금액</span>
                <span>{totalPrice.toLocaleString()}원</span>
              </div>
              {/* 쿠폰 · 포인트: 상품금액과 배송비 사이 (추가 기능 확장 시 공란 선택 가능) */}
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '10px' }}>쿠폰 · 포인트</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <label style={{ fontSize: '13px', color: '#64748b', minWidth: '72px', flexShrink: 0 }}>쿠폰</label>
                    <select
                      value={selectedCouponId}
                      onChange={(e) => setSelectedCouponId(e.target.value)}
                      style={{ flex: 1, minWidth: 0, maxWidth: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', backgroundColor: 'white', cursor: 'pointer' }}
                    >
                      {availableCoupons.length === 0 ? (
                        <option value="">사용 가능한 쿠폰이 없습니다.</option>
                      ) : (
                        <>
                          <option value="">사용 안 함</option>
                          {availableCoupons.map((c) => (
                            <option key={c.id} value={c.id}>{c.name} (-{c.discountAmount?.toLocaleString() ?? 0}원)</option>
                          ))}
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                      현재 보유 포인트: {(checkoutData?.availablePoints ?? 0).toLocaleString()}원
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label style={{ fontSize: '13px', color: '#64748b', minWidth: '72px' }}>포인트 사용</label>
                      <input
                        type="number"
                        min={0}
                        max={checkoutData?.availablePoints ?? 0}
                        value={usePointsInput === 0 ? '' : usePointsInput}
                        onChange={(e) => {
                          const availablePoints = checkoutData?.availablePoints ?? 0;
                          const raw = parseInt(e.target.value, 10) || 0;
                          const clamped = Math.min(Math.max(0, raw), availablePoints);
                          setUsePointsInput(clamped);
                        }}
                        placeholder="0"
                        style={{
                          width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px',
                          MozAppearance: 'textfield', WebkitAppearance: 'none', appearance: 'textfield',
                        }}
                      />
                      <span style={{ fontSize: '13px', color: '#64748b' }}>원</span>
                    </div>
                  </div>
                </div>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                  <span>할인 적용</span>
                  <span>-{discount.toLocaleString()}원</span>
                </div>
              )}
              {points > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                  <span>포인트 사용</span>
                  <span>-{points.toLocaleString()}원</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>배송비</span>
                <span>{deliveryFee.toLocaleString()}원</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <span style={{ fontWeight: '700', fontSize: '18px' }}>총 결제금액</span>
              <span style={{ fontWeight: '800', fontSize: '20px', color: 'var(--primary)' }}>{finalPrice.toLocaleString()}원</span>
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px', textAlign: 'center' }}>
              주문 내용을 확인하였으며, 이에 동의합니다.
            </div>
            <button 
              onClick={handlePayment}
              disabled={isProcessing}
              className="btn-primary"
              style={{ 
                width: '100%', 
                padding: '16px', 
                borderRadius: '12px', 
                background: isProcessing ? '#cbd5e1' : 'var(--primary)', 
                color: 'white', 
                border: 'none', 
                fontWeight: '800', 
                fontSize: '17px', 
                cursor: isProcessing ? 'not-allowed' : 'pointer', 
                boxShadow: isProcessing ? 'none' : '0 4px 14px rgba(16, 185, 129, 0.4)' 
              }}
            >
              {isProcessing ? '결제 처리 중...' : `${finalPrice.toLocaleString()}원 결제하기`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutView;
