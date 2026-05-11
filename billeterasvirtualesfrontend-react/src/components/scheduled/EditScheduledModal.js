// EditScheduledModal.js - Modal para editar operación programada
// Corregido según documento: transferencias a otros usuarios, ahorro automático, etc.

import React, { useState, useEffect } from 'react';
import './Modals.css';

const EditScheduledModal = ({ isOpen, onClose, onEdit, operation, wallets, user, operationTypes, priorities, frequencies }) => {
  const [formData, setFormData] = useState({
    type: '',
    fromWalletId: '',
    destinationType: 'usuario', // 'usuario' o 'misWallets'
    toUserId: '',
    toWalletId: '',
    paymentMethod: 'tarjeta',
    amount: '',
    scheduleDate: '',
    scheduleTime: '12:00',
    priority: '',
    frequency: '',
    description: ''
  });
  
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (operation) {
      // Extraer fecha y hora
      const dateParts = operation.date?.split(', ') || ['', ''];
      
      // Determinar destinationType basado en el destino
      let destinationType = 'usuario';
      let toUserId = '';
      let toWalletId = '';
      
      if (operation.toDestination) {
        if (operation.toDestination.startsWith('Usuario:')) {
          destinationType = 'usuario';
          toUserId = operation.toDestination.replace('Usuario: ', '');
        } else if (operation.toDestination === 'Cuenta Bancaria') {
          destinationType = 'usuario';
          toUserId = 'Cuenta Bancaria';
        } else {
          // Verificar si es una de mis billeteras
          const foundWallet = wallets.find(w => w.name === operation.toDestination);
          if (foundWallet) {
            destinationType = 'misWallets';
            toWalletId = foundWallet.id;
          } else {
            destinationType = 'usuario';
            toUserId = operation.toDestination;
          }
        }
      }
      
      setFormData({
        type: operation.type || 'transferencia',
        fromWalletId: wallets.find(w => w.name === operation.fromWallet)?.id || wallets[0]?.id || '',
        destinationType: destinationType,
        toUserId: toUserId,
        toWalletId: toWalletId,
        paymentMethod: 'tarjeta',
        amount: operation.amount || '',
        scheduleDate: dateParts[0] || '',
        scheduleTime: dateParts[1] || '12:00',
        priority: operation.priority || 'media',
        frequency: operation.frequency?.toLowerCase() === 'única' ? 'unica' : 
                   (operation.frequency?.toLowerCase() === 'mensual' ? 'mensual' :
                   (operation.frequency?.toLowerCase() || 'unica')),
        description: operation.description || ''
      });
    }
  }, [operation, wallets]);
  
  if (!isOpen || !operation) return null;
  
  const selectedFromWallet = wallets.find(w => w.id === formData.fromWalletId);
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };
  
  const validate = () => {
    const newErrors = {};
    if (!formData.fromWalletId) newErrors.fromWalletId = 'Selecciona billetera origen';
    if (formData.type === 'transferencia') {
      if (formData.destinationType === 'usuario' && !formData.toUserId) {
        newErrors.toUserId = 'Ingresa el ID de usuario o correo electrónico';
      }
      if (formData.destinationType === 'misWallets' && !formData.toWalletId) {
        newErrors.toWalletId = 'Selecciona una billetera destino';
      }
    }
    if (formData.type === 'ahorro' && !formData.toWalletId) {
      newErrors.toWalletId = 'Selecciona una billetera de ahorro';
    }
    if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Ingresa un monto válido';
    if (!formData.scheduleDate) newErrors.scheduleDate = 'Selecciona una fecha';
    return newErrors;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    const dateTime = `${formData.scheduleDate}, ${formData.scheduleTime}`;
    const priorityObj = priorities.find(p => p.value === formData.priority);
    const frequencyObj = frequencies.find(f => f.value === formData.frequency);
    const typeObj = operationTypes.find(t => t.value === formData.type);
    
    let destination = '';
    if (formData.type === 'transferencia') {
      if (formData.destinationType === 'usuario') {
        destination = `Usuario: ${formData.toUserId}`;
      } else {
        destination = wallets.find(w => w.id === formData.toWalletId)?.name;
      }
    } else if (formData.type === 'retiro') {
      destination = 'Cuenta Bancaria';
    } else if (formData.type === 'recarga') {
      destination = formData.paymentMethod === 'tarjeta' ? 'Tarjeta de crédito' : 'Cuenta bancaria';
    } else if (formData.type === 'ahorro') {
      destination = wallets.find(w => w.id === formData.toWalletId)?.name;
    }
    
    onEdit({
      ...operation,
      type: formData.type,
      typeLabel: typeObj?.label,
      fromWallet: selectedFromWallet?.name,
      toDestination: destination,
      amount: parseFloat(formData.amount),
      date: dateTime,
      priority: formData.priority,
      priorityLabel: priorityObj?.label,
      priorityLevel: priorityObj?.level,
      frequency: frequencyObj?.label,
      description: formData.description
    });
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-scheduled" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Editar Operación Programada</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tipo de operación *</label>
            <select 
              value={formData.type} 
              onChange={(e) => setFormData({...formData, type: e.target.value})}
            >
              <option value="transferencia">🔄 Transferencia (a otro usuario o billetera)</option>
              <option value="recarga">📥 Recarga automática</option>
              <option value="retiro">📤 Retiro programado</option>
              <option value="ahorro">🏦 Ahorro automático</option>
            </select>
            <small className="field-hint">Según documento: transferencias periódicas, recargas automáticas, pagos recurrentes, ahorro automático semanal</small>
          </div>
          
          <div className="form-group">
            <label>Desde (billetera origen) *</label>
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
          
          {/* Transferencia: selección de destino */}
          {formData.type === 'transferencia' && (
            <div className="destination-section">
              <label className="section-label">Tipo de destino *</label>
              
              <div className="destination-cards">
                <div 
                  className={`destination-card ${formData.destinationType === 'usuario' ? 'selected' : ''}`}
                  onClick={() => setFormData({...formData, destinationType: 'usuario', toWalletId: ''})}
                >
                  <div className="destination-icon">👤</div>
                  <div className="destination-info">
                    <h4>Otro usuario</h4>
                    <p>Transferencia a billetera de otro usuario de FinWallet</p>
                  </div>
                  <div className="destination-radio">
                    <div className={`custom-radio ${formData.destinationType === 'usuario' ? 'checked' : ''}`}>
                      {formData.destinationType === 'usuario' && <span>✓</span>}
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`destination-card ${formData.destinationType === 'misWallets' ? 'selected' : ''}`}
                  onClick={() => setFormData({...formData, destinationType: 'misWallets', toUserId: ''})}
                >
                  <div className="destination-icon">💳</div>
                  <div className="destination-info">
                    <h4>Mis billeteras</h4>
                    <p>Transferencia entre mis propias billeteras</p>
                  </div>
                  <div className="destination-radio">
                    <div className={`custom-radio ${formData.destinationType === 'misWallets' ? 'checked' : ''}`}>
                      {formData.destinationType === 'misWallets' && <span>✓</span>}
                    </div>
                  </div>
                </div>
              </div>
              
              {formData.destinationType === 'usuario' && (
                <div className="destination-field">
                  <label>ID de usuario o correo electrónico *</label>
                  <div className="input-with-icon">
                    <span className="input-icon">📧</span>
                    <input
                      type="text"
                      value={formData.toUserId}
                      onChange={(e) => setFormData({...formData, toUserId: e.target.value})}
                      placeholder="Ej: juan.perez@email.com o USR-12345"
                    />
                  </div>
                  {errors.toUserId && <span className="error-text">{errors.toUserId}</span>}
                  <small className="field-hint">La transferencia se realizará a la billetera principal del usuario destino</small>
                </div>
              )}
              
              {formData.destinationType === 'misWallets' && (
                <div className="destination-field">
                  <label>Billetera destino *</label>
                  <div className="input-with-icon">
                    <span className="input-icon">🏦</span>
                    <select 
                      value={formData.toWalletId} 
                      onChange={(e) => setFormData({...formData, toWalletId: e.target.value})}
                    >
                      <option value="">Selecciona una billetera...</option>
                      {wallets.filter(w => w.id !== formData.fromWalletId).map(w => (
                        <option key={w.id} value={w.id}>
                          {w.name} - {formatCurrency(w.balance)}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.toWalletId && <span className="error-text">{errors.toWalletId}</span>}
                  <small className="field-hint">Transferencia entre tus propias billeteras</small>
                </div>
              )}
            </div>
          )}
          
          {/* Recarga automática */}
          {formData.type === 'recarga' && (
            <div className="form-group">
              <label>Método de pago *</label>
              <div className="payment-methods">
                <div 
                  className={`payment-method ${formData.paymentMethod === 'tarjeta' ? 'selected' : ''}`}
                  onClick={() => setFormData({...formData, paymentMethod: 'tarjeta'})}
                >
                  <span className="payment-icon">💳</span>
                  <span>Tarjeta de crédito **** 4532</span>
                </div>
                <div 
                  className={`payment-method ${formData.paymentMethod === 'tarjeta2' ? 'selected' : ''}`}
                  onClick={() => setFormData({...formData, paymentMethod: 'tarjeta2'})}
                >
                  <span className="payment-icon">💳</span>
                  <span>Tarjeta de crédito **** 1234</span>
                </div>
                <div 
                  className={`payment-method ${formData.paymentMethod === 'cuenta' ? 'selected' : ''}`}
                  onClick={() => setFormData({...formData, paymentMethod: 'cuenta'})}
                >
                  <span className="payment-icon">🏦</span>
                  <span>Cuenta bancaria **** 3456</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Retiro programado */}
          {formData.type === 'retiro' && (
            <div className="form-group">
              <label>Cuenta de destino *</label>
              <div className="payment-methods">
                <div className="payment-method selected">
                  <span className="payment-icon">🏦</span>
                  <span>Cuenta bancaria **** 3456</span>
                </div>
                <div className="payment-method">
                  <span className="payment-icon">🏦</span>
                  <span>Cuenta bancaria **** 7890</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Ahorro automático */}
          {formData.type === 'ahorro' && (
            <div className="form-group">
              <label>Billetera destino (ahorro) *</label>
              <div className="input-with-icon">
                <span className="input-icon">🏦</span>
                <select 
                  value={formData.toWalletId} 
                  onChange={(e) => setFormData({...formData, toWalletId: e.target.value})}
                >
                  <option value="">Selecciona una billetera de ahorro...</option>
                  {wallets.filter(w => w.id !== formData.fromWalletId && (w.type === 'Ahorro' || w.name === 'Ahorros')).map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} - {formatCurrency(w.balance)}
                    </option>
                  ))}
                </select>
              </div>
              {errors.toWalletId && <span className="error-text">{errors.toWalletId}</span>}
              <small className="field-hint">Ahorro automático hacia una billetera de tipo Ahorro</small>
            </div>
          )}
          
          <div className="form-row">
            <div className="form-group">
              <label>Fecha de ejecución *</label>
              <input
                type="date"
                value={formData.scheduleDate}
                onChange={(e) => setFormData({...formData, scheduleDate: e.target.value})}
              />
              {errors.scheduleDate && <span className="error-text">{errors.scheduleDate}</span>}
            </div>
            <div className="form-group">
              <label>Hora</label>
              <input
                type="time"
                value={formData.scheduleTime}
                onChange={(e) => setFormData({...formData, scheduleTime: e.target.value})}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Monto *</label>
            <div className="input-with-icon">
              <span className="input-icon">💰</span>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                step="0.01"
              />
            </div>
            {errors.amount && <span className="error-text">{errors.amount}</span>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Prioridad *</label>
              <select 
                value={formData.priority} 
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
              >
                {priorities.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
              <small className="field-hint">Las operaciones se procesan según prioridad (cola de prioridad)</small>
            </div>
            <div className="form-group">
              <label>Frecuencia *</label>
              <select 
                value={formData.frequency} 
                onChange={(e) => setFormData({...formData, frequency: e.target.value})}
              >
                {frequencies.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              <small className="field-hint">Transferencias periódicas, pagos recurrentes, ahorro automático semanal</small>
            </div>
          </div>
          
          <div className="form-group">
            <label>Descripción / Concepto</label>
            <div className="input-with-icon">
              <span className="input-icon">📝</span>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Ej: Ahorro mensual, Pago de servicios, etc."
              />
            </div>
          </div>
          
          <div className="modal-buttons">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-edit-modal">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditScheduledModal;