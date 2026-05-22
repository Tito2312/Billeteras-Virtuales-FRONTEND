// WalletCard.js - Tarjeta de billetera para el Dashboard

import React, { useState } from 'react';
import './WalletCard.css';

const WalletCard = ({ name, type, balance, color = 'purple', walletId, transferKey, onRecharge, onTransfer, onWithdraw }) => {
  
  const [copied, setCopied] = useState(false);
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP',
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRecharge = () => {
    if (onRecharge) onRecharge();
  };

  const handleTransfer = () => {
    if (onTransfer) onTransfer();
  };

  const handleWithdraw = () => {
    if (onWithdraw) onWithdraw();
  };

  // Si no hay transferKey, no mostrar la sección
  const hasTransferKey = transferKey && transferKey !== 'null' && transferKey !== '';

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
      
      {/* CLAVE DE LA BILLETERA - MEJORADA */}
      {hasTransferKey && (
        <div className="wallet-transfer-key">
          <div className="key-header">
            <span className="key-label">🔑 Clave de la billetera</span>
          </div>
          <div className="key-content">
            <span className="key-value">{transferKey}</span>
            <button 
              className="btn-copy-key" 
              onClick={() => copyToClipboard(transferKey)}
              title="Copiar clave"
            >
              {copied ? '✓ Copiado' : '📋 Copiar'}
            </button>
          </div>
        </div>
      )}
      
      <div className="wallet-balance">
        <span className="balance-label">BALANCE DISPONIBLE</span>
        <span className="balance-value">{formatCurrency(balance)}</span>
      </div>
      <div className="wallet-actions">
        <button className="wallet-btn recargar" onClick={handleRecharge}>
          Recargar
        </button>
        <button className="wallet-btn transferir" onClick={handleTransfer}>
          Transferir
        </button>
        <button className="wallet-btn retirar" onClick={handleWithdraw}>
          Retirar
        </button>
      </div>
    </div>
  );
};

export default WalletCard;