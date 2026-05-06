// Transactions.js - Página de gestión de transacciones
// Incluye historial con filtros, modales para acciones y sección de reversión

import React, { useState } from 'react';
import RechargeModal from './RechargeModal';
import WithdrawModal from './WithdrawModal';
import TransferModal from './TransferModal';
import ReversalModal from './ReversalModal';
import './Transactions.css';

const Transactions = ({ user }) => {
  // Estados para modales
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showReversalModal, setShowReversalModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  // Estado para filtros
  const [filterType, setFilterType] = useState('todos');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Datos de ejemplo para el historial de transacciones
  const transactions = [
    { id: 1, date: '08 abr 2026, 10:30', type: 'recarga', typeLabel: 'Recarga', description: 'Recarga desde tarjeta **** 4532', origin: 'Billetera Principal', amount: 500, status: 'Completada', points: 50, reversible: false },
    { id: 2, date: '07 abr 2026, 15:45', type: 'transferencia', typeLabel: 'Transferencia', description: 'Transferencia interna', origin: 'Billetera Principal', amount: 1200, status: 'Completada', points: 120, reversible: true },
    { id: 3, date: '07 abr 2026, 09:20', type: 'retiro', typeLabel: 'Retiro', description: 'Retiro a cuenta bancaria', origin: 'Billetera Principal', amount: 300, status: 'Completada', points: 0, reversible: false },
    { id: 4, date: '06 abr 2026, 18:10', type: 'transferencia', typeLabel: 'Transferencia', description: 'Pago de servicio', origin: 'Billetera Principal', amount: 850, status: 'Completada', points: 85, reversible: false },
    { id: 5, date: '06 abr 2026, 12:30', type: 'recarga', typeLabel: 'Recarga', description: 'Recarga rechazada - fondos insuficientes', origin: 'Billetera Principal', amount: 2000, status: 'Fallida', points: 0, reversible: false },
    { id: 6, date: '05 abr 2026, 14:20', type: 'transferencia', typeLabel: 'Transferencia', description: 'Pago de electricidad', origin: 'Gastos Mensuales', amount: 450, status: 'Completada', points: 45, reversible: false }
  ];
  
  // Transacciones reversibles (últimas 24 horas)
  const reversibleTransactions = transactions.filter(t => t.reversible && t.status === 'Completada');
  
  // Datos para estadísticas de reversión
  const reversalStats = {
    available: reversibleTransactions.length,
    monthlyReversals: 2,
    successRate: 100
  };
  
  // Billeteras del usuario (para los modales)
  const userWallets = [
    { id: 1, name: 'Principal', balance: 25430.50 },
    { id: 2, name: 'Ahorros', balance: 8920.00 },
    { id: 3, name: 'Inversión', balance: 15600.75 }
  ];
  
  // Métodos de pago
  const paymentMethods = [
    { id: 1, name: 'Tarjeta de crédito **** 4532', lastDigits: '4532' },
    { id: 2, name: 'Tarjeta de crédito **** 1234', lastDigits: '1234' },
    { id: 3, name: 'Cuenta bancaria **** 3456', lastDigits: '3456' }
  ];
  
  // Formatear moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Filtrar transacciones
  const filteredTransactions = transactions.filter(t => {
    if (filterType !== 'todos' && t.type !== filterType) return false;
    if (searchTerm && !t.description.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !t.origin.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });
  
  // Obtener icono según tipo
  const getTypeIcon = (type) => {
    switch(type) {
      case 'recarga': return '📥';
      case 'retiro': return '📤';
      case 'transferencia': return '🔄';
      default: return '💰';
    }
  };
  
  // Obtener clase para estado
  const getStatusClass = (status) => {
    if (status === 'Completada') return 'status-completed';
    if (status === 'Fallida') return 'status-failed';
    return 'status-pending';
  };
  
  // Manejar acción de reversión
  const handleReversal = (transaction) => {
    setSelectedTransaction(transaction);
    setShowReversalModal(true);
  };
  
  // Simular acciones (solo alerta)
  const handleAction = (action, data) => {
    alert(`📝 Simulación: ${action}\n\nDatos: ${JSON.stringify(data, null, 2)}\n\n⚠️ Esta funcionalidad se conectará con el backend próximamente.`);
  };
  
  return (
    <div className="transactions-page">
      {/* Header */}
      <div className="transactions-header">
        <div>
          <h1>Transacciones</h1>
          <p>Gestiona tus movimientos de dinero</p>
        </div>
      </div>
      
      {/* Botones de acción rápida */}
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
      
      {/* Sección de Reversión */}
      <div className="reversal-section">
        <div className="section-header">
          <h2>Política de Reversión</h2>
        </div>
        <p className="reversal-policy">
          Puedes revertir transacciones completadas dentro de las 24 horas siguientes. 
          La reversión es instantánea y gratuita. Los puntos ganados serán descontados.
        </p>
        
        <div className="reversal-stats">
          <div className="reversal-stat-card">
            <span className="stat-value">{reversalStats.available}</span>
            <span className="stat-label">Reversiones Disponibles</span>
            <span className="stat-sub">Ultimas 24 horas</span>
          </div>
          <div className="reversal-stat-card">
            <span className="stat-value">{reversalStats.monthlyReversals}</span>
            <span className="stat-label">Reversiones Este Mes</span>
            <span className="stat-sub">Procesadas exitosamente</span>
          </div>
          <div className="reversal-stat-card">
            <span className="stat-value">{reversalStats.successRate}%</span>
            <span className="stat-label">Tasa de Éxito</span>
            <span className="stat-sub">Todas completadas</span>
          </div>
        </div>
        
        {/* Transacciones reversibles */}
        <div className="reversible-transactions">
          <h3>Transacciones Reversibles</h3>
          {reversibleTransactions.length > 0 ? (
            <div className="reversible-list">
              {reversibleTransactions.map(t => (
                <div key={t.id} className="reversible-item">
                  <div className="reversible-info">
                    <span className="reversible-icon">{getTypeIcon(t.type)}</span>
                    <div>
                      <p className="reversible-desc">{t.description}</p>
                      <span className="reversible-date">{t.date}</span>
                    </div>
                  </div>
                  <div className="reversible-amount">
                    <span>{formatCurrency(t.amount)}</span>
                    <button className="btn-reverse" onClick={() => handleReversal(t)}>
                      Revertir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-reversible">
              <p>No hay transacciones reversibles en este momento</p>
              <span>Solo puedes revertir transacciones de las últimas 24 horas</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Historial de Transacciones */}
      <div className="history-section">
        <div className="section-header">
          <h2>Historial de Transacciones</h2>
          <div className="history-actions">
            <button className="btn-export" onClick={() => handleAction('Exportar historial', { format: 'CSV' })}>
              📎 Exportar
            </button>
          </div>
        </div>
        
        {/* Filtros */}
        <div className="filters-bar">
          <div className="filter-group">
            <label>Tipo:</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="todos">Todos</option>
              <option value="recarga">Recargas</option>
              <option value="retiro">Retiros</option>
              <option value="transferencia">Transferencias</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Buscar:</label>
            <input
              type="text"
              placeholder="Descripción o origen..."
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
        
        {/* Tabla de transacciones */}
        <div className="transactions-table-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Origen/Destino</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Puntos</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(t => (
                <tr key={t.id}>
                  <td>{t.date}</td>
                  <td>
                    <span className="type-badge">
                      {getTypeIcon(t.type)} {t.typeLabel}
                    </span>
                  </td>
                  <td>{t.description}</td>
                  <td>{t.origin}</td>
                  <td className={t.amount > 0 ? 'amount-positive' : 'amount-negative'}>
                    {formatCurrency(t.amount)}
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(t.status)}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className={t.points > 0 ? 'points-positive' : 'points-zero'}>
                    {t.points > 0 ? `+${t.points}` : t.points}
                  </td>
                  <td>
                    {t.reversible && t.status === 'Completada' && (
                      <button className="btn-reverse-small" onClick={() => handleReversal(t)}>
                        ↩️
                      </button>
                    )}
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
        onConfirm={(data) => handleAction('Recargar billetera', data)}
        wallets={userWallets}
        paymentMethods={paymentMethods}
      />
      
      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onConfirm={(data) => handleAction('Retirar dinero', data)}
        wallets={userWallets}
      />
      
      <TransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onConfirm={(data) => handleAction('Transferir dinero', data)}
        wallets={userWallets}
      />
      
      <ReversalModal
        isOpen={showReversalModal}
        onClose={() => {
          setShowReversalModal(false);
          setSelectedTransaction(null);
        }}
        onConfirm={(data) => handleAction('Reversión de transacción', data)}
        transaction={selectedTransaction}
        transactions={reversibleTransactions}
      />
    </div>
  );
};

export default Transactions;