// AdminReports.js - Reportes financieros para admin (con enriquecimiento de datos)

import React, { useState, useEffect } from 'react';
import { 
  getMostUsedWallets, 
  getUsersWithMostTransfers, 
  getMostActiveCategories, 
  getTransactionFrequency,
  getTransactionsByDateRange 
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    try {
      // Cargar usuarios
      const usersResult = await getAllUsers();
      let usersList = [];
      if (usersResult.success && usersResult.data) {
        usersList = usersResult.data;
        setUsers(usersList);
      }
      
      // Cargar billeteras más usadas
      const walletsRes = await getMostUsedWallets(10);
      let walletsList = [];
      if (walletsRes.success && walletsRes.data) {
        walletsList = walletsRes.data;
        
        // Enriquecer las billeteras con el nombre del usuario
        const enrichedWallets = walletsList.map(wallet => {
          // Buscar el usuario por el userId (si el backend lo devuelve)
          // O si no, intentar obtenerlo de alguna otra manera
          let ownerName = 'Desconocido';
          
          // Si el wallet tiene userId
          if (wallet.userId) {
            const user = usersList.find(u => u.id === wallet.userId);
            ownerName = user ? user.name : 'Desconocido';
          } else {
            // Si no tiene userId, intentar buscar por walletName (no es ideal pero es temporal)
            // Esta es una solución temporal mientras el backend no envía userId
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
      
      const [usersRes, categoriesRes, frequencyRes] = await Promise.all([
        getUsersWithMostTransfers(5),
        getMostActiveCategories(),
        getTransactionFrequency()
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
    } catch (error) {
      console.error('Error cargando reportes:', error);
    }
    
    setLoading(false);
  };

  const handleDateRangeSearch = async () => {
    if (!dateRange.start || !dateRange.end) {
      alert('Selecciona ambas fechas');
      return;
    }
    
    setLoading(true);
    try {
      const result = await getTransactionsByDateRange(dateRange.start, dateRange.end);
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
        {/* Billeteras más usadas */}
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

        {/* Usuarios con más transferencias */}
        <div className="report-card">
          <h2>👥 Usuarios con más transferencias</h2>
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
                {mostActiveUsers.map((item, index) => (
                  <tr key={index}>
                    <td>{item.userName || '-'}</td>
                    <td>{item.userEmail || '-'}</td>
                    <td>{item.transferCount || 0}</td>
                    <td>{formatCurrency(item.totalTransferred || 0)}</td>
                  </tr>
                ))}
                {mostActiveUsers.length === 0 && (
                  <tr>
                    <td colSpan="4" className="empty-table">No hay datos disponibles</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Categorías más activas */}
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

        {/* Frecuencia por tipo de transacción */}
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
    </div>
  );
};

export default AdminReports;