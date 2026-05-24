import React from 'react';
import { isAdmin } from '../../../API/auth';
import logo from '../../../assets/LogoWalletTech.png';
import './Sidebar.css';

const Sidebar = ({ activeTab, onTabChange }) => {
  const baseMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'wallets', label: 'Billeteras', icon: '💳' },
    { id: 'transactions', label: 'Transacciones', icon: '🔄' },
    { id: 'scheduled', label: 'Operaciones Programadas', icon: '⏰' },
    { id: 'rewards', label: 'Recompensas', icon: '🎁' },
    { id: 'analytics', label: 'Analítica', icon: '📈' },
    { id: 'network', label: 'Mi Red', icon: '🕸️' },
    { id: 'notifications', label: 'Notificaciones', icon: '🔔' }
  ];

  const menuItems = [...baseMenuItems];
  if (isAdmin()) {
    menuItems.unshift({ id: 'admin', label: 'Admin Panel', icon: '🛡️' });
  }

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <img src={logo} alt="FinWallet" className="logo-icon" style={{ width: '100px', height: '100px', objectFit: 'contain', marginRight: '-20px' }} />
        <h2>FinWallet</h2>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="version">v1.0.0</div>
      </div>
    </div>
  );
};

export default Sidebar;
