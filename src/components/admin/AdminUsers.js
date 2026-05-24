import React, { useState, useEffect } from 'react';
import { getAllUsers, activateUser, deactivateUser } from '../../API/admin';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const result = await getAllUsers();
    if (result.success && result.data) {
      setUsers(result.data);
    }
    setLoading(false);
  };

  const handleActivateUser = async (userId, isActive) => {
    const result = isActive ? await activateUser(userId) : await deactivateUser(userId);

    if (result.success) {
      alert(`✅ Usuario ${isActive ? 'activado' : 'desactivado'} exitosamente`);
      loadUsers();
    } else {
      alert(`❌ Error al ${isActive ? 'activar' : 'desactivar'} usuario: ${result.message}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || 
                        (filterRole === 'admin' && (user.role === 'ROLE_ADMIN' || user.role === 'ADMIN')) ||
                        (filterRole === 'user' && user.role !== 'ROLE_ADMIN' && user.role !== 'ADMIN');
    const matchesStatus = filterStatus === 'all' ||
                          (filterStatus === 'active' && user.active) ||
                          (filterStatus === 'inactive' && !user.active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="admin-users-container">
        <div className="loading-spinner"></div>
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="admin-users-container">
      <div className="admin-users-header">
        <h1>Gestión de Usuarios</h1>
        <p>Administra los usuarios de la plataforma</p>
      </div>

      <div className="admin-users-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="all">Todos los roles</option>
            <option value="admin">Administradores</option>
            <option value="user">Usuarios normales</option>
          </select>
        </div>
        <div className="filter-box">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
        <button className="refresh-btn" onClick={loadUsers}>⟳ Actualizar</button>
      </div>

      <div className="admin-users-table-container">
        <table className="admin-users-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Documento</th>
              <th>Teléfono</th>
              <th>Nivel</th>
              <th>Puntos</th>
              <th>Rol</th>
              <th>Registro</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>{user.name || '-'}</td>
                <td>{user.email || '-'}</td>
                <td>{user.documentNumber || '-'}</td>
                <td>{user.phoneNumber || '-'}</td>
                <td>{user.level || 'Bronce'}</td>
                <td>{user.points || 0}</td>
                <td>
                  <span className={`role-badge ${user.role === 'ROLE_ADMIN' || user.role === 'ADMIN' ? 'role-admin' : 'role-user'}`}>
                    {user.role === 'ROLE_ADMIN' || user.role === 'ADMIN' ? 'Admin' : 'Usuario'}
                  </span>
                </td>
                <td>{formatDate(user.registrationDate)}</td>
                <td>
                  <span className={`status-badge ${user.active ? 'status-active' : 'status-inactive'}`}>
                    {user.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    {user.active ? (
                      <button 
                        className="action-btn deactivate"
                        onClick={() => handleActivateUser(user.id, false)}
                        title="Desactivar"
                      >
                        🔒
                      </button>
                    ) : (
                      <button 
                        className="action-btn activate"
                        onClick={() => handleActivateUser(user.id, true)}
                        title="Activar"
                      >
                        🔓
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="empty-users">
            <p>No hay usuarios que coincidan con los filtros</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
