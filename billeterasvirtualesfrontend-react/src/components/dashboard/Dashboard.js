// Dashboard.js - Pantalla principal con carrusel de billeteras
// El carrusel muestra las billeteras con navegación por páginas

import React, { useState } from 'react';
import WalletCarousel from './WalletCarousel';
import './Dashboard.css';

const Dashboard = ({ user, onLogout, activeTab, onTabChange }) => {
  // Si activeTab no es dashboard, no mostramos nada
  if (activeTab !== 'dashboard') {
    return null;
  }
  
  // Datos de ejemplo para las billeteras
  const userWallets = [
    { id: 1, name: 'Principal', type: 'Gastos diarios', balance: 25430.50 },
    { id: 2, name: 'Ahorros', type: 'Ahorro', balance: 8920.00 },
    { id: 3, name: 'Inversión', type: 'Inversión', balance: 15600.75 },
    { id: 4, name: 'Viajes', type: 'Ahorro', balance: 3500.00 },
    { id: 5, name: 'Emergencias', type: 'Ahorro', balance: 12000.00 }
  ];

  // Transacciones recientes
  const recentTransactions = [
    { id: 1, type: 'recarga', description: 'Recarga desde tarjeta **** 4532', date: '8 abr, 10:30', amount: 500000, status: 'Completada', isPositive: true },
    { id: 2, type: 'transferencia', description: 'Transferencia a Juan Pérez', date: '7 abr, 15:45', amount: 120000, status: 'Completada', isPositive: false },
    { id: 3, type: 'recarga', description: 'Recarga desde tarjeta **** 1234', date: '6 abr, 09:15', amount: 300000, status: 'Completada', isPositive: true },
    { id: 4, type: 'pago', description: 'Pago suscripción Netflix', date: '5 abr, 18:30', amount: 49900, status: 'Completada', isPositive: false }
  ];

  // Datos del gráfico
  const chartData = [
    { day: '1 Abr', value: 48000 },
    { day: '2 Abr', value: 49500 },
    { day: '3 Abr', value: 51200 },
    { day: '4 Abr', value: 50800 },
    { day: '5 Abr', value: 52500 },
    { day: '6 Abr', value: 53000 },
    { day: '7 Abr', value: 52800 },
    { day: '8 Abr', value: 53151 }
  ];

  const maxValue = Math.max(...chartData.map(d => d.value));
  const totalBalance = userWallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  const changePercentage = 12.5;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('es-CO').format(value);
  };

  const handleAction = (action) => {
    alert(`🔔 Función "${action}"\n\nPróximamente se conectará con el backend`);
  };

  return (
    <div className="dashboard-main-content">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-welcome">
          <h1>Bienvenido, {user.nombre?.split(' ')[0] || user.nombre}</h1>
          <div className="user-badge">
            <span className="badge-level">{user.nivel}</span>
            <span className="badge-points">{formatNumber(user.puntos)} puntos</span>
          </div>
        </div>
        <div className="header-actions">
          <button className="icon-btn" onClick={() => handleAction('Notificaciones')}>🔔</button>
          <button className="icon-btn" onClick={onLogout}>🚪</button>
        </div>
      </header>

      {/* Tarjetas de estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Balance Total</h3>
            <p className="stat-value">{formatCurrency(totalBalance)}</p>
            <span className="stat-change positive">+{changePercentage}% este mes</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💳</div>
          <div className="stat-info">
            <h3>Billeteras Activas</h3>
            <p className="stat-value">{userWallets.length}</p>
            <span className="stat-sub">Todas operativas</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <h3>Puntos Acumulados</h3>
            <p className="stat-value">{formatNumber(user.puntos)}</p>
            <span className="stat-sub">Nivel {user.nivel}</span>
          </div>
        </div>
      </div>

      {/* Mis Billeteras con CARRUSEL */}
      <div className="wallets-section">
        <div className="section-header">
          <h2>Mis Billeteras</h2>
          <button className="add-wallet-btn" onClick={() => onTabChange('wallets')}>
            + Administrar
          </button>
        </div>
        <WalletCarousel wallets={userWallets} />
      </div>

      {/* Gráfico de evolución */}
      <div className="chart-section">
        <div className="section-header">
          <h2>Evolución del Balance</h2>
          <span className="trend positive">▲ Tendencia positiva</span>
        </div>
        <div className="chart-container">
          <div className="chart-bars">
            {chartData.map((item, index) => (
              <div key={index} className="chart-bar-wrapper">
                <div 
                  className="chart-bar"
                  style={{ height: `${(item.value / maxValue) * 100}%` }}
                >
                  <span className="chart-tooltip">{formatCurrency(item.value)}</span>
                </div>
                <span className="chart-label">{item.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transacciones Recientes */}
      <div className="transactions-section">
        <div className="section-header">
          <h2>Transacciones Recientes</h2>
          <button className="view-all" onClick={() => handleAction('Ver todas')}>Ver todas →</button>
        </div>
        <div className="transactions-list">
          {recentTransactions.map(transaction => (
            <div key={transaction.id} className="transaction-item">
              <div className="transaction-icon">
                {transaction.type === 'recarga' ? '📥' : transaction.type === 'transferencia' ? '🔄' : '💳'}
              </div>
              <div className="transaction-info">
                <p className="transaction-description">{transaction.description}</p>
                <span className="transaction-date">{transaction.date}</span>
              </div>
              <div className="transaction-amount">
                <span className={transaction.isPositive ? 'positive' : 'negative'}>
                  {transaction.isPositive ? '+' : '-'}{formatCurrency(transaction.amount)}
                </span>
                <span className="transaction-status">{transaction.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;