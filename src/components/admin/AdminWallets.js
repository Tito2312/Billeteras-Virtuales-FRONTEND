// AdminWallets.js - Gestión de billeteras para administradores

import React, { useState, useEffect } from 'react';
import { getAllWallets, activateWallet, deactivateWallet } from '../../API/admin';
import './AdminWallets.css';

const AdminWallets = () => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const result = await getAllWallets();
    console.log('📊 Billeteras obtenidas:', result);
    
    if (result.success && result.data) {
      setWallets(result.data);
    }
    setLoading(false);
  };

  const handleToggleStatus = async (walletId, userId, isActive) => {
    const result = isActive ? await deactivateWallet(walletId, userId) : await activateWallet(walletId, userId);
    
    if (result.success) {
      alert(`✅ Billetera ${isActive ? 'desactivada' : 'activada'} exitosamente`);
      loadData();
    } else {
      alert(`❌ Error al ${isActive ? 'desactivar' : 'activar'} billetera: ${result.message}`);
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
    return date.toLocaleDateString('es-ES');
  };

  const filteredWallets = wallets.filter(wallet => {
    const matchesSearch = wallet.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          wallet.userName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' ||
                          (filterStatus === 'active' && wallet.active) ||
                          (filterStatus === 'inactive' && !wallet.active);
    const matchesType = filterType === 'all' || wallet.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const walletTypes = ['Gastos diarios', 'Ahorro', 'Inversión', 'Transporte', 'Compras'];

  if (loading) {
    return (
      <div className="admin-wallets-container">
        <div className="loading-spinner"></div>
        <p>Cargando billeteras...</p>
      </div>
    );
  }

  return (
    <div className="admin-wallets-container">
      <div className="admin-wallets-header">
        <h1>Gestión de Billeteras</h1>
        <p>Administra todas las billeteras de la plataforma</p>
      </div>

      <div className="admin-wallets-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por nombre de billetera o usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Todos los estados</option>
            <option value="active">Activas</option>
            <option value="inactive">Inactivas</option>
          </select>
        </div>
        <div className="filter-box">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">Todos los tipos</option>
            {walletTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <button className="refresh-btn" onClick={loadData}>⟳ Actualizar</button>
      </div>

      <div className="admin-wallets-table-container">
        <table className="admin-wallets-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Propietario</th>
              <th>Tipo</th>
              <th>Balance</th>
              <th>Transfer Key</th>
              <th>Fecha Creación</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredWallets.map((wallet) => (
              <tr key={wallet.id}>
                <td>{wallet.name || '-'}</td>
                <td>{wallet.userName || wallet.userId?.substring(0, 12) + '...' || '-'}</td>
                <td>{wallet.type || '-'}</td>
                <td>{formatCurrency(wallet.balance || 0)}</td>
                <td>{wallet.transferKey || '-'}</td>
                <td>{formatDate(wallet.createdAt)}</td>
                <td>
                  <span className={`status-badge ${wallet.active ? 'status-active' : 'status-inactive'}`}>
                    {wallet.active ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    {wallet.active ? (
                      <button 
                        className="action-btn deactivate"
                        onClick={() => handleToggleStatus(wallet.id, wallet.userId, true)}
                        title="Desactivar"
                      >
                        🔒
                      </button>
                    ) : (
                      <button 
                        className="action-btn activate"
                        onClick={() => handleToggleStatus(wallet.id, wallet.userId, false)}
                        title="Activar"
                      >
                        🔓
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredWallets.length === 0 && (
          <div className="empty-wallets">
            <p>No hay billeteras que coincidan con los filtros</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminWallets;