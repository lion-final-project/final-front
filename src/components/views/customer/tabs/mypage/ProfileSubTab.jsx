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
  onDateFilterChange,
  currentPage,
  totalPages,
  onPageChange,
  onSearch,
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
    onDateFilterChange={onDateFilterChange}
    currentPage={currentPage}
    totalPages={totalPages}
    onPageChange={onPageChange}
    onSearch={onSearch}
  />
);

export default ProfileSubTab;
