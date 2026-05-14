// ReversalModal.js - Modal para revertir transferencias

import React, { useState, useEffect } from 'react';
import { reverseTransaction, getUserTransactions } from '../../API/transactions';
import { getCurrentUser } from '../../API/auth';
import './Modals.css';

const ReversalModal = ({ isOpen, onClose, onSuccess }) => {
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [error, setError] = useState('');
  
  const userId = getCurrentUser()?.id;
  
  useEffect(() => {
    if (isOpen) {
      loadReversibleTransactions();
    } else {
      setSelectedTransaction(null);
      setError('');
    }
  }, [isOpen]);
  
  const loadReversibleTransactions = async () => {
    setLoadingTransactions(true);
    setError('');
    
    try {
      console.log('Cargando transferencias reversibles para userId:', userId);
      const result = await getUserTransactions(userId);
      console.log('Transacciones recibidas:', result);
      
      if (result.success && result.data) {
        // Filtrar SOLO TRANSFERENCIAS que el usuario ENVIÓ y que están completadas y no revertidas
        const reversible = result.data.filter(t => 
          t.type === 'TRANSFER' && 
          t.userId === userId &&
          t.status === 'COMPLETED' && 
          !t.reversed
        );
        console.log('Transferencias reversibles encontradas:', reversible.length);
        setTransactions(reversible);
      } else {
        setError('No se pudieron cargar las transferencias');
      }
    } catch (err) {
      console.error('Error cargando transferencias:', err);
      setError('Error al cargar las transferencias');
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
    if (!dateString) return 'Fecha no disponible';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha no disponible';
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day}/${month}/${year}, ${hours}:${minutes}`;
    } catch (error) {
      return 'Fecha no disponible';
    }
  };
  
  const handleSelectTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setError('');
  };
  
  const handleSubmit = async () => {
    if (!selectedTransaction) {
      setError('Selecciona una transferencia para revertir');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const result = await reverseTransaction(userId, selectedTransaction.id);
    
    if (result.success) {
      alert('✅ Transferencia revertida exitosamente');
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setError(result.message || 'Error al revertir la transferencia');
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
          <h2>Reversión de Transferencias</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {/* Política */}
          <div className="reversal-policy-card">
            <h3>¿Qué sucede al revertir?</h3>
            <ul>
              <li>💰 El dinero volverá a tu billetera origen</li>
              <li>📤 Se descontará de la billetera destino</li>
              <li>⭐ Los puntos ganados serán descontados</li>
              <li>📝 La transferencia quedará marcada como "Reversada"</li>
            </ul>
          </div>
          
          {/* Lista de transferencias reversibles */}
          <div className="reversible-list-section">
            <h3>Transferencias que puedes revertir</h3>
            {loadingTransactions ? (
              <div className="loading-transactions">
                <div className="loading-spinner-small"></div>
                <p>Cargando transferencias...</p>
              </div>
            ) : transactions.length > 0 ? (
              <div className="reversible-items-list">
                {transactions.map(t => (
                  <div 
                    key={t.id} 
                    className={`reversible-item ${selectedTransaction?.id === t.id ? 'selected' : ''}`}
                    onClick={() => handleSelectTransaction(t)}
                  >
                    <div className="reversible-item-info">
                      <div className="reversible-item-icon">🔄</div>
                      <div className="reversible-item-details">
                        <div className="reversible-item-amount">{formatCurrency(t.amount)}</div>
                        <div className="reversible-item-date">{formatDate(t.createdAt)}</div>
                        <div className="reversible-item-wallets">
                          {t.sourceWallet ? t.sourceWallet.substring(0, 10) + '...' : '-'} → {t.targetWallet ? t.targetWallet.substring(0, 10) + '...' : '-'}
                        </div>
                      </div>
                      <div className="reversible-item-points">+{t.points || 0} pts</div>
                    </div>
                    {selectedTransaction?.id === t.id && (
                      <div className="reversible-item-check">✓</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-reversible">
                <p>No hay transferencias reversibles</p>
                <span>Solo puedes revertir transferencias que hayas enviado y que no hayan sido revertidas</span>
              </div>
            )}
          </div>
          
          {/* Detalles de la transferencia seleccionada */}
          {selectedTransaction && (
            <div className="reversal-details-section">
              <h3>Detalles de la transferencia a revertir</h3>
              <div className="details-grid">
                <div className="detail-row">
                  <span className="detail-label">Fecha:</span>
                  <span className="detail-value">{formatDate(selectedTransaction.createdAt)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Billetera Origen:</span>
                  <span className="detail-value id-value">{selectedTransaction.sourceWallet || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Billetera Destino:</span>
                  <span className="detail-value id-value">{selectedTransaction.targetWallet || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Monto:</span>
                  <span className="detail-value highlight">{formatCurrency(selectedTransaction.amount)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Puntos a descontar:</span>
                  <span className="detail-value warning">{selectedTransaction.points || 0} pts</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Mensaje de error */}
          {error && (
            <div className="reversal-error">
              <span>⚠️ {error}</span>
            </div>
          )}
          
          {/* Consecuencias */}
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
            disabled={loading || !selectedTransaction}
          >
            {loading ? 'Procesando...' : 'Confirmar Reversión'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReversalModal;