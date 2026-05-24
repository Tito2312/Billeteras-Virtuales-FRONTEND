import React, { useState, useEffect } from 'react';
import { getAllAudits, getAllUsers } from '../../API/admin';
import './AdminAudit.css';

const AdminAudit = () => {
  const [audits, setAudits] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [auditsResult, usersResult] = await Promise.all([getAllAudits(), getAllUsers()]);

    if (usersResult.success && usersResult.data) {
      const map = {};
      usersResult.data.forEach(u => { map[u.id] = u; });
      setUsersMap(map);
    }

    if (auditsResult.success && auditsResult.data) {
      const sorted = [...auditsResult.data].sort((a, b) => new Date(b.date) - new Date(a.date));
      setAudits(sorted);
    }

    setLoading(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  const getRiskBadgeClass = (riskLevel) => {
    const level = riskLevel?.toLowerCase();
    if (level === 'alto') return 'risk-high';
    if (level === 'medio') return 'risk-medium';
    if (level === 'bajo') return 'risk-low';
    return 'risk-unknown';
  };

  const getRiskLabel = (riskLevel) => {
    const level = riskLevel?.toLowerCase();
    if (level === 'alto') return 'Alto';
    if (level === 'medio') return 'Medio';
    if (level === 'bajo') return 'Bajo';
    return riskLevel || 'Desconocido';
  };

  const filteredAudits = audits.filter(audit => {
    const user = usersMap[audit.userId];
    const matchesSearch =
      audit.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audit.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.documentNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === 'all' || audit.nivelRiesgo?.toLowerCase() === filterRisk.toLowerCase();
    return matchesSearch && matchesRisk;
  });

  if (loading) {
    return (
      <div className="admin-audit-container">
        <div className="loading-spinner"></div>
        <p>Cargando auditoría...</p>
      </div>
    );
  }

  return (
    <div className="admin-audit-container">
      <div className="admin-audit-header">
        <h1>Auditoría del Sistema</h1>
        <p>Historial de acciones y eventos de seguridad</p>
      </div>

      <div className="admin-audit-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por nombre, cédula o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <select value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)}>
            <option value="all">Todos los niveles</option>
            <option value="alto">Riesgo Alto</option>
            <option value="medio">Riesgo Medio</option>
            <option value="bajo">Riesgo Bajo</option>
          </select>
        </div>
        <button className="refresh-btn" onClick={loadData}>⟳ Actualizar</button>
      </div>

      <div className="admin-audit-table-container">
        <table className="admin-audit-table">
          <thead>
            <tr>
              <th>Fecha/Hora</th>
              <th>Cédula</th>
              <th>Transacción ID</th>
              <th>Nivel de Riesgo</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            {filteredAudits.map(audit => {
              const user = usersMap[audit.userId];
              return (
                <tr key={audit.id}>
                  <td className="date-cell">{formatDate(audit.date)}</td>
                  <td className="user-cell">{user?.documentNumber || '-'}</td>
                  <td className="transaction-cell">{audit.transactionId || '-'}</td>
                  <td>
                    <span className={`risk-badge ${getRiskBadgeClass(audit.nivelRiesgo)}`}>
                      {getRiskLabel(audit.nivelRiesgo)}
                    </span>
                  </td>
                  <td className="description-cell">{audit.descripcion || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredAudits.length === 0 && (
          <div className="empty-audit">
            <p>No hay registros de auditoría</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAudit;
