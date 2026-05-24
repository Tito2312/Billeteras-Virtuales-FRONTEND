import React, { useState, useEffect } from 'react';
import { getAvailableBenefits, redeemBenefit } from '../../../API/rewards';
import { getCurrentUser } from '../../../API/auth';
import { getUserWallets } from '../../../API/wallets';
import './RewardsModal.css';

const RewardsModal = ({ isOpen, onClose, onRedeem, userPoints, userLevel }) => {
  const [benefits, setBenefits] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [selectedBenefit, setSelectedBenefit] = useState(null);
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingBenefits, setLoadingBenefits] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const userId = getCurrentUser()?.id;

  useEffect(() => {
    if (isOpen) {
      loadData();
      setSelectedBenefit(null);
      setSelectedWalletId('');
      setError('');
      setSuccess(null);
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoadingBenefits(true);
    const [benefitsRes, walletsRes] = await Promise.all([
      getAvailableBenefits(),
      getUserWallets(userId)
    ]);
    if (benefitsRes.success) setBenefits(benefitsRes.data);
    if (walletsRes.success && walletsRes.data) {
      const active = walletsRes.data.filter(w => w.active !== false);
      setWallets(active);
      if (active.length > 0) setSelectedWalletId(active[0].id);
    }
    setLoadingBenefits(false);
  };

  const formatCurrency = (v) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v || 0);

  const formatNumber = (v) =>
    new Intl.NumberFormat('es-CO').format(v || 0);

  const handleRedeem = async () => {
    if (!selectedBenefit) return;
    setLoading(true);
    setError('');
    const res = await redeemBenefit(userId, selectedBenefit.id, selectedWalletId);
    if (res.success) {
      setSuccess(selectedBenefit);
      if (onRedeem) onRedeem({ benefit: selectedBenefit, pointsSpent: selectedBenefit.pointsCost });
    } else {
      setError(res.message || 'Error al canjear el beneficio');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-rewards" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <div className="rewards-icon-wrapper">
            <span className="rewards-icon">🎁</span>
          </div>
          <h2>Canjear Beneficios</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">

          <div className="points-available-card">
            <span className="points-label">Tus puntos disponibles</span>
            <span className="points-value">{formatNumber(userPoints)}</span>
            <span className="points-level">Nivel {userLevel}</span>
          </div>

          {success && (
            <div className="benefit-success-card">
              <div className="benefit-success-icon">✅</div>
              <div>
                <strong>¡Beneficio canjeado!</strong>
                <p>{success.name} — <strong>{formatCurrency(success.moneyValue)}</strong> acreditados a tu billetera</p>
              </div>
            </div>
          )}

          {!success && (
            <div className="benefits-list-modal">
              <h3>Beneficios disponibles</h3>
              {loadingBenefits ? (
                <div style={{ textAlign: 'center', padding: 24, color: '#6b7280' }}>Cargando beneficios...</div>
              ) : benefits.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 24, color: '#6b7280' }}>
                  No hay beneficios disponibles
                </div>
              ) : (
                <div className="benefits-grid-modal">
                  {benefits.map(benefit => {
                    const canAfford = userPoints >= benefit.pointsCost;
                    const isSelected = selectedBenefit?.id === benefit.id;
                    return (
                      <div
                        key={benefit.id}
                        className={`benefit-card ${isSelected ? 'selected' : ''} ${!canAfford ? 'insufficient' : ''}`}
                        onClick={() => canAfford && setSelectedBenefit(benefit)}
                      >
                        <div className="benefit-icon-modal">💰</div>
                        <div className="benefit-info-modal">
                          <div className="benefit-name">{benefit.name}</div>
                          <div className="benefit-desc-modal">{benefit.description}</div>
                          <div className="benefit-money-value">
                            {formatCurrency(benefit.moneyValue)} en tu billetera
                          </div>
                          <div className="benefit-cost">
                            <span className="cost-value">{formatNumber(benefit.pointsCost)} pts</span>
                            {!canAfford && <span className="insufficient-tag"> puntos insuficientes</span>}
                          </div>
                        </div>
                        {isSelected && <div className="selected-check-modal">✓</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {selectedBenefit && !success && (
            <div className="redemption-summary">
              <h4>Resumen del canje</h4>
              <div className="summary-row">
                <span>Beneficio:</span>
                <strong>{selectedBenefit.name}</strong>
              </div>
              <div className="summary-row">
                <span>Recibirás:</span>
                <strong style={{ color: '#059669' }}>{formatCurrency(selectedBenefit.moneyValue)}</strong>
              </div>
              <div className="summary-row">
                <span>Costo:</span>
                <strong className="cost-highlight">{formatNumber(selectedBenefit.pointsCost)} puntos</strong>
              </div>
              <div className="summary-row">
                <span>Puntos restantes:</span>
                <span>{formatNumber(userPoints - selectedBenefit.pointsCost)} puntos</span>
              </div>
              <div className="summary-row" style={{ marginTop: 10 }}>
                <span>Billetera destino:</span>
                <select
                  className="wallet-select-redeem"
                  value={selectedWalletId}
                  onChange={e => setSelectedWalletId(e.target.value)}
                >
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name || w.walletType} — Saldo: {formatCurrency(w.balance)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {error && <div className="reversal-error"><span>⚠️ {error}</span></div>}
        </div>

        <div className="modal-buttons modal-rewards-buttons">
          <button type="button" className="btn-cancel" onClick={onClose}>
            {success ? 'Cerrar' : 'Cancelar'}
          </button>
          {!success && (
            <button
              type="button"
              className="btn-redeem"
              onClick={handleRedeem}
              disabled={loading || !selectedBenefit}
            >
              {loading ? 'Procesando...' : 'Canjear Beneficio'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default RewardsModal;
