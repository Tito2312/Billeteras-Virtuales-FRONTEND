// ReversalModal.js - Modal para revertir transacciones

import React, { useState, useEffect } from 'react';
import { reverseTransaction, getUserTransactions } from '../../API/transactions';
import { getCurrentUser } from '../../API/auth';
import './Modals.css';

const ReversalModal = ({ isOpen, onClose, onSuccess }) => {
  const [transactions, setTransactions] = useState([]);
  const [selectedTransactionId, setSelectedTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  
  // Solo cargar transacciones cuando el modal se ABRE
  useEffect(() => {
    if (isOpen) {
      loadTransactions();
    } else {
      // Resetear estado cuando se cierra
      setSelectedTransactionId('');
    }
  }, [isOpen]);
  
  const loadTransactions = async () => {
    setLoadingTransactions(true);
    const userId = getCurrentUser()?.id;
    if (!userId) {
      setLoadingTransactions(false);
      return;
    }
    
    const result = await getUserTransactions(userId);
    if (result.success && result.data) {
      // Filtrar solo transacciones completadas que no estén revertidas
      const reversible = result.data.filter(t => 
        t.status === 'COMPLETED' && !t.reversed
      );
      setTransactions(reversible);
    }
    setLoadingTransactions(false);
  };
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };
  
  const handleSubmit = async () => {
    if (!selectedTransactionId) {
      alert('Selecciona una transacción para revertir');
      return;
    }
    
    setLoading(true);
    const userId = getCurrentUser()?.id;
    
    const result = await reverseTransaction(userId, selectedTransactionId);
    
    if (result.success) {
      alert('✅ Transacción revertida exitosamente');
      if (onSuccess) onSuccess();
      onClose();
    } else {
      alert(`❌ Error al revertir: ${result.message}`);
    }
    setLoading(false);
  };
  
  const selectedTransaction = transactions.find(t => t.id === selectedTransactionId);
  
  // Si el modal no está abierto, no renderizar nada
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-reversal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header modal-reversal-header">
          <div className="reversal-icon-wrapper">
            <span className="reversal-icon">↩️</span>
          </div>
          <h2>Reversión de Transacciones</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="reversal-policy-card">
            <h3>Política de Reversión</h3>
            <p>
              Puedes revertir transacciones completadas. La reversión es instantánea y gratuita. 
              Los puntos ganados serán descontados.
            </p>
          </div>
          
          <div className="reversible-list-modal">
            <h3>Transacciones Reversibles</h3>
            {loadingTransactions ? (
              <div className="loading-transactions">Cargando transacciones...</div>
            ) : transactions.length > 0 ? (
              <div className="reversible-items">
                {transactions.map(t => (
                  <div 
                    key={t.id} 
                    className={`reversible-item-modal ${selectedTransactionId === t.id ? 'selected' : ''}`}
                    onClick={() => setSelectedTransactionId(t.id)}
                  >
                    <div className="reversible-info-modal">
                      <div className="reversible-icon-modal">
                        {t.type === 'RECHARGE' ? '📥' : t.type === 'TRANSFER' ? '🔄' : '📤'}
                      </div>
                      <div className="reversible-details">
                        <p className="reversible-desc-modal">
                          {t.type === 'RECHARGE' ? 'Recarga' : t.type === 'TRANSFER' ? 'Transferencia' : 'Retiro'}
                        </p>
                        <span className="reversible-date-modal">{formatDate(t.createdAt)}</span>
                      </div>
                    </div>
                    <div className="reversible-amount-modal">
                      <span className="amount-value">{formatCurrency(t.amount)}</span>
                      <span className="points-value">+{t.points || 0} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-reversible-modal">
                <p>No hay transacciones reversibles</p>
                <span>Solo puedes revertir transacciones completadas</span>
              </div>
            )}
          </div>
          
          {selectedTransaction && (
            <div className="reversal-details-card">
              <h4>Transacción a revertir</h4>
              <div className="details-row">
                <span className="detail-label">Fecha:</span>
                <span className="detail-value">{formatDate(selectedTransaction.createdAt)}</span>
              </div>
              <div className="details-row">
                <span className="detail-label">Monto:</span>
                <span className="detail-value highlight">{formatCurrency(selectedTransaction.amount)}</span>
              </div>
              <div className="details-row">
                <span className="detail-label">Puntos a descontar:</span>
                <span className="detail-value warning">{selectedTransaction.points || 0} puntos</span>
              </div>
            </div>
          )}
          
          <div className="reversal-consequences">
            <p className="consequences-title">⚠️ Al revertir esta transacción:</p>
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
            disabled={loading || !selectedTransactionId}
          >
            {loading ? 'Procesando...' : 'Confirmar Reversión'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReversalModal;