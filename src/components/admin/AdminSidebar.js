// AdminSidebar.js - Menú lateral específico para el panel de administración

import React from 'react';
import './AdminSidebar.css';

const AdminSidebar = ({ activeTab, onTabChange, onLogout, userName }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Usuarios', icon: '👥' },
    { id: 'audit', label: 'Auditoría', icon: '📋' },
    { id: 'reports', label: 'Reportes', icon: '📈' },
    { id: 'wallets', label: 'Billeteras', icon: '💳' },
    { id: 'transactions', label: 'Transacciones', icon: '🔄' }
  ];

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-logo">
        <span className="logo-icon">🛡️</span>
        <h2>FinWallet Admin</h2>
      </div>
      
      <nav className="admin-sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`admin-sidebar-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
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