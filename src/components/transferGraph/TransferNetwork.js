import React, { useState, useEffect } from 'react';
import { getTransfersFromUser as getTransfersFrom, hasCycles as hasCycle, findPath } from '../../API/graph';
import { getUserTransactions } from '../../API/transactions';
import { getUserById, getCurrentUser } from '../../API/auth';
import './TransferNetwork.css';

const fmt = (v) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v || 0);
const fmtNum = (v) => new Intl.NumberFormat('es-CO').format(v || 0);

const NODE_R = 26;
const CX = 300;
const CY = 220;
const ORBIT = 165;

const nodePositions = (ids) =>
    ids.map((id, i) => {
        const angle = (2 * Math.PI * i) / ids.length - Math.PI / 2;
        return { id, x: CX + ORBIT * Math.cos(angle), y: CY + ORBIT * Math.sin(angle) };
    });

const curvedPath = (from, to) => {
    const dx = to.x - from.x, dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const ux = dx / dist, uy = dy / dist;
    const sx = from.x + ux * NODE_R, sy = from.y + uy * NODE_R;
    const ex = to.x - ux * NODE_R, ey = to.y - uy * NODE_R;
    const mx = (sx + ex) / 2 - uy * 35, my = (sy + ey) / 2 + ux * 35;
    return `M ${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}`;
};

