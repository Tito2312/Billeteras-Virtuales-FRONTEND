import React, { useState } from 'react';
import { getCurrentUser } from '../../API/auth';
import './Modals.css';

const CreateScheduledModal = ({ isOpen, onClose, onCreate, wallets }) => {
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

  if (!isOpen) return null;

  const transactionTypes = [
    { value: 'RECHARGE', label: 'Recarga automática', icon: '📥', requiresSource: false, requiresTarget: true },
    { value: 'WITHDRAWAL', label: 'Retiro programado', icon: '📤', requiresSource: true, requiresTarget: false },
    { value: 'TRANSFER', label: 'Transferencia programada', icon: '🔄', requiresSource: true, requiresTarget: false, requiresKey: true }
  ];

  const selectedType = transactionTypes.find(t => t.value === formData.type);

  const handleTransferKeyChange = async (key) => {
    setFormData({...formData, transferKey: key});
    setDestinationInfo(null);

    if (key.length > 5) {
      setVerifying(true);
      try {
        const { getWalletByKey } = await import('../../API/transactions');
        const result = await getWalletByKey(key);
        if (result.success && result.data) {
          setDestinationInfo({
            name: result.data.name,
            exists: true,
            walletId: result.data.id
          });
        } else {
          setDestinationInfo({ 
            exists: false, 
            message: result.message || 'Clave no válida o billetera no encontrada' 
          });
        }
      } catch (error) {
        console.error('Error verificando clave:', error);
        setDestinationInfo({ exists: false, message: 'Error al verificar la clave' });
      }
      setVerifying(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.type) newErrors.type = 'Selecciona un tipo de operación';

    if (formData.type === 'TRANSFER') {
      if (!formData.sourceWalletId) newErrors.sourceWalletId = 'Selecciona billetera origen';

      if (formData.destinationType === 'misWallets') {
        if (!formData.targetWalletId) newErrors.targetWalletId = 'Selecciona billetera destino';
        if (formData.sourceWalletId === formData.targetWalletId) {
          newErrors.targetWalletId = 'No puedes transferir a la misma billetera';
        }
      } else {
        if (!formData.transferKey) newErrors.transferKey = 'Ingresa la clave de la billetera destino';
        if (!destinationInfo?.exists) newErrors.transferKey = 'Clave de billetera no válida';
      }
    }

    if (formData.type === 'WITHDRAWAL') {
      if (!formData.sourceWalletId) newErrors.sourceWalletId = 'Selecciona billetera origen';
    }

    if (formData.type === 'RECHARGE') {
      if (!formData.targetWalletId) newErrors.targetWalletId = 'Selecciona billetera destino';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Ingresa un monto válido mayor a 0';
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
      transferKey: '',
      amount: '',
      scheduledDate: '',
      scheduledTime: '12:00'
    });
    setErrors({});
    setDestinationInfo(null);
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

      if (!userId) throw new Error('No se encontró el usuario');

      const [year, month, day] = formData.scheduledDate.split('-');
      const [hour, minute] = formData.scheduledTime.split(':');
      const scheduledDateTime = new Date(year, month - 1, day, hour, minute);

      const amountNum = parseFloat(formData.amount);

      let operationData = {};

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
              transferKey: formData.transferKey,
              type: formData.type,
              amount: amountNum,
              scheduledDate: scheduledDateTime.toISOString()
            };
          }
          break;

        default:
          throw new Error('Tipo de operación no válido');
      }

      console.log('📤 Enviando operación programada:', operationData);
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
      style: 'currency', currency: 'COP',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

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
                transferKey: ''
              })}
              disabled={loading}
            >
              {transactionTypes.map(t => (
                <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
              ))}
            </select>
            {errors.type && <span className="error-text">{errors.type}</span>}
          </div>

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
                <label className="section-label">Tipo de destino</label>
                <div className="destination-cards">
                  <div 
                    className={`destination-card ${formData.destinationType === 'misWallets' ? 'selected' : ''}`}
                    onClick={() => setFormData({
                      ...formData, 
                      destinationType: 'misWallets',
                      transferKey: ''
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
                    <div className="destination-icon">🔑</div>
                    <div className="destination-info">
                      <h4>Por clave de billetera</h4>
                      <p>Transferir usando la clave única de la billetera destino</p>
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
                <div className="form-group">
                  <label>Clave de la billetera destino *</label>
                  <div className="input-with-icon">
                    <input
                      type="text"
                      value={formData.transferKey}
                      onChange={(e) => handleTransferKeyChange(e.target.value)}
                      placeholder="Ej: principal1091203166"
                      disabled={loading}
                    />
                    {verifying && <span className="verifying-spinner">⏳ Verificando...</span>}
                  </div>
                  {errors.transferKey && <span className="error-text">{errors.transferKey}</span>}
                  {destinationInfo && destinationInfo.exists && (
                    <div className="destination-info success">
                      ✅ Billetera: <strong>{destinationInfo.name}</strong>
                    </div>
                  )}
                  {destinationInfo && !destinationInfo.exists && (
                    <div className="destination-info error">
                      ❌ {destinationInfo.message}
                    </div>
                  )}
                  <small className="field-hint">
                    La clave aparece en la tarjeta de cada billetera. Pídesela a la persona.
                  </small>
                </div>
              )}
            </>
          )}

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
