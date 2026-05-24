import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../../API/auth';
import { getUserById, updateUser, changePasswordLogged } from '../../API/auth';
import { useLevelBenefits } from '../../hooks/useLevelBenefits';
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

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState({ text: '', type: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  const translateLevel = (level) => {
    const levelMap = {
      'Bronze': 'Bronce',
      'Silver': 'Plata',
      'Gold': 'Oro',
      'Platinum': 'Platino'
    };
    return levelMap[level] || level || 'Bronce';
  };

  const benefits = useLevelBenefits(userData.nivel);

  const formatNumber = (value) => {
    return new Intl.NumberFormat('es-CO').format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    try {

      const normalized = dateString.includes('T') ? dateString : dateString + 'T12:00:00';
      const date = new Date(normalized);
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
        documento: apiUser.documentNumber || 'No registrado',
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
        documento: apiUser.documentNumber || ''
      });

      const currentStoredUser = getCurrentUser();
      if (currentStoredUser) {
        const updatedStoredUser = {
          ...currentStoredUser,
          nombre: apiUser.name || '',
          email: apiUser.email || '',
          telefono: apiUser.phoneNumber || '',
          nivel: apiUser.level || 'Bronce',
          puntos: apiUser.points || 0,
          documento: apiUser.documentNumber || ''
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

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordMessage({ text: '', type: '' });
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
      email: userData.email,
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
    switch(translateLevel(userData.nivel)) {
      case 'Platino': return '#e5e4e2';
      case 'Oro': return '#ffd700';
      case 'Plata': return '#c0c0c0';
      default: return '#cd7f32';
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ text: '❌ Todos los campos son obligatorios', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ text: '❌ La nueva contraseña debe tener al menos 6 caracteres', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: '❌ Las contraseñas nuevas no coinciden', type: 'error' });
      return;
    }

    setChangingPassword(true);
    try {
      const result = await changePasswordLogged(currentPassword, newPassword, confirmPassword);
      if (result.success) {
        setPasswordMessage({ text: '✅ Contraseña cambiada exitosamente', type: 'success' });

        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMessage({ text: `❌ ${result.message}`, type: 'error' });
      }
    } catch (err) {
      setPasswordMessage({ text: '❌ Error al cambiar la contraseña', type: 'error' });
    } finally {
      setChangingPassword(false);
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
        <div className="profile-sidebar">
          <div className="profile-avatar">
            <div className="avatar-large">
              <span>{userData.nombre?.charAt(0) || 'U'}{userData.nombre?.split(' ')[1]?.charAt(0) || ''}</span>
            </div>
            <div className="profile-level" style={{ backgroundColor: getLevelColor() }}>
              {translateLevel(userData.nivel)}
            </div>
            <div className="profile-points">
              <span className="points-icon">⭐</span>
              <span className="points-value">{formatNumber(userData.puntos)} puntos</span>
            </div>
          </div>

          <div className="profile-benefits">
            <h3>Beneficios de {translateLevel(userData.nivel)}</h3>
            <div className="benefits-list-profile">
              <div className="benefit-item-profile">
                <span className="benefit-label">Comisión:</span>
                <span className="benefit-value">{benefits.formatCommissionRate()}</span>
              </div>
              <div className="benefit-item-profile">
                <span className="benefit-label">Límite diario:</span>
                <span className="benefit-value">
                  {benefits.dailyTransferCount === Infinity ? 'Ilimitado' : `${benefits.dailyTransferCount} transferencias`}
                </span>
              </div>
              <div className="benefit-item-profile">
                <span className="benefit-label">Bono de puntos:</span>
                <span className="benefit-value">{benefits.formatPointsBonus()}</span>
              </div>
              <div className="benefit-item-profile">
                <span className="benefit-label">Prioridad:</span>
                <span className="benefit-value">
                  {benefits.processingPriority === 1 ? 'Máxima' : 
                   benefits.processingPriority === 2 ? 'Alta' :
                   benefits.processingPriority === 3 ? 'Media' : 'Baja'}
                </span>
              </div>
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
                  {translateLevel(userData.nivel)}
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

          <div className="profile-change-password-section">
            <h3>🔒 Cambiar Contraseña</h3>
            <div className="change-password-form">
              <div className="form-group">
                <label>Contraseña actual</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Nueva contraseña</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <div className="form-group">
                  <label>Confirmar nueva contraseña</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la nueva"
                  />
                </div>
              </div>
              <button
                className="btn-change-password"
                onClick={handleChangePassword}
                disabled={changingPassword}
              >
                {changingPassword ? 'Actualizando...' : 'Actualizar contraseña'}
              </button>
              {passwordMessage.text && (
                <div className={`password-message ${passwordMessage.type}`}>
                  {passwordMessage.text}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