const TransferNetwork = ({ user }) => {
    const currentUser = user || getCurrentUser();
    const userId = currentUser?.id;

    const [outEdges, setOutEdges]       = useState([]);  
    const [inEdges, setInEdges]         = useState([]);  
    const [userMap, setUserMap]         = useState({});  
    const [cycleExists, setCycleExists] = useState(null);
    const [loading, setLoading]         = useState(true);
    const [tooltip, setTooltip]         = useState(null);

    const [targetId, setTargetId]       = useState('');
    const [pathResult, setPathResult]   = useState(null);
    const [pathLoading, setPathLoading] = useState(false);
    const [pathError, setPathError]     = useState('');

    useEffect(() => { if (userId) loadAll(); }, [userId]);

    const loadAll = async () => {
        setLoading(true);

        const [cycleRes, txRes] = await Promise.all([
            hasCycle(),
            getUserTransactions(userId),
        ]);

        if (cycleRes.success) setCycleExists(cycleRes.data);

        const txList = txRes.success ? (Array.isArray(txRes.data) ? txRes.data : txRes.data?.content || []) : [];

        const outgoingTx = txList.filter(t =>
            t.type === 'TRANSFER' && t.userId === userId && t.receiverUserId && t.userId !== t.receiverUserId
        );
        const out = outgoingTx.map(t => ({
            sourceUserId: userId,
            targetUserId: t.receiverUserId,
            amount: t.originalAmount || t.amount,
            transactionId: t.id,
        }));

        const incomingTx = txList.filter(t =>
            t.type === 'TRANSFER' && t.receiverUserId === userId && t.userId !== userId
        );
        const inc = incomingTx.map(t => ({
            sourceUserId: t.userId,
            targetUserId: userId,
            amount: t.originalAmount || t.amount,
            transactionId: t.id,
        }));

        setOutEdges(out);
        setInEdges(inc);

        const ids = new Set([...out.map(e => e.targetUserId), ...inc.map(e => e.sourceUserId)]);
        ids.delete(userId);
        const map = { [userId]: { name: currentUser?.name || 'Tú', email: currentUser?.email } };
        await Promise.all([...ids].map(async (id) => {
            const r = await getUserById(id);
            if (r?.id || r?.data?.id) {
                const u = r?.id ? r : r.data;
                map[id] = { name: u.name, email: u.email };
            }
        }));
        setUserMap(map);
        setLoading(false);
    };

    const frequentRoutes = () => {
        const agg = {};
        outEdges.forEach(e => {
            if (!agg[e.targetUserId]) agg[e.targetUserId] = { count: 0, total: 0 };
            agg[e.targetUserId].count += 1;
            agg[e.targetUserId].total += e.amount;
        });
        return Object.entries(agg)
            .sort((a, b) => b[1].count - a[1].count)
            .map(([id, data]) => ({ id, ...data, name: userMap[id]?.name || id }));
    };

    const handleFindPath = async () => {
        if (!targetId) return;
        setPathLoading(true);
        setPathResult(null);
        setPathError('');
        const res = await findPath(userId, targetId);
        if (res.success && res.data.length > 0) {
            setPathResult(res.data);
        } else {
            setPathError('No existe ruta entre tú y ese usuario.');
        }
        setPathLoading(false);
    };

    const peerIds = [...new Set([
        ...outEdges.map(e => e.targetUserId),
        ...inEdges.map(e => e.sourceUserId),
    ])].filter(id => id !== userId);

    const peers = nodePositions(peerIds);
    const centerNode = { id: userId, x: CX, y: CY };

    const allEdges = [
        ...outEdges.map(e => ({ ...e, dir: 'out' })),
        ...inEdges.map(e => ({ ...e, dir: 'in' })),
    ];

    const svgH = peers.length === 0 ? 200 : 440;

    if (loading) return (
        <div className="tn-page">
            <div className="tn-loading">Cargando tu red de transferencias...</div>
        </div>
    );

    return (
        <div className="tn-page">
            <div className="tn-header">
                <h1>Mi Red de Transferencias</h1>
                <p>Grafo de conexiones financieras: transferencias enviadas y recibidas</p>
            </div>

            <div className="tn-stats">
                <div className="tn-stat">
                    <span className="tn-stat-num">{peerIds.length}</span>
                    <span className="tn-stat-label">Usuarios conectados</span>
                </div>
                <div className="tn-stat">
                    <span className="tn-stat-num">{outEdges.length}</span>
                    <span className="tn-stat-label">Transferencias enviadas</span>
                </div>
                <div className="tn-stat">
                    <span className="tn-stat-num">{inEdges.length}</span>
                    <span className="tn-stat-label">Transferencias recibidas</span>
                </div>
                <div className={`tn-stat tn-cycle ${cycleExists ? 'cycle-yes' : 'cycle-no'}`}>
                    <span className="tn-stat-num">{cycleExists === null ? '—' : cycleExists ? '⚠️ Sí' : '✓ No'}</span>
                    <span className="tn-stat-label">Ciclos en la red</span>
                </div>
            </div>

            <div className="tn-card">
                <div className="tn-card-title">Visualización del grafo</div>
                <div className="tn-svg-wrap">
                    {peers.length === 0 ? (
                        <div className="tn-empty">Aún no tienes transferencias realizadas o recibidas</div>
                    ) : (
                        <svg viewBox={`0 0 600 ${svgH}`} className="tn-svg">
                            <defs>
                                <marker id="arr-out" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
                                    <path d="M0,0 L0,6 L7,3 z" fill="#7c3aed" />
                                </marker>
                                <marker id="arr-in" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
                                    <path d="M0,0 L0,6 L7,3 z" fill="#059669" />
                                </marker>
                            </defs>

                            {allEdges.map((edge, i) => {
                                const isOut = edge.dir === 'out';
                                const fromNode = isOut ? centerNode : peers.find(p => p.id === edge.sourceUserId);
                                const toNode   = isOut ? peers.find(p => p.id === edge.targetUserId) : centerNode;
                                if (!fromNode || !toNode) return null;
                                return (
                                    <path
                                        key={i}
                                        d={curvedPath(fromNode, toNode)}
                                        fill="none"
                                        stroke={isOut ? '#7c3aed' : '#059669'}
                                        strokeWidth={1.5}
                                        strokeDasharray={isOut ? 'none' : '5,3'}
                                        markerEnd={`url(#arr-${isOut ? 'out' : 'in'})`}
                                        opacity={0.75}
                                        style={{ cursor: 'pointer' }}
                                        onMouseEnter={e => setTooltip({
                                            x: e.clientX, y: e.clientY,
                                            text: isOut
                                                ? `Enviaste → ${userMap[edge.targetUserId]?.name || edge.targetUserId}`
                                                : `Recibiste de ${userMap[edge.sourceUserId]?.name || edge.sourceUserId}`,
                                            sub: fmt(edge.amount),
                                        })}
                                        onMouseLeave={() => setTooltip(null)}
                                    />
                                );
                            })}

                            {peers.map(p => {
                                const name = userMap[p.id]?.name || p.id;
                                const initials = name.substring(0, 2).toUpperCase();
                                const isSender = outEdges.some(e => e.targetUserId === p.id);
                                return (
                                    <g key={p.id}
                                        onMouseEnter={e => setTooltip({ x: e.clientX, y: e.clientY, text: name, sub: userMap[p.id]?.email || '' })}
                                        onMouseLeave={() => setTooltip(null)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <circle cx={p.x} cy={p.y} r={NODE_R + 2} fill="rgba(0,0,0,0.07)" />
                                        <circle cx={p.x} cy={p.y} r={NODE_R} fill={isSender ? '#059669' : '#7c3aed'} />
                                        <text x={p.x} y={p.y + 1} textAnchor="middle" dominantBaseline="middle"
                                            fontSize="11" fontWeight="bold" fill="white">{initials}</text>
                                        <text x={p.x} y={p.y + NODE_R + 13} textAnchor="middle"
                                            fontSize="10" fill="#374151" fontWeight="500">
                                            {name.split(' ')[0]}
                                        </text>
                                    </g>
                                );
                            })}

                            <circle cx={CX} cy={CY} r={NODE_R + 6} fill="#4c1d95" />
                            <circle cx={CX} cy={CY} r={NODE_R + 3} fill="#7c3aed" />
                            <text x={CX} y={CY + 1} textAnchor="middle" dominantBaseline="middle"
                                fontSize="13" fontWeight="bold" fill="white">
                                {currentUser?.name?.substring(0, 2).toUpperCase() || 'YO'}
                            </text>
                            <text x={CX} y={CY + NODE_R + 16} textAnchor="middle"
                                fontSize="11" fill="#4c1d95" fontWeight="700">Tú</text>
                        </svg>
                    )}
                </div>

                <div className="tn-legend">
                    <div className="tn-leg-item"><span className="tn-leg-dot" style={{ background: '#7c3aed' }} /><span>Transferencias enviadas (línea sólida)</span></div>
                    <div className="tn-leg-item"><span className="tn-leg-dot" style={{ background: '#059669' }} /><span>Transferencias recibidas (línea punteada)</span></div>
                </div>
            </div>

            <div className={`tn-cycle-card ${cycleExists ? 'cycle-alert' : 'cycle-ok'}`}>
                <div className="tn-cycle-icon">{cycleExists ? '⚠️' : '✅'}</div>
                <div className="tn-cycle-info">
                    <div className="tn-cycle-title">
                        {cycleExists ? 'Se detectaron ciclos en la red' : 'Sin ciclos detectados'}
                    </div>
                    <div className="tn-cycle-desc">
                        {cycleExists
                            ? 'Existen rutas circulares entre usuarios — el dinero puede fluir en bucle entre varios nodos de la red.'
                            : 'La red de transferencias es acíclica. No existen flujos circulares entre los usuarios.'}
                    </div>
                </div>
            </div>

            {frequentRoutes().length > 0 && (
                <div className="tn-card">
                    <div className="tn-card-title">Rutas frecuentes — a quién más transferiste</div>
                    <div className="tn-routes-list">
                        {frequentRoutes().map((r, i) => (
                            <div key={r.id} className="tn-route-row">
                                <span className="tn-route-rank">#{i + 1}</span>
                                <div className="tn-route-avatar">{r.name.substring(0, 2).toUpperCase()}</div>
                                <div className="tn-route-info">
                                    <span className="tn-route-name">{r.name}</span>
                                    <span className="tn-route-id">{r.id}</span>
                                </div>
                                <div className="tn-route-stats">
                                    <span className="tn-route-count">{r.count} transferencia{r.count !== 1 ? 's' : ''}</span>
                                    <span className="tn-route-total">{fmt(r.total)}</span>
                                </div>
                                <div className="tn-route-bar-wrap">
                                    <div className="tn-route-bar"
                                        style={{ width: `${Math.min((r.count / frequentRoutes()[0].count) * 100, 100)}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="tn-card">
                <div className="tn-card-title">Buscar ruta hasta otro usuario</div>
                <p className="tn-card-desc">Encuentra si existe un camino de transferencias entre tú y otro usuario de la plataforma.</p>

                <div className="tn-path-form">
                    <select className="tn-path-select" value={targetId} onChange={e => { setTargetId(e.target.value); setPathResult(null); setPathError(''); }}>
                        <option value="">— Selecciona un usuario —</option>
                        {peerIds.map(id => (
                            <option key={id} value={id}>{userMap[id]?.name || id}</option>
                        ))}
                    </select>
                    <button className="tn-path-btn" onClick={handleFindPath} disabled={!targetId || pathLoading}>
                        {pathLoading ? 'Buscando...' : 'Buscar ruta'}
                    </button>
                </div>

                {pathError && <div className="tn-path-error">{pathError}</div>}

                {pathResult && (
                    <div className="tn-path-result">
                        <div className="tn-path-label">Ruta encontrada ({pathResult.length} nodos):</div>
                        <div className="tn-path-nodes">
                            {pathResult.map((id, i) => (
                                <React.Fragment key={id}>
                                    <div className="tn-path-node">
                                        <div className="tn-path-avatar"
                                            style={{ background: id === userId ? '#4c1d95' : '#7c3aed' }}>
                                            {(userMap[id]?.name || id).substring(0, 2).toUpperCase()}
                                        </div>
                                        <span>{id === userId ? 'Tú' : (userMap[id]?.name || id)}</span>
                                    </div>
                                    {i < pathResult.length - 1 && <span className="tn-path-arrow">→</span>}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {tooltip && (
                <div className="tn-tooltip" style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}>
                    <div className="tn-tt-title">{tooltip.text}</div>
                    {tooltip.sub && <div className="tn-tt-sub">{tooltip.sub}</div>}
                </div>
            )}
        </div>
    );
};

export default TransferNetwork;
