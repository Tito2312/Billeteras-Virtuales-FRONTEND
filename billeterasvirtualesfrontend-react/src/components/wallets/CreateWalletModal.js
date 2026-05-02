// CreateWalletModal.js - Modal para crear nueva billetera

import React, { useState } from 'react';
import './Modals.css';

const CreateWalletModal = ({ isOpen, onClose, onCreate, walletTypes }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Gastos diarios',
    balance: '',
    description: ''
  });
  
  const [errors, setErrors] = useState({});
  
  if (!isOpen) return null;
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };
  
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (formData.name.length < 3) newErrors.name = 'Mínimo 3 caracteres';
    if (formData.balance && isNaN(formData.balance)) newErrors.balance = 'Ingrese un número válido';
    return newErrors;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onCreate({
      name: formData.name,
      type: formData.type,
      balance: formData.balance || 0,
      description: formData.description
    });
    
    setFormData({ name: '', type: 'Gastos diarios', balance: '', description: '' });
    onClose();
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Crear Nueva Billetera</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre de la billetera *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Mi Billetera de Ahorros"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>
          
          <div className="form-group">
            <label>Tipo de billetera *</label>
            <select name="type" value={formData.type} onChange={handleChange}>
              {walletTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Balance inicial</label>
            <input
              type="number"
              name="balance"
              value={formData.balance}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
            />
          </div>
          
          <div className="form-group">
            <label>Descripción (opcional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe el propósito de esta billetera..."
              rows="3"
            />
          </div>
          
          <div className="modal-buttons">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-create-modal">
              Crear Billetera
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWalletModal;