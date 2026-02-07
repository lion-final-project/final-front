import React from 'react';

const CouponSubTab = ({ coupons }) => (
  <div
    style={{
      background: "white",
      padding: "24px",
      borderRadius: "16px",
      border: "1px solid var(--border)",
    }}
  >
    <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "20px" }}>나의 쿠폰함</h3>
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {coupons.map((coupon) => (
        <div
          key={coupon.id}
          style={{
            display: "flex",
            border: "1px solid #f1f5f9",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "100px",
              backgroundColor: "var(--primary)",
              color: "white",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px",
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: "600" }}>DISCOUNT</div>
            <div style={{ fontSize: "20px", fontWeight: "800" }}>{coupon.discount}</div>
          </div>
          <div style={{ flexGrow: 1, padding: "16px", position: "relative" }}>
            <div style={{ fontWeight: "700", fontSize: "16px", marginBottom: "4px" }}>{coupon.name}</div>
            <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "12px" }}>{coupon.minOrder}</div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>~{coupon.expiry} 까지</div>
            <div style={{ position: "absolute", top: "16px", right: "16px", color: "var(--primary)", fontWeight: "700", fontSize: "12px" }}>
              {coupon.status}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default CouponSubTab;
