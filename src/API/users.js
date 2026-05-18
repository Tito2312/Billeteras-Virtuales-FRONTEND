// users.js - Servicio de usuarios
// GET, PUT, activar/desactivar usuarios

const BASE_URL = 'http://localhost:8080/api';

// ============================================
// UTILIDADES LOCALES
// ============================================

const getHeaders = (requiresAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (requiresAuth) {
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

const handleResponse = async (response) => {
  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = {};
  }
  
  if (!response.ok) {
    throw {
      status: response.status,
      message: data.message || data.error || 'Error en la petición',
    };
  }
  
  return data;
};

const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// ============================================
// USUARIOS
// ============================================

export const getAllUsers = async () => {
  try {
    const url = `${BASE_URL}/users`;
    const params = { headers: getHeaders(true) };
    const response = await fetch(url, params);
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return { success: false, message: error.message };
  }
};

export const getUserById = async (id) => {
  try {
    const url = `${BASE_URL}/users/${id}`;
    const params = { headers: getHeaders(true) };
    const response = await fetch(url, params);
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return { success: false, message: error.message };
  }
};

export const updateUser = async (id, userData) => {
  try {
    const url = `${BASE_URL}/users/${id}`;
    const token = localStorage.getItem('auth_token');
    const currentUser = getCurrentUser();
    
    const emailToSend = currentUser?.email || userData.email;
    
    const params = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: userData.name || userData.nombre,
        email: emailToSend,
        phoneNumber: userData.phoneNumber || userData.telefono
      })
    };
    
    const response = await fetch(url, params);
    const result = await handleResponse(response);
    
    // Actualizar localStorage con los nuevos datos
    if (currentUser && currentUser.id === id) {
      const updatedUser = {
        ...currentUser,
        nombre: result.name || userData.name || userData.nombre,
        email: result.email || userData.email || currentUser.email,
        telefono: result.phoneNumber || userData.phoneNumber || userData.telefono
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return { success: false, message: error.message };
  }
};

export const activateUser = async (id) => {
  try {
    const url = `${BASE_URL}/users/${id}/activate`;
    const params = { method: 'PATCH', headers: getHeaders(true) };
    const response = await fetch(url, params);
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al activar usuario:', error);
    return { success: false, message: error.message };
  }
};

export const deactivateUser = async (id) => {
  try {
    const url = `${BASE_URL}/users/${id}/desactivate`;
    const params = { method: 'PATCH', headers: getHeaders(true) };
    const response = await fetch(url, params);
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al desactivar usuario:', error);
    return { success: false, message: error.message };
  }
};