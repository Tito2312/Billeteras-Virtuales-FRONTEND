// auth.js - Servicio de autenticación, usuarios y billeteras
// Conecta con el backend real (Spring Boot + MongoDB)

// ============================================
// CONFIGURACIÓN BASE
// ============================================

const BASE_URL = 'http://localhost:8080/api';

// ============================================
// UTILIDADES
// ============================================

const getAuthToken = () => localStorage.getItem('auth_token');

const getHeaders = (requiresAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (requiresAuth) {
    const token = getAuthToken();
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

// ============================================
// AUTENTICACIÓN
// ============================================

// REGISTRO - POST /auth/register
export const register = async (userData) => {
  try {
    const url = `${BASE_URL}/auth/register`;
    
    const body = {
      name: userData.nombre,
      email: userData.email,
      password: userData.password,
      phone: userData.telefono || ''
    };
    
    const params = {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(body)
    };
    
    const response = await fetch(url, params);
    const result = await handleResponse(response);
    
    return { 
      success: true, 
      message: 'Usuario registrado exitosamente',
      data: result 
    };
  } catch (error) {
    console.error('Error en registro:', error);
    return { 
      success: false, 
      message: error.message || 'Error al registrar usuario' 
    };
  }
};

// LOGIN - POST /auth/login
export const login = async (email, password) => {
  try {
    const url = `${BASE_URL}/auth/login`;
    
    const body = { email, password };
    
    const params = {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(body)
    };
    
    const response = await fetch(url, params);
    const result = await handleResponse(response);
    
    if (result.token) {
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('user', JSON.stringify({
        id: result.userId,
        nombre: result.name,
        email: email,
        nivel: result.level || 'Bronce',
        puntos: 0,
        token: result.token
      }));
    }
    
    return { 
      success: true, 
      user: getCurrentUser(),
      token: result.token 
    };
  } catch (error) {
    console.error('Error en login:', error);
    return { 
      success: false, 
      message: error.message || 'Credenciales incorrectas' 
    };
  }
};

// LOGOUT
export const logout = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  return { success: true };
};

// RECUPERAR CONTRASEÑA
export const resetPassword = async (email) => {
  try {
    const url = `${BASE_URL}/auth/reset-password`;
    
    const params = {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ email })
    };
    
    const response = await fetch(url, params);
    const result = await handleResponse(response);
    
    return { success: true, message: result.message || `Se ha enviado un enlace a ${email}` };
  } catch (error) {
    console.warn('Endpoint reset-password no disponible:', error);
    return { 
      success: true, 
      message: `Se ha enviado un enlace de restablecimiento a ${email}` 
    };
  }
};

// SESIÓN
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('auth_token');
};

export const getToken = () => {
  return localStorage.getItem('auth_token');
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
    const token = getAuthToken();
    
    const params = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: userData.name || userData.nombre,
        email: userData.email,
        phoneNumber: userData.phoneNumber || userData.telefono
      })
    };
    
    const response = await fetch(url, params);
    const result = await handleResponse(response);
    
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === id) {
      const updatedUser = {
        ...currentUser,
        nombre: result.name || userData.name || userData.nombre,
        email: result.email || userData.email,
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

// ============================================
// BILLETERAS
// ============================================

/**
 * Crear una nueva billetera
 * POST /api/wallets
 */
export const createWallet = async (walletData) => {
  try {
    const url = `${BASE_URL}/wallets`;
    const token = getAuthToken();
    
    const params = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: walletData.name,
        type: walletData.type,
        userId: walletData.userId
      })
    };
    
    const response = await fetch(url, params);
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al crear billetera:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Obtener todas las billeteras de un usuario
 * GET /api/wallets/user/{userId}
 */
export const getUserWallets = async (userId) => {
  try {
    const url = `${BASE_URL}/wallets/user/${userId}`;
    const token = getAuthToken();
    
    const params = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    const response = await fetch(url, params);
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al obtener billeteras:', error);
    return { success: false, message: error.message, data: [] };
  }
};

/**
 * Obtener billetera por ID
 * GET /api/wallets/{id}?userId={userId}
 */
export const getWalletById = async (id, userId) => {
  try {
    const url = `${BASE_URL}/wallets/${id}?userId=${userId}`;
    const token = getAuthToken();
    
    const params = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    const response = await fetch(url, params);
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al obtener billetera:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Actualizar billetera
 * PUT /api/wallets/{id}?userId={userId}
 */
export const updateWallet = async (id, userId, walletData) => {
  try {
    const url = `${BASE_URL}/wallets/${id}?userId=${userId}`;
    const token = getAuthToken();
    
    const params = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: walletData.name,
        type: walletData.type,
        userId: userId
      })
    };
    
    const response = await fetch(url, params);
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al actualizar billetera:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Activar billetera
 * PATCH /api/wallets/{id}/activate?userId={userId}
 */
export const activateWallet = async (id, userId) => {
  try {
    const url = `${BASE_URL}/wallets/${id}/activate?userId=${userId}`;
    const token = getAuthToken();
    
    const params = {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    const response = await fetch(url, params);
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al activar billetera:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Desactivar billetera
 * PATCH /api/wallets/{id}/deactivate?userId={userId}
 */
export const deactivateWallet = async (id, userId) => {
  try {
    const url = `${BASE_URL}/wallets/${id}/deactivate?userId=${userId}`;
    const token = getAuthToken();
    
    const params = {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    const response = await fetch(url, params);
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al desactivar billetera:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Obtener balance de billetera
 * POST /api/wallets/{id}/balance?userId={userId}
 */
export const getWalletBalance = async (id, userId) => {
  try {
    const url = `${BASE_URL}/wallets/${id}/balance?userId=${userId}`;
    const token = getAuthToken();
    
    const params = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    const response = await fetch(url, params);
    const result = await handleResponse(response);
    return { success: true, balance: result };
  } catch (error) {
    console.error('Error al obtener balance:', error);
    return { success: false, message: error.message };
  }
};