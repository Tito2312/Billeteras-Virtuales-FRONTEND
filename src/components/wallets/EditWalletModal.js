import React, { useState, useEffect } from 'react';
import './Modals.css';

const EditWalletModal = ({ isOpen, onClose, onEdit, wallet, walletTypes }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    customType: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (wallet) {
      const isPredefined = walletTypes.some(t => t.value === wallet.type);
      setFormData({
        name: wallet.name,
        type: isPredefined ? wallet.type : 'Otro',
        customType: isPredefined ? '' : wallet.type
      });
    }
  }, [wallet, walletTypes]);

  if (!isOpen || !wallet) return null;

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

    onEdit({
      name: formData.name,
      type: finalType
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Editar Billetera</h2>
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
            <button type="submit" className="btn-edit-modal">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditWalletModal;
