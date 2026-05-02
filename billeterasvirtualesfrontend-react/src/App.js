
// App.js - Componente principal de la aplicación
// Controla la navegación entre login, registro, dashboard y billeteras

import React, { useState, useEffect } from 'react';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import Dashboard from './components/dashboard/Dashboard';
import Wallets from './components/wallets/Wallets';
import Sidebar from './components/dashboard/Sidebar';  // ← IMPORTACIÓN MOVIDA ARRIBA
import { getCurrentUser, logout } from './services/authService';
import './App.css';

function App() {
  // Estados para manejar la vista actual y el usuario
  const [view, setView] = useState('login'); // 'login', 'register', 'forgotPassword', 'dashboard', 'wallets'
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Verificar si hay una sesión guardada al cargar la app
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setView('dashboard');
      setActiveTab('dashboard');
    }
    setLoading(false);
  }, []);

  // Manejar login exitoso
  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setView('dashboard');
    setActiveTab('dashboard');
  };

  // Manejar registro exitoso (cambia a login)
  const handleRegisterSuccess = () => {
    setView('login');
  };

  // Manejar cierre de sesión
  const handleLogout = () => {
    logout();
    setUser(null);
    setView('login');
    setActiveTab('dashboard');
  };

  // Manejar cambio de pestaña en el sidebar
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'dashboard') {
      setView('dashboard');
    } else if (tab === 'wallets') {
      setView('wallets');
    }
    // Aquí puedes agregar más condiciones para otras pestañas
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

  // Renderizar según la vista actual
  switch (view) {
    case 'login':
      return (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={() => setView('register')}
          onSwitchToForgotPassword={() => setView('forgotPassword')}
        />
      );
    case 'register':
      return (
        <Register
          onRegisterSuccess={handleRegisterSuccess}
          onSwitchToLogin={() => setView('login')}
        />
      );
    case 'forgotPassword':
      return (
        <ForgotPassword
          onBackToLogin={() => setView('login')}
        />
      );
    case 'wallets':
      return (
        <div className="app-layout">
          <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
          <div className="app-main-content">
            <Wallets user={user} />
          </div>
        </div>
      );
    case 'dashboard':
    default:
      return (
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
      );
  }
}

export default App;

