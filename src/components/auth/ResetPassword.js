import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { changePasswordWithToken } from '../../API/auth';
import './Auth.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    if (!tokenParam) {
      setError('Token no válido o expirado');
    } else {
      setToken(tokenParam);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!password || !confirmPassword) {
      setError('Por favor completa todos los campos');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    const result = await changePasswordWithToken(token, password);
    if (result.success) {
      setSuccess('✅ Contraseña actualizada exitosamente. Redirigiendo al login...');
      setTimeout(() => navigate('/login'), 3000);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  if (!token && !error) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Validando enlace...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card auth-card-reset">
        <div className="auth-header">
          <div className="auth-icon">🔒</div>
          <h1>Nueva Contraseña</h1>
          <p>Ingresa tu nueva contraseña</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Nueva contraseña</label>
            <div className="input-icon-wrapper">
              <span className="input-icon">🔑</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Confirmar contraseña</label>
            <div className="input-icon-wrapper">
              <span className="input-icon">✓</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la nueva contraseña"
              />
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-small"></span> Actualizando...
              </>
            ) : (
              'Restablecer contraseña'
            )}
          </button>
        </form>

        <div className="auth-links">
          <button onClick={() => navigate('/login')} className="link-button">
            ← Volver al inicio de sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
