import React, { useState, useEffect } from 'react';
import {
  getMostUsedWallets,
  getUsersWithMostTransfers,
  getMostActiveCategories,
  getTransactionFrequency,
  getTransactionsByDateRange,
  getTopTransactionsByAmount
} from '../../API/admin';
import { getAllUsers } from '../../API/admin';
import './AdminReports.css';

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [mostUsedWallets, setMostUsedWallets] = useState([]);
  const [mostActiveUsers, setMostActiveUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [frequency, setFrequency] = useState([]);
  const [users, setUsers] = useState([]);
  const [walletsWithOwner, setWalletsWithOwner] = useState([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [dateRangeResult, setDateRangeResult] = useState(null);
  const [activePeriod, setActivePeriod] = useState('all');
  const [transfersLoading, setTransfersLoading] = useState(false);
  const [topTransactions, setTopTransactions] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    try {

      const usersResult = await getAllUsers();
      let usersList = [];
      if (usersResult.success && usersResult.data) {
        usersList = usersResult.data;
        setUsers(usersList);
      }

      const walletsRes = await getMostUsedWallets(10);
      let walletsList = [];
      if (walletsRes.success && walletsRes.data) {
        walletsList = walletsRes.data;

        const enrichedWallets = walletsList.map(wallet => {

          let ownerName = 'Desconocido';

          if (wallet.userId) {
            const user = usersList.find(u => u.id === wallet.userId);
            ownerName = user ? user.name : 'Desconocido';
          } else {

            console.log('Billetera sin userId:', wallet);
          }

          return {
            ...wallet,
            ownerName: ownerName
          };
        });
        setWalletsWithOwner(enrichedWallets);
        setMostUsedWallets(walletsList);
      }

      const [usersRes, categoriesRes, frequencyRes, topAmountRes] = await Promise.all([
        getUsersWithMostTransfers(5),
        getMostActiveCategories(),
        getTransactionFrequency(),
        getTopTransactionsByAmount(10)
      ]);

      if (usersRes.success && usersRes.data) {
        setMostActiveUsers(usersRes.data);
      }
      if (categoriesRes.success && categoriesRes.data) {
        setCategories(categoriesRes.data);
      }
      if (frequencyRes.success && frequencyRes.data) {
        setFrequency(frequencyRes.data);
      }
      if (topAmountRes.success && topAmountRes.data) {
        setTopTransactions(topAmountRes.data);
      }
    } catch (error) {
      console.error('Error cargando reportes:', error);
    }

    setLoading(false);
  };

  const loadTransfersByPeriod = async (period) => {
    setActivePeriod(period);
    setTransfersLoading(true);
    try {
      let start = null;
      let end = null;
      if (period !== 'all') {
        const now = new Date();
        end = now.toISOString().slice(0, 19);
        const from = new Date(now);
        if (period === '7d')  from.setDate(now.getDate() - 7);
        if (period === '30d') from.setDate(now.getDate() - 30);
        if (period === '90d') from.setDate(now.getDate() - 90);
        start = from.toISOString().slice(0, 19);
      }
      const res = await getUsersWithMostTransfers(5, start, end);
      if (res.success) setMostActiveUsers(res.data);
    } catch (e) {
      console.error(e);
    }
    setTransfersLoading(false);
  };

  const handleDateRangeSearch = async () => {
    if (!dateRange.start || !dateRange.end) {
      alert('Selecciona ambas fechas');
      return;
    }

    setLoading(true);
    try {
      const start = `${dateRange.start}T00:00:00`;
      const end   = `${dateRange.end}T23:59:59`;
      const result = await getTransactionsByDateRange(start, end);
      if (result.success) {
        setDateRangeResult(result.data);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al obtener datos');
    }
    setLoading(false);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const getCategoryLabel = (category) => {
    if (!category || category === 'Unknown') return 'Sin categoría';
    return category;
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case 'RECHARGE': return 'Recarga';
      case 'WITHDRAWAL': return 'Retiro';
      case 'TRANSFER': return 'Transferencia';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="admin-reports-container">
        <div className="loading-spinner"></div>
        <p>Cargando reportes...</p>
      </div>
    );
  }

  return (
    <div className="admin-reports-container">
      <div className="admin-reports-header">
        <h1>Reportes Financieros</h1>
        <p>Visualiza estadísticas y análisis de la plataforma</p>
      </div>

      <div className="date-range-filter">
        <div className="date-inputs">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
          />
          <span>a</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
          />
          <button onClick={handleDateRangeSearch}>Filtrar</button>
        </div>
        {dateRangeResult && (
          <div className="date-range-result">
            <p>Transacciones: <strong>{dateRangeResult.transactionCount || 0}</strong></p>
            <p>Monto total: <strong>{formatCurrency(dateRangeResult.totalAmount || 0)}</strong></p>
          </div>
        )}
      </div>

      <div className="reports-grid">

        <div className="report-card">
          <h2>🏆 Billeteras más usadas</h2>
          <div className="report-table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Propietario</th>
                  <th>Billetera</th>
                  <th>Tipo</th>
                  <th>Transacciones</th>
                  <th>Monto Total</th>
                </tr>
              </thead>
              <tbody>
                {walletsWithOwner.map((item, index) => (
                  <tr key={index}>
                    <td>{item.ownerName || 'Desconocido'}</td>
                    <td>{item.walletName || '-'}</td>
                    <td>{item.walletType || '-'}</td>
                    <td>{item.transactionCount || 0}</td>
                    <td>{formatCurrency(item.totalAmount || 0)}</td >
                  </tr>
                ))}
                {walletsWithOwner.length === 0 && (
                  <tr>
                    <td colSpan="5" className="empty-table">No hay datos disponibles</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="report-card">
          <h2>👥 Usuarios con más transferencias</h2>
          <div className="period-tabs">
            {[
              { key: 'all', label: 'Todo' },
              { key: '7d',  label: 'Últimos 7 días' },
              { key: '30d', label: 'Últimos 30 días' },
              { key: '90d', label: 'Últimos 90 días' },
            ].map(p => (
              <button
                key={p.key}
                className={`period-tab${activePeriod === p.key ? ' active' : ''}`}
                onClick={() => loadTransfersByPeriod(p.key)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="report-table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Transferencias</th>
                  <th>Monto Total</th>
                </tr>
              </thead>
              <tbody>
                {transfersLoading ? (
                  <tr><td colSpan="4" className="empty-table">Cargando...</td></tr>
                ) : mostActiveUsers.length === 0 ? (
                  <tr><td colSpan="4" className="empty-table">No hay datos en este período</td></tr>
                ) : mostActiveUsers.map((item, index) => (
                  <tr key={index}>
                    <td>{item.userName || '-'}</td>
                    <td>{item.userEmail || '-'}</td>
                    <td>{item.transferCount || 0}</td>
                    <td>{formatCurrency(item.totalTransferred || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="report-card">
          <h2>📊 Categorías más activas</h2>
          <div className="report-table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Transacciones</th>
                  <th>Monto Total</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((item, index) => (
                  <tr key={index}>
                    <td>{getCategoryLabel(item.category)}</td>
                    <td>{item.transactionCount || 0}</td>
                    <td>{formatCurrency(item.totalAmount || 0)}</td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan="3" className="empty-table">No hay datos disponibles</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="report-note">
            <small>📌 Las categorías se asignan según el tipo de billetera (Ahorro, Gastos diarios, Inversión, etc.)</small>
          </div>
        </div>

        <div className="report-card">
          <h2>🔄 Frecuencia por tipo de transacción</h2>
          <div className="report-table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Monto Total</th>
                </tr>
              </thead>
              <tbody>
                {frequency.map((item, index) => (
                  <tr key={index}>
                    <td>{getTypeLabel(item.type)}</td>
                    <td>{item.count || 0}</td>
                    <td>{formatCurrency(item.totalAmount || 0)}</td>
                  </tr>
                ))}
                {frequency.length === 0 && (
                  <tr>
                    <td colSpan="3" className="empty-table">No hay datos disponibles</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="report-card report-card-full">
        <h2>💰 Top transacciones por monto</h2>
        <p className="report-card-desc">Obtenidas con una PriorityQueue ordenada descendente por monto</p>
        <div className="report-table-container">
          <table className="report-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Usuario</th>
                <th>Monto</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {topTransactions.length === 0 ? (
                <tr><td colSpan="6" className="empty-table">No hay datos disponibles</td></tr>
              ) : topTransactions.map((tx, index) => (
                <tr key={tx.id || index}>
                  <td><span className="top-rank">#{index + 1}</span></td>
                  <td>{tx.createdAt ? new Date(tx.createdAt).toLocaleString('es-CO') : '-'}</td>
                  <td>{getTypeLabel(tx.type)}</td>
                  <td className="top-user-cell">
                    {users.find(u => u.id === tx.userId)?.name || tx.userId?.substring(0, 10) + '...'}
                  </td>
                  <td><strong>{formatCurrency(tx.originalAmount || tx.amount)}</strong></td>
                  <td>
                    <span className={`top-status top-status-${(tx.status || '').toLowerCase()}`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminReports;
