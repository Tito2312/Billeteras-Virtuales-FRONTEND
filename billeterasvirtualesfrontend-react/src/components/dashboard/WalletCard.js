// WalletCard.js - Tarjeta de billetera versión profesional y estable

import React from 'react';
import './WalletCard.css';

const WalletCard = ({ name, type, balance }) => {
  // Obtener iniciales para el ícono minimalista
  const getInitials = () => {
    if (name === 'Principal') return 'PP';
    if (name === 'Ahorros') return 'AH';
    if (name === 'Inversión') return 'IN';
    if (name === 'Viajes') return 'VJ';
    return name.substring(0, 2).toUpperCase();
  };

  // Formatear moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Formatear tipo de billetera
  const formatType = (type) => {
    const types = {
      'Ahorro': 'Cuenta de ahorro',
      'Gastos diarios': 'Gastos diarios',
      'Compras': 'Compras online',
      'Transporte': 'Movilidad',
      'Inversión': 'Portafolio inversión'
    };
    return types[type] || type;
  };

  const handleAction = (action) => {
    alert(`🔔 ${action} - ${name}\n\nPróximamente se conectará con el backend`);
  };

  return (
    <div className="wallet-card">
      <div className="wallet-card-header">
        <div className="wallet-icon-minimal">
          <span>{getInitials()}</span>
        </div>
        <div className="wallet-info">
          <h4 className="wallet-name">{name}</h4>
          <p className="wallet-type">{formatType(type)}</p>
        </div>
      </div>
      
      <div className="wallet-balance">
        <span className="balance-label">BALANCE DISPONIBLE</span>
        <span className="balance-value">{formatCurrency(balance)}</span>
      </div>
      
      <div className="wallet-actions">
        <button className="wallet-btn recargar" onClick={() => handleAction('Recargar')}>
          Recargar
        </button>
        <button className="wallet-btn transferir" onClick={() => handleAction('Transferir')}>
          Transferir
        </button>
        <button className="wallet-btn retirar" onClick={() => handleAction('Retirar')}>
          Retirar
        </button>
      </div>
    </div>
  );
};

export default WalletCard;