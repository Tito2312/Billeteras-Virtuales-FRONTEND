import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../../API/auth';
import './Modals.css';

const EditScheduledModal = ({ isOpen, onClose, onEdit, operation, wallets }) => {
  const [formData, setFormData] = useState({
    type: 'RECHARGE',
    sourceWalletId: '',
    destinationType: 'misWallets',
    targetWalletId: '',
    transferKey: '',
    amount: '',
    scheduledDate: '',
    scheduledTime: '12:00'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [destinationInfo, setDestinationInfo] = useState(null);

  useEffect(() => {
    if (operation && isOpen) {
      const date = new Date(operation.scheduledDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      setFormData({
        type: operation.type || 'RECHARGE',
        sourceWalletId: operation.sourceWalletId || '',
        destinationType: operation.targetWalletId ? 'misWallets' : (operation.transferKey ? 'otroUsuario' : 'misWallets'),
        targetWalletId: operation.targetWalletId || '',
        transferKey: operation.transferKey || '',
        amount: operation.amount?.toString() || '',
        scheduledDate: `${year}-${month}-${day}`,
        scheduledTime: `${hours}:${minutes}`
      });
      setDestinationInfo(null);
    }
  }, [operation, isOpen]);

  if (!isOpen || !operation) return null;

  const transactionTypes = [
    { value: 'RECHARGE', label: 'Recarga automática', icon: '📥' },
    { value: 'WITHDRAWAL', label: 'Retiro programado', icon: '📤' },
    { value: 'TRANSFER', label: 'Transferencia programada', icon: '🔄' }
  ];

  const handleTransferKeyChange = async (key) => {
    setFormData({...formData, transferKey: key});
    setDestinationInfo(null);
    if (key.length > 5) {
      setVerifying(true);
      try {
        const { getWalletByKey } = await import('../../API/transactions');
        const result = await getWalletByKey(key);
        if (result.success && result.data) {
          setDestinationInfo({ name: result.data.name, exists: true });
        } else {
          setDestinationInfo({ exists: false, message: 'Clave no válida' });
        }
      } catch (error) {
        setDestinationInfo({ exists: false, message: 'Error al verificar' });
      }
      setVerifying(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (formData.type === 'TRANSFER') {
      if (!formData.sourceWalletId) newErrors.sourceWalletId = 'Selecciona origen';
      if (formData.destinationType === 'misWallets' && !formData.targetWalletId) newErrors.targetWalletId = 'Selecciona destino';
      if (formData.destinationType === 'otroUsuario' && !formData.transferKey) newErrors.transferKey = 'Ingresa clave';
      if (formData.destinationType === 'otroUsuario' && !destinationInfo?.exists) newErrors.transferKey = 'Clave inválida';
    }
    if (formData.type === 'WITHDRAWAL' && !formData.sourceWalletId) newErrors.sourceWalletId = 'Selecciona origen';
    if (formData.type === 'RECHARGE' && !formData.targetWalletId) newErrors.targetWalletId = 'Selecciona destino';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Monto inválido';
    if (!formData.scheduledDate) newErrors.scheduledDate = 'Fecha requerida';
    else {
      const today = new Date().toISOString().split('T')[0];
      if (formData.scheduledDate < today) newErrors.scheduledDate = 'Fecha pasada';
    }
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
    try {
      const currentUser = getCurrentUser();
      const userId = currentUser?.id;
      if (!userId) throw new Error('Usuario no encontrado');

      const [year, month, day] = formData.scheduledDate.split('-');
      const [hour, minute] = formData.scheduledTime.split(':');
      const scheduledDateTime = new Date(year, month - 1, day, hour, minute);
      const amountNum = parseFloat(formData.amount);

      let operationData = { userId, type: formData.type, amount: amountNum, scheduledDate: scheduledDateTime.toISOString() };

      if (formData.type === 'RECHARGE') operationData.targetWalletId = formData.targetWalletId;
      else if (formData.type === 'WITHDRAWAL') operationData.sourceWalletId = formData.sourceWalletId;
      else if (formData.type === 'TRANSFER') {
        operationData.sourceWalletId = formData.sourceWalletId;
        if (formData.destinationType === 'misWallets') operationData.targetWalletId = formData.targetWalletId;
        else operationData.transferKey = formData.transferKey;
      }

      await onEdit(operation.id, operationData);
      onClose();
    } catch (error) {
      alert('Error al editar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value || 0);
  const getMinDate = () => new Date().toISOString().split('T')[0];
  const getDestinationWallets = () => wallets.filter(w => w.id !== formData.sourceWalletId);

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
            <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
              {transactionTypes.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
            </select>
          </div>

          {formData.type === 'TRANSFER' && (
            <>
              <div className="form-group">
                <label>Desde billetera *</label>
                <select value={formData.sourceWalletId} onChange={(e) => setFormData({...formData, sourceWalletId: e.target.value})}>
                  <option value="">Selecciona...</option>
                  {wallets.map(w => <option key={w.id} value={w.id}>{w.name} - {formatCurrency(w.balance)}</option>)}
                </select>
                {errors.sourceWalletId && <span className="error-text">{errors.sourceWalletId}</span>}
              </div>
              <div className="form-group">
                <label>Tipo de destino</label>
                <div className="destination-cards">
                  <div className={`destination-card ${formData.destinationType === 'misWallets' ? 'selected' : ''}`} onClick={() => setFormData({...formData, destinationType: 'misWallets', transferKey: ''})}>
                    <div className="destination-icon">💳</div><div>Mis billeteras</div>
                  </div>
                  <div className={`destination-card ${formData.destinationType === 'otroUsuario' ? 'selected' : ''}`} onClick={() => setFormData({...formData, destinationType: 'otroUsuario', targetWalletId: ''})}>
                    <div className="destination-icon">🔑</div><div>Por clave de billetera</div>
                  </div>
                </div>
              </div>
              {formData.destinationType === 'misWallets' && (
                <div className="form-group">
                  <label>Billetera destino *</label>
                  <select value={formData.targetWalletId} onChange={(e) => setFormData({...formData, targetWalletId: e.target.value})}>
                    <option value="">Selecciona...</option>
                    {getDestinationWallets().map(w => <option key={w.id} value={w.id}>{w.name} - {formatCurrency(w.balance)}</option>)}
                  </select>
                  {errors.targetWalletId && <span className="error-text">{errors.targetWalletId}</span>}
                </div>
              )}
              {formData.destinationType === 'otroUsuario' && (
                <div className="form-group">
                  <label>Clave destino *</label>
                  <input type="text" value={formData.transferKey} onChange={(e) => handleTransferKeyChange(e.target.value)} placeholder="Ej: principal123" />
                  {verifying && <span>Verificando...</span>}
                  {destinationInfo?.exists && <div className="success">✅ Billetera: {destinationInfo.name}</div>}
                  {errors.transferKey && <span className="error-text">{errors.transferKey}</span>}
                </div>
              )}
            </>
          )}

          {formData.type === 'WITHDRAWAL' && (
            <div className="form-group">
              <label>Billetera origen *</label>
              <select value={formData.sourceWalletId} onChange={(e) => setFormData({...formData, sourceWalletId: e.target.value})}>
                {wallets.map(w => <option key={w.id} value={w.id}>{w.name} - {formatCurrency(w.balance)}</option>)}
              </select>
              {errors.sourceWalletId && <span className="error-text">{errors.sourceWalletId}</span>}
            </div>
          )}

          {formData.type === 'RECHARGE' && (
            <div className="form-group">
              <label>Billetera destino *</label>
              <select value={formData.targetWalletId} onChange={(e) => setFormData({...formData, targetWalletId: e.target.value})}>
                {wallets.map(w => <option key={w.id} value={w.id}>{w.name} - {formatCurrency(w.balance)}</option>)}
              </select>
              {errors.targetWalletId && <span className="error-text">{errors.targetWalletId}</span>}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Fecha *</label>
              <input type="date" value={formData.scheduledDate} onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})} min={getMinDate()} />
              {errors.scheduledDate && <span className="error-text">{errors.scheduledDate}</span>}
            </div>
            <div className="form-group">
              <label>Hora</label>
              <input type="time" value={formData.scheduledTime} onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})} />
            </div>
          </div>

          <div className="form-group">
            <label>Monto *</label>
            <input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
            {errors.amount && <span className="error-text">{errors.amount}</span>}
          </div>

          <div className="modal-buttons">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-confirm" disabled={loading}>{loading ? 'Guardando...' : 'Guardar Cambios'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditScheduledModal;
