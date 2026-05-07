import React, { useState } from 'react';
import { register } from '../../services/authService';
import './Auth.css';

const Register = ({ onRegisterSuccess, onSwitchToLogin }) => {
  // Estados para los campos del formulario
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

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validar el formulario
  const validateForm = () => {
    // validar que TODOS los campos estén llenos
    // nombre, email, password, confirmPassword, telefono, documento son OBLIGATORIOS
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

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Ingresa un correo electrónico válido');
      return false;
    }

    // Validar que el teléfono tenga al menos 7 dígitos (básico)
    if (formData.telefono.length < 7) {
      setError('Ingresa un número de teléfono válido (mínimo 7 dígitos)');
      return false;
    }

    // Validar que el documento tenga al menos 5 caracteres
    if (formData.documento.length < 5) {
      setError('Ingresa un número de documento válido (mínimo 5 caracteres)');
      return false;
    }

    return true;
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    // Preparamos los datos para registrar
    const userData = {
      nombre: formData.nombre,
      email: formData.email,
      password: formData.password,
      telefono: formData.telefono,
      documento: formData.documento
    };

    setTimeout(() => {
      const result = register(userData);
      
      if (result.success) {
        setSuccess(result.message);
        // Limpiar formulario
        setFormData({
          nombre: '',
          email: '',
          password: '',
          confirmPassword: '',
          telefono: '',
          documento: ''
        });
        // Después de 2 segundos, cambiar al login
        setTimeout(() => {
          onRegisterSuccess();
        }, 2000);
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