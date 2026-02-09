import React from 'react';

const SPECIAL_ITEMS = [
  {
    title: "겨울철 비타민 충전!",
    desc: "제철 과일 20% 할인",
    color: "linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)",
  },
  {
    title: "따끈따끈 밀키트",
    desc: "우리집이 맛집! 전품목 15%",
    color: "linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)",
  },
  {
    title: "우리동네 정육점 특가",
    desc: "한우/한돈 최대 30% 할인",
    color: "linear-gradient(to right, #f78ca0 0%, #f9748f 19%, #fd868c 60%, #fe9a8b 100%)",
  },
  {
    title: "유기농 야채 새벽배송",
    desc: "신규 구독 시 첫 주 무료",
    color: "linear-gradient(to top, #0ba360 0%, #3cba92 100%)",
  },
];

const SpecialTabContent = ({ onToast }) => {
  return (
    <div style={{ padding: "20px" }}>
      <h2
        style={{
          fontSize: "24px",
          fontWeight: "800",
          marginBottom: "24px",
        }}
      >
        진행 중인 기획전
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
        }}
      >
        {SPECIAL_ITEMS.map((special, i) => (
          <div
            key={i}
            style={{
              height: "200px",
              borderRadius: "20px",
              background: special.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              padding: "20px",
              textAlign: "center",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  marginBottom: "8px",
                }}
              >
                {special.title}
              </h3>
              <p style={{ fontSize: "14px" }}>{special.desc}</p>
              <button
                onClick={() =>
                  onToast?.("상세 기획전 페이지로 이동합니다. (데모)")
                }
                style={{
                  marginTop: "16px",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  background: "white",
                  color: "#333",
                  border: "none",
                  fontWeight: "700",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                자세히 보기
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpecialTabContent;
