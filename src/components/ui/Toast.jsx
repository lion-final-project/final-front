import React from 'react';

const Toast = ({ message }) => {
  if (!message) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "100px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#1e293b",
        color: "white",
        padding: "12px 24px",
        borderRadius: "24px",
        fontSize: "14px",
        fontWeight: "700",
        zIndex: 2000,
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        animation: "slideUp 0.3s ease-out",
      }}
    >
      ✨ {message}
      <style>{`
        @keyframes slideUp {
          from { transform: translate(-50%, 20px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Toast;
