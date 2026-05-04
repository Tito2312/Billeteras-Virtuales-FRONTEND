// User.js - Componente para gestionar perfil de usuario
// Muestra información del usuario y opciones de configuración

import React, { useState, useEffect } from 'react';
import { getPerfil } from '../../services/userService';
import './User.css';

const User = ({ user, onLogout }) => {
  const [perfilData, setPerfilData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos del perfil desde la API
  useEffect(() => {
    const cargarPerfil = async () => {
      console.log('Usuario actual:', user);
      
      if (!user || !user.id) {
        console.log('No hay usuario o ID');
        setLoading(false);
        return;
      } 

      try {
        console.log('Cargando perfil para ID:', user.id);
        const data = await getPerfil(user.id);
        console.log('Datos recibidos:', data);
        setPerfilData(data);
      } catch (err) {
        console.error('Error completo:', err);
        setError(`Error al cargar el perfil: ${err.message}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    cargarPerfil();
  }, [user]);

  if (!user) {
    return (
      <div className="user-container">
        <p>No hay información de usuario disponible</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="user-container">
        <div className="loading-spinner"></div>
        <p>Cargando perfil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  // Usar datos de la API si están disponibles, si no usar datos del estado local
  const userData = perfilData || user;

  return (
    <div className="user-container">
      <div className="user-header">
        <h2>Mi Perfil</h2>
      </div>
      
      <div className="user-profile">
        <div className="user-avatar">
          <div className="avatar-circle">
            {userData.nombre ? userData.nombre.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
        
        <div className="user-info">
          <h3>{userData.nombre || 'Usuario'}</h3>
          <p className="user-email">{userData.email || 'usuario@ejemplo.com'}</p>
          <p className="user-role">Nivel: {userData.nivel || 'Bronce'}</p>
          <p className="user-points">Puntos: {userData.puntosTotales || 0}</p>
          <p className="user-balance">Saldo: ${userData.saldo ? userData.saldo.toFixed(2) : '0.00'}</p>
        </div>
      </div>
      
      <div className="user-actions">
        <button className="btn-primary">Editar Perfil</button>
        <button className="btn-secondary">Cambiar Contraseña</button>
        <button className="btn-danger" onClick={onLogout}>
          Cerrar Sesión
        </button>
      </div>
      
      <div className="user-settings">
        <h3>Configuración</h3>
        <div className="settings-list">
          <div className="setting-item">
            <label>Notificaciones por email</label>
            <input type="checkbox" defaultChecked />
          </div>
          <div className="setting-item">
            <label>Autenticación de dos factores</label>
            <input type="checkbox" />
          </div>
          <div className="setting-item">
            <label>Tema oscuro</label>
            <input type="checkbox" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default User;
