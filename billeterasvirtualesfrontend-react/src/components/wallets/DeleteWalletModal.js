// DeleteWalletModal.js - Modal de confirmación para eliminar (diseño mejorado)

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
        <div className="modal-header modal-danger-header">
          <div className="danger-icon-wrapper">
            <span className="danger-icon">🗑️</span>
          </div>
          <h2>Eliminar Billetera</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="delete-warning-card">
            <div className="warning-badge">
              <span>⚠️</span>
              <span>Advertencia</span>
            </div>
            <p className="warning-message">
              ¿Estás seguro de que deseas eliminar esta billetera?
              <br />
              <strong>Esta acción no se puede deshacer.</strong>
            </p>
          </div>
          
          <div className="delete-info-card">
            <div className="delete-info-row">
              <span className="info-label">Nombre:</span>
              <span className="info-value">{wallet.name}</span>
            </div>
            <div className="delete-info-row">
              <span className="info-label">Tipo:</span>
              <span className="info-value">{wallet.type}</span>
            </div>
            <div className="delete-info-row">
              <span className="info-label">Balance:</span>
              <span className="info-value highlight">{formatCurrency(wallet.balance)}</span>
            </div>
          </div>
          
          <div className="delete-consequences">
            <p className="consequences-title">Se eliminará permanentemente:</p>
            <ul className="consequences-list">
              <li>La billetera y su información</li>
              <li>Todas las transacciones asociadas</li>
              <li>El historial de movimientos</li>
              <li>Las operaciones programadas relacionadas</li>
            </ul>
          </div>
        </div>
        
        <div className="modal-buttons modal-danger-buttons">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn-delete" onClick={onDelete}>
            Eliminar Billetera
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteWalletModal;