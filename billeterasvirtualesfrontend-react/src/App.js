import React, { useState, useEffect } from 'react';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import Dashboard from './components/dashboard/Dashboard';
import { getCurrentUser, logout } from './services/authService';
import './App.css';

function App() {
  // Estados para manejar la vista actual y el usuario
  const [view, setView] = useState('login'); // 'login', 'register', 'forgotPassword', 'dashboard'
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar si hay una sesión guardada al cargar la app
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setView('dashboard');
    }
    setLoading(false);
  }, []);

  // Manejar login exitoso
  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setView('dashboard');
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
    case 'dashboard':
      return (
        <Dashboard
          user={user}
          onLogout={handleLogout}
        />
      );
    default:
      return <Login onLoginSuccess={handleLoginSuccess} />;
  }
}

export default App;