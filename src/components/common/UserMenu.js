// UserMenu.js - Menú desplegable del usuario (avatar)
// Opciones: Mi Perfil, Cerrar Sesión

import React, { useState, useRef, useEffect } from 'react';
import './UserMenu.css';

const UserMenu = ({ user, onLogout, onNavigateToProfile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Obtener iniciales del usuario
  const getInitials = () => {
    if (!user || !user.nombre) return 'U';
    const names = user.nombre.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  // Obtener color según nivel
  const getLevelColor = () => {
    const level = user?.nivel || 'Bronce';
    switch(level) {
      case 'Platino': return '#e5e4e2';
      case 'Oro': return '#ffd700';
      case 'Plata': return '#c0c0c0';
      default: return '#cd7f32';
    }
  };

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleProfile = () => {
    setIsOpen(false);
    onNavigateToProfile();
  };

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('es-CO').format(value || 0);
  };

  return (
    <div className="user-menu" ref={menuRef}>
      <button className="user-avatar" onClick={toggleMenu}>
        <span className="avatar-initials">{getInitials()}</span>
        <span className="avatar-level" style={{ backgroundColor: getLevelColor() }}></span>
      </button>
      
      {isOpen && (
        <div className="user-dropdown">
          <div className="dropdown-header">
            <div className="dropdown-avatar">
              <span>{getInitials()}</span>
            </div>
            <div className="dropdown-info">
              <span className="dropdown-name">{user?.nombre || 'Usuario'}</span>
              <span className="dropdown-level">Nivel {user?.nivel || 'Bronce'}</span>
              <span className="dropdown-points">{formatNumber(user?.puntos || 0)} puntos</span>
            </div>
          </div>
          <div className="dropdown-divider"></div>
          <button className="dropdown-item" onClick={handleProfile}>
            <span className="dropdown-icon">👤</span>
            <span>Mi Perfil</span>
          </button>
          <button className="dropdown-item logout" onClick={handleLogout}>
            <span className="dropdown-icon">🚪</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;