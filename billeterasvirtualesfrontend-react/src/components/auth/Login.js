import React, { useState } from 'react';
import { login } from '../../API/auth';
import './Auth.css';

const Login = ({ onLoginSuccess, onSwitchToRegister, onSwitchToForgotPassword }) => {
  // Estados para manejar los campos del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setError('');
    setLoading(true);

    // Validaciones básicas
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      setLoading(false);
      return;
    }

    // Simular un pequeño retraso como si fuera una llamada a API
    setTimeout(() => {
      const result = login(email, password);
      
      if (result.success) {
        // Si el login es exitoso, llamamos a la función que nos pasaron como prop
        onLoginSuccess(result.user);
      } else {
        setError(result.message);
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>FinWallet</h1>
          <p>Tu billetera digital inteligente</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@correo.com"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              autoComplete="current-password"
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="auth-links">
          <button onClick={onSwitchToForgotPassword} className="link-button">
            ¿Olvidaste tu contraseña?
          </button>
          <button onClick={onSwitchToRegister} className="link-button">
            ¿No tienes cuenta? Regístrate
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;