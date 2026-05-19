// analytics.js - Servicio de analítica

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
  console.log('📡 Response status:', response.status);
  console.log('📡 Response body:', textResponse);
  
  let data;
  try {
    data = JSON.parse(textResponse);
  } catch (e) {
    data = { message: textResponse || 'Error en la respuesta' };
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
// TRANSACCIONES DEL USUARIO
// ============================================

export const getUserTransactions = async (userId) => {
  try {
    if (!userId) {
      console.error('❌ No userId provided');
      return { success: false, message: 'No userId provided', data: [] };
    }
    
    // ✅ URL correcta para el endpoint con @PathVariable
    const url = `${BASE_URL}/transactions/user/${userId}`;
    console.log('📤 GET Transactions URL:', url);
    
    const response = await fetch(url, { 
      method: 'GET',
      headers: getHeaders(true)
    });
    
    const result = await handleResponse(response);
    console.log('✅ Transactions loaded:', result.length || 0);
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Error al obtener transacciones:', error);
    return { success: false, message: error.message, data: [] };
  }
};

// Resto de funciones igual...
export const getMostUsedWallets = async (top = 5) => {
  try {
    const url = `${BASE_URL}/reports/wallets/most-used?top=${top}`;
    const response = await fetch(url, { headers: getHeaders(true) });
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al obtener billeteras más usadas:', error);
    return { success: false, message: error.message, data: [] };
  }
};

export const getMostActiveCategories = async () => {
  try {
    const url = `${BASE_URL}/reports/wallets/categories`;
    const response = await fetch(url, { headers: getHeaders(true) });
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
    const response = await fetch(url, { headers: getHeaders(true) });
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
    const response = await fetch(url, { headers: getHeaders(true) });
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al obtener transacciones por fecha:', error);
    return { success: false, message: error.message };
  }
};

export const getUsersWithMostTransfers = async (top = 5) => {
  try {
    const url = `${BASE_URL}/reports/users/most-transfers?top=${top}`;
    const response = await fetch(url, { headers: getHeaders(true) });
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al obtener usuarios con más transferencias:', error);
    return { success: false, message: error.message, data: [] };
  }
};