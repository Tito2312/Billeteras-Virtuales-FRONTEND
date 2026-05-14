// Transactions.js - Página de gestión de transacciones

import React, { useState, useEffect } from 'react';
import { getUserTransactions } from '../../API/transactions';
import { getCurrentUser } from '../../API/auth';  // ← CORREGIDO
import { getUserWallets } from '../../API/wallets';
import RechargeModal from './RechargeModal';
import WithdrawModal from './WithdrawModal';
import TransferModal from './TransferModal';
import ReversalModal from './ReversalModal';
import './Transactions.css';

const Transactions = ({ user }) => {
  // Estados para modales - TODOS INICIALIZADOS EN false
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showReversalModal, setShowReversalModal] = useState(false);
  
  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  
  const userId = user?.id || getCurrentUser()?.id;
  
  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Cargar transacciones
      const transResult = await getUserTransactions(userId);
      if (transResult.success && transResult.data) {
        setTransactions(transResult.data);
      }
      
      // Cargar billeteras
      const walletsResult = await getUserWallets(userId);
      if (walletsResult.success && walletsResult.data) {
        setWallets(walletsResult.data);
      }
      
      setLoading(false);
    };
    
    if (userId) {
      loadData();
    }
  }, [userId]);
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };
  
  const getTypeIcon = (type) => {
    switch(type) {
      case 'RECHARGE': return '📥';
      case 'WITHDRAWAL': return '📤';
      case 'TRANSFER': return '🔄';
      default: return '💰';
    }
  };
  
  const getTypeLabel = (type) => {
    switch(type) {
      case 'RECHARGE': return 'Recarga';
      case 'WITHDRAWAL': return 'Retiro';
      case 'TRANSFER': return 'Transferencia';
      default: return type;
    }
  };
  
  const getStatusClass = (status) => {
    if (status === 'COMPLETED') return 'status-completed';
    if (status === 'FAILED') return 'status-failed';
    if (status === 'REVERSED') return 'status-reversed';
    return 'status-pending';
  };
  
  const getStatusLabel = (status) => {
    switch(status) {
      case 'COMPLETED': return 'Completada';
      case 'FAILED': return 'Fallida';
      case 'REVERSED': return 'Reversada';
      default: return status;
    }
  };
  
  // Filtrar transacciones
  const filteredTransactions = transactions.filter(t => {
    if (filterType !== 'todos' && t.type !== filterType) return false;
    if (searchTerm && !t.id?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });
  
  const handleTransactionSuccess = () => {
    // Recargar datos después de una transacción
    const loadData = async () => {
      const transResult = await getUserTransactions(userId);
      if (transResult.success && transResult.data) {
        setTransactions(transResult.data);
      }
      const walletsResult = await getUserWallets(userId);
      if (walletsResult.success && walletsResult.data) {
        setWallets(walletsResult.data);
      }
    };
    loadData();
  };
  
  if (loading) {
    return (
      <div className="transactions-page">
        <div className="loading-container-transactions">
          <div className="loading-spinner-small"></div>
          <p>Cargando transacciones...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="transactions-page">
      <div className="transactions-header">
        <h1>Transacciones</h1>
        <p>Gestiona tus movimientos de dinero</p>
      </div>
      
      {/* Botones de acción */}
      <div className="action-buttons-grid">
        <button className="action-card" onClick={() => setShowRechargeModal(true)}>
          <span className="action-icon">📥</span>
          <span className="action-label">Recargar</span>
        </button>
        <button className="action-card" onClick={() => setShowWithdrawModal(true)}>
          <span className="action-icon">📤</span>
          <span className="action-label">Retirar</span>
        </button>
        <button className="action-card" onClick={() => setShowTransferModal(true)}>
          <span className="action-icon">🔄</span>
          <span className="action-label">Transferir</span>
        </button>
        <button className="action-card" onClick={() => setShowReversalModal(true)}>
          <span className="action-icon">↩️</span>
          <span className="action-label">Reversión</span>
        </button>
      </div>
      
      {/* Historial de transacciones */}
      <div className="history-section">
        <div className="section-header">
          <h2>Historial de Transacciones</h2>
          <button className="btn-export" onClick={() => alert('Exportar - Próximamente')}>
            📎 Exportar
          </button>
        </div>
        
        {/* Filtros */}
        <div className="filters-bar">
          <div className="filter-group">
            <label>Tipo:</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="todos">Todos</option>
              <option value="RECHARGE">Recargas</option>
              <option value="WITHDRAWAL">Retiros</option>
              <option value="TRANSFER">Transferencias</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Buscar por ID:</label>
            <input
              type="text"
              placeholder="ID de transacción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {(filterType !== 'todos' || searchTerm) && (
            <button className="btn-clear-filters" onClick={() => {
              setFilterType('todos');
              setSearchTerm('');
            }}>
              Limpiar filtros
            </button>
          )}
        </div>
        
        {/* Tabla */}
        <div className="transactions-table-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Origen</th>
                <th>Destino</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Puntos</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(t => (
                <tr key={t.id}>
                  <td>{t.createdAt ? new Date(t.createdAt).toLocaleString('es-ES') : '-'}</td>
                  <td>
                    <span className="type-badge">
                      {getTypeIcon(t.type)} {getTypeLabel(t.type)}
                    </span>
                  </td>
                  <td>{t.sourceWallet || '-'}</td>
                  <td>{t.targetWallet || (t.receiverUserId ? `Usuario: ${t.receiverUserId.substring(0, 8)}...` : '-')}</td>
                  <td className="amount-cell">{formatCurrency(t.amount)}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(t.status)}`}>
                      {getStatusLabel(t.status)}
                    </span>
                  </td>
                  <td className={t.points > 0 ? 'points-positive' : 'points-zero'}>
                    {t.points > 0 ? `+${t.points}` : t.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredTransactions.length === 0 && (
            <div className="empty-table">
              <p>No hay transacciones que coincidan con los filtros</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Modales */}
      <RechargeModal
        isOpen={showRechargeModal}
        onClose={() => setShowRechargeModal(false)}
        wallets={wallets}
        onSuccess={handleTransactionSuccess}
      />
      
      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        wallets={wallets}
        onSuccess={handleTransactionSuccess}
      />
      
      <TransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        wallets={wallets}
        onSuccess={handleTransactionSuccess}
      />
      
      <ReversalModal
        isOpen={showReversalModal}
        onClose={() => setShowReversalModal(false)}
        onSuccess={handleTransactionSuccess}
      />
    </div>
  );
};

export default Transactions;