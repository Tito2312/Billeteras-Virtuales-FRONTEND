// CreateScheduledModal.js - Modal para crear operación programada

import React, { useState } from 'react';
import { getCurrentUser } from '../../API/auth';
import './Modals.css';

const CreateScheduledModal = ({ isOpen, onClose, onCreate, wallets }) => {
  const [formData, setFormData] = useState({
    type: 'RECHARGE',
    sourceWalletId: '',
    destinationType: 'misWallets', // 'misWallets' o 'otroUsuario'
    targetWalletId: '',
    targetUserId: '',
    targetWalletIdOther: '',
    amount: '',
    scheduledDate: '',
    scheduledTime: '12:00'
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  if (!isOpen) return null;
  
  const transactionTypes = [
    { value: 'RECHARGE', label: 'Recarga automática', icon: '📥' },
    { value: 'WITHDRAWAL', label: 'Retiro programado', icon: '📤' },
    { value: 'TRANSFER', label: 'Transferencia programada', icon: '🔄' }
  ];
  
  const validate = () => {
    const newErrors = {};
    if (!formData.type) newErrors.type = 'Selecciona un tipo de operación';
    
    // TRANSFERENCIA
    if (formData.type === 'TRANSFER') {
      if (!formData.sourceWalletId) newErrors.sourceWalletId = 'Selecciona billetera origen';
      
      if (formData.destinationType === 'misWallets') {
        if (!formData.targetWalletId) newErrors.targetWalletId = 'Selecciona billetera destino';
        if (formData.sourceWalletId === formData.targetWalletId) {
          newErrors.targetWalletId = 'No puedes transferir a la misma billetera';
        }
      } else {
        if (!formData.targetUserId) newErrors.targetUserId = 'Ingresa el ID del usuario destino';
        if (!formData.targetWalletIdOther) newErrors.targetWalletIdOther = 'Ingresa el ID de la billetera destino';
      }
    }
    
    // RETIRO
    if (formData.type === 'WITHDRAWAL') {
      if (!formData.sourceWalletId) newErrors.sourceWalletId = 'Selecciona billetera origen';
    }
    
    // RECARGA
    if (formData.type === 'RECHARGE') {
      if (!formData.targetWalletId) newErrors.targetWalletId = 'Selecciona billetera destino';
    }
    
    if (!formData.amount) {
      newErrors.amount = 'Ingresa un monto válido';
    } else {
      const amountNum = parseFloat(formData.amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        newErrors.amount = 'Ingresa un monto válido mayor a 0';
      }
    }
    
    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'Selecciona una fecha';
    } else {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      if (formData.scheduledDate < todayStr) {
        newErrors.scheduledDate = 'No puedes programar operaciones en fechas pasadas';
      }
    }
    
    return newErrors;
  };
  
  const resetForm = () => {
    setFormData({
      type: 'RECHARGE',
      sourceWalletId: '',
      destinationType: 'misWallets',
      targetWalletId: '',
      targetUserId: '',
      targetWalletIdOther: '',
      amount: '',
      scheduledDate: '',
      scheduledTime: '12:00'
    });
    setErrors({});
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      const currentUser = getCurrentUser();
      const userId = currentUser?.id;
      
      if (!userId) {
        throw new Error('No se encontró el usuario');
      }
      
      const [year, month, day] = formData.scheduledDate.split('-');
      const [hour, minute] = formData.scheduledTime.split(':');
      const scheduledDateTime = new Date(year, month - 1, day, hour, minute);
      
      if (isNaN(scheduledDateTime.getTime())) {
        throw new Error('Fecha inválida');
      }
      
      let operationData = {};
      const amountNum = parseFloat(formData.amount);
      
      switch (formData.type) {
        case 'RECHARGE':
          operationData = {
            userId: userId,
            targetWalletId: formData.targetWalletId,
            type: formData.type,
            amount: amountNum,
            scheduledDate: scheduledDateTime.toISOString()
          };
          break;
          
        case 'WITHDRAWAL':
          operationData = {
            userId: userId,
            sourceWalletId: formData.sourceWalletId,
            type: formData.type,
            amount: amountNum,
            scheduledDate: scheduledDateTime.toISOString()
          };
          break;
          
        case 'TRANSFER':
          if (formData.destinationType === 'misWallets') {
            operationData = {
              userId: userId,
              sourceWalletId: formData.sourceWalletId,
              targetWalletId: formData.targetWalletId,
              type: formData.type,
              amount: amountNum,
              scheduledDate: scheduledDateTime.toISOString()
            };
          } else {
            operationData = {
              userId: userId,
              sourceWalletId: formData.sourceWalletId,
              targetUserId: formData.targetUserId,
              targetWalletId: formData.targetWalletIdOther,
              type: formData.type,
              amount: amountNum,
              scheduledDate: scheduledDateTime.toISOString()
            };
          }
          break;
          
        default:
          throw new Error('Tipo de operación no válido');
      }
      
      console.log('📤 Enviando al backend:', operationData);
      await onCreate(operationData);
      
      resetForm();
      onClose();
      
    } catch (error) {
      console.error('❌ Error en creación:', error);
      alert('Error al programar la operación: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };
  
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value || 0);
  };
  
  // Obtener billeteras destino (todas excepto la seleccionada como origen)
  const getDestinationWallets = () => {
    if (!formData.sourceWalletId) return wallets;
    return wallets.filter(w => w.id !== formData.sourceWalletId);
  };
  
  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content modal-scheduled" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Programar Operación</h2>
          <button className="modal-close" onClick={handleClose} disabled={loading}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tipo de operación *</label>
            <select 
              value={formData.type} 
              onChange={(e) => setFormData({
                ...formData, 
                type: e.target.value,
                sourceWalletId: '',
                targetWalletId: '',
                targetUserId: '',
                targetWalletIdOther: ''
              })}
              disabled={loading}
            >
              {transactionTypes.map(t => (
                <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
              ))}
            </select>
            {errors.type && <span className="error-text">{errors.type}</span>}
          </div>
          
          {/* TRANSFERENCIA PROGRAMADA */}
          {formData.type === 'TRANSFER' && (
            <>
              <div className="form-group">
                <label>Desde billetera *</label>
                <select 
                  value={formData.sourceWalletId} 
                  onChange={(e) => setFormData({...formData, sourceWalletId: e.target.value})}
                  disabled={loading}
                >
                  <option value="">Selecciona una billetera...</option>
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} - {formatCurrency(w.balance)}
                    </option>
                  ))}
                </select>
                {errors.sourceWalletId && <span className="error-text">{errors.sourceWalletId}</span>}
              </div>
              
              <div className="form-group">
                <label>Tipo de destino</label>
                <div className="destination-cards">
                  <div 
                    className={`destination-card ${formData.destinationType === 'misWallets' ? 'selected' : ''}`}
                    onClick={() => setFormData({
                      ...formData, 
                      destinationType: 'misWallets',
                      targetUserId: '',
                      targetWalletIdOther: ''
                    })}
                  >
                    <div className="destination-icon">💳</div>
                    <div className="destination-info">
                      <h4>Mis billeteras</h4>
                      <p>Transferencia entre tus propias billeteras</p>
                    </div>
                    <div className="destination-radio">
                      <div className={`custom-radio ${formData.destinationType === 'misWallets' ? 'checked' : ''}`}>
                        {formData.destinationType === 'misWallets' && <span>✓</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={`destination-card ${formData.destinationType === 'otroUsuario' ? 'selected' : ''}`}
                    onClick={() => setFormData({
                      ...formData, 
                      destinationType: 'otroUsuario',
                      targetWalletId: ''
                    })}
                  >
                    <div className="destination-icon">👤</div>
                    <div className="destination-info">
                      <h4>Otro usuario</h4>
                      <p>Transferencia a otro usuario de FinWallet</p>
                    </div>
                    <div className="destination-radio">
                      <div className={`custom-radio ${formData.destinationType === 'otroUsuario' ? 'checked' : ''}`}>
                        {formData.destinationType === 'otroUsuario' && <span>✓</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {formData.destinationType === 'misWallets' && (
                <div className="form-group">
                  <label>Billetera destino *</label>
                  <select 
                    value={formData.targetWalletId} 
                    onChange={(e) => setFormData({...formData, targetWalletId: e.target.value})}
                    disabled={loading}
                  >
                    <option value="">Selecciona una billetera...</option>
                    {getDestinationWallets().map(w => (
                      <option key={w.id} value={w.id}>
                        {w.name} - {formatCurrency(w.balance)}
                      </option>
                    ))}
                  </select>
                  {errors.targetWalletId && <span className="error-text">{errors.targetWalletId}</span>}
                </div>
              )}
              
              {formData.destinationType === 'otroUsuario' && (
                <>
                  <div className="form-group">
                    <label>ID del usuario destino *</label>
                    <input
                      type="text"
                      value={formData.targetUserId}
                      onChange={(e) => setFormData({...formData, targetUserId: e.target.value})}
                      placeholder="Ej: 6a0518699b62c391703c0bf5"
                      disabled={loading}
                    />
                    <small className="field-hint">Pídele su ID de usuario a la persona (aparece en su perfil)</small>
                    {errors.targetUserId && <span className="error-text">{errors.targetUserId}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label>ID de la billetera destino *</label>
                    <input
                      type="text"
                      value={formData.targetWalletIdOther}
                      onChange={(e) => setFormData({...formData, targetWalletIdOther: e.target.value})}
                      placeholder="Ej: 6a0518699b62c391703c0bf6"
                      disabled={loading}
                    />
                    <small className="field-hint">Pídele el ID de su billetera a la persona</small>
                    {errors.targetWalletIdOther && <span className="error-text">{errors.targetWalletIdOther}</span>}
                  </div>
                </>
              )}
            </>
          )}
          
          {/* RETIRO: Solo billetera origen */}
          {formData.type === 'WITHDRAWAL' && (
            <div className="form-group">
              <label>Billetera origen *</label>
              <select 
                value={formData.sourceWalletId} 
                onChange={(e) => setFormData({...formData, sourceWalletId: e.target.value})}
                disabled={loading}
              >
                <option value="">Selecciona una billetera...</option>
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} - {formatCurrency(w.balance)}
                  </option>
                ))}
              </select>
              {errors.sourceWalletId && <span className="error-text">{errors.sourceWalletId}</span>}
              <small className="field-hint">El dinero se retirará a tu cuenta bancaria asociada</small>
            </div>
          )}
          
          {/* RECARGA: Solo billetera destino */}
          {formData.type === 'RECHARGE' && (
            <div className="form-group">
              <label>Billetera destino *</label>
              <select 
                value={formData.targetWalletId} 
                onChange={(e) => setFormData({...formData, targetWalletId: e.target.value})}
                disabled={loading}
              >
                <option value="">Selecciona una billetera...</option>
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} - {formatCurrency(w.balance)}
                  </option>
                ))}
              </select>
              {errors.targetWalletId && <span className="error-text">{errors.targetWalletId}</span>}
              <small className="field-hint">La recarga proviene de una tarjeta o cuenta bancaria externa</small>
            </div>
          )}
          
          <div className="form-row">
            <div className="form-group">
              <label>Fecha de ejecución *</label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                min={getMinDate()}
                disabled={loading}
              />
              {errors.scheduledDate && <span className="error-text">{errors.scheduledDate}</span>}
              <small className="field-hint">Puedes programar para hoy o cualquier día futuro</small>
            </div>
            <div className="form-group">
              <label>Hora</label>
              <input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Monto *</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              disabled={loading}
            />
            {errors.amount && <span className="error-text">{errors.amount}</span>}
          </div>
          
          <div className="modal-buttons">
            <button type="button" className="btn-cancel" onClick={handleClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-confirm" disabled={loading}>
              {loading ? 'Programando...' : 'Programar Operación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateScheduledModal;