import React from 'react';
import OrderTrackingView from '../../views/rider/OrderTrackingView';

const TrackingModal = ({ isOpen, onClose, trackingTarget }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1100,
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          height: "80vh",
          backgroundColor: "white",
          borderRadius: "24px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ fontSize: "18px", fontWeight: "800" }}>배송 현황</h3>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              fontSize: "24px",
              color: "#94a3b8",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ flexGrow: 1, overflowY: "auto" }}>
          <OrderTrackingView
            trackingTarget={trackingTarget}
            onBack={onClose}
            isModal={true}
          />
        </div>
      </div>
    </div>
  );
};

export default TrackingModal;
