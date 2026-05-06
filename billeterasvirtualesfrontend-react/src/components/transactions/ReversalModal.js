// ReversalModal.js - Modal para revertir transacciones

import React, { useState } from 'react';
import './Modals.css';

const ReversalModal = ({ isOpen, onClose, onConfirm, transaction, transactions }) => {
  const [selectedTransactionId, setSelectedTransactionId] = useState(transaction?.id || '');
  
  if (!isOpen) return null;
  
  const selectedTransaction = transactions?.find(t => t.id === selectedTransactionId) || transaction;
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedTransaction) {
      alert('Selecciona una transacción para revertir');
      return;
    }
    
    onConfirm({
      transaction: selectedTransaction,
      reversalDate: new Date().toISOString()
    });
    
    onClose();
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Reversión de Transacción</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {transactions && transactions.length > 0 && !transaction && (
            <div className="form-group">
              <label>Selecciona transacción a revertir</label>
              <select 
                value={selectedTransactionId} 
                onChange={(e) => setSelectedTransactionId(parseInt(e.target.value))}
              >
                <option value="">Selecciona...</option>
                {transactions.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.date} - {t.description} - {formatCurrency(t.amount)}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {selectedTransaction && (
            <div className="reversal-info-card">
              <div className="reversal-info-row">
                <span className="info-label">Fecha:</span>
                <span className="info-value">{selectedTransaction.date}</span>
              </div>
              <div className="reversal-info-row">
                <span className="info-label">Descripción:</span>
                <span className="info-value">{selectedTransaction.description}</span>
              </div>
              <div className="reversal-info-row">
                <span className="info-label">Monto:</span>
                <span className="info-value highlight">{formatCurrency(selectedTransaction.amount)}</span>
              </div>
              <div className="reversal-info-row">
                <span className="info-label">Puntos a descontar:</span>
                <span className="info-value warning">{selectedTransaction.points} puntos</span>
              </div>
            </div>
          )}
          
          <div className="reversal-policy-note">
            <p>⚠️ Al revertir esta transacción:</p>
            <ul>
              <li>El saldo de la billetera se restaurará</li>
              <li>Los puntos generados serán descontados</li>
              <li>La transacción quedará marcada como "Reversada"</li>
            </ul>
          </div>
          
          <div className="modal-buttons">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-reverse-modal">
              Confirmar Reversión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReversalModal;