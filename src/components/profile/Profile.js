// Profile.js - Perfil de usuario (ver y editar datos)
// Basado en los endpoints: GET /api/users/{id}, PUT /api/users/{id}

import React, { useState } from 'react';
import './Profile.css';

const Profile = ({ user, onUpdateUser }) => {
  // Estado para modo edición
  const [isEditing, setIsEditing] = useState(false);
  
  // Datos del usuario (simulados, después vendrán del backend)
  const [userData, setUserData] = useState({
    id: user?.id || '1',
    nombre: user?.nombre || 'María González',
    email: user?.email || 'maria.gonzalez@email.com',
    telefono: '300 123 4567',
    documento: 'CC 12345678',
    nivel: user?.nivel || 'Oro',
    puntos: user?.puntos || 12450,
    fechaRegistro: '15 de enero de 2025',
    ultimoAcceso: '10 de abril de 2026, 10:30'
  });
  
  const [formData, setFormData] = useState({ ...userData });
  const [errors, setErrors] = useState({});
  
  const formatNumber = (value) => {
    return new Intl.NumberFormat('es-CO').format(value);
  };
  
  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!formData.email.trim()) newErrors.email = 'El email es obligatorio';
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es obligatorio';
    if (!formData.documento.trim()) newErrors.documento = 'El documento es obligatorio';
    return newErrors;
  };
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    setFormData({ ...userData });
    setIsEditing(false);
    setErrors({});
  };
  
  const handleSave = () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setUserData({ ...formData });
    setIsEditing(false);
    
    // Simular actualización (después conectará con API)
    if (onUpdateUser) {
      onUpdateUser(formData);
    }
    
    alert('✅ Perfil actualizado exitosamente\n\n⚠️ Próximamente se conectará con el backend.');
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };
  
  const getLevelColor = () => {
    switch(userData.nivel) {
      case 'Platino': return '#e5e4e2';
      case 'Oro': return '#ffd700';
      case 'Plata': return '#c0c0c0';
      default: return '#cd7f32';
    }
  };
  
  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Mi Perfil</h1>
        <p>Gestiona tu información personal</p>
      </div>
      
      <div className="profile-container">
        {/* Avatar y nivel */}
        <div className="profile-sidebar">
          <div className="profile-avatar">
            <div className="avatar-large">
              <span>{userData.nombre.charAt(0)}{userData.nombre.split(' ')[1]?.charAt(0) || ''}</span>
            </div>
            <div className="profile-level" style={{ backgroundColor: getLevelColor() }}>
              {userData.nivel}
            </div>
            <div className="profile-points">
              <span className="points-icon">⭐</span>
              <span className="points-value">{formatNumber(userData.puntos)} puntos</span>
            </div>
          </div>
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-label">Miembro desde</span>
              <span className="stat-value">{userData.fechaRegistro}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Último acceso</span>
              <span className="stat-value">{userData.ultimoAcceso}</span>
            </div>
          </div>
        </div>
        
        {/* Formulario de datos */}
        <div className="profile-form-container">
          <div className="form-header">
            <h2>Información Personal</h2>
            {!isEditing && (
              <button className="btn-edit-profile" onClick={handleEdit}>
                ✏️ Editar perfil
              </button>
            )}
          </div>
          
          <div className="profile-form">
            <div className="form-group">
              <label>Nombre completo *</label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className={errors.nombre ? 'error' : ''}
                  />
                  {errors.nombre && <span className="error-text">{errors.nombre}</span>}
                </>
              ) : (
                <div className="field-value">{userData.nombre}</div>
              )}
            </div>
            
            <div className="form-group">
              <label>Correo electrónico *</label>
              {isEditing ? (
                <>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </>
              ) : (
                <div className="field-value">{userData.email}</div>
              )}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Teléfono *</label>
                {isEditing ? (
                  <>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className={errors.telefono ? 'error' : ''}
                    />
                    {errors.telefono && <span className="error-text">{errors.telefono}</span>}
                  </>
                ) : (
                  <div className="field-value">{userData.telefono}</div>
                )}
              </div>
              
              <div className="form-group">
                <label>Documento *</label>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      name="documento"
                      value={formData.documento}
                      onChange={handleChange}
                      className={errors.documento ? 'error' : ''}
                    />
                    {errors.documento && <span className="error-text">{errors.documento}</span>}
                  </>
                ) : (
                  <div className="field-value">{userData.documento}</div>
                )}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Nivel</label>
                <div className="field-value level-display" style={{ color: getLevelColor() }}>
                  {userData.nivel}
                </div>
              </div>
              
              <div className="form-group">
                <label>Puntos</label>
                <div className="field-value">{formatNumber(userData.puntos)} pts</div>
              </div>
            </div>
            
            {isEditing && (
              <div className="form-buttons">
                <button className="btn-cancel" onClick={handleCancel}>
                  Cancelar
                </button>
                <button className="btn-save" onClick={handleSave}>
                  Guardar Cambios
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;