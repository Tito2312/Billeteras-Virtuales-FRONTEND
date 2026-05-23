// components/admin/AdminSidebar.js
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
    { id: 'tree', label: 'Ranking', icon: '🏆', path: '/admin/tree' },
    { id: 'graphs', label: 'Grafos Financieros', icon: '📈', path: '/admin/graphs' }
  ];

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-logo">
        <img src={logo} alt="FinWallet" style={{ width: '100px', height: '100px', objectFit: 'contain', marginRight: '-20px' }} />
        <h2>FinWallet Admin</h2>
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