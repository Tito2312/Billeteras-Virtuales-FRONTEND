// Dashboard.js - Pantalla principal después del login
// Muestra: balance total, billeteras, gráfico, transacciones recientes

import React, { useState } from 'react';  // SOLO UNA VEZ, al inicio del archivo
import Sidebar from './Sidebar';
import WalletCard from './WalletCard';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Datos de ejemplo para las billeteras del usuario
  // Estos datos deberían venir de una base de datos en el futuro
  const userWallets = [
    { id: 1, name: 'Principal', type: 'Gastos diarios', balance: 25430.50, color: 'purple' },
    { id: 2, name: 'Ahorros', type: 'Ahorro', balance: 8920.00, color: 'light' },
    { id: 3, name: 'Inversión', type: 'Inversión', balance: 15600.75, color: 'dark' }
  ];

  // Datos de ejemplo para transacciones recientes
  const recentTransactions = [
    { id: 1, type: 'recarga', description: 'Recarga desde tarjeta **** 4532', date: '8 abr, 10:30', amount: 500, status: 'Completada', isPositive: true },
    { id: 2, type: 'transferencia', description: 'Transferencia interna', date: '7 abr, 15:45', amount: 1200, status: 'Completada', isPositive: false },
    { id: 3, type: 'recarga', description: 'Recarga desde tarjeta **** 1234', date: '6 abr, 09:15', amount: 300, status: 'Completada', isPositive: true },
    { id: 4, type: 'pago', description: 'Pago suscripción Netflix', date: '5 abr, 18:30', amount: 49900, status: 'Completada', isPositive: false }
  ];

  // Datos para el gráfico de evolución (balance por día)
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
  
  // Calcular balance total sumando todas las billeteras
  const totalBalance = userWallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  
  // Calcular porcentaje de cambio (simulado)
  const changePercentage = 12.5;

  // Formatear moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Formatear número con puntos
  const formatNumber = (value) => {
    return new Intl.NumberFormat('es-CO').format(value);
  };

  // Manejar acciones de los botones (solo UI por ahora)
  const handleAction = (action) => {
    alert(`🔔 Función "${action}" - Próximamente se conectará con el backend`);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="dashboard-main-content">
        {/* Header superior */}
        <header className="dashboard-header">
          <div className="header-welcome">
            <h1>Bienvenid@, {user.nombre?.split(' ')[0] || user.nombre}</h1>
            <p>Nivel {user.nivel} • {formatNumber(user.puntos)} puntos</p>
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

        {/* Botones de acción rápidos */}
        <div className="action-buttons">
          <button className="action-btn recargar" onClick={() => handleAction('Recargar')}>
            ⬇️ Recargar
          </button>
          <button className="action-btn transferir" onClick={() => handleAction('Transferir')}>
            📂 Transferir
          </button>
          <button className="action-btn retirar" onClick={() => handleAction('Retirar')}>
            ⏳ Retirar
          </button>
        </div>

        {/* Sección: Mis Billeteras y Gráfico */}
        <div className="two-columns">
          {/* Columna izquierda: Mis Billeteras */}
          <div className="wallets-section">
            <div className="section-header">
              <h2>Mis Billeteras</h2>
              <button className="add-wallet-btn" onClick={() => handleAction('Agregar Billetera')}>+ Nueva</button>
            </div>
            <div className="wallets-grid">
              {userWallets.map(wallet => (
                <WalletCard
                  key={wallet.id}
                  name={wallet.name}
                  type={wallet.type}
                  balance={wallet.balance}
                  color={wallet.color}
                />
              ))}
            </div>
          </div>

          {/* Columna derecha: Evolución del Balance (Gráfico) */}
          <div className="chart-section">
            <div className="section-header">
              <h2>Evolución del Balance</h2>
              <span className="trend positive">📈 Tendencia positiva</span>
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
        </div>

        {/* Sección: Transacciones Recientes */}
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
    </div>
  );
};

export default Dashboard;