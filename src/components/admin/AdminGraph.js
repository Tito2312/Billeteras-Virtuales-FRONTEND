import React, { useState, useEffect, useRef } from 'react';
import { getAllTransactions, getAllUsers } from '../../API/admin';
import AdminGraphs from './AdminGraphs';
import './AdminGraph.css';

const AdminGraph = () => {
    const [users, setUsers] = useState([]);
    const [edges, setEdges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tooltip, setTooltip] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const svgRef = useRef(null);

    const WIDTH = 1000;
    const HEIGHT = 680;
    const CX = WIDTH / 2;
    const CY = HEIGHT / 2;
    const RADIUS = 290;
    const NODE_R = 30;

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [usersRes, txRes] = await Promise.all([getAllUsers(), getAllTransactions()]);

        const usersData = usersRes.success ? usersRes.data : [];
        const txData = txRes.success ? txRes.data : [];

        const transfers = txData.filter(t =>
            t.type === 'TRANSFER' && t.status === 'COMPLETED' && t.receiverUserId
        );

        const involvedIds = new Set();
        transfers.forEach(t => {
            involvedIds.add(t.userId);
            involvedIds.add(t.receiverUserId);
        });

        const involvedUsers = [
            ...new Map(
                usersData.filter(u => involvedIds.has(u.id)).map(u => [u.id, u])
            ).values()
        ];

        const edgeMap = {};
        transfers.forEach(t => {
            const key = `${t.userId}__${t.receiverUserId}`;
            if (!edgeMap[key]) {
                edgeMap[key] = { from: t.userId, to: t.receiverUserId, total: 0, count: 0 };
            }
            edgeMap[key].total += t.originalAmount || t.amount;
            edgeMap[key].count += 1;
        });

        setUsers(involvedUsers);
        setEdges(Object.values(edgeMap));
        setLoading(false);
    };

    const getNodePositions = () => {
        const positions = {};
        users.forEach((u, i) => {
            const angle = (2 * Math.PI * i) / users.length - Math.PI / 2;
            positions[u.id] = {
                x: CX + RADIUS * Math.cos(angle),
                y: CY + RADIUS * Math.sin(angle),
                name: u.name,
                initials: u.name?.substring(0, 2).toUpperCase() || '??'
            };
        });
        return positions;
    };

    const NODE_COLORS = [
        '#7c3aed', '#059669', '#dc2626', '#d97706', '#2563eb',
        '#db2777', '#0891b2', '#65a30d', '#9333ea', '#ea580c',
    ];

    const getUserColor = (userId) => {
        const idx = users.findIndex(u => u.id === userId);
        return NODE_COLORS[idx % NODE_COLORS.length];
    };

    const formatCurrency = (v) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v);

    const positions = getNodePositions();

    const biDirSet = new Set(
        edges.filter(e => edges.some(e2 => e2.from === e.to && e2.to === e.from))
             .map(e => `${e.from}__${e.to}`)
    );

    const getEdgeData = (from, to, side = 1, isBiDir = false) => {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const ux = dx / dist;
        const uy = dy / dist;

        const sx = from.x + ux * NODE_R;
        const sy = from.y + uy * NODE_R;
        const ex = to.x - ux * (NODE_R + 6);
        const ey = to.y - uy * (NODE_R + 6);

        const curveOffset = isBiDir ? 55 : 35;
        const cx = (sx + ex) / 2 - uy * curveOffset * side;
        const cy = (sy + ey) / 2 + ux * curveOffset * side;

        const lx = 0.25 * sx + 0.5 * cx + 0.25 * ex;
        const ly = 0.25 * sy + 0.5 * cy + 0.25 * ey;

        return {
            path: `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`,
            labelX: lx,
            labelY: ly,
        };
    };

    const isHighlighted = (edge) => {
        if (!selectedNode) return true;
        return edge.from === selectedNode || edge.to === selectedNode;
    };

    if (loading) {
        return (
            <div className="admin-graph-container">
                <div className="graph-loading">Cargando grafo de transferencias...</div>
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="admin-graph-container">
                <div className="graph-empty">No hay transferencias completadas para mostrar</div>
            </div>
        );
    }

    return (
        <div className="admin-graph-container">
            <div className="admin-graph-header">
                <h1>Grafo de Transferencias</h1>
                <p>Visualización de transferencias entre usuarios — haz clic en un nodo para ver sus conexiones</p>
            </div>

            <div className="graph-stats-bar">
                <div className="graph-stat">
                    <span className="graph-stat-num">{users.length}</span>
                    <span className="graph-stat-label">Usuarios</span>
                </div>
                <div className="graph-stat">
                    <span className="graph-stat-num">{edges.length}</span>
                    <span className="graph-stat-label">Conexiones</span>
                </div>
                <div className="graph-stat">
                    <span className="graph-stat-num">
                        {formatCurrency(edges.reduce((s, e) => s + e.total, 0))}
                    </span>
                    <span className="graph-stat-label">Total transferido</span>
                </div>
                {selectedNode && (
                    <button className="graph-clear-btn" onClick={() => setSelectedNode(null)}>
                        ✕ Limpiar selección
                    </button>
                )}
            </div>

            <div className="graph-svg-wrapper">
                <svg ref={svgRef} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="graph-svg">
                    <defs>
                        {users.map((u) => (
                            <marker key={u.id} id={`arrow-${u.id}`}
                                markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                                <path d="M0,0 L0,6 L8,3 z" fill={getUserColor(u.id)} />
                            </marker>
                        ))}
                        <marker id="arrow-dim" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                            <path d="M0,0 L0,6 L8,3 z" fill="#d1d5db" />
                        </marker>
                    </defs>

                    {edges.map((edge, i) => {
                        const from = positions[edge.from];
                        const to = positions[edge.to];
                        if (!from || !to) return null;
                        const highlighted = isHighlighted(edge);
                        const isBiDir = biDirSet.has(`${edge.from}__${edge.to}`);
                        const side = isBiDir
                            ? (edge.from < edge.to ? 1 : -1)
                            : 1;
                        const edgeData = getEdgeData(from, to, side, isBiDir);

                        return (
                            <g key={i}>
                                {(() => {
                                    const color = getUserColor(edge.from);
                                    return (
                                        <>
                                            <path
                                                d={edgeData.path}
                                                fill="none"
                                                stroke={highlighted ? color : '#e5e7eb'}
                                                strokeWidth={highlighted ? Math.min(1.5 + edge.count, 5) : 1}
                                                markerEnd={highlighted ? `url(#arrow-${edge.from})` : 'url(#arrow-dim)'}
                                                opacity={highlighted ? 0.9 : 0.25}
                                                style={{ cursor: 'pointer' }}
                                                onMouseEnter={(e) => setTooltip({
                                                    x: e.clientX, y: e.clientY,
                                                    text: `${positions[edge.from]?.name} → ${positions[edge.to]?.name}`,
                                                    sub: `${edge.count} transferencia(s) · ${formatCurrency(edge.total)}`
                                                })}
                                                onMouseLeave={() => setTooltip(null)}
                                            />
                                            {highlighted && (
                                                <g>
                                                    <rect
                                                        x={edgeData.labelX - 32} y={edgeData.labelY - 9}
                                                        width={64} height={18}
                                                        rx={5} fill={color} opacity={0.15}
                                                    />
                                                    <rect
                                                        x={edgeData.labelX - 32} y={edgeData.labelY - 9}
                                                        width={64} height={18}
                                                        rx={5} fill="white" opacity={0.75}
                                                    />
                                                    <text x={edgeData.labelX} y={edgeData.labelY + 1}
                                                        textAnchor="middle" dominantBaseline="middle"
                                                        fontSize="10" fill={color} fontWeight="800">
                                                        {formatCurrency(edge.total)}
                                                    </text>
                                                </g>
                                            )}
                                        </>
                                    );
                                })()}
                            </g>
                        );
                    })}

                    {users.map((u) => {
                        const pos = positions[u.id];
                        if (!pos) return null;
                        const isSelected = selectedNode === u.id;
                        const connectedEdges = edges.filter(e => e.from === u.id || e.to === u.id);
                        const totalInvolved = connectedEdges.reduce((s, e) => s + e.total, 0);
                        const color = getUserColor(u.id);
                        const dim = !selectedNode || isSelected;

                        return (
                            <g key={u.id} style={{ cursor: 'pointer' }}
                                onClick={() => setSelectedNode(isSelected ? null : u.id)}
                                onMouseEnter={(e) => setTooltip({
                                    x: e.clientX, y: e.clientY,
                                    text: u.name,
                                    sub: `${connectedEdges.length} conexión(es) · ${formatCurrency(totalInvolved)}`
                                })}
                                onMouseLeave={() => setTooltip(null)}
                            >
                                <circle cx={pos.x} cy={pos.y} r={NODE_R + 6}
                                    fill={color} opacity={isSelected ? 0.35 : (dim ? 0.15 : 0.08)} />
                                <circle cx={pos.x} cy={pos.y} r={NODE_R + 2}
                                    fill="none" stroke={color}
                                    strokeWidth={isSelected ? 3 : 1.5}
                                    opacity={dim ? 1 : 0.3} />
                                <circle cx={pos.x} cy={pos.y} r={NODE_R}
                                    fill={color} opacity={dim ? 1 : 0.3} />
                                <text x={pos.x} y={pos.y + 1} textAnchor="middle"
                                    dominantBaseline="middle" fontSize="12"
                                    fontWeight="bold" fill="white" opacity={dim ? 1 : 0.4}>
                                    {pos.initials}
                                </text>
                                <text x={pos.x} y={pos.y + NODE_R + 15} textAnchor="middle"
                                    fontSize="11" fill={color} fontWeight="700" opacity={dim ? 1 : 0.4}>
                                    {u.name?.split(' ')[0]}
                                </text>
                            </g>
                        );
                    })}
                </svg>

                {tooltip && (
                    <div className="graph-tooltip" style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}>
                        <div className="tooltip-title">{tooltip.text}</div>
                        <div className="tooltip-sub">{tooltip.sub}</div>
                    </div>
                )}
            </div>

            <AdminGraphs />
        </div>
    );
};

export default AdminGraph;
