// WalletCard.js - Tarjeta de billetera para el Dashboard (recibe props directas)

import React from 'react';
import './WalletCard.css';

const WalletCard = ({ name, type, balance, color = 'purple' }) => {
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const getInitials = (name) => {
    if (!name) return '??';
    if (name === 'Principal') return 'PP';
    if (name === 'Ahorros') return 'AH';
    if (name === 'Inversión') return 'IN';
    if (name === 'Viajes') return 'VJ';
    if (name === 'Emergencias') return 'EM';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className={`wallet-card wallet-card-${color}`}>
      <div className="wallet-card-header">
        <div className="wallet-icon-minimal">
          <span>{getInitials(name)}</span>
        </div>
        <div className="wallet-info">
          <h4 className="wallet-name">{name}</h4>
          <p className="wallet-type">{type}</p>
        </div>
      </div>
      <div className="wallet-balance">
        <span className="balance-label">BALANCE DISPONIBLE</span>
        <span className="balance-value">{formatCurrency(balance)}</span>
      </div>
      <div className="wallet-actions">
        <button className="wallet-btn recargar">Recargar</button>
        <button className="wallet-btn transferir">Transferir</button>
        <button className="wallet-btn retirar">Retirar</button>
      </div>
    </div>
  );
};

export default WalletCard;