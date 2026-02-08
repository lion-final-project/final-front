import React from 'react';

const SubscriptionSubTab = ({
  subscriptionList,
  subscriptionListLoading,
  subscriptionListError,
  subscriptionFilter,
  setSubscriptionFilter,
  expandedSubId,
  setExpandedSubId,
  subscriptionPayments,
  handleCancelSubscription,
  resumeSubscription,
}) => (
  <div
    style={{
      background: "white",
      padding: "24px",
      borderRadius: "16px",
      border: "1px solid var(--border)",
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
      <h3 style={{ fontSize: "18px", fontWeight: "700" }}>나의 구독 관리</h3>
      <div style={{ display: "flex", gap: "8px", backgroundColor: "#f8fafc", padding: "4px", borderRadius: "10px" }}>
        {["전체", "구독중", "일시정지", "해지 예정"].map((f) => (
          <button
            key={f}
            onClick={() => setSubscriptionFilter(f)}
            style={{
              padding: "6px 14px",
              borderRadius: "8px",
              border: "none",
              fontSize: "12px",
              fontWeight: "700",
              background: subscriptionFilter === f ? "var(--primary)" : "transparent",
              color: subscriptionFilter === f ? "white" : "#64748b",
              cursor: "pointer",
            }}
          >
            {f}
          </button>
        ))}
      </div>
    </div>

    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "40px" }}>
      {subscriptionListLoading ? (
        <div style={{ padding: "40px 24px", textAlign: "center", color: "#64748b", fontSize: "14px" }}>
          구독 목록을 불러오는 중…
        </div>
      ) : subscriptionListError ? (
        <div style={{ padding: "40px 24px", textAlign: "center", color: "#ef4444", fontSize: "14px" }}>
          {subscriptionListError}
        </div>
      ) : subscriptionList.length === 0 ? (
        <div
          style={{
            padding: "40px 24px",
            textAlign: "center",
            color: "#94a3b8",
            fontSize: "14px",
            borderRadius: "12px",
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        >
          현재 구독 중인 항목이 없습니다.
        </div>
      ) : (
        subscriptionList
          .filter((s) => subscriptionFilter === "전체" || s.status === subscriptionFilter)
          .map((sub) => (
            <div
              key={sub.id}
              style={{
                background: "white",
                borderRadius: "16px",
                border: "1px solid var(--border)",
                overflow: "hidden",
                transition: "all 0.3s ease",
              }}
            >
              <div
                onClick={() => setExpandedSubId(expandedSubId === sub.id ? null : sub.id)}
                style={{
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  backgroundColor: expandedSubId === sub.id ? "#f8fafc" : "white",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div
                    style={{
                      fontSize: "24px",
                      width: "44px",
                      height: "44px",
                      backgroundColor: "#f1f5f9",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {sub.img}
                  </div>
                  <div>
                    <div style={{ fontWeight: "800", fontSize: "16px", color: "#1e293b" }}>{sub.name}</div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{sub.period} • {sub.price}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      backgroundColor:
                        sub.status === "구독중"
                          ? "rgba(16, 185, 129, 0.1)"
                          : sub.status === "해지 예정"
                            ? "rgba(245, 158, 11, 0.1)"
                            : sub.status === "일시정지"
                              ? "rgba(59, 130, 246, 0.1)"
                              : "#f1f5f9",
                      color:
                        sub.status === "구독중"
                          ? "var(--primary)"
                          : sub.status === "해지 예정"
                            ? "#f59e0b"
                            : sub.status === "일시정지"
                              ? "#3b82f6"
                              : "#94a3b8",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "800",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {sub.status}
                  </div>
                  <span
                    style={{
                      fontSize: "18px",
                      color: "#94a3b8",
                      transform: expandedSubId === sub.id ? "rotate(180deg)" : "rotate(0)",
                      transition: "transform 0.3s",
                    }}
                  >
                    ▾
                  </span>
                </div>
              </div>

              {expandedSubId === sub.id && (
                <div
                  style={{
                    padding: "0 24px 24px",
                    borderTop: "1px solid #f1f5f9",
                    backgroundColor: "#f8fafc",
                  }}
                >
                  <div style={{ paddingTop: "20px" }}>
                    <div
                      style={{
                        padding: "20px",
                        backgroundColor: "white",
                        borderRadius: "16px",
                        border: "1px solid #e2e8f0",
                        marginBottom: "20px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                        <span style={{ fontSize: "14px", fontWeight: "800", color: "#1e293b" }}>구독 상품 구성</span>
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: "700",
                            color: "var(--primary)",
                            backgroundColor: "rgba(46, 204, 113, 0.1)",
                            padding: "2px 8px",
                            borderRadius: "4px",
                          }}
                        >
                          월 {sub.monthlyCount} 배송
                        </span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {sub.includedItems?.map((item, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: "12px",
                              padding: "6px 12px",
                              backgroundColor: "#f1f5f9",
                              color: "#475569",
                              borderRadius: "8px",
                              border: "1px solid #e2e8f0",
                            }}
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {sub.status === "구독중" ? (
                      <>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "20px",
                            padding: "16px",
                            backgroundColor: "white",
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <span style={{ fontSize: "13px", color: "#64748b" }}>다음 결제 예정일</span>
                          <span style={{ fontSize: "14px", fontWeight: "800", color: "var(--primary)" }}>{sub.nextPayment}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelSubscription(sub.id);
                          }}
                          style={{
                            width: "100%",
                            padding: "14px",
                            borderRadius: "12px",
                            border: "1px solid #fee2e2",
                            background: "white",
                            color: "#ef4444",
                            fontWeight: "700",
                            fontSize: "14px",
                            cursor: "pointer",
                          }}
                        >
                          구독 해지하기
                        </button>
                      </>
                    ) : sub.status === "일시정지" ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          resumeSubscription(sub.id);
                        }}
                        style={{
                          width: "100%",
                          padding: "14px",
                          borderRadius: "12px",
                          background: "var(--primary)",
                          color: "white",
                          border: "none",
                          fontWeight: "800",
                          fontSize: "14px",
                          cursor: "pointer",
                        }}
                      >
                        구독 재개하기
                      </button>
                    ) : sub.status === "해지 예정" ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div
                          style={{
                            padding: "16px",
                            backgroundColor: "#fff7ed",
                            borderRadius: "12px",
                            border: "1px solid #ffedd5",
                            color: "#9a3412",
                            fontSize: "13px",
                            lineHeight: "1.6",
                          }}
                        >
                          이미 해지 신청이 완료된 상품입니다. 남은 구독 기간까지는 혜택이 유지되며, 이후 자동으로 종료됩니다.
                          <br />
                          해지 예정을 취소하시면 구독이 계속 유지됩니다.
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            resumeSubscription(sub.id);
                          }}
                          style={{
                            width: "100%",
                            padding: "14px",
                            borderRadius: "12px",
                            background: "var(--primary)",
                            color: "white",
                            border: "none",
                            fontWeight: "800",
                            fontSize: "14px",
                            cursor: "pointer",
                          }}
                        >
                          해지 취소하기 (구독 유지)
                        </button>
                      </div>
                    ) : (
                      <div
                        style={{
                          padding: "16px",
                          backgroundColor: "#f1f5f9",
                          borderRadius: "12px",
                          border: "1px solid #e2e8f0",
                          color: "#64748b",
                          fontSize: "13px",
                          textAlign: "center",
                        }}
                      >
                        해지된 구독 상품입니다. 다시 이용하시려면 상점에서 신청해 주세요.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
      )}
    </div>

    <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "32px" }}>
      <h4 style={{ fontSize: "16px", fontWeight: "800", marginBottom: "20px" }}>구독 결제 내역</h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {subscriptionPayments.length === 0 ? (
          <div
            style={{
              padding: "24px",
              textAlign: "center",
              color: "#94a3b8",
              fontSize: "13px",
              backgroundColor: "#f8fafc",
              borderRadius: "12px",
              border: "1px solid #f1f5f9",
            }}
          >
            결제 내역이 없습니다.
          </div>
        ) : (
          subscriptionPayments.map((p) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                backgroundColor: "#f8fafc",
                borderRadius: "12px",
                border: "1px solid #f1f5f9",
              }}
            >
              <div>
                <div style={{ fontSize: "14px", fontWeight: "700", marginBottom: "2px" }}>{p.name}</div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>{p.date} • {p.id}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "14px", fontWeight: "800", color: "var(--primary)" }}>{p.amount}</div>
                <div style={{ fontSize: "11px", color: "#10b981", fontWeight: "600" }}>{p.status}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

export default SubscriptionSubTab;
