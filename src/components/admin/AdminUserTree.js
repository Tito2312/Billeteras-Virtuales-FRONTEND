import React, { useState, useEffect, useRef } from 'react';
import { getAllUsers } from '../../API/admin';
import { getOrderedUsers, getUsersByRange, getTopUser, getUsersByLevel } from '../../API/admin';
import './AdminUserTree.css';

// ── Constantes de layout ──────────────────────────────
const NODE_R   = 22;
const H_GAP    = 58;   // espacio horizontal entre nodos
const V_GAP    = 88;   // espacio vertical entre niveles
const PAD      = 50;

// ── BST helpers ───────────────────────────────────────
const bstInsert = (root, user) => {
    if (!root) return { user, points: user.points, left: null, right: null };
    if (user.points <= root.points) return { ...root, left: bstInsert(root.left, user) };
    return { ...root, right: bstInsert(root.right, user) };
};

const buildBST = (users) => users.reduce((root, u) => bstInsert(root, u), null);

// Asigna índice x via inorder (izquierda → nodo → derecha)
const assignXIndex = (node, counter = { v: 0 }) => {
    if (!node) return;
    assignXIndex(node.left, counter);
    node.xIdx = counter.v++;
    assignXIndex(node.right, counter);
};

const assignDepth = (node, d = 0) => {
    if (!node) return;
    node.depth = d;
    assignDepth(node.left, d + 1);
    assignDepth(node.right, d + 1);
};

// Recorre el árbol y recolecta { node, x, y, px, py }
const collectLayout = (node, parentPos, result) => {
    if (!node) return;
    const x = node.xIdx * H_GAP + PAD;
    const y = node.depth * V_GAP + PAD;
    result.push({ node, x, y, px: parentPos?.x ?? null, py: parentPos?.y ?? null });
    collectLayout(node.left,  { x, y }, result);
    collectLayout(node.right, { x, y }, result);
};

// ── Colores por nivel ─────────────────────────────────
const getLevelStyle = (points) => {
    if (points > 5000) return { fill: '#7c3aed', text: '#fff', label: 'Platino' };
    if (points > 1000) return { fill: '#d97706', text: '#fff', label: 'Oro' };
    if (points > 500)  return { fill: '#64748b', text: '#fff', label: 'Plata' };
    return                    { fill: '#b45309', text: '#fff', label: 'Bronce' };
};

const LEVELS = [
    { key: 'ALL',      label: 'Todos',   color: '#6b7280' },
    { key: 'BRONZE',   label: 'Bronce',  color: '#b45309' },
    { key: 'SILVER',   label: 'Plata',   color: '#64748b' },
    { key: 'GOLD',     label: 'Oro',     color: '#d97706' },
    { key: 'PLATINUM', label: 'Platino', color: '#7c3aed' },
];

const LEVEL_RANGES = {
    BRONZE:   [0, 500],
    SILVER:   [501, 1000],
    GOLD:     [1001, 5000],
    PLATINUM: [5001, 999999],
};

const fmt = (p) => new Intl.NumberFormat('es-CO').format(p || 0);

