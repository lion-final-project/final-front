import React from 'react';
import OrderManagementView from '../../../store/OrderManagementView';

const ProfileSubTab = ({
  orderList,
  reviews,
  setActiveTab,
  openTrackingModal,
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
    onTracking={(order) => openTrackingModal(order)}
    onWriteReview={(order) => {
      setViewingReview(null);
      handleOpenReviewModal(order);
    }}
    onCancelOrder={handleCancelOrder}
    onViewReview={(order) => {
      // CustomerView의 handleOpenReviewModal이 reviewWritten 여부를 체크하여
      // 자동으로 조회 모드/작성 모드를 분기 처리함
      handleOpenReviewModal(order);
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
