// Security.js - Detección de comportamiento inusual
// Según documento: múltiples transferencias, retiros altos, horarios no habituales

import React, { useState } from 'react';
import './Security.css';

const Security = ({ user }) => {
  // Estado de seguridad
  const [securityStatus, setSecurityStatus] = useState('protected');
  
  // Alertas activas (ejemplo - después vendrán del backend)
  const [activeAlerts, setActiveAlerts] = useState([
    {
      id: 1,
      title: 'Acceso no reconocido',
      risk: 'alto',
      description: 'Intento de inicio de sesión desde IP: 192.168.1.100 - Madrid, España',
      date: '8 de abril, 11:00'
    },
    {
      id: 2,
      title: 'Patrón de transacción inusual',
      risk: 'medio',
      description: 'Múltiples transferencias pequeñas en corto período',
      date: '6 de abril, 22:15'
    }
  ]);
  
  // Alertas resueltas
  const [resolvedAlerts, setResolvedAlerts] = useState([
    {
      id: 3,
      title: 'Horario no habitual',
      risk: 'bajo',
      description: 'Transacción a las 3:00 AM desde ubicación desconocida',
      date: '1 de abril, 03:00',
      resolvedDate: '2 de abril'
    }
  ]);
  
  // Medidas de seguridad activas
  const securityMeasures = [
    { name: 'Autenticación 2FA', active: true, icon: '🔐' },
    { name: 'Notificaciones de inicio de sesión', active: true, icon: '📧' },
    { name: 'Detección de ubicaciones inusuales', active: true, icon: '📍' },
    { name: 'Límites de transacción', active: true, icon: '💰' },
    { name: 'Monitoreo 24/7', active: true, icon: '🕒' }
  ];
  
  const getRiskClass = (risk) => {
    switch(risk) {
      case 'alto': return 'risk-high';
      case 'medio': return 'risk-medium';
      case 'bajo': return 'risk-low';
      default: return '';
    }
  };
  
  const getRiskText = (risk) => {
    switch(risk) {
      case 'alto': return 'Riesgo Alto';
      case 'medio': return 'Riesgo Medio';
      case 'bajo': return 'Riesgo Bajo';
      default: return '';
    }
  };
  
  const handleResolveAlert = (alertId) => {
    const alert = activeAlerts.find(a => a.id === alertId);
    if (alert) {
      setActiveAlerts(activeAlerts.filter(a => a.id !== alertId));
      setResolvedAlerts([{ ...alert, resolvedDate: new Date().toLocaleDateString('es-ES') }, ...resolvedAlerts]);
    }
  };
  
  return (
    <div className="security-page">
      {/* Header */}
      <div className="security-header">
        <h1>Detección de Seguridad</h1>
        <p>Monitoreo de comportamiento inusual</p>
      </div>
      
      {/* Tarjetas de estado */}
      <div className="security-stats">
        <div className="security-stat-card">
          <div className="stat-icon">🛡️</div>
          <div className="stat-info">
            <h3>Estado de Seguridad</h3>
            <div className={`status-badge ${securityStatus}`}>
              {securityStatus === 'protected' ? 'Protegido' : 'En riesgo'}
            </div>
            <span>Todos los sistemas activos</span>
          </div>
        </div>
        
        <div className="security-stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <h3>Alertas Activas</h3>
            <p className="stat-number">{activeAlerts.length}</p>
            <span>Requieren atención</span>
          </div>
        </div>
        
        <div className="security-stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>Alertas Resueltas</h3>
            <p className="stat-number">{resolvedAlerts.length}</p>
            <span>Últimos 30 días</span>
          </div>
        </div>
      </div>
      
      {/* Alertas Activas */}
      <div className="alerts-section">
        <h2>Alertas Activas</h2>
        {activeAlerts.length > 0 ? (
          <div className="alerts-list">
            {activeAlerts.map(alert => (
              <div key={alert.id} className={`alert-card ${getRiskClass(alert.risk)}`}>
                <div className="alert-header">
                  <div className="alert-title">
                    <span className="alert-icon">⚠️</span>
                    <span>{alert.title}</span>
                  </div>
                  <span className={`risk-badge ${getRiskClass(alert.risk)}`}>
                    {getRiskText(alert.risk)}
                  </span>
                </div>
                <div className="alert-description">
                  {alert.description}
                </div>
                <div className="alert-footer">
                  <span className="alert-date">📅 {alert.date}</span>
                  <button className="btn-resolve" onClick={() => handleResolveAlert(alert.id)}>
                    Marcar como resuelta
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-alerts">
            <p>✅ No hay alertas activas</p>
            <span>Tu cuenta está segura</span>
          </div>
        )}
      </div>
      
      {/* Medidas de Seguridad Activas */}
      <div className="measures-section">
        <h2>Medidas de Seguridad Activas</h2>
        <div className="measures-grid">
          {securityMeasures.map((measure, idx) => (
            <div key={idx} className="measure-card">
              <div className="measure-icon">{measure.icon}</div>
              <div className="measure-info">
                <span className="measure-name">{measure.name}</span>
                <span className="measure-status active">Activo</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Alertas Resueltas */}
      {resolvedAlerts.length > 0 && (
        <div className="resolved-section">
          <h2>Alertas Resueltas</h2>
          <div className="resolved-list">
            {resolvedAlerts.map(alert => (
              <div key={alert.id} className="resolved-card">
                <div className="resolved-header">
                  <span className="resolved-icon">✅</span>
                  <span className="resolved-title">{alert.title}</span>
                  <span className="resolved-date">Resuelta: {alert.resolvedDate}</span>
                </div>
                <div className="resolved-description">{alert.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Security;