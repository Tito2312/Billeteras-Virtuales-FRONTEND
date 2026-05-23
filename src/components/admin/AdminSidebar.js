// AdminSidebar.js - Menú lateral específico para el panel de administración

import React from 'react';
import logo from '../../assets/LogoWalletTech.png';
import './AdminSidebar.css';

const AdminSidebar = ({ activeTab, onTabChange, onLogout, userName }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/admin' },
    { id: 'users', label: 'Usuarios', icon: '👥', path: '/admin/users' },
    { id: 'audit', label: 'Auditoría', icon: '📋', path: '/admin/audit' },
    { id: 'reports', label: 'Reportes', icon: '📈', path: '/admin/reports' },
    { id: 'wallets', label: 'Billeteras', icon: '💳', path: '/admin/wallets' },
    { id: 'transactions', label: 'Transacciones', icon: '🔄', path: '/admin/transactions' },
    { id: 'graph', label: 'Grafo', icon: '🕸️', path: '/admin/graph' },
    { id: 'tree', label: 'Ranking', icon: '🏆', path: '/admin/tree' }
  ];

  const handleClick = (item) => {
    if (item.id === 'dashboard') {
      window.location.href = '/admin';
    } else {
      window.location.href = item.path;
    }
  };

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-logo">
        <img src={logo} alt="FinWallet" style={{ width: '100px', height: '100px', objectFit: 'contain', marginRight: '-20px' }} />
        <h2>FinWallet Admin</h2>
      </div>
      
      <nav className="admin-sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`admin-sidebar-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => handleClick(item)}
          >
            <span className="admin-sidebar-icon">{item.icon}</span>
            <span className="admin-sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="admin-sidebar-footer">
        <div className="admin-user-info">
          <span className="admin-user-name">{userName || 'Admin'}</span>
          <button className="admin-logout-btn" onClick={onLogout}>
            🚪 Cerrar Sesión
          </button>
        </div>
        <div className="admin-version">v1.0.0</div>
      </div>
    </div>
  );
};

export default AdminSidebar;