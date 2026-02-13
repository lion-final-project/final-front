import React from 'react';
import OrderManagementView from '../../store/OrderManagementView';
import SupportView from '../../shared/SupportView';
import {
  ProfileSubTab,
  UserProfileSubTab,
  SubscriptionSubTab,
  CouponSubTab,
  HelpSubTab,
  AddressSubTab,
  PaymentSubTab,
  ResidentSubTab,
  ApplicationStatusSubTab,
} from './mypage';

const MypageTabContent = (props) => {
  const {
    isLoggedIn, loyaltyPoints, coupons, myPageTab, setMyPageTab,
    isResidentRider, verifyStep, setVerifyStep, setActiveTab, onLogout,
    orderList, reviews, userInfo,     subscriptionList, subscriptionListLoading,
    subscriptionListError, subscriptionPayments, subscriptionFilter, setSubscriptionFilter,
    expandedSubId, setExpandedSubId, addressList, paymentMethodList,
      storeRegistrationStatus, storeRegistrationStoreName,
      riderRegistrationStatus,
      riderRegistrationApprovalId,
      setStoreRegistrationStatus, setStoreRegistrationStoreName,
      refreshRiderRegistration,
    setIsResidentRider,
    inquiries, userRole, setUserRole, onOpenAuth,
    setIsTrackingOpen, handleOpenReviewModal, handleCancelOrder,
    setViewingReview, setSelectedOrderForReview, setIsReviewModalOpen,
    handleCancelSubscription, resumeSubscription, fetchSubscriptions, fetchAddresses,
    showToast, handleOpenAddressModal, handleSaveAddress, handleDeleteAddress,
    handleSetDefaultAddress,     handleOpenPaymentModal, handleSavePaymentMethod,
    handleDeletePaymentMethod, handleSetDefaultPaymentMethod,
    onCardRegistered, fetchPaymentMethods,
    isAddressModalOpen, setIsAddressModalOpen, isPaymentModalOpen, setIsPaymentModalOpen,
    editingAddress, newAddress, setNewAddress, editingPaymentMethod, newPaymentMethod, setNewPaymentMethod,
  } = props;

  return (
          <div style={{ padding: "20px" }}>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "800",
                marginBottom: "24px",
              }}
            >
              마이 페이지
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "260px 1fr",
                gap: "24px",
              }}
            >
              <div
                style={{
                  background: "white",
                  padding: "24px",
                  borderRadius: "16px",
                  border: "1px solid var(--border)",
                  height: "fit-content",
                }}
              >
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      backgroundColor: "#f1f5f9",
                      margin: "0 auto 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "32px",
                    }}
                  >
                    {isLoggedIn ? "👤" : "👣"}
                  </div>
                  <div style={{ fontWeight: "700", fontSize: "18px" }}>
                    {isLoggedIn ? "사용자 님" : "비회원 님"}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    {isLoggedIn
                      ? "님은 'VIP' 등급입니다."
                      : "로그인하고 혜택을 받으세요."}
                  </div>
                  <div
                    style={{
                      marginTop: "12px",
                      display: "flex",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "#fdf2f8",
                        color: "#db2777",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: "800",
                      }}
                    >
                      P {loyaltyPoints.toLocaleString()}
                    </div>
                    <div
                      style={{
                        backgroundColor: "#fff7ed",
                        color: "#c2410c",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: "800",
                      }}
                    >
                      쿠폰 {coupons.length}장
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {[
                    { id: "profile", label: "주문/리뷰 관리", icon: "📝" },
                    { id: "user_profile", label: "내 정보 관리", icon: "👤" },
                    { id: "subscription", label: "구독 관리", icon: "📅" },
                    { id: "address", label: "배송지 관리", icon: "📍" },
                    { id: "payment", label: "구독 결제 관리", icon: "💳" },
                    { id: "coupon", label: "쿠폰함", icon: "🎫" },
                    { id: "help", label: "고객지원", icon: "📞" },
                    {
                      id: "application_status",
                      label: "신청 현황",
                      icon: "📋",
                    },
                    {
                      id: "resident",
                      label: "주민라이더",
                      icon: "🛵",
                      visible: isResidentRider || verifyStep > 0,
                    },
                  ]
                    .filter((tab) => tab.visible !== false)
                    .map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setMyPageTab(tab.id)}
                        style={{
                          textAlign: "left",
                          padding: "12px 16px",
                          borderRadius: "12px",
                          border: "none",
                          background:
                            myPageTab === tab.id
                              ? "rgba(46, 204, 113, 0.1)"
                              : "transparent",
                          color:
                            myPageTab === tab.id ? "var(--primary)" : "#475569",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          transition: "all 0.2s",
                        }}
                        onMouseOver={(e) => {
                          if (myPageTab !== tab.id)
                            e.currentTarget.style.backgroundColor = "#f8fafc";
                        }}
                        onMouseOut={(e) => {
                          if (myPageTab !== tab.id)
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                        }}
                      >
                        <span style={{ fontSize: "18px" }}>{tab.icon}</span>
                        <span style={{ whiteSpace: "nowrap" }}>
                          {tab.label}
                        </span>
                      </button>
                    ))}
                  <div
                    style={{
                      height: "1px",
                      background: "#f1f5f9",
                      margin: "12px 0",
                    }}
                  ></div>
                  <button
                    onClick={onLogout}
                    style={{
                      textAlign: "left",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: "none",
                      background: "transparent",
                      fontWeight: "700",
                      color: "#94a3b8",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <span>🚪</span>
                    로그아웃
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
                {myPageTab === "profile" && (
                  <ProfileSubTab
                    orderList={orderList}
                    reviews={reviews}
                    setActiveTab={setActiveTab}
                    setIsTrackingOpen={setIsTrackingOpen}
                    handleOpenReviewModal={handleOpenReviewModal}
                    handleCancelOrder={handleCancelOrder}
                    setViewingReview={setViewingReview}
                    setSelectedOrderForReview={setSelectedOrderForReview}
                    setIsReviewModalOpen={setIsReviewModalOpen}
                    onDateFilterChange={props.onOrderDateFilterChange}
                    currentPage={props.orderCurrentPage}
                    totalPages={props.orderTotalPages}
                    onPageChange={props.onOrderPageChange}
                    onSearch={props.onOrderSearch}
                  />
                )}

                {myPageTab === "user_profile" && (
                  <UserProfileSubTab
                    userInfo={userInfo}
                    subscriptionList={subscriptionList}
                    onLogout={onLogout}
                  />
                )}

                {myPageTab === "subscription" && (
                  <SubscriptionSubTab
                    subscriptionList={subscriptionList}
                    subscriptionListLoading={subscriptionListLoading}
                    subscriptionListError={subscriptionListError}
                    subscriptionFilter={subscriptionFilter}
                    setSubscriptionFilter={setSubscriptionFilter}
                    expandedSubId={expandedSubId}
                    setExpandedSubId={setExpandedSubId}
                    subscriptionPayments={subscriptionPayments}
                    handleCancelSubscription={handleCancelSubscription}
                    resumeSubscription={resumeSubscription}
                  />
                )}

                {myPageTab === "coupon" && <CouponSubTab coupons={coupons} />}

                {myPageTab === "address" && (
                  <AddressSubTab
                    addressList={addressList}
                    handleOpenAddressModal={handleOpenAddressModal}
                    handleSetDefaultAddress={handleSetDefaultAddress}
                    handleDeleteAddress={handleDeleteAddress}
                    isAddressModalOpen={isAddressModalOpen}
                    setIsAddressModalOpen={setIsAddressModalOpen}
                    editingAddress={editingAddress}
                    newAddress={newAddress}
                    setNewAddress={setNewAddress}
                    handleSaveAddress={handleSaveAddress}
                    showToast={showToast}
                  />
                )}

                {myPageTab === "payment" && (
                  <PaymentSubTab
                    paymentMethodList={paymentMethodList}
                    handleOpenPaymentModal={handleOpenPaymentModal}
                    handleSetDefaultPaymentMethod={handleSetDefaultPaymentMethod}
                    handleDeletePaymentMethod={handleDeletePaymentMethod}
                    isPaymentModalOpen={isPaymentModalOpen}
                    setIsPaymentModalOpen={setIsPaymentModalOpen}
                    editingPaymentMethod={editingPaymentMethod}
                    newPaymentMethod={newPaymentMethod}
                    setNewPaymentMethod={setNewPaymentMethod}
                    handleSavePaymentMethod={handleSavePaymentMethod}
                    onCardRegistered={onCardRegistered}
                    onRefreshPaymentMethods={fetchPaymentMethods}
                    showToast={showToast}
                  />
                )}

                {myPageTab === "help" && (
                  <HelpSubTab
                    userRole={userRole}
                    isLoggedIn={isLoggedIn}
                    onOpenAuth={onOpenAuth}
                  />
                )}

                {myPageTab === "resident" && (
                  <ResidentSubTab
                    isResidentRider={isResidentRider}
                    verifyStep={verifyStep}
                    setVerifyStep={setVerifyStep}
                    setUserRole={setUserRole}
                    setIsResidentRider={setIsResidentRider}
                    showToast={showToast}
                  />
                )}

                {myPageTab === "application_status" && (
                  <ApplicationStatusSubTab
                      storeRegistrationStatus={storeRegistrationStatus}
                      storeRegistrationStoreName={storeRegistrationStoreName}
                      riderRegistrationStatus={riderRegistrationStatus}
                      riderRegistrationApprovalId={riderRegistrationApprovalId}
                      setStoreRegistrationStatus={setStoreRegistrationStatus}
                      setStoreRegistrationStoreName={setStoreRegistrationStoreName}
                      refreshRiderRegistration={refreshRiderRegistration}
                      setActiveTab={setActiveTab}
                      isResidentRider={isResidentRider}
                      verifyStep={verifyStep}
                    setVerifyStep={setVerifyStep}
                    showToast={showToast}
                  />
                )}
              </div>
            </div>
          </div>
  );
};

export default MypageTabContent;
