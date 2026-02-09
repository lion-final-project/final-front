import React from 'react';
import OrderManagementView from '../../../store/OrderManagementView';

const ProfileSubTab = ({
  orderList,
  reviews,
  setActiveTab,
  setIsTrackingOpen,
  handleOpenReviewModal,
  handleCancelOrder,
  setViewingReview,
  setSelectedOrderForReview,
  setIsReviewModalOpen,
}) => (
  <OrderManagementView
    orders={orderList}
    onTracking={() => setIsTrackingOpen(true)}
    onWriteReview={(order) => {
      setViewingReview(null);
      handleOpenReviewModal(order);
    }}
    onCancelOrder={handleCancelOrder}
    onViewReview={(order) => {
      const review = reviews.find((r) => r.store === order.store) || {
        rate: 5,
        content: "정말 신선하고 배송도 빨라요! 재구매 의사 있습니다.",
        store: order.store,
      };
      setViewingReview(review);
      setSelectedOrderForReview(order);
      setIsReviewModalOpen(true);
    }}
    onBack={() => setActiveTab("home")}
  />
);

export default ProfileSubTab;
