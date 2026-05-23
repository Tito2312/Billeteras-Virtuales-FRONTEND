// components/admin/AdminSidebar.js
import React from 'react';
import './AdminSidebar.css';

const AdminSidebar = ({ activeTab, onTabChange, onLogout, userName }) => {
  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard', path: '/admin' },
    { id: 'users', icon: '👥', label: 'Usuarios', path: '/admin/users' },
    { id: 'wallets', icon: '💳', label: 'Billeteras', path: '/admin/wallets' },
    { id: 'transactions', icon: '🔄', label: 'Transacciones', path: '/admin/transactions' },

{ id: 'graphs', icon: '📈', label: 'Grafos Financieros', path: '/admin/graphs' },
    { id: 'audit', icon: '📋', label: 'Auditoría', path: '/admin/audit' },
    { id: 'reports', icon: '📄', label: 'Reportes', path: '/admin/reports' },
  ];

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-header">
        <div className="admin-logo">
          <span className="logo-icon">🏦</span>
          <span className="logo-text">FinWallet</span>
        </div>
        <div className="admin-role-badge">
          <span className="role-icon">👑</span>
          <span className="role-text">Administrador</span>
        </div>
      </div>

      <nav className="admin-sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`admin-nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <div className="admin-user-info">
          <div className="user-avatar">
            {userName ? userName.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="user-details">
            <span className="user-name">{userName || 'Administrador'}</span>
            <span className="user-role">Admin</span>
          </div>
        </div>
        <button className="admin-logout-btn" onClick={onLogout}>
          <span className="logout-icon">🚪</span>
          <span className="logout-text">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;