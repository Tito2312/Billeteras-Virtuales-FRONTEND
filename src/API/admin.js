// admin.js - Servicio de administración (solo para admin)

const BASE_URL = 'http://localhost:8080/api';

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
  const textResponse = await response.text();
  
  if (!textResponse || textResponse.trim() === '') {
    if (!response.ok) throw { status: response.status, message: 'Error en la petición' };
    return {};
  }
  
  let data;
  try {
    data = JSON.parse(textResponse);
  } catch (e) {
    throw { status: response.status, message: 'Error en la respuesta del servidor' };
  }
  
  if (!response.ok) {
    throw {
      status: response.status,
      message: data.message || data.error || `Error ${response.status}`
    };
  }
  
  return data;
};

// ============================================
// USUARIOS
// ============================================

export const getAllUsers = async () => {
  try {
    const url = `${BASE_URL}/users`;
    const response = await fetch(url, { method: 'GET', headers: getHeaders(true) });
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return { success: false, message: error.message, data: [] };
  }
};

export const activateUser = async (userId) => {
  try {
    const url = `${BASE_URL}/users/${userId}/activate`;
    const response = await fetch(url, { method: 'PATCH', headers: getHeaders(true) });
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al activar usuario:', error);
    return { success: false, message: error.message };
  }
};

export const deactivateUser = async (userId) => {
  try {
    const url = `${BASE_URL}/users/${userId}/desactivate`;
    const response = await fetch(url, { method: 'PATCH', headers: getHeaders(true) });
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al desactivar usuario:', error);
    return { success: false, message: error.message };
  }
};

// ============================================
// AUDITORÍA
// ============================================

export const getAllAudits = async () => {
  try {
    const url = `${BASE_URL}/audit/all`;
    const response = await fetch(url, { method: 'GET', headers: getHeaders(true) });
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al obtener auditoría:', error);
    return { success: false, message: error.message, data: [] };
  }
};

export const getAuditsByUser = async (userId) => {
  try {
    const url = `${BASE_URL}/audit/user?userId=${userId}`;
    const response = await fetch(url, { method: 'GET', headers: getHeaders(true) });
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al obtener auditoría del usuario:', error);
    return { success: false, message: error.message, data: [] };
  }
};

export const getAuditsToday = async () => {
  try {
    const url = `${BASE_URL}/audit/today`;
    const response = await fetch(url, { method: 'GET', headers: getHeaders(true) });
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al obtener auditoría de hoy:', error);
    return { success: false, message: error.message, data: [] };
  }
};

export const getAuditsByDateRange = async (start, end) => {
  try {
    const url = `${BASE_URL}/audit/date-range?start=${start}&end=${end}`;
    const response = await fetch(url, { method: 'GET', headers: getHeaders(true) });
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al obtener auditoría por rango:', error);
    return { success: false, message: error.message, data: [] };
  }
};

export const getAuditsByRiskLevel = async (riskLevel) => {
  try {
    const url = `${BASE_URL}/audit/risk-level?riskLevel=${riskLevel}`;
    const response = await fetch(url, { method: 'GET', headers: getHeaders(true) });
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al obtener auditoría por riesgo:', error);
    return { success: false, message: error.message, data: [] };
  }
};

// ============================================
// REPORTES
// ============================================

export const getMostUsedWallets = async (top = 5) => {
  try {
    const url = `${BASE_URL}/reports/wallets/most-used?top=${top}`;
    const response = await fetch(url, { method: 'GET', headers: getHeaders(true) });
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al obtener billeteras más usadas:', error);
    return { success: false, message: error.message, data: [] };
  }
};

export const getUsersWithMostTransfers = async (top = 5, start = null, end = null) => {
  try {
    let url = `${BASE_URL}/reports/users/most-transfers?top=${top}`;
    if (start) url += `&start=${encodeURIComponent(start)}`;
    if (end)   url += `&end=${encodeURIComponent(end)}`;
    const response = await fetch(url, { method: 'GET', headers: getHeaders(true) });
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al obtener usuarios con más transferencias:', error);
    return { success: false, message: error.message, data: [] };
  }
};

export const getMostActiveCategories = async () => {
  try {
    const url = `${BASE_URL}/reports/wallets/categories`;
    const response = await fetch(url, { method: 'GET', headers: getHeaders(true) });
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al obtener categorías activas:', error);
    return { success: false, message: error.message, data: [] };
  }
};

export const getTransactionFrequency = async () => {
  try {
    const url = `${BASE_URL}/reports/transactions/frequency`;
    const response = await fetch(url, { method: 'GET', headers: getHeaders(true) });
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al obtener frecuencia de transacciones:', error);
    return { success: false, message: error.message, data: [] };
  }
};

export const getTransactionsByDateRange = async (start, end) => {
  try {
    const url = `${BASE_URL}/reports/transactions/date-range?start=${start}&end=${end}`;
    const response = await fetch(url, { method: 'GET', headers: getHeaders(true) });
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al obtener transacciones por fecha:', error);
    return { success: false, message: error.message };
  }
};

export const getTopTransactionsByAmount = async (top = 10) => {
  try {
    const url = `${BASE_URL}/reports/transactions/top-amount?top=${top}`;
    const response = await fetch(url, { method: 'GET', headers: getHeaders(true) });
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al obtener top transacciones:', error);
    return { success: false, message: error.message, data: [] };
  }
};

// ============================================
// ESTADÍSTICAS
// ============================================

