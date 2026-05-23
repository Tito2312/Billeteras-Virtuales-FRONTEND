// Dashboard.js - Pantalla principal (con modales de transacciones)

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import WalletCarousel from './walletCarousel/WalletCarousel';
import UserMenu from '../common/UserMenu';
import NotificationBell from '../notifications/notificationBell/NotificationBell';
import { getUserWallets } from '../../API/wallets';
import { getUserTransactions } from '../../API/transactions';
import { getCurrentUser, getUserById } from '../../API/auth';
import RechargeModal from '../transactions/RechargeModal';
import WithdrawModal from '../transactions/WithdrawModal';
import TransferModal from '../transactions/TransferModal';
import './Dashboard.css';

const Dashboard = ({ user, onLogout, activeTab, onTabChange }) => {
  const navigate = useNavigate();
  const [userWallets, setUserWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [currentUser, setCurrentUser] = useState(user);
  
  // Usar useRef para evitar recargas infinitas
  const isInitialLoad = useRef(true);
  const isUpdating = useRef(false);
  
  // Estados para modales
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  
  const userId = currentUser?.id || user?.id || getCurrentUser()?.id;
  
  // Función para actualizar los datos del usuario desde el backend
  const refreshUserData = useCallback(async () => {
    if (!userId || isUpdating.current) return;
    
    isUpdating.current = true;
    const result = await getUserById(userId);
    if (result.success && result.data) {
      const updatedUser = {
        id: result.data.id,
        nombre: result.data.name,
        email: result.data.email,
        nivel: result.data.level || 'Bronce',
        puntos: result.data.points || 0,
        telefono: result.data.phoneNumber,
        documento: result.data.documentNumber,
        role: result.data.role
      };
      
      setCurrentUser(updatedUser);
      
      // Actualizar localStorage
      const storedUser = getCurrentUser();
      if (storedUser) {
        const mergedUser = { ...storedUser, ...updatedUser };
        localStorage.setItem('user', JSON.stringify(mergedUser));
      }
      
      // Disparar evento solo si hay cambios significativos
      const event = new CustomEvent('userUpdate', { detail: updatedUser });
      window.dispatchEvent(event);
    }
    isUpdating.current = false;
  }, [userId]);
  
  // Función para obtener la descripción de la transacción
  const getTransactionDescription = (t) => {
    if (t.type === 'RECHARGE') {
      return `Recarga a billetera`;
    } else if (t.type === 'WITHDRAWAL') {
      return `Retiro de billetera`;
    } else if (t.type === 'TRANSFER') {
      if (t.userId === userId) {
        return `Transferencia enviada`;
      } else {
        return `Transferencia recibida`;
      }
    }
    return 'Transacción';
  };
  
  // Calcular la evolución del balance por día
  const calculateBalanceEvolution = useCallback((transactionsList, walletsList) => {
    const last7Days = getLast7Days();
    const currentBalance = walletsList.reduce((sum, w) => sum + (w.balance || 0), 0);

    if (!transactionsList || transactionsList.length === 0) {
      setChartData(last7Days.map(day => ({ day: day.label, value: currentBalance, fullDate: day.date })));
      return;
    }

    const sortedTransactions = [...transactionsList].sort((a, b) =>
      new Date(a.createdAt) - new Date(b.createdAt)
    );

    // Para cada día calcula el balance acumulado desde cero (sin reutilizar runningBalance entre días)
    const evolution = last7Days.map(day => {
      const dayEnd = new Date(day.date + 'T23:59:59');
      let balance = 0;

      for (const trans of sortedTransactions) {
        const transDate = new Date(trans.createdAt);
        if (transDate > dayEnd) continue;

        switch (trans.type) {
          case 'RECHARGE':
            balance += trans.amount;
            break;
          case 'WITHDRAWAL':
            balance -= trans.originalAmount || trans.amount;
            break;
          case 'TRANSFER':
            if (trans.userId === userId) {
              balance -= trans.originalAmount || trans.amount;
            } else if (trans.receiverUserId === userId) {
              balance += trans.amount;
            }
            break;
          default:
            break;
        }
      }

      return { day: day.label, value: Math.max(balance, 0), fullDate: day.date };
    });

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
  
  // Cargar billeteras y transacciones - SOLO UNA VEZ al montar
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
    
    if (isInitialLoad.current) {
      loadData();
      refreshUserData();
      isInitialLoad.current = false;
    }
  }, [userId, calculateBalanceEvolution, refreshUserData]); // Dependencias correctas
  
  // Transacciones recientes (calculado en cada render pero sin recargar)
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map(t => ({
      id: t.id,
      type: t.type === 'RECHARGE' ? 'recarga' : t.type === 'WITHDRAWAL' ? 'retiro' : 'transferencia',
      description: getTransactionDescription(t),
      date: t.createdAt ? new Date(t.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '',
      amount: t.amount,
      status: t.status === 'COMPLETED' ? 'Completada' : t.status === 'FAILED' ? 'Fallida' : t.status === 'REVERSED' ? 'Reversada' : 'Pendiente',
      isPositive: t.type === 'RECHARGE' || (t.type === 'TRANSFER' && t.receiverUserId === userId)
    }));
  
  // Handlers para abrir modales
  const handleRecharge = (wallet) => {
    setSelectedWallet(wallet);
    setShowRechargeModal(true);
  };
  
  const handleTransfer = (wallet) => {
    setSelectedWallet(wallet);
    setShowTransferModal(true);
  };
  
  const handleWithdraw = (wallet) => {
    setSelectedWallet(wallet);
    setShowWithdrawModal(true);
  };
  
  // Actualizar todos los datos después de una transacción exitosa
  const handleTransactionSuccess = async () => {
    console.log('🔄 Actualizando datos después de transacción...');
    
    // Actualizar datos del usuario (puntos y nivel)
    await refreshUserData();
    
    // Recargar billeteras
    const walletsResult = await getUserWallets(userId);
    if (walletsResult.success && walletsResult.data) {
      setUserWallets(walletsResult.data);
      const total = walletsResult.data.reduce((sum, w) => sum + (w.balance || 0), 0);
      setTotalBalance(total);
      calculateBalanceEvolution(transactions, walletsResult.data);
    }
    
    // Recargar transacciones
    const transResult = await getUserTransactions(userId);
    if (transResult.success && transResult.data) {
      setTransactions(transResult.data);
    }
  };
  
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
  
  // Calcular valor máximo para el gráfico
  const maxChartValue = Math.max(...chartData.map(d => d.value), 1000);
  
  return (
    <div className="dashboard-main-content">
      <header className="dashboard-header">
        <div className="header-welcome">
          <h1>Bienvenido, {currentUser?.nombre?.split(' ')[0] || currentUser?.nombre || 'Usuario'}</h1>
          <div className="user-badge">
            <span className="badge-level">{currentUser?.nivel || 'Bronce'}</span>
            <span className="badge-points">{formatNumber(currentUser?.puntos || 0)} puntos</span>
          </div>
        </div>
        <div className="header-actions">
          <NotificationBell onViewAll={handleViewAllNotifications} />
          <UserMenu user={currentUser} onLogout={handleLogout} onNavigateToProfile={handleNavigateToProfile} />
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Balance Total</h3>
            <p className="stat-value">{formatCurrency(totalBalance)}</p>
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
            <p className="stat-value">{formatNumber(currentUser?.puntos || 0)}</p>
            <span className="stat-sub">Nivel {currentUser?.nivel || 'Bronce'}</span>
          </div>
        </div>
      </div>

      <div className="wallets-section">
        <div className="section-header">
          <h2>Mis Billeteras</h2>
          <button className="add-wallet-btn" onClick={() => onTabChange('wallets')}>+ Administrar</button>
        </div>
        <WalletCarousel 
          wallets={userWallets} 
          onRecharge={handleRecharge}
          onTransfer={handleTransfer}
          onWithdraw={handleWithdraw}
        />
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
                    style={{ height: `${Math.max((item.value / maxChartValue) * 220, 8)}px` }}
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
      
      {/* Modales de transacciones */}
      <RechargeModal
        isOpen={showRechargeModal}
        onClose={() => {
          setShowRechargeModal(false);
          setSelectedWallet(null);
        }}
        wallets={userWallets}
        selectedWallet={selectedWallet}
        onSuccess={handleTransactionSuccess}
      />
      
      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => {
          setShowWithdrawModal(false);
          setSelectedWallet(null);
        }}
        wallets={userWallets}
        selectedWallet={selectedWallet}
        onSuccess={handleTransactionSuccess}
      />
      
      <TransferModal
        isOpen={showTransferModal}
        onClose={() => {
          setShowTransferModal(false);
          setSelectedWallet(null);
        }}
        wallets={userWallets}
        selectedWallet={selectedWallet}
        onSuccess={handleTransactionSuccess}
      />
    </div>
  );
};

export default Dashboard;