// ── Componente principal ──────────────────────────────
const AdminUserTree = () => {
    const [rawUsers, setRawUsers]       = useState([]); // orden MongoDB (para construir BST)
    const [topUser, setTopUser]         = useState(null);
    const [displayUsers, setDisplayUsers] = useState([]); // lista ranking
    const [loading, setLoading]         = useState(true);
    const [activeLevel, setActiveLevel] = useState('ALL');
    const [rangeMin, setRangeMin]       = useState('');
    const [rangeMax, setRangeMax]       = useState('');
    const [tooltip, setTooltip]         = useState(null);
    const [searchMode, setSearchMode]   = useState('level');
    const svgWrapRef = useRef(null);

    useEffect(() => { loadAll(); }, []);

    const loadAll = async () => {
        setLoading(true);
        const [allRes, orderedRes, topRes] = await Promise.all([
            getAllUsers(),
            getOrderedUsers(),
            getTopUser(),
        ]);
        if (allRes.success)     setRawUsers(allRes.data);
        if (orderedRes.success) setDisplayUsers([...orderedRes.data].reverse());
        if (topRes.success)     setTopUser(topRes.data);
        setLoading(false);
    };

    // ── Construir y calcular layout del árbol ──────────
    const buildLayout = () => {
        if (!rawUsers.length) return { nodes: [], svgW: 0, svgH: 0 };
        const root = buildBST(rawUsers);
        assignXIndex(root);
        assignDepth(root);
        const result = [];
        collectLayout(root, null, result);
        const maxX = Math.max(...result.map(n => n.x));
        const maxY = Math.max(...result.map(n => n.y));
        return {
            nodes: result,
            svgW: maxX + PAD + NODE_R * 2,
            svgH: maxY + PAD + NODE_R * 3 + 20,
        };
    };

    const { nodes, svgW, svgH } = buildLayout();

    // ── Filtros ────────────────────────────────────────
    const handleLevelFilter = async (key) => {
        setActiveLevel(key);
        setSearchMode('level');
        if (key === 'ALL') {
            const res = await getOrderedUsers();
            setDisplayUsers(res.success ? [...res.data].reverse() : []);
        } else {
            const res = await getUsersByLevel(key);
            setDisplayUsers(res.success ? [...res.data].reverse() : []);
        }
    };

    const handleRangeSearch = async () => {
        const min = parseInt(rangeMin) || 0;
        const max = parseInt(rangeMax) || 999999;
        setSearchMode('range');
        setActiveLevel('ALL');
        const res = await getUsersByRange(min, max);
        setDisplayUsers(res.success ? [...res.data].reverse() : []);
    };

    if (loading) return (
        <div className="tree-container">
            <div className="tree-loading">Cargando árbol de usuarios...</div>
        </div>
    );

    return (
        <div className="tree-container">
            {/* Header */}
            <div className="tree-header">
                <h1>Ranking de Usuarios</h1>
                <p>Usuarios clasificados por puntos acumulados mediante un Árbol Binario de Búsqueda (BST).</p>
            </div>

            {/* ── SECCIÓN 1: ORGANIZAR POR PUNTOS ── */}
            <div className="tree-section-label">
                <span className="tree-section-num">1</span>
                <span>Organizar usuarios según puntos acumulados</span>
            </div>
            <div className="tree-visual-card">
                <div className="tree-visual-title">
                    <span className="tree-visual-icon">🌳</span>
                    Árbol BST — nodos coloreados por nivel de puntos
                </div>
                {nodes.length === 0 ? (
                    <div className="tree-empty">No hay usuarios para mostrar</div>
                ) : (
                    <div className="tree-svg-scroll" ref={svgWrapRef}>
                        <svg
                            width={svgW}
                            height={svgH}
                            className="tree-svg"
                        >
                            {/* Aristas primero (debajo de los nodos) */}
                            {nodes.map((n, i) =>
                                n.px !== null ? (
                                    <line
                                        key={`e-${i}`}
                                        x1={n.px} y1={n.py + NODE_R}
                                        x2={n.x}  y2={n.y - NODE_R}
                                        stroke="#cbd5e1"
                                        strokeWidth="1.5"
                                    />
                                ) : null
                            )}

                            {/* Nodos */}
                            {nodes.map((n, i) => {
                                const style = getLevelStyle(n.node.points);
                                const initials = n.node.user?.name?.substring(0, 2).toUpperCase() || '??';
                                const firstName = n.node.user?.name?.split(' ')[0] || '';
                                return (
                                    <g
                                        key={`n-${i}`}
                                        style={{ cursor: 'pointer' }}
                                        onMouseEnter={(e) => setTooltip({ x: e.clientX, y: e.clientY, user: n.node.user })}
                                        onMouseLeave={() => setTooltip(null)}
                                    >
                                        {/* Sombra */}
                                        <circle cx={n.x} cy={n.y} r={NODE_R + 2} fill="rgba(0,0,0,0.08)" />
                                        {/* Nodo */}
                                        <circle cx={n.x} cy={n.y} r={NODE_R} fill={style.fill} />
                                        {/* Iniciales */}
                                        <text
                                            x={n.x} y={n.y + 1}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            fontSize="11"
                                            fontWeight="bold"
                                            fill={style.text}
                                        >
                                            {initials}
                                        </text>
                                        {/* Puntos sobre el nodo */}
                                        <text
                                            x={n.x} y={n.y - NODE_R - 6}
                                            textAnchor="middle"
                                            fontSize="9"
                                            fill="#64748b"
                                            fontWeight="600"
                                        >
                                            {fmt(n.node.points)} pts
                                        </text>
                                        {/* Nombre debajo */}
                                        <text
                                            x={n.x} y={n.y + NODE_R + 13}
                                            textAnchor="middle"
                                            fontSize="10"
                                            fill="#374151"
                                            fontWeight="500"
                                        >
                                            {firstName}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                )}

                {/* Leyenda */}
                <div className="tree-legend">
                    {[
                        { label: 'Bronce',  color: '#b45309', range: '0 – 500 pts' },
                        { label: 'Plata',   color: '#64748b', range: '501 – 1000 pts' },
                        { label: 'Oro',     color: '#d97706', range: '1001 – 5000 pts' },
                        { label: 'Platino', color: '#7c3aed', range: '5001+ pts' },
                    ].map(l => (
                        <div key={l.label} className="tree-legend-item">
                            <span className="tree-legend-dot" style={{ background: l.color }} />
                            <span className="tree-legend-label">{l.label}</span>
                            <span className="tree-legend-range">{l.range}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── SECCIÓN 2: CLASIFICAR NIVELES ── */}
            <div className="tree-section-label">
                <span className="tree-section-num">2</span>
                <span>Clasificar niveles de fidelización</span>
            </div>

            {/* ── TOP USER ── */}
            {topUser && (
                <div className="tree-top-card">
                    <div className="tree-top-crown">👑</div>
                    <div className="tree-top-info">
                        <span className="tree-top-label">Nodo máximo del BST — mayor a la derecha</span>
                        <span className="tree-top-name">{topUser.name}</span>
                        <span className="tree-top-email">{topUser.email}</span>
                    </div>
                    <div className="tree-top-points">
                        <span className="tree-top-pts-num">{fmt(topUser.points)}</span>
                        <span className="tree-top-pts-label">puntos</span>
                    </div>
                    <div className="tree-top-badge" style={{ background: getLevelStyle(topUser.points).fill }}>
                        {getLevelStyle(topUser.points).label}
                    </div>
                </div>
            )}

            {/* ── STATS POR NIVEL ── */}
            <div className="tree-level-stats">
                {LEVELS.filter(l => l.key !== 'ALL').map(l => {
                    const [min, max] = LEVEL_RANGES[l.key];
                    const count = rawUsers.filter(u => u.points >= min && u.points <= max).length;
                    return (
                        <div key={l.key} className="tree-level-stat" style={{ borderColor: l.color }}>
                            <span className="tree-level-stat-count" style={{ color: l.color }}>{count}</span>
                            <span className="tree-level-stat-label">{l.label}</span>
                            <span className="tree-level-stat-range">{min} – {max === 999999 ? '∞' : max} pts</span>
                        </div>
                    );
                })}
            </div>

            {/* ── SECCIÓN 3: BÚSQUEDA POR RANGO ── */}
            <div className="tree-section-label">
                <span className="tree-section-num">3</span>
                <span>Búsquedas eficientes por rango de puntos</span>
            </div>

            {/* ── FILTROS ── */}
            <div className="tree-filters">
                <div className="tree-level-tabs">
                    {LEVELS.map(l => (
                        <button
                            key={l.key}
                            className={`tree-level-tab ${activeLevel === l.key && searchMode === 'level' ? 'active' : ''}`}
                            style={activeLevel === l.key && searchMode === 'level'
                                ? { background: l.color, borderColor: l.color, color: '#fff' }
                                : { borderColor: l.color, color: l.color }}
                            onClick={() => handleLevelFilter(l.key)}
                        >
                            {l.label}
                        </button>
                    ))}
                </div>
                <div className="tree-range-search">
                    <span className="tree-range-label">Rango de puntos:</span>
                    <input type="number" placeholder="Mín" value={rangeMin}
                        onChange={e => setRangeMin(e.target.value)} className="tree-range-input" />
                    <span>—</span>
                    <input type="number" placeholder="Máx" value={rangeMax}
                        onChange={e => setRangeMax(e.target.value)} className="tree-range-input" />
                    <button className="tree-range-btn" onClick={handleRangeSearch}>Buscar</button>
                </div>
            </div>

            {/* ── SECCIÓN 4: REPORTE ORDENADO ── */}
            <div className="tree-section-label">
                <span className="tree-section-num">4</span>
                <span>Reporte ordenado — recorrido inorder del BST</span>
            </div>

            {/* ── TABLA RANKING ── */}
            <div className="tree-table-wrapper">
                <div className="tree-table-header-row">
                    <span className="tree-col-rank">Pos.</span>
                    <span className="tree-col-user">Usuario</span>
                    <span className="tree-col-doc">Cédula</span>
                    <span className="tree-col-level">Nivel</span>
                    <span className="tree-col-points">Puntos</span>
                    <span className="tree-col-bar">Progreso</span>
                </div>
                {displayUsers.length === 0 ? (
                    <div className="tree-empty">No hay usuarios en este rango</div>
                ) : (
                    displayUsers.map((u, i) => {
                        const lvl = getLevelStyle(u.points);
                        const pct = Math.min((u.points / Math.max(displayUsers[0]?.points || 1, 1)) * 100, 100);
                        return (
                            <div key={u.id || i} className="tree-row">
                                <span className="tree-col-rank">
                                    {i === 0 ? <span className="rank-medal">🥇</span>
                                     : i === 1 ? <span className="rank-medal">🥈</span>
                                     : i === 2 ? <span className="rank-medal">🥉</span>
                                     : <span className="rank-num">#{i + 1}</span>}
                                </span>
                                <span className="tree-col-user">
                                    <div className="tree-user-avatar" style={{ background: lvl.fill }}>
                                        {u.name?.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="tree-user-name">{u.name}</div>
                                        <div className="tree-user-email">{u.email}</div>
                                    </div>
                                </span>
                                <span className="tree-col-doc">{u.documentNumber || '—'}</span>
                                <span className="tree-col-level">
                                    <span className="tree-level-badge"
                                        style={{ background: lvl.fill + '22', color: lvl.fill }}>
                                        {lvl.label}
                                    </span>
                                </span>
                                <span className="tree-col-points tree-pts-val">{fmt(u.points)}</span>
                                <span className="tree-col-bar">
                                    <div className="tree-bar-track">
                                        <div className="tree-bar-fill"
                                            style={{ width: `${pct}%`, background: lvl.fill }} />
                                    </div>
                                </span>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="tree-footer-note">
                BST: inserción por puntos → nodo menor va a la izquierda, mayor a la derecha.
                Recorrido inorder = lista ordenada de menor a mayor.
                El nodo máximo siempre está en el extremo derecho del árbol.
            </div>

            {/* Tooltip */}
            {tooltip && (
                <div className="tree-tooltip" style={{ left: tooltip.x + 14, top: tooltip.y - 12 }}>
                    <div className="tt-name">{tooltip.user?.name}</div>
                    <div className="tt-sub">{fmt(tooltip.user?.points)} pts — {getLevelStyle(tooltip.user?.points).label}</div>
                    <div className="tt-sub">{tooltip.user?.email}</div>
                </div>
            )}
        </div>
    );
};

export default AdminUserTree;