export const getAdminStats = async () => {
  try {
    const usersResult = await getAllUsers();
    const auditsResult = await getAllAudits();
    const todayAuditsResult = await getAuditsToday();
    
    return {
      success: true,
      data: {
        totalUsers: usersResult.data?.length || 0,
        totalAudits: auditsResult.data?.length || 0,
        todayAudits: todayAuditsResult.data?.length || 0,
        activeUsers: usersResult.data?.filter(u => u.active).length || 0,
        inactiveUsers: usersResult.data?.filter(u => !u.active).length || 0,
        adminUsers: usersResult.data?.filter(u => u.role === 'ROLE_ADMIN' || u.role === 'ADMIN').length || 0
      }
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return { success: false, message: error.message };
  }
};

// ============================================
// BILLETERAS (ADMIN) - Usando el API/wallets existente
// ============================================

/**
 * Obtener todas las billeteras del sistema (admin)
 * Usa el endpoint existente GET /api/wallets/user/{userId} para cada usuario
 * O si el backend tiene GET /api/wallets, usarlo
 */
export const getAllWallets = async () => {
  try {
    // Primero obtenemos todos los usuarios
    const usersResult = await getAllUsers();
    
    if (!usersResult.success || !usersResult.data) {
      return { success: false, message: 'No se pudieron obtener usuarios', data: [] };
    }
    
    const allWallets = [];
    
    // Para cada usuario, obtenemos sus billeteras
    for (const user of usersResult.data) {
      try {
        const url = `${BASE_URL}/wallets/user/${user.id}`;
        const response = await fetch(url, { method: 'GET', headers: getHeaders(true) });
        const result = await handleResponse(response);
        
        if (Array.isArray(result)) {
          result.forEach(wallet => {
            allWallets.push({
              ...wallet,
              userName: user.name,
              userEmail: user.email
            });
          });
        }
      } catch (err) {
        console.error(`Error obteniendo billeteras de usuario ${user.id}:`, err);
      }
    }
    
    return { success: true, data: allWallets };
  } catch (error) {
    console.error('Error al obtener todas las billeteras:', error);
    return { success: false, message: error.message, data: [] };
  }
};


// ============================================
// TRANSACCIONES (ADMIN)
// ============================================

/**
 * Obtener todas las transacciones del sistema (solo admin)
 * GET /api/transactions
 */
export const getAllTransactions = async () => {
  try {
    const url = `${BASE_URL}/transactions`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(true)
    });
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al obtener todas las transacciones:', error);
    return { success: false, message: error.message, data: [] };
  }
};

/**
 * Revertir transacción (admin)
 * PUT /api/transactions/reverseTransaction?userId={userId}&transactionId={transactionId}
 */
export const reverseTransaction = async (userId, transactionId) => {
  try {
    const url = `${BASE_URL}/transactions/reverseTransaction?userId=${userId}&transactionId=${transactionId}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: getHeaders(true)
    });
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al revertir transacción:', error);
    return { success: false, message: error.message };
  }
};
/**
 * Revertir última transacción de un usuario usando la Pila (Stack)
 * PUT /api/transactions/reverse-pila?userId={userId}
 */
export const reverseTransactionPila = async (userId) => {
  try {
    const url = `${BASE_URL}/transactions/reverse-pila?userId=${userId}`;
    const response = await fetch(url, { method: 'PUT', headers: getHeaders(true) });
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al revertir con pila:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Obtener billetera por ID (admin)
 * GET /api/wallets/{id}
 */
export const getWalletById = async (walletId, userId) => {
  try {
    const url = `${BASE_URL}/wallets/${walletId}?userId=${userId}`;
    const response = await fetch(url, { method: 'GET', headers: getHeaders(true) });
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al obtener billetera:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Activar billetera (admin)
 * PATCH /api/wallets/{id}/activate
 */
export const activateWallet = async (walletId, userId) => {
  try {
    const url = `${BASE_URL}/wallets/${walletId}/activate?userId=${userId}`;
    const response = await fetch(url, { method: 'PATCH', headers: getHeaders(true) });
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al activar billetera:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Desactivar billetera (admin)
 * PATCH /api/wallets/{id}/deactivate
 */
export const deactivateWallet = async (walletId, userId) => {
  try {
    const url = `${BASE_URL}/wallets/${walletId}/deactivate?userId=${userId}`;
    const response = await fetch(url, { method: 'PATCH', headers: getHeaders(true) });
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al desactivar billetera:', error);
    return { success: false, message: error.message };
  }
};
// ============================================
// ÁRBOL BINARIO DE USUARIOS
// ============================================

export const getOrderedUsers = async () => {
  try {
    const response = await fetch(`${BASE_URL}/tree/users/ordered`, { headers: getHeaders() });
    const result = await handleResponse(response);
    return { success: true, data: Array.isArray(result) ? result : [] };
  } catch (error) {
    return { success: false, data: [], message: error.message };
  }
};

export const getUsersByRange = async (min, max) => {
  try {
    const response = await fetch(`${BASE_URL}/tree/users/range?min=${min}&max=${max}`, { headers: getHeaders() });
    const result = await handleResponse(response);
    return { success: true, data: Array.isArray(result) ? result : [] };
  } catch (error) {
    return { success: false, data: [], message: error.message };
  }
};

export const getTopUser = async () => {
  try {
    const response = await fetch(`${BASE_URL}/tree/users/top`, { headers: getHeaders() });
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, data: null, message: error.message };
  }
};

export const getUsersByLevel = async (level) => {
  try {
    const response = await fetch(`${BASE_URL}/tree/users/level/${level}`, { headers: getHeaders() });
    const result = await handleResponse(response);
    return { success: true, data: Array.isArray(result) ? result : [] };
  } catch (error) {
    return { success: false, data: [], message: error.message };
  }
};
