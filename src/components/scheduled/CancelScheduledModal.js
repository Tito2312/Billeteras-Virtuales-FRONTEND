// CancelScheduledModal.js - Modal para cancelar operación programada

import React from 'react';
import './Modals.css';

const CancelScheduledModal = ({ isOpen, onClose, onCancel, operation }) => {
  if (!isOpen || !operation) return null;
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };
  
  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'alta': return 'priority-high';
      case 'media': return 'priority-medium';
      case 'baja': return 'priority-low';
      default: return '';
    }
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-danger" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header modal-danger-header">
          <div className="danger-icon-wrapper">
            <span className="danger-icon">🗑️</span>
          </div>
          <h2>Cancelar Operación</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="delete-warning-card">
            <div className="warning-badge">
              <span>⚠️</span>
              <span>Advertencia</span>
            </div>
            <p className="warning-message">
              ¿Estás seguro de que deseas cancelar esta operación programada?
              <br />
              <strong>Esta acción no se puede deshacer.</strong>
            </p>
          </div>
          
          <div className="operation-info-card">
            <div className={`operation-priority-badge ${getPriorityClass(operation.priority)}`}>
              Prioridad {operation.priorityLabel}
            </div>
            <div className="info-row">
              <span className="info-label">Tipo:</span>
              <span className="info-value">{operation.typeLabel}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Fecha:</span>
              <span className="info-value">{operation.date}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Ruta:</span>
              <span className="info-value">{operation.fromWallet} → {operation.toWallet}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Monto:</span>
              <span className="info-value highlight">{formatCurrency(operation.amount)}</span>
            </div>
            {operation.description && (
              <div className="info-row">
                <span className="info-label">Descripción:</span>
                <span className="info-value">{operation.description}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="modal-buttons modal-danger-buttons">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Volver
          </button>
          <button type="button" className="btn-delete" onClick={onCancel}>
            Cancelar Operación
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelScheduledModal;