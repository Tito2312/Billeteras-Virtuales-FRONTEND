import React, { useState, useEffect } from 'react';
import { appConfirm } from '../../utils/confirm';
import { toast } from '../../utils/toast';
import { getAllTransactions, getAllUsers, reverseTransaction, reverseTransactionPila } from '../../API/admin';
import './AdminTransactions.css';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const [users, setUsers] = useState([]);
  const [pilaUserId, setPilaUserId] = useState('');
  const [pilaStack, setPilaStack] = useState([]);
  const [pilaLoading, setPilaLoading] = useState(false);
  const [pilaResult, setPilaResult] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [txResult, usersResult] = await Promise.all([getAllTransactions(), getAllUsers()]);

    if (txResult.success && txResult.data) {
      const sorted = [...txResult.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTransactions(sorted);
    }
    if (usersResult.success && usersResult.data) {
      setUsers(usersResult.data);
    }
    setLoading(false);
  };

  const loadPilaForUser = (userId) => {
    setPilaUserId(userId);
    setPilaResult(null);
    if (!userId) { setPilaStack([]); return; }

    const userTx = transactions
      .filter(t => t.userId === userId && t.status !== 'REVERSED' && t.status !== 'FAILED')
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    setPilaStack(userTx);
  };

  const handleRevertirConPila = async () => {
    if (!pilaUserId) return;
    setPilaLoading(true);
    setPilaResult(null);
    const result = await reverseTransactionPila(pilaUserId);
    if (result.success) {
      setPilaResult({ ok: true, tx: result.data });
      await loadData();

      const userTx = transactions
        .filter(t => t.userId === pilaUserId && t.status !== 'REVERSED' && t.status !== 'FAILED' && t.id !== result.data?.id)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setPilaStack(userTx);
    } else {
      setPilaResult({ ok: false, msg: result.message });
    }
    setPilaLoading(false);
  };

  const handleReverseTransaction = async (transaction) => {
    const ok = await appConfirm(`ID: ${transaction.id}\nMonto: ${formatCurrency(transaction.amount)}\n\nEsta acción no se puede deshacer.`, '¿Revertir transacción?');
    if (!ok) return;

    const result = await reverseTransaction(transaction.userId, transaction.id);

    if (result.success) {
      toast.success('Transacción revertida exitosamente');
      loadData();
    } else {
      toast.error(`Error al revertir transacción: ${result.message}`);
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

      <div className="pila-panel">
        <div className="pila-panel-header">
          <div className="pila-panel-title">
            <span className="pila-icon">📚</span>
            <div>
              <h2>Revertir con Pila (Stack)</h2>
              <p>Selecciona un usuario para ver su pila de transacciones. El tope (última) será la revertida.</p>
            </div>
          </div>
          <select
            className="pila-user-select"
            value={pilaUserId}
            onChange={(e) => loadPilaForUser(e.target.value)}
          >
            <option value="">— Selecciona un usuario —</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
            ))}
          </select>
        </div>

        {pilaUserId && (
          <div className="pila-content">
            <div className="pila-visual">
              <div className="pila-label-top">▲ TOP (se revertirá)</div>
              {pilaStack.length === 0 ? (
                <div className="pila-empty">Sin transacciones reversibles</div>
              ) : (
                [...pilaStack].reverse().map((tx, idx) => {
                  const isTop = idx === 0;
                  return (
                    <div key={tx.id} className={`pila-card${isTop ? ' pila-card-top' : ''}`}>
                      <div className="pila-card-left">
                        <span className="pila-card-type">
                          {tx.type === 'RECHARGE' ? '📥' : tx.type === 'WITHDRAWAL' ? '📤' : '🔄'}
                          {' '}{getTypeLabel(tx.type)}
                        </span>
                        <span className="pila-card-date">{formatDate(tx.createdAt)}</span>
                      </div>
                      <div className="pila-card-right">
                        <span className="pila-card-amount">{formatCurrency(tx.originalAmount || tx.amount)}</span>
                        {isTop && <span className="pila-top-badge">TOPE</span>}
                      </div>
                    </div>
                  );
                })
              )}
              <div className="pila-base">▬ BASE</div>
            </div>

            <div className="pila-action">
              <div className="pila-info">
                <span className="pila-count">{pilaStack.length}</span>
                <span className="pila-count-label">transacción(es) en la pila</span>
              </div>
              <button
                className="pila-btn"
                onClick={handleRevertirConPila}
                disabled={pilaLoading || pilaStack.length === 0}
              >
                {pilaLoading ? 'Revirtiendo...' : '↩ Revertir tope de pila'}
              </button>

              {pilaResult && (
                <div className={`pila-result ${pilaResult.ok ? 'pila-result-ok' : 'pila-result-err'}`}>
                  {pilaResult.ok ? (
                    <>
                      <strong>✅ Revertida exitosamente</strong>
                      <span>ID: {pilaResult.tx?.id?.substring(0, 16)}...</span>
                      <span>Monto: {formatCurrency(pilaResult.tx?.originalAmount || pilaResult.tx?.amount)}</span>
                    </>
                  ) : (
                    <><strong>❌ Error</strong><span>{pilaResult.msg}</span></>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTransactions;
