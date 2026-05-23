// components/admin/AdminGraphs.js
import React, { useState, useEffect } from 'react';
import { hasCycles, getMostActiveUser, getFrequentTransfers } from '../../API/graph';
import { getAllUsers } from '../../API/admin';
import { getAllTransactions } from '../../API/admin';
import './AdminGraphs.css';

// Función auxiliar para convertir cualquier formato de ID a string
const safeUserId = (id) => {
    if (!id) return null;
    if (typeof id === 'string') return id;
    if (typeof id === 'object' && id !== null) {
        return id.$oid || id.toString();
    }
    return String(id);
};

const AdminGraphs = () => {
    const [loading, setLoading] = useState(true);
    const [cycles, setCycles] = useState(false);
    const [mostActiveUser, setMostActiveUser] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [frequentTransfers, setFrequentTransfers] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadGraphData();
    }, []);

    const loadGraphData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // 1. Ciclos
            const cyclesResult = await hasCycles();
            if (cyclesResult.success) setCycles(cyclesResult.hasCycle);
            
            // 2. Usuarios
            const usersResult = await getAllUsers();
            let users = [];
            if (usersResult.success && usersResult.data) {
                users = usersResult.data.map(u => ({
                    ...u,
                    id: safeUserId(u.id)
                }));
                setAllUsers(users);
            }
            
            // 3. Transacciones
            const transactionsResult = await getAllTransactions();
            let transactions = [];
            if (transactionsResult.success && transactionsResult.data) {
                transactions = transactionsResult.data.map(tx => ({
                    ...tx,
                    userId: safeUserId(tx.userId),
                    receiverUserId: safeUserId(tx.receiverUserId)
                }));
                
                // Calcular usuario más activo localmente (por cantidad de transferencias enviadas)
                const transferCount = new Map();
                transactions.forEach(tx => {
                    if (tx.type === 'TRANSFER' && tx.userId) {
                        const count = transferCount.get(tx.userId) || 0;
                        transferCount.set(tx.userId, count + 1);
                    }
                });
                let maxUserId = null;
                let maxCount = 0;
                for (const [userId, count] of transferCount.entries()) {
                    if (count > maxCount) {
                        maxCount = count;
                        maxUserId = userId;
                    }
                }
                // Si encontramos localmente, usarlo (prioridad sobre el backend)
                if (maxUserId) {
                    setMostActiveUser(maxUserId);
                } else {
                    // Fallback: intentar obtener del backend
                    const activeUserResult = await getMostActiveUser();
                    if (activeUserResult.success && activeUserResult.userId) {
                        setMostActiveUser(safeUserId(activeUserResult.userId));
                    } else {
                        setMostActiveUser(null);
                    }
                }
                
                // 4. Conexiones recurrentes
                const frequent = await getFrequentTransfers(transactions);
                const normalizedFrequent = frequent.map(conn => ({
                    ...conn,
                    from: safeUserId(conn.from),
                    to: safeUserId(conn.to)
                }));
                setFrequentTransfers(normalizedFrequent);
            } else {
                // No hay transacciones, usar backend para usuario activo si existe
                const activeUserResult = await getMostActiveUser();
                if (activeUserResult.success && activeUserResult.userId) {
                    setMostActiveUser(safeUserId(activeUserResult.userId));
                } else {
                    setMostActiveUser(null);
                }
            }
        } catch (err) {
            console.error('Error cargando datos del grafo:', err);
            setError('No se pudieron cargar los datos del grafo. Verifica que el backend esté corriendo.');
        }
        
        setLoading(false);
    };

    const getUserName = (userId) => {
        if (!userId) return 'Desconocido';
        const userIdStr = safeUserId(userId);
        const user = allUsers.find(u => safeUserId(u.id) === userIdStr);
        if (user) return user.name || user.email || userIdStr.substring(0, 12);
        return userIdStr.substring(0, 12) + '...';
    };

    if (loading) {
        return (
            <div className="admin-graphs-container">
                <div className="loading-spinner"></div>
                <p>Cargando análisis de grafos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-graphs-container">
                <div className="error-message">
                    <span>⚠️</span>
                    <p>{error}</p>
                    <button onClick={loadGraphData}>Reintentar</button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-graphs-container">
            <div className="admin-graphs-header">
                <h1>📊 Análisis de Grafos Financieros</h1>
                <p>Visualiza relaciones y patrones de transferencias entre usuarios</p>
            </div>

            <div className="stats-grid-graphs">
                <div className="stat-card-graphs">
                    <div className="stat-icon">🔄</div>
                    <div className="stat-info">
                        <h3>Ciclos Financieros</h3>
                        <p className={`stat-value ${cycles ? 'has-cycle' : 'no-cycle'}`}>
                            {cycles ? '⚠️ Detectados' : '✅ Sin ciclos'}
                        </p>
                    </div>
                </div>
                
                <div className="stat-card-graphs">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-info">
                        <h3>Usuario Más Activo</h3>
                        <p className="stat-value">
                            {mostActiveUser ? getUserName(mostActiveUser) : 'No hay datos'}
                        </p>
                        {mostActiveUser === null && (
                            <small style={{ color: '#f59e0b', display: 'block', marginTop: '5px' }}>
                                No se encontraron transferencias
                            </small>
                        )}
                    </div>
                </div>
                
                <div className="stat-card-graphs">
                    <div className="stat-icon">🔗</div>
                    <div className="stat-info">
                        <h3>Conexiones Recurrentes</h3>
                        <p className="stat-value">{frequentTransfers.length}</p>
                    </div>
                </div>
            </div>

            {frequentTransfers.length > 0 && (
                <div className="frequent-transfers-section">
                    <h3>🔗 Conexiones Recurrentes entre Usuarios</h3>
                    <table className="frequent-table">
                        <thead>
                            <tr>
                                <th>Desde</th>
                                <th>Hacia</th>
                                <th>Transferencias</th>
                                <th>Monto Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {frequentTransfers.map((conn, idx) => (
                                <tr key={idx}>
                                    <td>{getUserName(conn.from)}</td>
                                    <td>→ {getUserName(conn.to)}</td>
                                    <td className="count-cell">{conn.count} veces</td>
                                    <td className="amount-cell">
                                        ${conn.totalAmount.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {frequentTransfers.length === 0 && !loading && (
                <div className="no-data-message">
                    <p>No se encontraron conexiones recurrentes (más de 2 transferencias entre los mismos usuarios).</p>
                </div>
            )}
        </div>
    );
};

export default AdminGraphs;