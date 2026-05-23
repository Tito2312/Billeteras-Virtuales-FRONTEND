// App.js - Componente principal de la aplicación

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import Dashboard from './components/dashboard/Dashboard';
import Wallets from './components/wallets/Wallets';
import Transactions from './components/transactions/Transactions';
import Sidebar from './components/dashboard/sidebar/Sidebar';
import { getCurrentUser, logout, isAdmin } from './API/auth';
import Scheduled from './components/scheduled/Scheduled';
import Rewards from './components/rewards/Rewards';
import Profile from './components/profile/Profile';
import Notifications from './components/notifications/Notifications';
import Analytics from './components/analytics/Analytics';
import VerifyEmail from './components/auth/VerifyEmail';
import AdminDashboard from './components/admin/AdminDashboard';
import TransferNetwork from './components/transferGraph/TransferNetwork';
import AssistantBot from './components/assistant/AssistantBot';
import './App.css';

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Escuchar cambios de usuario desde el Dashboard (para actualizar puntos y nivel en tiempo real)
  useEffect(() => {
    const handleUserUpdate = (event) => {
      if (event.detail) {
        console.log('🔄 Actualizando usuario desde evento:', event.detail);
        setUser(event.detail);
        // Actualizar localStorage
        const storedUser = getCurrentUser();
        if (storedUser) {
          const mergedUser = { ...storedUser, ...event.detail };
          localStorage.setItem('user', JSON.stringify(mergedUser));
        }
      }
    };
    
    window.addEventListener('userUpdate', handleUserUpdate);
    return () => window.removeEventListener('userUpdate', handleUserUpdate);
  }, []);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      const path = location.pathname;
      if (path === '/wallets') {
        setActiveTab('wallets');
      } else if (path === '/transactions') {
        setActiveTab('transactions');
      } else if (path === '/scheduled') {
        setActiveTab('scheduled');
      } else if (path === '/rewards') {
        setActiveTab('rewards');
      } else if (path === '/security') {
        setActiveTab('security');
      } else if (path === '/profile') {
        setActiveTab('profile');
      } else if (path === '/notifications') {
        setActiveTab('notifications');
      } else if (path === '/analytics') {
        setActiveTab('analytics');
      } else if (path === '/network') {
        setActiveTab('network');
      } else if (path === '/admin' || path.startsWith('/admin/')) {
        setActiveTab('admin');
      } else {
        setActiveTab('dashboard');
      }
    }
    setLoading(false);
  }, [location.pathname]);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    if (loggedInUser?.role === 'ADMIN' || loggedInUser?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const handleRegisterSuccess = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/login');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'dashboard') {
      navigate('/');
    } else if (tab === 'wallets') {
      navigate('/wallets');
    } else if (tab === 'transactions') {
      navigate('/transactions');
    } else if (tab === 'scheduled') {
      navigate('/scheduled');
    } else if (tab === 'rewards') {
      navigate('/rewards');
    } else if (tab === 'security') {
      navigate('/security');
    } else if (tab === 'profile') {
      navigate('/profile');
    } else if (tab === 'notifications') {
      navigate('/notifications');
    } else if (tab === 'analytics') {
      navigate('/analytics');
    } else if (tab === 'network') {
      navigate('/network');
    } else if (tab === 'admin') {
      navigate('/admin');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando FinWallet...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Routes>
          <Route path="/login" element={
            <Login
              onLoginSuccess={handleLoginSuccess}
              onSwitchToRegister={() => navigate('/register')}
              onSwitchToForgotPassword={() => navigate('/forgot-password')}
            />
          } />
          <Route path="/register" element={
            <Register
              onRegisterSuccess={handleRegisterSuccess}
              onSwitchToLogin={() => navigate('/login')}
            />
          } />
          <Route path="/forgot-password" element={
            <ForgotPassword
              onBackToLogin={() => navigate('/login')}
            />
          } />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <AssistantBot />
      </>
    );
  }

  if (isAdmin()) {
    return (
      <>
        <Routes>
          <Route path="/admin" element={<AdminDashboard user={user} onLogout={handleLogout} />} />
          <Route path="/admin/users" element={<AdminDashboard user={user} onLogout={handleLogout} />} />
          <Route path="/admin/audit" element={<AdminDashboard user={user} onLogout={handleLogout} />} />
          <Route path="/admin/reports" element={<AdminDashboard user={user} onLogout={handleLogout} />} />
          <Route path="/admin/wallets" element={<AdminDashboard user={user} onLogout={handleLogout} />} />
          <Route path="/admin/transactions" element={<AdminDashboard user={user} onLogout={handleLogout} />} />
          <Route path="/admin/graphs" element={<AdminDashboard user={user} onLogout={handleLogout} />} />
          <Route path="/admin/graph" element={<AdminDashboard user={user} onLogout={handleLogout} />} />
          <Route path="/admin/tree" element={<AdminDashboard user={user} onLogout={handleLogout} />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
        <AssistantBot />
      </>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={
          <div className="app-layout">
            <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
            <div className="app-main-content">
              <Dashboard 
                user={user} 
                onLogout={handleLogout}
                activeTab={activeTab}
                onTabChange={handleTabChange}
              />
            </div>
          </div>
        } />
        <Route path="/wallets" element={
          <div className="app-layout">
            <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
            <div className="app-main-content">
              <Wallets user={user} />
            </div>
          </div>
        } />
        <Route path="/transactions" element={
          <div className="app-layout">
            <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
            <div className="app-main-content">
              <Transactions user={user} />
            </div>
          </div>
        } />
        <Route path="/scheduled" element={
          <div className="app-layout">
            <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
            <div className="app-main-content">
              <Scheduled user={user} />
            </div>
          </div>
        } />
        <Route path="/rewards" element={
          <div className="app-layout">
            <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
            <div className="app-main-content">
              <Rewards user={user} />
            </div>
          </div>
        } />
        <Route path="/profile" element={
          <div className="app-layout">
            <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
            <div className="app-main-content">
              <Profile user={user} onUpdateUser={(updatedUser) => {
                const newUser = { ...user, ...updatedUser };
                localStorage.setItem('user', JSON.stringify(newUser));
                setUser(newUser);
              }} />
            </div>
          </div>
        } />
        <Route path="/notifications" element={
          <div className="app-layout">
            <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
            <div className="app-main-content">
              <Notifications user={user} />
            </div>
          </div>
        } />
        <Route path="/analytics" element={
          <div className="app-layout">
            <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
            <div className="app-main-content">
              <Analytics user={user} />
            </div>
          </div>
        } />
        <Route path="/network" element={
          <div className="app-layout">
            <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
            <div className="app-main-content">
              <TransferNetwork user={user} />
            </div>
          </div>
        } />
        <Route path="/verify-email" element={
          <div className="app-layout">
            <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
            <div className="app-main-content">
              <VerifyEmail />
            </div>
          </div>
        } />
        <Route path="*" element={
          <div className="app-layout">
            <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
            <div className="app-main-content">
              <Dashboard 
                user={user} 
                onLogout={handleLogout}
                activeTab={activeTab}
                onTabChange={handleTabChange}
              />
            </div>
          </div>
        } />
      </Routes>
      <AssistantBot />
    </>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;