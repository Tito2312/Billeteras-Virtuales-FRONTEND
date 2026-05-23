// AdminDashboard.js - Panel de administración (versión completa sin conflictos)
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminUsers from './AdminUsers';
import AdminAudit from './AdminAudit';
import AdminReports from './AdminReports';
import AdminWallets from './AdminWallets';
import { getAdminStats } from '../../API/admin';
import AdminTransactions from './AdminTransactions';
import AdminGraphs from './AdminGraphs';      // Para /admin/graphs
import AdminGraph from './AdminGraph';        // Para /admin/graph
import AdminUserTree from './AdminUserTree';  // Para /admin/tree
import './AdminDashboard.css';

const AdminDashboard = ({ user, onLogout }) => {
  const location = useLocation();
  
  // Determinar la pestaña activa desde la URL
  const getTabFromPath = () => {
    const path = location.pathname;
    if (path === '/admin/users') return 'users';
    if (path === '/admin/audit') return 'audit';
    if (path === '/admin/reports') return 'reports';
    if (path === '/admin/wallets') return 'wallets';
    if (path === '/admin/transactions') return 'transactions';
    if (path === '/admin/graphs') return 'graphs';
    if (path === '/admin/graph') return 'graph';
    if (path === '/admin/tree') return 'tree';
    return 'dashboard';
  };
  
  const [activeTab, setActiveTab] = useState(getTabFromPath());
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
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'dashboard') {
      window.location.href = '/admin';
    } else if (tab === 'users') {
      window.location.href = '/admin/users';
    } else if (tab === 'audit') {
      window.location.href = '/admin/audit';
    } else if (tab === 'reports') {
      window.location.href = '/admin/reports';
    } else if (tab === 'wallets') {
      window.location.href = '/admin/wallets';
    } else if (tab === 'transactions') {
      window.location.href = '/admin/transactions';
    } else if (tab === 'graphs') {
      window.location.href = '/admin/graphs';
    } else if (tab === 'graph') {
      window.location.href = '/admin/graph';
    } else if (tab === 'tree') {
      window.location.href = '/admin/tree';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <AdminUsers />;
      case 'audit':
        return <AdminAudit />;
      case 'reports':
        return <AdminReports />;
      case 'wallets':
        return <AdminWallets />;
      case 'transactions':
        return <AdminTransactions />;
      case 'graphs':
        return <AdminGraphs />;
      case 'graph':
        return <AdminGraph />;
      case 'tree':
        return <AdminUserTree />;
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
          onTabChange={handleTabChange}
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
        onTabChange={handleTabChange}
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