import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserMenu.css';

const UserMenu = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const getInitials = () => {
    if (!user?.nombre) return 'U';
    const names = user.nombre.split(' ');
    if (names.length >= 2) return `${names[0][0]}${names[1][0]}`.toUpperCase();
    return names[0][0].toUpperCase();
  };

  const getLevelColor = () => {
    const level = user?.nivel || 'Bronce';
    switch(level) {
      case 'Platino': return '#e5e4e2';
      case 'Oro': return '#ffd700';
      case 'Plata': return '#c0c0c0';
      default: return '#cd7f32';
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfile = () => {
    setIsOpen(false);
    navigate('/profile');
  };

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
    navigate('/login');
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('es-CO').format(value || 0);
  };

  return (
    <div className="user-menu" ref={menuRef}>
      <button className="user-avatar" onClick={() => setIsOpen(!isOpen)}>
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
