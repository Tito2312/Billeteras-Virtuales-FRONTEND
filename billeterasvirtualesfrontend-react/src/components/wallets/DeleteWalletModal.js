// DeleteWalletModal.js - Modal de confirmación para eliminar

import React from 'react';
import './Modals.css';

const DeleteWalletModal = ({ isOpen, onClose, onDelete, wallet }) => {
  if (!isOpen || !wallet) return null;
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-danger" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Eliminar Billetera</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="delete-warning">
            <span className="warning-icon">⚠️</span>
            <p>¿Estás seguro de que deseas eliminar esta billetera?</p>
          </div>
          
          <div className="delete-info">
            <p><strong>Nombre:</strong> {wallet.name}</p>
            <p><strong>Tipo:</strong> {wallet.type}</p>
            <p><strong>Balance:</strong> {formatCurrency(wallet.balance)}</p>
          </div>
          
          <p className="delete-note">
            Esta acción no se puede deshacer. La billetera y todas sus transacciones asociadas serán eliminadas.
          </p>
        </div>
        
        <div className="modal-buttons">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn-delete" onClick={onDelete}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteWalletModal;