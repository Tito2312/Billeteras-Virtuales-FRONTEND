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
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('es-CO');
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
            <div className="info-row">
              <span className="info-label">Tipo:</span>
              <span className="info-value">{operation.type}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Fecha programada:</span>
              <span className="info-value">{formatDate(operation.scheduledDate)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Monto:</span>
              <span className="info-value highlight">{formatCurrency(operation.amount)}</span>
            </div>
          </div>
        </div>

        <div className="modal-buttons modal-danger-buttons">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Volver
          </button>
          <button 
            type="button" 
            className="btn-delete" 
            onClick={() => onCancel(operation.id)}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Cancelar Operación
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelScheduledModal;