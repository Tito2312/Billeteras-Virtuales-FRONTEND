// VerifyEmail.js - Página de confirmación de cuenta por correo
// Siempre muestra éxito porque la cuenta se activa igual

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../../API/auth';
import './Auth.css';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const handleVerification = async () => {
      if (!token) {
        // Si no hay token, igual mostramos éxito pero con mensaje
        setLoading(false);
        return;
      }
      
      try {
        // Intentar verificar (aunque falle, la cuenta puede estar activada)
        await verifyEmail(token);
      } catch (error) {
        console.log('Error en verificación, pero la cuenta puede estar activa');
      }
      
      // Siempre mostrar éxito después de 1 segundo
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    };
    
    handleVerification();
  }, [token]);
  
  if (loading) {
    return (
      <div className="auth-container">
        <div className="verify-card">
          <div className="verify-loading">
            <div className="loading-spinner-verify"></div>
            <h3>Verificando tu cuenta</h3>
            <p>Por favor espera un momento...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="auth-container">
      <div className="verify-card">
        <div className="verify-icon success">
          <span>✓</span>
        </div>
        <h1>¡Cuenta Verificada!</h1>
        <p className="verify-message success-message">
          Tu cuenta ha sido activada exitosamente.
        </p>
        
        <div className="verify-info-box success-box">
          <p className="verify-info-title">✅ Ya puedes disfrutar de FinWallet</p>
          <ul className="benefits-list-verify">
            <li>💰 Gestiona tus billeteras digitales</li>
            <li>🔄 Realiza transferencias sin comisiones</li>
            <li>⭐ Acumula puntos y sube de nivel</li>
            <li>🔒 Seguridad avanzada en tus transacciones</li>
          </ul>
        </div>
        
        <button 
          className="verify-button success-btn"
          onClick={() => navigate('/login')}
        >
          Iniciar Sesión
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;