// userService.js - Servicio para consumir APIs de usuario
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Obtener perfil del usuario por ID
export const getPerfil = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/perfil/${userId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener el perfil:', error);
    throw error;
  }
};

// Actualizar perfil del usuario
export const updatePerfil = async (userId, userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/perfil/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    throw error;
  }
};

// Cambiar contraseña
export const changePassword = async (userId, passwordData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/perfil/${userId}/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(passwordData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    throw error;
  }
};
