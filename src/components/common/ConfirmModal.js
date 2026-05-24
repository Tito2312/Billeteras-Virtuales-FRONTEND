import React, { useState, useEffect } from 'react';
import './ConfirmModal.css';

const ConfirmModal = () => {
  const [modal, setModal] = useState(null);

  useEffect(() => {
    const handler = (e) => setModal(e.detail);
    window.addEventListener('app-confirm', handler);
    return () => window.removeEventListener('app-confirm', handler);
  }, []);

  if (!modal) return null;

  const handleConfirm = () => { modal.resolve(true); setModal(null); };
  const handleCancel = () => { modal.resolve(false); setModal(null); };

  return (
    <div className="confirm-overlay" onClick={handleCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon">⚠️</div>
        <h3 className="confirm-title">{modal.title}</h3>
        <p className="confirm-message">{modal.message}</p>
        <div className="confirm-actions">
          <button className="confirm-btn-cancel" onClick={handleCancel}>Cancelar</button>
          <button className="confirm-btn-ok" onClick={handleConfirm}>Confirmar</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
