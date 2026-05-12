// TransferModal.js - Modal para transferir dinero (VERSIÓN SIMULADA)

import React, { useState } from 'react';
import './Modals.css';

const TransferModal = ({ isOpen, onClose, wallets, initialWallet, onSuccess }) => {
  const [formData, setFormData] = useState({
    fromWalletId: initialWallet?.id || wallets[0]?.id || '',
    destinationType: 'usuario',
    toUserId: '',
    toWalletId: '',
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
    if (formData.destinationType === 'usuario' && !formData.toUserId) {
      newErrors.toUserId = 'Ingresa el ID de usuario o correo';
    }
    if (formData.destinationType === 'wallet' && !formData.toWalletId) {
      newErrors.toWalletId = 'Selecciona una billetera destino';
    }
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
    
    setLoading(true);
    
    // SIMULACIÓN - No conecta con backend
    setTimeout(() => {
      const destination = formData.destinationType === 'usuario' 
        ? `usuario ${formData.toUserId}` 
        : `billetera ${wallets.find(w => w.id === formData.toWalletId)?.name}`;
      
      alert(`✅ SIMULACIÓN: Transferencia exitosa de ${formatCurrency(formData.amount)} desde ${selectedWallet?.name} hacia ${destination}\n\n⚠️ Esta funcionalidad se conectará con el backend próximamente.`);
      if (onSuccess) onSuccess();
      onClose();
      setFormData({
        fromWalletId: wallets[0]?.id || '',
        destinationType: 'usuario',
        toUserId: '',
        toWalletId: '',
        amount: '',
        description: ''
      });
      setLoading(false);
    }, 800);
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
                  checked={formData.destinationType === 'usuario'}
                  onChange={() => setFormData({...formData, destinationType: 'usuario', toWalletId: ''})}
                /> 
                Otro usuario
              </label>
              <label>
                <input 
                  type="radio" 
                  name="destinationType"
                  checked={formData.destinationType === 'wallet'}
                  onChange={() => setFormData({...formData, destinationType: 'wallet', toUserId: ''})}
                /> 
                Mis billeteras
              </label>
            </div>
          </div>
          
          {formData.destinationType === 'usuario' && (
            <div className="form-group">
              <label>ID de usuario o correo electrónico</label>
              <input
                type="text"
                value={formData.toUserId}
                onChange={(e) => setFormData({...formData, toUserId: e.target.value})}
                placeholder="Ej: juan@email.com o USR-12345"
              />
              {errors.toUserId && <span className="error-text">{errors.toUserId}</span>}
            </div>
          )}
          
          {formData.destinationType === 'wallet' && (
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