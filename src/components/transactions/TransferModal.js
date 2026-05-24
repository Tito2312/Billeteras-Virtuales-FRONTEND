import React, { useState } from 'react';
import { toast } from '../../utils/toast';
import { transferToUser, getWalletByKey } from '../../API/transactions';
import { getCurrentUser } from '../../API/auth';
import { useLevelBenefits } from '../../hooks/useLevelBenefits';
import './Modals.css';

const TransferModal = ({ isOpen, onClose, wallets, selectedWallet, onSuccess }) => {
  const currentUser = getCurrentUser();
  const userId = currentUser?.id;
  const userLevel = currentUser?.nivel || currentUser?.level || 'Bronce';
  const benefits = useLevelBenefits(userLevel);

  const [formData, setFormData] = useState({
    sourceWalletId: selectedWallet?.id || wallets[0]?.id || '',
    destinationType: 'key',
    targetWalletId: '',
    transferKey: '',
    amount: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [destinationInfo, setDestinationInfo] = useState(null);
  const [verifying, setVerifying] = useState(false);

  if (!isOpen) return null;

  const selectedSourceWallet = wallets.find(w => w.id === formData.sourceWalletId);
  const amount = parseFloat(formData.amount) || 0;
  const commissionAmount = benefits.calculateCommission(amount);
  const receiverAmount = amount - commissionAmount;
  const totalDebit = amount;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const handleTransferKeyChange = async (key) => {
    setFormData({...formData, transferKey: key});
    setDestinationInfo(null);

    if (key.length > 5) {
      setVerifying(true);
      try {
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
    if (!formData.sourceWalletId) {
      newErrors.sourceWalletId = 'Selecciona billetera origen';
    }

    if (formData.destinationType === 'own') {
      if (!formData.targetWalletId) {
        newErrors.targetWalletId = 'Selecciona una billetera destino';
      }
      if (formData.sourceWalletId === formData.targetWalletId) {
        newErrors.targetWalletId = 'No puedes transferir a la misma billetera';
      }
    }

    if (formData.destinationType === 'key') {
      if (!formData.transferKey) {
        newErrors.transferKey = 'Ingresa la clave de la billetera destino';
      } else if (!destinationInfo?.exists) {
        newErrors.transferKey = destinationInfo?.message || 'Clave de billetera no válida';
      }
    }

    if (!amount || amount <= 0) {
      newErrors.amount = 'Ingresa un monto válido';
    } else if (amount > selectedSourceWallet?.balance) {
      newErrors.amount = `Monto excede el balance disponible (${formatCurrency(selectedSourceWallet?.balance)})`;
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
    let result;

    try {
      let transferKey;

      if (formData.destinationType === 'own') {
        const targetWallet = wallets.find(w => w.id === formData.targetWalletId);
        if (!targetWallet?.transferKey) {
          toast.error('La billetera destino no tiene clave de transferencia configurada');
          setLoading(false);
          return;
        }
        transferKey = targetWallet.transferKey;
      } else {
        transferKey = formData.transferKey;
      }

      result = await transferToUser(
        userId,
        formData.sourceWalletId,
        transferKey,
        amount
      );

      if (result.success) {
        toast.success(`Transferencia exitosa: ${formatCurrency(amount)}\n💰 Comisión: ${formatCurrency(commissionAmount)} (${benefits.formatCommissionRate()})\n📦 Destinatario recibe: ${formatCurrency(receiverAmount)}`);
        if (onSuccess) await onSuccess();
        onClose();
        setFormData({
          sourceWalletId: wallets[0]?.id || '',
          destinationType: 'key',
          targetWalletId: '',
          transferKey: '',
          amount: '',
          description: ''
        });
        setDestinationInfo(null);
      } else {
        toast.error(`Error al transferir: ${result.message}`);
      }
    } catch (error) {
      console.error('Error en transferencia:', error);
      toast.error(`Error al transferir: ${error.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
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
            <label>Desde billetera *</label>
            <select
              value={formData.sourceWalletId}
              onChange={(e) => setFormData({...formData, sourceWalletId: e.target.value})}
            >
              <option value="">Selecciona una billetera</option>
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
            <div className="destination-tabs">
              <button
                type="button"
                className={`destination-tab ${formData.destinationType === 'key' ? 'active' : ''}`}
                onClick={() => setFormData({...formData, destinationType: 'key', targetWalletId: ''})}
              >
                🔑 Por clave de billetera
              </button>
              <button
                type="button"
                className={`destination-tab ${formData.destinationType === 'own' ? 'active' : ''}`}
                onClick={() => setFormData({...formData, destinationType: 'own', transferKey: ''})}
              >
                💳 Mis billeteras
              </button>
            </div>
          </div>

          {formData.destinationType === 'key' && (
            <div className="form-group">
              <label>Clave de la billetera destino *</label>
              <div className="input-with-icon">
                <input
                  type="text"
                  value={formData.transferKey}
                  onChange={(e) => handleTransferKeyChange(e.target.value)}
                  placeholder="Ej: principal1091203166"
                  autoComplete="off"
                />
                {verifying && <span className="verifying-spinner">⏳ Verificando...</span>}
              </div>
              {errors.transferKey && <span className="error-text">{errors.transferKey}</span>}
              {destinationInfo && destinationInfo.exists && (
                <div className="destination-info success">
                  ✅ Billetera: <strong>{destinationInfo.name}</strong>
                </div>
              )}
              <small className="field-hint">La clave aparece en la tarjeta de cada billetera.</small>
            </div>
          )}

          {formData.destinationType === 'own' && (
            <div className="form-group">
              <label>Billetera destino *</label>
              <select
                value={formData.targetWalletId}
                onChange={(e) => setFormData({...formData, targetWalletId: e.target.value})}
              >
                <option value="">Selecciona una billetera...</option>
                {wallets.filter(w => w.id !== formData.sourceWalletId).map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} - {formatCurrency(w.balance)}
                  </option>
                ))}
              </select>
              {errors.targetWalletId && <span className="error-text">{errors.targetWalletId}</span>}
            </div>
          )}

          <div className="form-group">
            <label>Monto a transferir *</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder="0.00"
              step="0.01"
              min="0.01"
            />
            {errors.amount && <span className="error-text">{errors.amount}</span>}
          </div>

          {amount > 0 && selectedSourceWallet && (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: '12px',
              padding: '14px 16px',
              margin: '4px 0 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0'
            }}>
              {[
                { label: 'Monto enviado', value: formatCurrency(amount), color: '#111827' },
                { label: `Comisión (${benefits.formatCommissionRate()})`, value: formatCurrency(commissionAmount), color: '#d97706' },
                { label: 'El destinatario recibe', value: formatCurrency(receiverAmount), color: '#059669', bold: true },
              ].map(({ label, value, color, bold }, i, arr) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '7px 0',
                  borderBottom: i < arr.length - 1 ? '1px solid #dcfce7' : 'none',
                  fontSize: '13px'
                }}>
                  <span style={{ color: '#6b7280' }}>{label}</span>
                  <span style={{ color, fontWeight: bold ? 700 : 600, fontSize: bold ? '15px' : '13px' }}>{value}</span>
                </div>
              ))}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '9px 0 2px',
                borderTop: '2px solid #86efac',
                marginTop: '4px',
                fontSize: '13px'
              }}>
                <span style={{ color: '#374151', fontWeight: 600 }}>Total debitado</span>
                <span style={{ color: '#1e1b4b', fontWeight: 700, fontSize: '16px' }}>{formatCurrency(totalDebit)}</span>
              </div>
            </div>
          )}

          <div className="form-group" style={{ marginTop: '4px' }}>
            <label>Concepto <span style={{ fontWeight: 400, color: '#9ca3af' }}>(opcional)</span></label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Descripción de la transferencia"
            />
          </div>

          <div className="modal-buttons">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
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
