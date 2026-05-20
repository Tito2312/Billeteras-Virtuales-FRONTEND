// AdminDashboard.js - Panel de administración

import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminUsers from './AdminUsers';
import AdminAudit from './AdminAudit';
import AdminReports from './AdminReports';
import { getAdminStats } from '../../API/admin';
import './AdminDashboard.css';

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAudits: 0,
    todayAudits: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    adminUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      const result = await getAdminStats();
      if (result.success && result.data) {
        setStats(result.data);
      }
      setLoading(false);
    };
    loadStats();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <AdminUsers />;
      case 'audit':
        return <AdminAudit />;
      case 'reports':
        return <AdminReports />;
      case 'wallets':
        return (
          <div className="admin-placeholder">
            <div className="placeholder-icon">💳</div>
            <h2>Billeteras</h2>
            <p>Próximamente: Gestión de billeteras a nivel administrativo</p>
          </div>
        );
      case 'transactions':
        return (
          <div className="admin-placeholder">
            <div className="placeholder-icon">🔄</div>
            <h2>Transacciones</h2>
            <p>Próximamente: Monitoreo de todas las transacciones</p>
          </div>
        );
      default:
        return (
          <div className="admin-dashboard-content">
            <div className="welcome-card">
              <h2>Bienvenido al Panel de Administración</h2>
              <p>Aquí podrás gestionar todos los aspectos de la plataforma FinWallet</p>
            </div>
            
            <div className="stats-grid-admin">
              <div className="stat-card-admin">
                <div className="stat-icon-admin">👥</div>
                <div className="stat-info-admin">
                  <h3>Usuarios Totales</h3>
                  <p className="stat-number-admin">{stats.totalUsers}</p>
                </div>
              </div>
              <div className="stat-card-admin">
                <div className="stat-icon-admin">✅</div>
                <div className="stat-info-admin">
                  <h3>Usuarios Activos</h3>
                  <p className="stat-number-admin">{stats.activeUsers}</p>
                </div>
              </div>
              <div className="stat-card-admin">
                <div className="stat-icon-admin">❌</div>
                <div className="stat-info-admin">
                  <h3>Usuarios Inactivos</h3>
                  <p className="stat-number-admin">{stats.inactiveUsers}</p>
                </div>
              </div>
              <div className="stat-card-admin">
                <div className="stat-icon-admin">🛡️</div>
                <div className="stat-info-admin">
                  <h3>Administradores</h3>
                  <p className="stat-number-admin">{stats.adminUsers}</p>
                </div>
              </div>
              <div className="stat-card-admin">
                <div className="stat-icon-admin">📋</div>
                <div className="stat-info-admin">
                  <h3>Eventos de Auditoría</h3>
                  <p className="stat-number-admin">{stats.totalAudits}</p>
                </div>
              </div>
              <div className="stat-card-admin">
                <div className="stat-icon-admin">📅</div>
                <div className="stat-info-admin">
                  <h3>Eventos Hoy</h3>
                  <p className="stat-number-admin">{stats.todayAudits}</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          onLogout={onLogout}
          userName={user?.nombre}
        />
        <div className="admin-main-content">
          <div className="loading-container-admin">
            <div className="loading-spinner"></div>
            <p>Cargando panel de administración...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onLogout={onLogout}
        userName={user?.nombre}
      />
      <div className="admin-main-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;