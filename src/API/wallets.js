// wallets.js - Servicio de billeteras
// CRUD de billeteras

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
    const token = localStorage.getItem('auth_token');
    
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
    const token = localStorage.getItem('auth_token');
    
    const params = {
      method: 'GET',
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
    const token = localStorage.getItem('auth_token');
    
    const params = {
      method: 'GET',
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
    const token = localStorage.getItem('auth_token');
    
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
    const token = localStorage.getItem('auth_token');
    
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
    const token = localStorage.getItem('auth_token');
    
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
 * Eliminar billetera
 * GET /api/wallets/deleteWallet?walletId={walletId}&userId={userId}
 */
export const deleteWallet = async (walletId, userId) => {
  try {
    const url = `${BASE_URL}/wallets/deleteWallet?walletId=${walletId}&userId=${userId}`;
    const token = localStorage.getItem('auth_token');

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      const text = await response.text();
      throw { message: text || 'Error al eliminar la billetera' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error al eliminar billetera:', error);
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
    const token = localStorage.getItem('auth_token');
    
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