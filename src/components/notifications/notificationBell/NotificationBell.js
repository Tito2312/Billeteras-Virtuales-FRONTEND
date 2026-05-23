// NotificationBell.js - Campanita con mini ventana de notificaciones
import React, { useState, useRef, useEffect } from 'react';
import { getUserNotifications } from '../../../API/notifications';
import { getCurrentUser } from '../../../API/auth';
import './NotificationBell.css';

const getTypeAndIcon = (asunto = '') => {
    const a = asunto.toLowerCase();
    if (a.includes('bajo') || a.includes('⚠️')) return { type: 'warning', icon: '⚠️' };
    if (a.includes('sospechosa') || a.includes('inusual') || a.includes('alerta') || a.includes('🚨') || a.includes('⚡') || a.includes('🔁') || a.includes('🌙')) return { type: 'danger', icon: '🚨' };
    if (a.includes('rechazada') || a.includes('fallida') || a.includes('❌')) return { type: 'error', icon: '❌' };
    if (a.includes('nivel') || a.includes('🎉')) return { type: 'success', icon: '🎉' };
    if (a.includes('revertida') || a.includes('🔄')) return { type: 'info', icon: '🔄' };
    return { type: 'info', icon: '✅' };
};

const NotificationBell = ({ onViewAll }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const menuRef = useRef(null);
    const userId = getCurrentUser()?.id;

    const storageKey = userId ? `readNotifications_${userId}` : 'readNotifications';

    const getReadIds = () => {
        try { return JSON.parse(localStorage.getItem(storageKey) || '[]'); }
        catch { return []; }
    };

    const saveReadId = (id) => {
        const ids = getReadIds();
        if (!ids.includes(id)) {
            localStorage.setItem(storageKey, JSON.stringify([...ids, id]));
        }
    };

    const loadNotifications = async () => {
        if (!userId) return;
        const result = await getUserNotifications(userId);
        if (result.success) {
            const readIds = getReadIds();
            const mapped = result.data.map(n => {
                const { type, icon } = getTypeAndIcon(n.asunto);
                return {
                    id: n.id,
                    title: n.asunto || 'Notificación',
                    message: n.message || '',
                    date: n.registrationDate || '-',
                    type,
                    icon,
                    read: readIds.includes(n.id)
                };
            });
            setNotifications(mapped);
        }
    };

    useEffect(() => {
        loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    // Recargar desde la API cada vez que se abre el dropdown
    useEffect(() => {
        if (isOpen) loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = (id) => {
        saveReadId(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        const allIds = notifications.map(n => n.id);
        localStorage.setItem(storageKey, JSON.stringify(allIds));
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const getTypeClass = (type) => type || '';

    return (
        <div className="notification-bell" ref={menuRef}>
            <button className="bell-button" onClick={() => setIsOpen(!isOpen)}>
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
                        {notifications.filter(n => !n.read).length > 0 ? (
                            notifications.filter(n => !n.read).slice(0, 5).map(notif => (
                                <div
                                    key={notif.id}
                                    className={`notification-item unread ${getTypeClass(notif.type)}`}
                                    onClick={() => markAsRead(notif.id)}
                                >
                                    <div className="notif-icon">{notif.icon}</div>
                                    <div className="notif-content">
                                        <div className="notif-title">{notif.title}</div>
                                        <div className="notif-message">{notif.message}</div>
                                        <div className="notif-date">{notif.date}</div>
                                    </div>
                                    <div className="notif-dot"></div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-notifications">
                                <span>🔔</span>
                                <p>No hay notificaciones sin leer</p>
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
