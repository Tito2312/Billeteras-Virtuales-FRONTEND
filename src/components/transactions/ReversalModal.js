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
      const result = await getUserTransactions(userId);
      if (result.success && result.data) {
        const reversible = result.data.filter(t =>
          t.type === 'TRANSFER' &&
          t.userId === userId &&
          t.status === 'COMPLETED' &&
          !t.reversed
        );
        setTransactions(reversible);
      } else {
        setError('No se pudieron cargar las transferencias');
      }
    } catch (err) {
      setError('Error al cargar las transferencias');
    }
    setLoadingTransactions(false);
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

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

  const handleSubmit = async () => {
    if (!selectedTransaction) {
      setError('Selecciona una transferencia para revertir');
      return;
    }
    setLoading(true);
    setError('');
    const result = await reverseTransaction(userId, selectedTransaction.id);
    if (result.success) {
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
          <div className="reversal-policy-card">
            <h3>¿Qué sucede al revertir?</h3>
            <ul>
              <li>💰 El dinero volverá a tu billetera origen</li>
              <li>📤 Se descontará de la billetera destino</li>
              <li>⭐ Los puntos ganados serán descontados</li>
              <li>📝 La transferencia quedará marcada como "Reversada"</li>
            </ul>
          </div>

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
                    onClick={() => { setSelectedTransaction(t); setError(''); }}
                  >
                    <div className="reversible-item-info">
                      <div className="reversible-item-icon">🔄</div>
                      <div className="reversible-item-details">
                        <div className="reversible-item-amount">{formatCurrency(t.amount)}</div>
                        <div className="reversible-item-date">{formatDate(t.createdAt)}</div>
                        <div className="reversible-item-wallets">
                          {t.sourceWallet?.substring(0, 10)}... → {t.targetWallet?.substring(0, 10)}...
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

          {error && <div className="reversal-error"><span>⚠️ {error}</span></div>}

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
