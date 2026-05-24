import React, { useState, useEffect } from 'react';
import './Toast.css';

const ICONS = { success: '✅', error: '❌', info: 'ℹ️' };

const Toast = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      const { msg, type } = e.detail;
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, msg, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    };
    window.addEventListener('app-toast', handler);
    return () => window.removeEventListener('app-toast', handler);
  }, []);

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast-item toast-${t.type}`}>
          <span className="toast-icon">{ICONS[t.type]}</span>
          <span className="toast-msg">{t.msg}</span>
          <button className="toast-close" onClick={() => dismiss(t.id)}>✕</button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
