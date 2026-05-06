// RechargeModal.js - Modal para recargar billetera

import React, { useState } from 'react';
import './Modals.css';

const RechargeModal = ({ isOpen, onClose, onConfirm, wallets, paymentMethods }) => {
  const [formData, setFormData] = useState({
    walletId: wallets[0]?.id || '',
    amount: '',
    paymentMethodId: paymentMethods[0]?.id || ''
  });
  
  const [errors, setErrors] = useState({});
  
  if (!isOpen) return null;
  
  const selectedWallet = wallets.find(w => w.id === formData.walletId);
  const selectedMethod = paymentMethods.find(m => m.id === formData.paymentMethodId);
  
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
    if (!formData.paymentMethodId) newErrors.paymentMethodId = 'Selecciona un método de pago';
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
      paymentMethod: selectedMethod
    });
    
    onClose();
    setFormData({ walletId: wallets[0]?.id || '', amount: '', paymentMethodId: paymentMethods[0]?.id || '' });
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Recargar Billetera</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Selecciona billetera</label>
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
            <label>Monto a recargar</label>
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
            <label>Método de pago</label>
            <select 
              name="paymentMethodId" 
              value={formData.paymentMethodId} 
              onChange={(e) => setFormData({...formData, paymentMethodId: e.target.value})}
            >
              {paymentMethods.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            {errors.paymentMethodId && <span className="error-text">{errors.paymentMethodId}</span>}
          </div>
          
          <div className="modal-buttons">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-confirm">
              Confirmar Recarga
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RechargeModal;