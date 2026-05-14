// App.js - Componente principal de la aplicación
// Controla la navegación entre login, registro, dashboard, billeteras y transacciones
// CON SOPORTE PARA RUTAS URL (React Router)

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import Dashboard from './components/dashboard/Dashboard';
import Wallets from './components/wallets/Wallets';
import Transactions from './components/transactions/Transactions';
import Sidebar from './components/dashboard/sidebar/Sidebar';
import { getCurrentUser, logout } from './API/auth';
import Scheduled from './components/scheduled/Scheduled';
import Rewards from './components/rewards/Rewards';
import Security from './components/security/Security';
import Profile from './components/profile/Profile';
import Notifications from './components/notifications/Notifications';
import Analytics from './components/analytics/Analytics';
import VerifyEmail from './components/auth/VerifyEmail';
import './App.css';

// Componente interno que maneja la navegación por URL
const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estados para manejar la vista actual y el usuario
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Verificar si hay una sesión guardada al cargar la app
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      // Sincronizar vista según la URL actual
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
      } else {
        setActiveTab('dashboard');
      }
    }
    setLoading(false);
  }, [location.pathname]);

  // Manejar login exitoso
  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    navigate('/'); // Ir al dashboard
  };

  // Manejar registro exitoso (cambia a login)
  const handleRegisterSuccess = () => {
    navigate('/login');
  };

  // Manejar cierre de sesión
  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/login');
  };

  // Manejar cambio de pestaña en el sidebar
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Navegar a la ruta correspondiente
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
    }
  };

  // Mostrar pantalla de carga mientras verificamos sesión
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando FinWallet...</p>
      </div>
    );
  }

  // Si no hay usuario, mostrar pantalla de login
  if (!user) {
    return (
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
        <Route path="*" element={<Login
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={() => navigate('/register')}
          onSwitchToForgotPassword={() => navigate('/forgot-password')}
        />} />
      </Routes>
    );
  }

  // Si hay usuario, mostrar layout con sidebar
  return (
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
      <Route path="/security" element={
        <div className="app-layout">
          <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
          <div className="app-main-content">
            <Security user={user} />
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