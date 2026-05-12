// NotificationBell.js - Campanita con mini ventana de notificaciones
// Al hacer clic, muestra las últimas notificaciones

import React, { useState, useRef, useEffect } from 'react';
import './NotificationBell.css';

const NotificationBell = ({ onViewAll }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  
  // Datos de ejemplo para notificaciones recientes
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Saldo Bajo', message: 'Tu billetera Principal tiene saldo bajo', date: 'Hoy, 10:30', type: 'warning', read: false },
    { id: 2, title: 'Actividad Inusual', message: 'Se detectó un intento de acceso desde Madrid, España', date: '8 abr, 11:00', type: 'danger', read: false },
    { id: 3, title: '¡Felicitaciones!', message: 'Has alcanzado el nivel Oro', date: '7 abr, 16:00', type: 'success', read: true },
    { id: 4, title: 'Transacción Fallida', message: 'Tu recarga de $2,000 no pudo ser procesada', date: '6 abr, 12:30', type: 'error', read: true }
  ]);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Cerrar al hacer clic fuera
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
  
  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };
  
  const getTypeIcon = (type) => {
    switch(type) {
      case 'warning': return '⚠️';
      case 'danger': return '🚨';
      case 'success': return '🎉';
      case 'error': return '❌';
      default: return '📢';
    }
  };
  
  const getTypeClass = (type) => {
    switch(type) {
      case 'warning': return 'warning';
      case 'danger': return 'danger';
      case 'success': return 'success';
      case 'error': return 'error';
      default: return '';
    }
  };
  
  return (
    <div className="notification-bell" ref={menuRef}>
      <button className="bell-button" onClick={toggleMenu}>
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
      </button>
      
      {isOpen && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h3>Notificaciones</h3>
            {unreadCount > 0 && (
              <button className="mark-all-read" onClick={markAllAsRead}>
                Marcar todas como leídas
              </button>
            )}
          </div>
          
          <div className="dropdown-list">
            {notifications.length > 0 ? (
              notifications.slice(0, 5).map(notif => (
                <div 
                  key={notif.id} 
                  className={`notification-item ${!notif.read ? 'unread' : ''} ${getTypeClass(notif.type)}`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className="notif-icon">{getTypeIcon(notif.type)}</div>
                  <div className="notif-content">
                    <div className="notif-title">{notif.title}</div>
                    <div className="notif-message">{notif.message}</div>
                    <div className="notif-date">{notif.date}</div>
                  </div>
                  {!notif.read && <div className="notif-dot"></div>}
                </div>
              ))
            ) : (
              <div className="empty-notifications">
                <span>🔔</span>
                <p>No hay notificaciones</p>
              </div>
            )}
          </div>
          
          <div className="dropdown-footer">
            <button className="view-all-btn" onClick={onViewAll}>
              Ver todas las notificaciones →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;