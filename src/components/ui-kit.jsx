/* eslint-disable */
import React, { createContext, useContext, useState } from "react";

/* Minimal Toasts (center-top position, smooth slide-down) */
const ToastCtx = createContext({ pushToast: () => {} });

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  function pushToast(message, type = "info", ms = 1800) {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), ms);
  }

  return (
    <ToastCtx.Provider value={{ pushToast }}>
      {children}
      <div
        style={{
          position: "fixed",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          display: "grid",
          gap: 10,
          zIndex: 99999,
          textAlign: "center",
          transition: "all 0.3s ease",
        }}
      >
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              background:
                t.type === "success"
                  ? "#eaffea"
                  : t.type === "error"
                  ? "#ffeaea"
                  : "#f1f5ff",
              border: "1px solid #ccc",
              borderRadius: 10,
              padding: "12px 18px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
              minWidth: "220px",
              margin: "auto",
              fontWeight: 500,
              animation: "slideDown 0.3s ease-out",
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}
