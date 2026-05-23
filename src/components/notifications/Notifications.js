// Notifications.js
import React, { useState, useEffect } from 'react';
import { getUserNotifications } from '../../API/notifications';
import { getCurrentUser } from '../../API/auth';
import './Notifications.css';

const getTypeAndIcon = (asunto = '') => {
    const a = asunto.toLowerCase();
    if (a.includes('bajo') || a.includes('⚠️'))
        return { type: 'warning', icon: '⚠️' };
    if (a.includes('sospechosa') || a.includes('inusual') || a.includes('alerta') || a.includes('🚨') || a.includes('⚡') || a.includes('🔁') || a.includes('🌙'))
        return { type: 'danger', icon: '🚨' };
    if (a.includes('rechazada') || a.includes('fallida') || a.includes('❌'))
        return { type: 'error', icon: '❌' };
    if (a.includes('nivel') || a.includes('🎉'))
        return { type: 'success', icon: '🎉' };
    if (a.includes('revertida') || a.includes('🔄'))
        return { type: 'info', icon: '🔄' };
    return { type: 'info', icon: '✅' };
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('es-CO', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    } catch {
        return dateString;
    }
};

const Notifications = ({ user }) => {
    const userId = user?.id || getCurrentUser()?.id;
    const [filter, setFilter] = useState('all');
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const [settings, setSettings] = useState([
        { id: 1, name: 'Saldo Bajo', description: 'Alertas cuando el saldo es menor a un umbral', enabled: true },
        { id: 2, name: 'Transacciones Exitosas', description: 'Confirmación de operaciones completadas', enabled: true },
        { id: 3, name: 'Actividad Inusual', description: 'Alertas de accesos o movimientos sospechosos', enabled: true },
        { id: 4, name: 'Ascenso de Nivel', description: 'Notificaciones al alcanzar un nuevo nivel', enabled: true },
        { id: 5, name: 'Promociones y Ofertas', description: 'Ofertas especiales y beneficios exclusivos', enabled: false }
    ]);

    const getReadIds = () => {
        try { return JSON.parse(localStorage.getItem('readNotifications') || '[]'); }
        catch { return []; }
    };

    useEffect(() => {
        const load = async () => {
            if (!userId) return;
            setLoading(true);
            const result = await getUserNotifications(userId);
            if (result.success) {
                const readIds = getReadIds();
                const mapped = result.data.map(n => {
                    const { type, icon } = getTypeAndIcon(n.asunto);
                    return {
                        id: n.id,
                        title: n.asunto || 'Notificación',
                        message: n.message || '',
                        date: formatDate(n.registrationDate),
                        type,
                        icon,
                        read: readIds.includes(n.id)
                    };
                }).reverse();
                setNotifications(mapped);
            }
            setLoading(false);
        };
        load();
    }, [userId]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const filteredNotifications = notifications.filter(n =>
        filter === 'unread' ? !n.read : true
    );

    const markAsRead = (id) => {
        const ids = getReadIds();
        if (!ids.includes(id)) localStorage.setItem('readNotifications', JSON.stringify([...ids, id]));
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        const allIds = notifications.map(n => n.id);
        localStorage.setItem('readNotifications', JSON.stringify(allIds));
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const toggleSetting = (id) => {
        setSettings(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
    };

    const getTypeClass = (type) => type || 'info';

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
                            {loading ? (
                                <div className="empty-notifications-page">
                                    <p>Cargando notificaciones...</p>
                                </div>
                            ) : filteredNotifications.length > 0 ? (
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
                                                <span className="notification-date">{notif.date}</span>
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
