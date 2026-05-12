// Profile.js - Perfil de usuario (ver y editar datos)
// Conectado a la API real: GET /api/users/{id}, PUT /api/users/{id}

import React, { useState, useEffect } from 'react';
import { getUserById, updateUser, getCurrentUser } from '../../API/auth';
import './Profile.css';

const Profile = ({ user, onUpdateUser }) => {
  // Estado para modo edición y carga
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Datos del usuario (vienen de la API)
  const [userData, setUserData] = useState({
    id: '',
    nombre: '',
    email: '',
    telefono: '',
    documento: '',
    nivel: '',
    puntos: 0,
    fechaRegistro: '',
    ultimoAcceso: ''
  });
  
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  
  const formatNumber = (value) => {
    return new Intl.NumberFormat('es-CO').format(value || 0);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };
  
  // Cargar datos del usuario desde la API
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      const userId = user?.id || getCurrentUser()?.id;
      
      if (!userId) {
        console.error('No se encontró ID de usuario');
        setIsLoading(false);
        return;
      }
      
      const result = await getUserById(userId);
      
      if (result.success && result.data) {
        const apiUser = result.data;
        setUserData({
          id: apiUser.id,
          nombre: apiUser.name || '',
          email: apiUser.email || '',
          telefono: apiUser.phoneNumber || '',
          documento: apiUser.documento || 'No registrado',
          nivel: apiUser.level || 'Bronce',
          puntos: apiUser.points || 0,
          fechaRegistro: formatDate(apiUser.registrationDate),
          ultimoAcceso: new Date().toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        });
        setFormData({
          nombre: apiUser.name || '',
          email: apiUser.email || '',
          telefono: apiUser.phoneNumber || '',
          documento: apiUser.documento || ''
        });
      } else {
        console.error('Error al cargar usuario:', result.message);
      }
      setIsLoading(false);
    };
    
    loadUserData();
  }, [user]);
  
  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre?.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!formData.email?.trim()) newErrors.email = 'El email es obligatorio';
    if (!formData.telefono?.trim()) newErrors.telefono = 'El teléfono es obligatorio';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un email válido';
    }
    return newErrors;
  };
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    setFormData({
      nombre: userData.nombre,
      email: userData.email,
      telefono: userData.telefono,
      documento: userData.documento
    });
    setIsEditing(false);
    setErrors({});
  };
  
  const handleSave = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSaving(true);
    const userId = user?.id || getCurrentUser()?.id;
    
    const result = await updateUser(userId, {
      name: formData.nombre,
      email: formData.email,
      phoneNumber: formData.telefono
    });
    
    if (result.success) {
      // Actualizar datos locales
      setUserData(prev => ({
        ...prev,
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono
      }));
      setIsEditing(false);
      
      // Actualizar usuario en localStorage
      const currentUser = getCurrentUser();
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      // Notificar al padre
      if (onUpdateUser) {
        onUpdateUser(result.data);
      }
      
      alert('✅ Perfil actualizado exitosamente');
    } else {
      alert('❌ Error al actualizar: ' + result.message);
    }
    setIsSaving(false);
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
  
  if (isLoading) {
    return (
      <div className="profile-page">
        <div className="loading-container-profile">
          <div className="loading-spinner-small"></div>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }
  
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
              <span>{userData.nombre?.charAt(0) || 'U'}{userData.nombre?.split(' ')[1]?.charAt(0) || ''}</span>
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
                    value={formData.nombre || ''}
                    onChange={handleChange}
                    className={errors.nombre ? 'error' : ''}
                  />
                  {errors.nombre && <span className="error-text">{errors.nombre}</span>}
                </>
              ) : (
                <div className="field-value">{userData.nombre || 'No registrado'}</div>
              )}
            </div>
            
            <div className="form-group">
              <label>Correo electrónico *</label>
              {isEditing ? (
                <>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </>
              ) : (
                <div className="field-value">{userData.email || 'No registrado'}</div>
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
                      value={formData.telefono || ''}
                      onChange={handleChange}
                      className={errors.telefono ? 'error' : ''}
                    />
                    {errors.telefono && <span className="error-text">{errors.telefono}</span>}
                  </>
                ) : (
                  <div className="field-value">{userData.telefono || 'No registrado'}</div>
                )}
              </div>
              
              <div className="form-group">
                <label>Documento</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="documento"
                    value={formData.documento || ''}
                    onChange={handleChange}
                    disabled
                    className="disabled-field"
                  />
                ) : (
                  <div className="field-value">{userData.documento || 'No registrado'}</div>
                )}
                <small className="field-hint">El documento no puede ser modificado</small>
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
                <button className="btn-cancel" onClick={handleCancel} disabled={isSaving}>
                  Cancelar
                </button>
                <button className="btn-save" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
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