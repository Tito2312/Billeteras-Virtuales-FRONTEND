// WalletCard.js - Tarjeta individual para mostrar cada billetera
// Es reutilizable, podemos usarla para cada billetera que tenga el usuario

import React from 'react';
import './WalletCard.css';

const WalletCard = ({ name, type, balance, color = 'purple' }) => {
  // Ícono según el tipo de billetera
  const getIcon = () => {
    switch (type) {
      case 'Ahorro':
        return '🏦';
      case 'Gastos diarios':
        return '☕';
      case 'Compras':
        return '🛍️';
      case 'Transporte':
        return '🚗';
      case 'Inversión':
        return '📈';
      default:
        return '💳';
    }
  };

  // Formatear número a moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className={`wallet-card wallet-card-${color}`}>
      <div className="wallet-card-header">
        <div className="wallet-icon">{getIcon()}</div>
        <div className="wallet-info">
          <h4 className="wallet-name">{name}</h4>
          <p className="wallet-type">{type}</p>
        </div>
      </div>
      <div className="wallet-balance">
        <span className="balance-label">Balance disponible</span>
        <span className="balance-value">{formatCurrency(balance)}</span>
      </div>
      <div className="wallet-actions">
        <button className="wallet-btn recargar">➕ Recargar</button>
        <button className="wallet-btn transferir">↗️ Transferir</button>
      </div>
    </div>
  );
};

export default WalletCard;