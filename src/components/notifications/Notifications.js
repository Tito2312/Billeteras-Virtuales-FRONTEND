// Notifications.js - Página completa de notificaciones
// Muestra histórico de notificaciones y configuración

import React, { useState } from 'react';
import './Notifications.css';

const Notifications = ({ user }) => {
  const [filter, setFilter] = useState('all'); // 'all', 'unread'
  
  // Datos de ejemplo para notificaciones (después vendrán del backend)
  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      title: 'Saldo Bajo', 
      message: 'Tu billetera Principal tiene un saldo menor a $5,000. Te recomendamos recargar para evitar inconvenientes.',
      date: 'Hoy, 10:30',
      type: 'warning',
      read: false,
      icon: '⚠️'
    },
    { 
      id: 2, 
      title: 'Actividad Inusual Detectada', 
      message: 'Se detectó un intento de acceso desde una ubicación no reconocida (Madrid, España). Si no fuiste tú, cambia tu contraseña.',
      date: '8 de abril, 11:00',
      type: 'danger',
      read: false,
      icon: '🚨'
    },
    { 
      id: 3, 
      title: '¡Felicitaciones!', 
      message: 'Has alcanzado el nivel Oro. Disfruta de tus nuevos beneficios: 3% cashback, soporte VIP y eventos exclusivos.',
      date: '7 de abril, 16:00',
      type: 'success',
      read: true,
      icon: '🎉'
    },
    { 
      id: 4, 
      title: 'Transacción Fallida', 
      message: 'Tu recarga de $2,000 no pudo ser procesada. Verifica tu método de pago o intenta nuevamente.',
      date: '6 de abril, 12:30',
      type: 'error',
      read: true,
      icon: '❌'
    },
    { 
      id: 5, 
      title: 'Transferencia Exitosa', 
      message: 'Transferencia de $1,200 a Juan Pérez completada exitosamente.',
      date: '5 de abril, 15:45',
      type: 'info',
      read: true,
      icon: '✅'
    }
  ]);
  
  // Configuraciones de notificaciones
  const [settings, setSettings] = useState([
    { id: 1, name: 'Saldo Bajo', description: 'Alertas cuando el saldo es menor a un umbral', enabled: true },
    { id: 2, name: 'Transacciones Exitosas', description: 'Confirmación de operaciones completadas', enabled: true },
    { id: 3, name: 'Actividad Inusual', description: 'Alertas de accesos o movimientos sospechosos', enabled: true },
    { id: 4, name: 'Ascenso de Nivel', description: 'Notificaciones al alcanzar un nuevo nivel', enabled: true },
    { id: 5, name: 'Promociones y Ofertas', description: 'Ofertas especiales y beneficios exclusivos', enabled: false }
  ]);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    return true;
  });
  
  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };
  
  const toggleSetting = (id) => {
    setSettings(settings.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
    alert(`⚙️ Configuración "${settings.find(s => s.id === id)?.name}" ${!settings.find(s => s.id === id)?.enabled ? 'activada' : 'desactivada'}\n\n⚠️ Próximamente se conectará con el backend.`);
  };
  
  const getTypeClass = (type) => {
    switch(type) {
      case 'warning': return 'warning';
      case 'danger': return 'danger';
      case 'success': return 'success';
      case 'error': return 'error';
      default: return 'info';
    }
  };
  
  const formatDate = (date) => {
    return date;
  };
  
  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <h1>Notificaciones</h1>
          <p>{unreadCount} sin leer de {notifications.length} total</p>
        </div>
        {unreadCount > 0 && (
          <button className="mark-all-btn" onClick={markAllAsRead}>
            Marcar todas como leídas
          </button>
        )}
      </div>
      
      <div className="notifications-layout">
        {/* Columna izquierda: Configuración */}
        <div className="settings-section">
          <div className="section-card">
            <h2>Configuración de Notificaciones</h2>
            <div className="settings-list">
              {settings.map(setting => (
                <div key={setting.id} className="setting-item">
                  <div className="setting-info">
                    <span className="setting-name">{setting.name}</span>
                    <span className="setting-description">{setting.description}</span>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={setting.enabled} 
                      onChange={() => toggleSetting(setting.id)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Columna derecha: Lista de notificaciones */}
        <div className="notifications-section">
          <div className="section-card">
            <div className="notifications-tabs">
              <button 
                className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                Todas
              </button>
              <button 
                className={`tab-btn ${filter === 'unread' ? 'active' : ''}`}
                onClick={() => setFilter('unread')}
              >
                No leídas {unreadCount > 0 && `(${unreadCount})`}
              </button>
            </div>
            
            <div className="notifications-list">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className={`notification-card ${!notif.read ? 'unread' : ''} ${getTypeClass(notif.type)}`}
                    onClick={() => markAsRead(notif.id)}
                  >
                    <div className="notification-icon">{notif.icon}</div>
                    <div className="notification-content">
                      <div className="notification-header">
                        <h3>{notif.title}</h3>
                        <span className="notification-date">{formatDate(notif.date)}</span>
                      </div>
                      <p className="notification-message">{notif.message}</p>
                      {!notif.read && <span className="notification-badge">No leída</span>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-notifications-page">
                  <span>🔔</span>
                  <p>No hay notificaciones</p>
                  <span className="empty-sub">Las notificaciones aparecerán aquí</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;