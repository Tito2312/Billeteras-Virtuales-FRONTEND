// Transactions.js - Página de gestión de transacciones

import React, { useState, useEffect, useCallback } from 'react';
import { getUserTransactions } from '../../API/transactions';
import { getCurrentUser } from '../../API/auth';
import { getUserWallets } from '../../API/wallets';
import RechargeModal from './RechargeModal';
import WithdrawModal from './WithdrawModal';
import TransferModal from './TransferModal';
import ReversalModal from './ReversalModal';
import './Transactions.css';

const Transactions = ({ user }) => {
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showReversalModal, setShowReversalModal] = useState(false);
  
  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const userId = user?.id || getCurrentUser()?.id;
  
  const loadTransactions = useCallback(async () => {
    if (!userId) return;
    
    const result = await getUserTransactions(userId);
    
    if (result.success && result.data) {
      // Ordenar por fecha descendente (más recientes primero)
      const sorted = [...result.data].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      });
      setTransactions(sorted);
    }
  }, [userId]);
  
  const loadWallets = useCallback(async () => {
    if (!userId) return;
    
    const result = await getUserWallets(userId);
    if (result.success && result.data) {
      setWallets(result.data);
    }
  }, [userId]);
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await loadTransactions();
      await loadWallets();
      setLoading(false);
    };
    
    loadData();
  }, [loadTransactions, loadWallets]);
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };
  
  // Formatear fecha solo con el valor del backend, sin fallback
  const formatDate = (dateString) => {
    if (!dateString) {
      return '-';
    }
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '-';
      }
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day}/${month}/${year}, ${hours}:${minutes}`;
    } catch (error) {
      return '-';
    }
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
  
  const canReverse = (transaction) => {
    return transaction.type === 'TRANSFER' && 
           transaction.userId === userId &&
           transaction.status === 'COMPLETED' && 
           !transaction.reversed;
  };
  
  const filteredTransactions = transactions.filter(t => {
    if (filterType !== 'ALL' && t.type !== filterType) return false;
    if (searchTerm && !t.id?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });
  
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  const handleTransactionSuccess = async () => {
    await loadTransactions();
    await loadWallets();
    setCurrentPage(1);
  };
  
  const openReversalModal = (transaction) => {
    setSelectedTransaction(transaction);
    setShowReversalModal(true);
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
      
      <div className="history-section">
        <div className="section-header">
          <h2>Historial de Transacciones</h2>
          <button className="btn-export" onClick={() => alert('Exportar - Próximamente')}>
            📎 Exportar
          </button>
        </div>
        
        <div className="filters-bar">
          <div className="filter-group">
            <label>Tipo:</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="ALL">Todos</option>
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
          
          {(filterType !== 'ALL' || searchTerm) && (
            <button className="btn-clear-filters" onClick={() => {
              setFilterType('ALL');
              setSearchTerm('');
              setCurrentPage(1);
            }}>
              Limpiar filtros
            </button>
          )}
        </div>
        
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
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map(t => (
                  <tr key={t.id}>
                    <td className="date-cell">{formatDate(t.createdAt)}</td>
                    <td>
                      <span className="type-badge">
                        {getTypeIcon(t.type)} {getTypeLabel(t.type)}
                      </span>
                    </td>
                    <td>{t.sourceWallet ? t.sourceWallet.substring(0, 12) + '...' : '-'}</td>
                    <td>{t.targetWallet ? t.targetWallet.substring(0, 12) + '...' : (t.receiverUserId ? `Usuario: ${t.receiverUserId.substring(0, 8)}...` : '-')}</td>
                    <td className="amount-cell">{formatCurrency(t.amount)}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(t.status)}`}>
                        {getStatusLabel(t.status)}
                      </span>
                    </td>
                    <td className={t.points > 0 ? 'points-positive' : 'points-zero'}>
                      {t.points > 0 ? `+${t.points}` : t.points}
                    </td>
                    <td>
                      {canReverse(t) && (
                        <button 
                          className="btn-reverse-small"
                          onClick={() => openReversalModal(t)}
                          title="Revertir transferencia"
                        >
                          ↩️
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="empty-table">
                    No hay transacciones que coincidan con los filtros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              className="pagination-arrow"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ‹
            </button>
            
            <div className="pagination-pages">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    className={`pagination-page ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => goToPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="pagination-dots">...</span>
                  <button
                    className="pagination-page"
                    onClick={() => goToPage(totalPages)}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
            
            <button 
              className="pagination-arrow"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              ›
            </button>
          </div>
        )}
      </div>
      
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
        onClose={() => {
          setShowReversalModal(false);
          setSelectedTransaction(null);
        }}
        transactionId={selectedTransaction?.id}
        transactionAmount={selectedTransaction?.amount}
        transactionPoints={selectedTransaction?.points}
        sourceWallet={selectedTransaction?.sourceWallet}
        targetWallet={selectedTransaction?.targetWallet}
        transactionDate={selectedTransaction?.createdAt}
        onSuccess={handleTransactionSuccess}
      />
    </div>
  );
};

export default Transactions;