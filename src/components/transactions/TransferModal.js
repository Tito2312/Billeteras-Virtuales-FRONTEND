// TransferModal.js - Modal para transferir dinero

import React, { useState } from 'react';
import { transferToOwnWallet, transferToUser } from '../../API/transactions';
import { getCurrentUser } from '../../API/auth';
import './Modals.css';

const TransferModal = ({ isOpen, onClose, wallets, onSuccess }) => {
  const [formData, setFormData] = useState({
    fromWalletId: wallets[0]?.id || '',
    destinationType: 'own', // 'own' o 'user'
    toWalletId: '',
    toUserId: '',
    amount: '',
    description: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  if (!isOpen) return null;
  
  const selectedWallet = wallets.find(w => w.id === formData.fromWalletId);
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };
  
  const validate = () => {
    const newErrors = {};
    if (!formData.fromWalletId) newErrors.fromWalletId = 'Selecciona billetera origen';
    if (formData.destinationType === 'own' && !formData.toWalletId) {
      newErrors.toWalletId = 'Selecciona una billetera destino';
    }
    if (formData.destinationType === 'user' && !formData.toUserId) {
      newErrors.toUserId = 'Ingresa el ID de usuario destino';
    }
    if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Ingresa un monto válido';
    if (formData.amount > selectedWallet?.balance) newErrors.amount = 'Monto excede el balance disponible';
    return newErrors;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    const userId = getCurrentUser()?.id;
    let result;
    
    if (formData.destinationType === 'own') {
      // Transferencia entre mis propias billeteras
      result = await transferToOwnWallet(
        userId,
        formData.fromWalletId,
        formData.toWalletId,
        parseFloat(formData.amount)
      );
    } else {
      // Transferencia a otro usuario
      result = await transferToUser(
        userId,
        formData.toUserId,
        formData.fromWalletId,
        wallets.find(w => w.id === formData.toWalletId)?.id || '',
        parseFloat(formData.amount)
      );
    }
    
    if (result.success) {
      alert(`✅ Transferencia exitosa: ${formatCurrency(formData.amount)}`);
      if (onSuccess) onSuccess();
      onClose();
      setFormData({
        fromWalletId: wallets[0]?.id || '',
        destinationType: 'own',
        toWalletId: '',
        toUserId: '',
        amount: '',
        description: ''
      });
    } else {
      alert(`❌ Error al transferir: ${result.message}`);
    }
    setLoading(false);
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
            <label>Tipo de destino</label>
            <div className="radio-group">
              <label>
                <input 
                  type="radio" 
                  name="destinationType"
                  checked={formData.destinationType === 'own'}
                  onChange={() => setFormData({...formData, destinationType: 'own', toUserId: ''})}
                /> 
                Mis billeteras
              </label>
              <label>
                <input 
                  type="radio" 
                  name="destinationType"
                  checked={formData.destinationType === 'user'}
                  onChange={() => setFormData({...formData, destinationType: 'user', toWalletId: ''})}
                /> 
                Otro usuario
              </label>
            </div>
          </div>
          
          {formData.destinationType === 'own' && (
            <div className="form-group">
              <label>Billetera destino</label>
              <select 
                value={formData.toWalletId} 
                onChange={(e) => setFormData({...formData, toWalletId: e.target.value})}
              >
                <option value="">Selecciona...</option>
                {wallets.filter(w => w.id !== formData.fromWalletId).map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
              {errors.toWalletId && <span className="error-text">{errors.toWalletId}</span>}
            </div>
          )}
          
          {formData.destinationType === 'user' && (
            <div className="form-group">
              <label>ID de usuario destino</label>
              <input
                type="text"
                value={formData.toUserId}
                onChange={(e) => setFormData({...formData, toUserId: e.target.value})}
                placeholder="Ej: 6a0518699b62c391703c0bf5"
              />
              {errors.toUserId && <span className="error-text">{errors.toUserId}</span>}
              <small className="field-hint">Ingresa el ID del usuario al que quieres transferir</small>
            </div>
          )}
          
          <div className="form-group">
            <label>Monto a transferir</label>
            <input
              type="number"
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
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Descripción de la transferencia"
            />
          </div>
          
          <div className="modal-buttons">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-confirm" disabled={loading}>
              {loading ? 'Procesando...' : 'Confirmar Transferencia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferModal;