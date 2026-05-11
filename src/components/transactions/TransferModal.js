// TransferModal.js - Modal para transferir dinero

import React, { useState } from 'react';
import './Modals.css';

const TransferModal = ({ isOpen, onClose, onConfirm, wallets }) => {
  const [formData, setFormData] = useState({
    fromWalletId: wallets[0]?.id || '',
    toUserId: '',
    amount: '',
    concept: ''
  });
  
  const [errors, setErrors] = useState({});
  
  if (!isOpen) return null;
  
  const selectedWallet = wallets.find(w => w.id === formData.fromWalletId);
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };
  
  const validate = () => {
    const newErrors = {};
    if (!formData.fromWalletId) newErrors.fromWalletId = 'Selecciona una billetera origen';
    if (!formData.toUserId.trim()) newErrors.toUserId = 'Ingresa un ID de usuario o billetera destino';
    if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Ingresa un monto válido';
    if (formData.amount > selectedWallet?.balance) newErrors.amount = 'Monto excede el balance disponible';
    return newErrors;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onConfirm({
      fromWallet: selectedWallet,
      toUserId: formData.toUserId,
      amount: parseFloat(formData.amount),
      concept: formData.concept
    });
    
    onClose();
    setFormData({ fromWalletId: wallets[0]?.id || '', toUserId: '', amount: '', concept: '' });
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Transferir Dinero</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Desde billetera</label>
            <select 
              name="fromWalletId" 
              value={formData.fromWalletId} 
              onChange={(e) => setFormData({...formData, fromWalletId: e.target.value})}
            >
              {wallets.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name} - {formatCurrency(w.balance)}
                </option>
              ))}
            </select>
            {errors.fromWalletId && <span className="error-text">{errors.fromWalletId}</span>}
          </div>
          
          <div className="form-group">
            <label>Hacia billetera / Usuario</label>
            <input
              type="text"
              name="toUserId"
              value={formData.toUserId}
              onChange={(e) => setFormData({...formData, toUserId: e.target.value})}
              placeholder="ID de usuario o billetera"
            />
            {errors.toUserId && <span className="error-text">{errors.toUserId}</span>}
          </div>
          
          <div className="form-group">
            <label>Monto a transferir</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder="0.00"
              step="0.01"
            />
            {errors.amount && <span className="error-text">{errors.amount}</span>}
          </div>
          
          <div className="form-group">
            <label>Concepto (opcional)</label>
            <input
              type="text"
              name="concept"
              value={formData.concept}
              onChange={(e) => setFormData({...formData, concept: e.target.value})}
              placeholder="Descripción de la transferencia"
            />
          </div>
          
          <div className="modal-buttons">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-confirm">
              Confirmar Transferencia
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferModal;