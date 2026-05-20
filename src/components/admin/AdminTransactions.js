// AdminTransactions.js - Gestión de transacciones para administradores

import React, { useState, useEffect } from 'react';
import { getAllTransactions, reverseTransaction } from '../../API/admin';
import './AdminTransactions.css';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const result = await getAllTransactions();
    console.log('📊 Transacciones obtenidas:', result);
    
    if (result.success && result.data) {
      // Ordenar por fecha descendente (más reciente primero)
      const sorted = [...result.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTransactions(sorted);
    }
    setLoading(false);
  };

  const handleReverseTransaction = async (transaction) => {
    if (!window.confirm(`¿Estás seguro de que deseas revertir esta transacción?\n\nID: ${transaction.id}\nMonto: ${formatCurrency(transaction.amount)}\n\nEsta acción no se puede deshacer.`)) {
      return;
    }
    
    const result = await reverseTransaction(transaction.userId, transaction.id);
    
    if (result.success) {
      alert(`✅ Transacción revertida exitosamente`);
      loadData();
    } else {
      alert(`❌ Error al revertir transacción: ${result.message}`);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
    switch(status) {
      case 'COMPLETED': return 'status-completed';
      case 'FAILED': return 'status-failed';
      case 'REVERSED': return 'status-reversed';
      default: return 'status-pending';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'COMPLETED': return 'Completada';
      case 'FAILED': return 'Fallida';
      case 'REVERSED': return 'Reversada';
      default: return 'Pendiente';
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.sourceWallet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.targetWallet?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    
    let matchesDate = true;
    if (dateRange.start && dateRange.end) {
      const transDate = new Date(t.createdAt);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59);
      matchesDate = transDate >= startDate && transDate <= endDate;
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  const transactionTypes = [
    { value: 'all', label: 'Todos' },
    { value: 'RECHARGE', label: 'Recargas' },
    { value: 'WITHDRAWAL', label: 'Retiros' },
    { value: 'TRANSFER', label: 'Transferencias' }
  ];

  const statusTypes = [
    { value: 'all', label: 'Todos' },
    { value: 'COMPLETED', label: 'Completadas' },
    { value: 'FAILED', label: 'Fallidas' },
    { value: 'REVERSED', label: 'Reversadas' }
  ];

  const applyDateFilter = () => {
    loadData();
  };

  const clearDateFilter = () => {
    setDateRange({ start: '', end: '' });
  };

  if (loading) {
    return (
      <div className="admin-transactions-container">
        <div className="loading-spinner"></div>
        <p>Cargando transacciones...</p>
      </div>
    );
  }

  return (
    <div className="admin-transactions-container">
      <div className="admin-transactions-header">
        <h1>Gestión de Transacciones</h1>
        <p>Monitorea todas las transacciones de la plataforma</p>
      </div>

      <div className="admin-transactions-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por ID, usuario o billetera..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            {transactionTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        <div className="filter-box">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            {statusTypes.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
        <div className="date-range-filter">
          <input
            type="date"
            placeholder="Desde"
            value={dateRange.start}
            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
          />
          <span>a</span>
          <input
            type="date"
            placeholder="Hasta"
            value={dateRange.end}
            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
          />
          <button onClick={applyDateFilter}>Aplicar</button>
          <button onClick={clearDateFilter}>Limpiar</button>
        </div>
        <button className="refresh-btn" onClick={loadData}>⟳ Actualizar</button>
      </div>

      <div className="admin-transactions-table-container">
        <table className="admin-transactions-table">
          <thead>
            <tr>
              <th>Fecha/Hora</th>
              <th>ID Transacción</th>
              <th>Usuario ID</th>
              <th>Tipo</th>
              <th>Origen</th>
              <th>Destino</th>
              <th>Monto</th>
              <th>Puntos</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="date-cell">{formatDate(transaction.createdAt)}</td>
                <td className="id-cell">{transaction.id?.substring(0, 12)}...</td>
                <td className="user-cell">{transaction.userId?.substring(0, 12)}...</td>
                <td>
                  <span className="type-badge">
                    {getTypeIcon(transaction.type)} {getTypeLabel(transaction.type)}
                  </span>
                </td>
                <td>{transaction.sourceWallet?.substring(0, 12) || '-'}...</td>
                <td>{transaction.targetWallet?.substring(0, 12) || '-'}...</td>
                <td className="amount-cell">{formatCurrency(transaction.amount)}</td>
                <td className="points-cell">{transaction.points || 0}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(transaction.status)}`}>
                    {getStatusLabel(transaction.status)}
                  </span>
                </td>
                <td>
                  {transaction.status !== 'REVERSED' && transaction.status !== 'FAILED' && (
                    <button 
                      className="btn-reverse"
                      onClick={() => handleReverseTransaction(transaction)}
                      title="Revertir transacción"
                    >
                      ↩️ Revertir
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTransactions.length === 0 && (
          <div className="empty-transactions">
            <p>No hay transacciones que coincidan con los filtros</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTransactions;