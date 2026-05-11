// ReversalModal.js - Modal para revertir transacciones
// Versión simplificada como en la imagen

import React, { useState } from 'react';
import './Modals.css';

const ReversalModal = ({ isOpen, onClose, onConfirm, transaction, transactions }) => {
  const [selectedTransactionId, setSelectedTransactionId] = useState(transaction?.id || '');
  
  if (!isOpen) return null;
  
  const reversibleTransactions = transactions || [];
  const hasSpecificTransaction = !!transaction;
  const selectedTransaction = hasSpecificTransaction 
    ? transaction 
    : reversibleTransactions.find(t => t.id === selectedTransactionId);
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const handleSubmit = () => {
    if (!selectedTransaction && !hasSpecificTransaction) {
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
      <div className="modal-content modal-reversal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header modal-reversal-header">
          <div className="reversal-icon-wrapper">
            <span className="reversal-icon">↩️</span>
          </div>
          <h2>Política de Reversión</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {/* Política */}
          <div className="reversal-policy-card">
            <p>
              Puedes revertir transacciones completadas dentro de las 24 horas siguientes. 
              La reversión es instantánea y gratuita. Los puntos ganados serán descontados.
            </p>
          </div>
          
          {/* Lista de reversibles */}
          <div className="reversible-list-modal">
            <h3>Transacciones Reversibles</h3>
            {reversibleTransactions.length > 0 || hasSpecificTransaction ? (
              <div className="reversible-items">
                {(hasSpecificTransaction ? [transaction] : reversibleTransactions).map(t => (
                  <div 
                    key={t.id} 
                    className={`reversible-item-modal ${selectedTransactionId === t.id || hasSpecificTransaction ? 'selected' : ''}`}
                    onClick={() => !hasSpecificTransaction && setSelectedTransactionId(t.id)}
                  >
                    <div className="reversible-info-modal">
                      <div className="reversible-icon-modal">
                        {t.type === 'recarga' ? '📥' : t.type === 'transferencia' ? '🔄' : '📤'}
                      </div>
                      <div className="reversible-details">
                        <p className="reversible-desc-modal">{t.description}</p>
                        <span className="reversible-date-modal">{t.date}</span>
                      </div>
                    </div>
                    <div className="reversible-amount-modal">
                      <span className="amount-value">{formatCurrency(t.amount)}</span>
                      <span className="points-value">+{t.points} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-reversible-modal">
                <p>No hay transacciones reversibles en este momento</p>
                <span>Solo puedes revertir transacciones de las últimas 24 horas</span>
              </div>
            )}
          </div>
          
          {/* Consecuencias */}
          <div className="reversal-consequences">
            <ul>
              <li>El saldo de la billetera se restaurará</li>
              <li>Los puntos generados serán descontados</li>
              <li>La transacción quedará marcada como "Reversada"</li>
            </ul>
          </div>
        </div>
        
        <div className="modal-buttons reversal-buttons">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button 
            type="button" 
            className="btn-reverse-modal"
            onClick={handleSubmit}
            disabled={!selectedTransaction && !hasSpecificTransaction}
          >
            Confirmar Reversión
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReversalModal;