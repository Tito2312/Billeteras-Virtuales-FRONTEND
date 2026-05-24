import React, { useState } from 'react';
import { register } from '../../API/auth';
import './Auth.css';

const Register = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    documento: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.nombre || !formData.email || !formData.password || !formData.confirmPassword || !formData.telefono || !formData.documento) {
      setError('Por favor completa TODOS los campos');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Ingresa un correo electrónico válido');
      return false;
    }

    if (formData.telefono.length < 7) {
      setError('Ingresa un número de teléfono válido (mínimo 7 dígitos)');
      return false;
    }

    if (formData.documento.length < 5) {
      setError('Ingresa un número de documento válido (mínimo 5 caracteres)');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const userData = {
      nombre: formData.nombre,
      email: formData.email,
      password: formData.password,
      telefono: formData.telefono,
      documento: formData.documento
    };

    const result = await register(userData);

    if (result.success) {
      setSuccess(result.message);
      setFormData({
        nombre: '',
        email: '',
        password: '',
        confirmPassword: '',
        telefono: '',
        documento: ''
      });

      setTimeout(() => {
        setSuccess('');
      }, 8000);
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Crear Cuenta</h1>
          <p>Regístrate en FinWallet</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombre">Nombre completo *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="María González"
              />
            </div>

            <div className="form-group">
              <label htmlFor="documento">Documento *</label>
              <input
                type="text"
                id="documento"
                name="documento"
                value={formData.documento}
                onChange={handleChange}
                placeholder="CC 12345678"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo electrónico *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ejemplo@correo.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="telefono">Teléfono *</label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="300 123 4567"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Contraseña *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar contraseña *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••"
              />
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <div className="auth-links">
          <button onClick={onSwitchToLogin} className="link-button">
            ¿Ya tienes cuenta? Inicia Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
