// Dashboard.js - Pantalla principal (con nombres de usuarios)

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import WalletCarousel from './walletCarousel/WalletCarousel';
import UserMenu from '../common/UserMenu';
import NotificationBell from '../notifications/notificationBell/NotificationBell';
import { getUserWallets } from '../../API/wallets';
import { getUserTransactions } from '../../API/transactions';
import { getUserById } from '../../API/users';
import { getCurrentUser } from '../../API/auth';
import './Dashboard.css';

const Dashboard = ({ user, onLogout, activeTab, onTabChange }) => {
  const navigate = useNavigate();
  const [userWallets, setUserWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [usersCache, setUsersCache] = useState({});
  const [loading, setLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);
  const [chartData, setChartData] = useState([]);
  
  const userId = user?.id || getCurrentUser()?.id;
  
  // Función para obtener nombre de usuario por ID (con cache)
  const getUserName = useCallback(async (id) => {
    if (!id) return 'Usuario';
    
    // Verificar cache
    if (usersCache[id]) return usersCache[id];
    
    try {
      const result = await getUserById(id);
      if (result.success && result.data) {
        const name = result.data.name || result.data.nombre || id.substring(0, 8);
        setUsersCache(prev => ({ ...prev, [id]: name }));
        return name;
      }
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
    }
    return id.substring(0, 8);
  }, [usersCache]);
  
  // Calcular la evolución del balance por día
  const calculateBalanceEvolution = useCallback((transactionsList, walletsList) => {
    const currentBalance = walletsList.reduce((sum, w) => sum + (w.balance || 0), 0);
    const last7Days = getLast7Days();
    
    if (!transactionsList || transactionsList.length === 0) {
      const evolution = last7Days.map(day => ({
        day: day.label,
        value: currentBalance,
        fullDate: day.date
      }));
      setChartData(evolution);
      return;
    }
    
    const sortedTransactions = [...transactionsList].sort((a, b) => 
      new Date(a.createdAt) - new Date(b.createdAt)
    );
    
    const balanceMap = new Map();
    
    last7Days.forEach(day => {
      balanceMap.set(day.date, 0);
    });
    
    for (const day of last7Days) {
      let dayBalance = 0;
      const dayEnd = new Date(day.date + 'T23:59:59');
      
      for (const trans of sortedTransactions) {
        const transDate = new Date(trans.createdAt);
        
        if (transDate <= dayEnd) {
          let amountChange = 0;
          
          switch (trans.type) {
            case 'RECHARGE':
              amountChange = trans.amount;
              break;
            case 'WITHDRAWAL':
              amountChange = -trans.amount;
              break;
            case 'TRANSFER':
              if (trans.userId === userId) {
                amountChange = -trans.amount;
              } else if (trans.receiverUserId === userId) {
                amountChange = trans.amount;
              }
              break;
            default:
              amountChange = 0;
          }
          
          dayBalance += amountChange;
        }
      }
      
      balanceMap.set(day.date, Math.max(dayBalance, 0));
    }
    
    const evolution = last7Days.map(day => ({
      day: day.label,
      value: balanceMap.get(day.date),
      fullDate: day.date
    }));
    
    setChartData(evolution);
  }, [userId]);
  
  const getLast7Days = () => {
    const days = [];
    const today = new Date();
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const dateStr = date.toISOString().split('T')[0];
      const label = `${date.getDate()} ${months[date.getMonth()]}`;
      days.push({ date: dateStr, label, fullDate: date });
    }
    
    return days;
  };
  
  // Cargar billeteras y transacciones
  useEffect(() => {
    const loadData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        const walletsResult = await getUserWallets(userId);
        let wallets = [];
        if (walletsResult.success && walletsResult.data) {
          wallets = walletsResult.data;
          setUserWallets(wallets);
          const total = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);
          setTotalBalance(total);
        }
        
        const transResult = await getUserTransactions(userId);
        let trans = [];
        if (transResult.success && transResult.data) {
          trans = transResult.data;
          setTransactions(trans);
        }
        
        calculateBalanceEvolution(trans, wallets);
        
      } catch (error) {
        console.error('Error cargando datos:', error);
      }
      
      setLoading(false);
    };
    
    loadData();
  }, [userId, calculateBalanceEvolution]);
  
  // Procesar transacciones recientes con nombres
  const [recentTransactions, setRecentTransactions] = useState([]);
  
  useEffect(() => {
    const processTransactions = async () => {
      const sorted = [...transactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const recent = sorted.slice(0, 5);
      
      const processed = [];
      for (const t of recent) {
        let description = '';
        let isPositive = false;
        
        if (t.type === 'RECHARGE') {
          description = `Recarga realizada`;
          isPositive = true;
        } else if (t.type === 'WITHDRAWAL') {
          description = `Retiro realizado`;
          isPositive = false;
        } else if (t.type === 'TRANSFER') {
          if (t.userId === userId) {
            // Transferencia enviada por mí
            if (t.receiverUserId) {
              const receiverName = await getUserName(t.receiverUserId);
              description = t.reversed ? `Transferencia revertida a ${receiverName}` : `Transferencia enviada a ${receiverName}`;
            } else {
              description = t.reversed ? 'Transferencia revertida' : 'Transferencia enviada';
            }
            isPositive = false;
          } else if (t.receiverUserId === userId) {
            // Transferencia recibida por mí
            const senderName = await getUserName(t.userId);
            description = t.reversed ? `Transferencia revertida de ${senderName}` : `Transferencia recibida de ${senderName}`;
            isPositive = true;
          }
        }
        
        // Si la transacción está revertida, agregar indicador
        if (t.reversed && t.type !== 'TRANSFER') {
          description = `${description} (Revertida)`;
        }
        
        processed.push({
          id: t.id,
          type: t.type === 'RECHARGE' ? 'recarga' : t.type === 'WITHDRAWAL' ? 'retiro' : 'transferencia',
          description: description,
          date: t.createdAt ? new Date(t.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '',
          amount: t.amount,
          status: t.status === 'COMPLETED' ? 'Completada' : t.status === 'FAILED' ? 'Fallida' : 'Reversada',
          isPositive: isPositive,
          reversed: t.reversed
        });
      }
      
      setRecentTransactions(processed);
    };
    
    if (transactions.length > 0) {
      processTransactions();
    }
  }, [transactions, userId, getUserName]);
  
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
          {chartData.length > 0 ? (
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
              <div key={transaction.id} className={`transaction-item ${transaction.reversed ? 'reversed' : ''}`}>
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