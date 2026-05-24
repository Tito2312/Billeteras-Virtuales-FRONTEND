import React, { useState } from 'react';
import { toast } from '../../utils/toast';
import { rechargeWallet } from '../../API/transactions';
import { getCurrentUser } from '../../API/auth';
import './Modals.css';

const RechargeModal = ({ isOpen, onClose, wallets, onSuccess }) => {
  const [formData, setFormData] = useState({
    walletId: wallets[0]?.id || '',
    amount: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const selectedWallet = wallets.find(w => w.id === formData.walletId);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.walletId) newErrors.walletId = 'Selecciona una billetera';
    if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Ingresa un monto válido';
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

    const result = await rechargeWallet(
      userId,
      formData.walletId,
      parseFloat(formData.amount)
    );

    if (result.success) {
      toast.success(`Recarga exitosa: ${formatCurrency(formData.amount)}`);
      if (onSuccess) onSuccess();
      onClose();
      setFormData({ walletId: wallets[0]?.id || '', amount: '' });
    } else {
      toast.error(`Error al recargar: ${result.message}`);
    }
    setLoading(false);
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
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder="0.00"
              step="0.01"
            />
            {errors.amount && <span className="error-text">{errors.amount}</span>}
          </div>

          <div className="modal-buttons">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-confirm" disabled={loading}>
              {loading ? 'Procesando...' : 'Confirmar Recarga'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RechargeModal;
