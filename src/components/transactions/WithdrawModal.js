// WithdrawModal.js - Modal para retirar dinero

import React, { useState } from 'react';
import './Modals.css';

const WithdrawModal = ({ isOpen, onClose, onConfirm, wallets }) => {
  const [formData, setFormData] = useState({
    walletId: wallets[0]?.id || '',
    amount: '',
    destinationAccount: 'Cuenta Bancaria ****3456'
  });
  
  const [errors, setErrors] = useState({});
  
  if (!isOpen) return null;
  
  const selectedWallet = wallets.find(w => w.id === formData.walletId);
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };
  
  const validate = () => {
    const newErrors = {};
    if (!formData.walletId) newErrors.walletId = 'Selecciona una billetera';
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
      wallet: selectedWallet,
      amount: parseFloat(formData.amount),
      destinationAccount: formData.destinationAccount
    });
    
    onClose();
    setFormData({ walletId: wallets[0]?.id || '', amount: '', destinationAccount: 'Cuenta Bancaria ****3456' });
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Retirar Dinero</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Desde billetera</label>
            <select 
              name="walletId" 
              value={formData.walletId} 
              onChange={(e) => setFormData({...formData, walletId: e.target.value})}
            >
              {wallets.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name} - {formatCurrency(w.balance)}
                </option>
              ))}
            </select>
            {errors.walletId && <span className="error-text">{errors.walletId}</span>}
          </div>
          
          <div className="form-group">
            <label>Monto a retirar</label>
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
            <label>Cuenta de destino</label>
            <input
              type="text"
              name="destinationAccount"
              value={formData.destinationAccount}
              onChange={(e) => setFormData({...formData, destinationAccount: e.target.value})}
            />
          </div>
          
          <div className="modal-buttons">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-confirm">
              Confirmar Retiro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WithdrawModal;