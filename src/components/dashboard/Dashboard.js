// Dashboard.js - Pantalla principal (con gráfico basado en transacciones reales)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WalletCarousel from './walletCarousel/WalletCarousel';
import UserMenu from '../common/UserMenu';
import NotificationBell from '../notifications/notificationBell/NotificationBell';
import { getUserWallets } from '../../API/wallets';
import { getUserTransactions } from '../../API/transactions';
import { getCurrentUser } from '../../API/auth';
import './Dashboard.css';

const Dashboard = ({ user, onLogout, activeTab, onTabChange }) => {
  const navigate = useNavigate();
  const [userWallets, setUserWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);
  const [chartData, setChartData] = useState([]);
  
  const userId = user?.id || getCurrentUser()?.id;
  
  // Cargar billeteras y transacciones
  useEffect(() => {
    const loadData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      // Cargar billeteras
      const walletsResult = await getUserWallets(userId);
      let wallets = [];
      if (walletsResult.success && walletsResult.data) {
        wallets = walletsResult.data;
        setUserWallets(wallets);
        const total = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);
        setTotalBalance(total);
      }
      
      // Cargar transacciones
      const transResult = await getUserTransactions(userId);
      let trans = [];
      if (transResult.success && transResult.data) {
        trans = transResult.data;
        setTransactions(trans);
      }
      
      // Calcular evolución del balance
      calculateBalanceEvolution(trans, wallets);
      
      setLoading(false);
    };
    
    loadData();
  }, [userId]);
  
  // Calcular la evolución del balance por día
  const calculateBalanceEvolution = (transactions, wallets) => {
    // Si no hay transacciones, usar el balance actual
    const currentBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);
    const last7Days = getLast7Days();
    
    if (!transactions || transactions.length === 0) {
      const evolution = last7Days.map(day => ({
        day: day.label,
        value: currentBalance
      }));
      setChartData(evolution);
      return;
    }
    
    // Ordenar transacciones por fecha
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(a.createdAt) - new Date(b.createdAt)
    );
    
    // Calcular balance acumulado por día
    const balanceByDay = {};
    
    // Inicializar todos los días
    last7Days.forEach(day => {
      balanceByDay[day.date] = 0;
    });
    
    // Para cada día, calcular el balance sumando todas las transacciones hasta esa fecha
    for (const day of last7Days) {
      let dayBalance = 0;
      const dayEnd = new Date(day.date + 'T23:59:59');
      
      for (const trans of sortedTransactions) {
        const transDate = new Date(trans.createdAt);
        
        if (transDate <= dayEnd) {
          // Determinar si la transacción afecta al usuario
          let affectsUser = false;
          let amountToAdd = 0;
          
          // Transacción de recarga - aumenta el balance
          if (trans.type === 'RECHARGE') {
            affectsUser = true;
            amountToAdd = trans.amount;
          }
          // Transacción de retiro - disminuye el balance
          else if (trans.type === 'WITHDRAWAL') {
            affectsUser = true;
            amountToAdd = -trans.amount;
          }
          // Transferencia - puede ser enviada o recibida
          else if (trans.type === 'TRANSFER') {
            if (trans.userId === userId) {
              // El usuario envió dinero
              affectsUser = true;
              amountToAdd = -trans.amount;
            } else if (trans.receiverUserId === userId) {
              // El usuario recibió dinero
              affectsUser = true;
              amountToAdd = trans.amount;
            }
          }
          
          if (affectsUser) {
            dayBalance += amountToAdd;
          }
        }
      }
      
      balanceByDay[day.date] = dayBalance;
    }
    
    // Convertir a formato para el gráfico
    const evolution = last7Days.map(day => ({
      day: day.label,
      value: Math.max(balanceByDay[day.date], 0)
    }));
    
    setChartData(evolution);
  };
  
  // Obtener últimos 7 días con formato
  const getLast7Days = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const label = `${date.getDate()} ${getMonthName(date.getMonth())}`;
      days.push({ date: dateStr, label });
    }
    
    return days;
  };
  
  const getMonthName = (month) => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return months[month];
  };
  
  // Transacciones recientes (últimas 5)
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map(t => ({
      id: t.id,
      type: t.type === 'RECHARGE' ? 'recarga' : t.type === 'WITHDRAWAL' ? 'retiro' : 'transferencia',
      description: getTransactionDescription(t),
      date: t.createdAt ? new Date(t.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '',
      amount: t.amount,
      status: t.status === 'COMPLETED' ? 'Completada' : t.status === 'FAILED' ? 'Fallida' : 'Reversada',
      isPositive: t.type === 'RECHARGE' || (t.type === 'TRANSFER' && t.receiverUserId === userId)
    }));
  
  const getTransactionDescription = (t) => {
    if (t.type === 'RECHARGE') {
      return `Recarga a ${t.targetWallet || 'billetera'}`;
    } else if (t.type === 'WITHDRAWAL') {
      return `Retiro de ${t.sourceWallet || 'billetera'}`;
    } else if (t.type === 'TRANSFER') {
      if (t.userId === userId) {
        return `Transferencia a ${t.targetWallet || 'usuario'}`;
      } else {
        return `Recibiste transferencia de ${t.sourceWallet || 'usuario'}`;
      }
    }
    return 'Transacción';
  };
  
  // Encontrar el valor máximo para la escala del gráfico
  const maxValue = Math.max(...chartData.map(d => d.value), totalBalance, 1000);
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP',
      minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(value || 0);
  };
  
  const formatNumber = (value) => {
    return new Intl.NumberFormat('es-CO').format(value || 0);
  };
  
  const handleNavigateToProfile = () => onTabChange('profile');
  const handleViewAllNotifications = () => onTabChange('notifications');
  const handleLogout = () => onLogout();
  
  if (activeTab !== 'dashboard') return null;
  
  if (loading) {
    return (
      <div className="dashboard-main-content">
        <div className="loading-container-dashboard">
          <div className="loading-spinner-small"></div>
          <p>Cargando dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="dashboard-main-content">
      <header className="dashboard-header">
        <div className="header-welcome">
          <h1>Bienvenido, {user?.nombre?.split(' ')[0] || user?.nombre || 'Usuario'}</h1>
          <div className="user-badge">
            <span className="badge-level">{user?.nivel || 'Bronce'}</span>
            <span className="badge-points">{formatNumber(user?.puntos || 0)} puntos</span>
          </div>
        </div>
        <div className="header-actions">
          <NotificationBell onViewAll={handleViewAllNotifications} />
          <UserMenu user={user} onLogout={handleLogout} onNavigateToProfile={handleNavigateToProfile} />
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Balance Total</h3>
            <p className="stat-value">{formatCurrency(totalBalance)}</p>
            <span className="stat-change positive">+12.5% este mes</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💳</div>
          <div className="stat-info">
            <h3>Billeteras Activas</h3>
            <p className="stat-value">{userWallets.filter(w => w.active).length}</p>
            <span className="stat-sub">Todas operativas</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <h3>Puntos Acumulados</h3>
            <p className="stat-value">{formatNumber(user?.puntos || 0)}</p>
            <span className="stat-sub">Nivel {user?.nivel || 'Bronce'}</span>
          </div>
        </div>
      </div>

      <div className="wallets-section">
        <div className="section-header">
          <h2>Mis Billeteras</h2>
          <button className="add-wallet-btn" onClick={() => onTabChange('wallets')}>+ Administrar</button>
        </div>
        <WalletCarousel wallets={userWallets} />
      </div>

      <div className="chart-section">
        <div className="section-header">
          <h2>Evolución del Balance</h2>
          <span className="trend positive">▲ Tendencia positiva</span>
        </div>
        <div className="chart-container">
          {chartData.length > 0 && chartData.some(d => d.value > 0) ? (
            <div className="chart-bars">
              {chartData.map((item, index) => (
                <div key={index} className="chart-bar-wrapper">
                  <div 
                    className="chart-bar"
                    style={{ height: `${Math.max((item.value / maxValue) * 100, 4)}%` }}
                  >
                    <span className="chart-tooltip">{formatCurrency(item.value)}</span>
                  </div>
                  <span className="chart-label">{item.day}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-chart-data">
              <p>No hay datos suficientes para mostrar el gráfico</p>
              <span>Realiza transacciones para ver tu evolución</span>
            </div>
          )}
        </div>
      </div>

      <div className="transactions-section">
        <div className="section-header">
          <h2>Transacciones Recientes</h2>
          <button className="view-all" onClick={() => onTabChange('transactions')}>Ver todas →</button>
        </div>
        <div className="transactions-list">
          {recentTransactions.length > 0 ? (
            recentTransactions.map(transaction => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-icon">
                  {transaction.type === 'recarga' ? '📥' : transaction.type === 'transferencia' ? '🔄' : '📤'}
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
            ))
          ) : (
            <div className="empty-transactions">
              <p>No hay transacciones recientes</p>
              <span>Realiza tu primera transacción</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;