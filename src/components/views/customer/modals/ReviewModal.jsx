import React from "react";

const RATE_LABELS = [
  "매우 아쉬워요",
  "아쉬워요",
  "보통이에요",
  "만족해요",
  "최고예요",
];

const ReviewModal = ({
  viewingReview,
  selectedOrderForReview,
  reviewForm,
  setReviewForm,
  onSave,
  onEdit,
  onDelete,
  onClose,
}) => {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          background: "white",
          width: "100%",
          maxWidth: "450px",
          borderRadius: "24px",
          padding: "32px",
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
        }}
      >
        {viewingReview ? (
          <>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "800",
                marginBottom: "8px",
              }}
            >
              내가 쓴 리뷰
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: "var(--text-muted)",
                marginBottom: "24px",
              }}
            >
              {selectedOrderForReview?.store}
            </p>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div
                style={{
                  fontSize: "32px",
                  color: "#f59e0b",
                  marginBottom: "8px",
                }}
              >
                {"★".repeat(viewingReview.rate)}
                {"☆".repeat(5 - viewingReview.rate)}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#f59e0b",
                }}
              >
                {RATE_LABELS[viewingReview.rate - 1]}
              </div>
            </div>
            <div
              style={{
                background: "#f8fafc",
                padding: "20px",
                borderRadius: "12px",
                fontSize: "15px",
                color: "#334155",
                lineHeight: "1.6",
                marginBottom: "32px",
              }}
            >
              {viewingReview.content}
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={onEdit}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: "12px",
                  background: "white",
                  border: "1px solid #e2e8f0",
                  fontWeight: "700",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                리뷰 수정
              </button>
              <button
                onClick={onDelete}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: "12px",
                  background: "white",
                  border: "1px solid #fee2e2",
                  color: "#ef4444",
                  fontWeight: "700",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                삭제하기
              </button>
            </div>
            <button
              onClick={onClose}
              style={{
                width: "100%",
                marginTop: "16px",
                padding: "14px",
                background: "transparent",
                border: "none",
                color: "#94a3b8",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              닫기
            </button>
          </>
        ) : (
          <>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "800",
                marginBottom: "8px",
              }}
            >
              리뷰 작성하기
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: "var(--text-muted)",
                marginBottom: "24px",
              }}
            >
              {selectedOrderForReview?.store}에서의 주문은 어떠셨나요?
            </p>

            <form
              onSubmit={onSave}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "24px",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "32px",
                    display: "flex",
                    justifyContent: "center",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() =>
                        setReviewForm({ ...reviewForm, rate: star })
                      }
                      style={{
                        cursor: "pointer",
                        color:
                          star <= reviewForm.rate ? "#f59e0b" : "#e2e8f0",
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#f59e0b",
                  }}
                >
                  {RATE_LABELS[reviewForm.rate - 1]}
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "700",
                    fontSize: "14px",
                    color: "#475569",
                  }}
                >
                  리뷰 내용
                </label>
                <textarea
                  required
                  value={reviewForm.content}
                  onChange={(e) =>
                    setReviewForm({
                      ...reviewForm,
                      content: e.target.value,
                    })
                  }
                  placeholder="다른 고객들에게 도움이 될 수 있도록 솔직한 리뷰를 남겨주세요. (비속어, 타인 비방 등 부적절한 언어 사용 시 서비스 이용에 제재를 받을 수 있습니다.)"
                  style={{
                    width: "100%",
                    height: "120px",
                    padding: "16px",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                    resize: "none",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: "14px",
                    borderRadius: "12px",
                    background: "#f1f5f9",
                    border: "none",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 2,
                    padding: "14px",
                    borderRadius: "12px",
                    background: "var(--primary)",
                    color: "white",
                    border: "none",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  리뷰 등록
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewModal;
