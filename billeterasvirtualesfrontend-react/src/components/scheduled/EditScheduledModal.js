// EditScheduledModal.js - Modal para editar operación programada

import React, { useState, useEffect } from 'react';
import './Modals.css';

const EditScheduledModal = ({ isOpen, onClose, onEdit, operation, wallets, operationTypes, priorities, frequencies }) => {
  const [formData, setFormData] = useState({
    type: '',
    fromWalletId: '',
    toWalletId: '',
    amount: '',
    date: '',
    time: '12:00',
    priority: '',
    frequency: '',
    description: ''
  });
  
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (operation) {
      // Extraer fecha y hora
      const dateParts = operation.date?.split(', ') || ['', ''];
      setFormData({
        type: operation.type || 'transferencia',
        fromWalletId: wallets.find(w => w.name === operation.fromWallet)?.id || '',
        toWalletId: wallets.find(w => w.name === operation.toWallet)?.id || '',
        amount: operation.amount || '',
        date: dateParts[0] || '',
        time: dateParts[1] || '12:00',
        priority: operation.priority || 'media',
        frequency: operation.frequency?.toLowerCase() === 'única' ? 'unica' : (operation.frequency?.toLowerCase() || 'unica'),
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
    if (!formData.toWalletId && formData.type !== 'recarga') newErrors.toWalletId = 'Selecciona billetera destino';
    if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Ingresa un monto válido';
    if (!formData.date) newErrors.date = 'Selecciona una fecha';
    return newErrors;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    const dateTime = `${formData.date}, ${formData.time}`;
    const toWallet = wallets.find(w => w.id === formData.toWalletId);
    const priorityObj = priorities.find(p => p.value === formData.priority);
    const frequencyObj = frequencies.find(f => f.value === formData.frequency);
    
    onEdit({
      ...operation,
      type: formData.type,
      fromWallet: selectedFromWallet?.name,
      toWallet: toWallet?.name || 'Cuenta Bancaria',
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
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Editar Operación Programada</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tipo de operación</label>
            <select 
              value={formData.type} 
              onChange={(e) => setFormData({...formData, type: e.target.value})}
            >
              {operationTypes.map(t => (
                <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Desde (billetera origen)</label>
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
          </div>
          
          {formData.type !== 'recarga' && (
            <div className="form-group">
              <label>Hacia (billetera destino)</label>
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
          
          <div className="form-row">
            <div className="form-group">
              <label>Fecha</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
              {errors.date && <span className="error-text">{errors.date}</span>}
            </div>
            <div className="form-group">
              <label>Hora</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Monto</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              step="0.01"
            />
            {errors.amount && <span className="error-text">{errors.amount}</span>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Prioridad</label>
              <select 
                value={formData.priority} 
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
              >
                {priorities.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Frecuencia</label>
              <select 
                value={formData.frequency} 
                onChange={(e) => setFormData({...formData, frequency: e.target.value})}
              >
                {frequencies.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label>Descripción (opcional)</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
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