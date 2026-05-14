// CreateWalletModal.js - Modal para crear nueva billetera (SIN balance inicial, SIN descripción)

import React, { useState } from 'react';
import './Modals.css';

const CreateWalletModal = ({ isOpen, onClose, onCreate, walletTypes }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Gastos diarios',
    customType: ''
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
    if (formData.type === 'Otro' && !formData.customType.trim()) {
      newErrors.customType = 'Especifica el tipo de billetera';
    }
    return newErrors;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    const finalType = formData.type === 'Otro' ? formData.customType : formData.type;
    
    onCreate({
      name: formData.name,
      type: finalType
    });
    
    setFormData({ name: '', type: 'Gastos diarios', customType: '' });
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
              <option value="Otro">✨ Otro (especificar)</option>
            </select>
          </div>
          
          {formData.type === 'Otro' && (
            <div className="form-group custom-type-group">
              <label>Especificar tipo *</label>
              <input
                type="text"
                name="customType"
                value={formData.customType}
                onChange={handleChange}
                placeholder="Ej: Criptomonedas, Fondos, etc."
                className={errors.customType ? 'error' : ''}
              />
              {errors.customType && <span className="error-text">{errors.customType}</span>}
            </div>
          )}
          
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