// Profile.js - Perfil de usuario (ver y editar datos)
// El correo electrónico NO se puede modificar

import React, { useState, useEffect } from 'react';
import { getUserById, updateUser } from '../../API/users';
import { getCurrentUser } from '../../API/auth';
import './Profile.css';

const Profile = ({ user, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
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
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };
  
  const loadUserData = async (userId) => {
    setIsLoading(true);
    
    const result = await getUserById(userId);
    
    if (result.success && result.data) {
      const apiUser = result.data;
      const newUserData = {
        id: apiUser.id,
        nombre: apiUser.name || '',
        email: apiUser.email || '',
        telefono: apiUser.phoneNumber || '',
        documento: apiUser.documento || 'No registrado',
        nivel: apiUser.level || 'Bronce',
        puntos: apiUser.points || 0,
        fechaRegistro: formatDate(apiUser.registrationDate),
        ultimoAcceso: new Date().toLocaleDateString('es-ES', {
          day: 'numeric', month: 'long', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        })
      };
      setUserData(newUserData);
      setFormData({
        nombre: apiUser.name || '',
        email: apiUser.email || '',
        telefono: apiUser.phoneNumber || '',
        documento: apiUser.documento || ''
      });
      
      const currentStoredUser = getCurrentUser();
      if (currentStoredUser) {
        const updatedStoredUser = {
          ...currentStoredUser,
          nombre: apiUser.name || '',
          email: apiUser.email || '',
          telefono: apiUser.phoneNumber || '',
          nivel: apiUser.level || 'Bronce',
          puntos: apiUser.points || 0
        };
        localStorage.setItem('user', JSON.stringify(updatedStoredUser));
        if (onUpdateUser) onUpdateUser(updatedStoredUser);
      }
    }
    setIsLoading(false);
  };
  
  useEffect(() => {
    const userId = user?.id || getCurrentUser()?.id;
    if (userId) {
      loadUserData(userId);
    } else {
      setIsLoading(false);
    }
  }, [user?.id]);
  
  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre?.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!formData.telefono?.trim()) newErrors.telefono = 'El teléfono es obligatorio';
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
      phoneNumber: formData.telefono
    });
    
    if (result.success) {
      await loadUserData(userId);
      setIsEditing(false);
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
  
  // Función para copiar ID al portapapeles
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('✅ ID copiado al portapapeles');
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
              <span className="stat-label">ID de Usuario</span>
              <div className="stat-value-with-copy">
                <span className="stat-value-id">{userData.id || 'No disponible'}</span>
                <button 
                  className="btn-copy-id" 
                  onClick={() => copyToClipboard(userData.id)}
                  title="Copiar ID"
                >
                  📋
                </button>
              </div>
              <small className="stat-hint">Usa este ID para recibir transferencias</small>
            </div>
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
              <label>Correo electrónico</label>
              <div className="field-value email-field">
                {userData.email || 'No registrado'}
              </div>
              <small className="field-hint">El correo electrónico no puede ser modificado</small>
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
                <div className="field-value disabled-field">{userData.documento || 'No registrado'}</div>
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