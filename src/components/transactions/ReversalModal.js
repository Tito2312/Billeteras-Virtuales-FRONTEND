// ReversalModal.js - Modal para revertir transferencias

import React, { useState } from 'react';
import { reverseTransaction } from '../../API/transactions';
import { getCurrentUser } from '../../API/auth';
import './Modals.css';

const ReversalModal = ({ isOpen, onClose, transactionId, transactionAmount, transactionPoints, sourceWallet, targetWallet, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };
  
  const handleSubmit = async () => {
    if (!transactionId) {
      alert('No se encontró la transferencia');
      return;
    }
    
    setLoading(true);
    const userId = getCurrentUser()?.id;
    
    const result = await reverseTransaction(userId, transactionId);
    
    if (result.success) {
      alert('✅ Transferencia revertida exitosamente');
      if (onSuccess) onSuccess();
      onClose();
    } else {
      alert(`❌ Error al revertir: ${result.message}`);
    }
    setLoading(false);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-reversal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header modal-reversal-header">
          <div className="reversal-icon-wrapper">
            <span className="reversal-icon">↩️</span>
          </div>
          <h2>Reversión de Transferencia</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="reversal-policy-card">
            <h3>¿Qué sucede al revertir?</h3>
            <ul>
              <li>💰 El dinero volverá a tu billetera origen</li>
              <li>📤 Se descontará de la billetera destino</li>
              <li>⭐ Los puntos ganados serán descontados</li>
              <li>📝 La transferencia quedará marcada como "Reversada"</li>
            </ul>
          </div>
          
          <div className="reversal-details-card">
            <h4>Detalles de la transferencia</h4>
            <div className="details-row">
              <span className="detail-label">Billetera Origen:</span>
              <span className="detail-value id-value">{sourceWallet || '-'}</span>
            </div>
            <div className="details-row">
              <span className="detail-label">Billetera Destino:</span>
              <span className="detail-value id-value">{targetWallet || '-'}</span>
            </div>
            <div className="details-row">
              <span className="detail-label">Monto:</span>
              <span className="detail-value highlight">{formatCurrency(transactionAmount)}</span>
            </div>
            <div className="details-row">
              <span className="detail-label">Puntos a descontar:</span>
              <span className="detail-value warning">{transactionPoints || 0} pts</span>
            </div>
          </div>
          
          <div className="reversal-consequences">
            <p className="consequences-title">⚠️ Esta acción no se puede deshacer</p>
            <p>Una vez revertida, la transferencia no podrá ser revertida nuevamente.</p>
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
            disabled={loading}
          >
            {loading ? 'Procesando...' : 'Confirmar Reversión'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReversalModal;