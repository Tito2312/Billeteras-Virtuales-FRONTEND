// transactions.js - Servicio de transacciones
// Recargar, transferir, retirar, revertir

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
// RECARGAR BILLETERA
// POST /api/transactions/recharge?userId={userId}&targetWallet={targetWallet}&amount={amount}
// ============================================

export const rechargeWallet = async (userId, targetWallet, amount) => {
  try {
    const url = `${BASE_URL}/transactions/recharge?userId=${userId}&targetWallet=${targetWallet}&amount=${amount}`;
    const token = localStorage.getItem('auth_token');
    
    const params = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    const response = await fetch(url, params);
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al recargar:', error);
    return { success: false, message: error.message };
  }
};

// ============================================
// RETIRAR DINERO
// POST /api/transactions/withdrawal?userId={userId}&sourceWallet={sourceWallet}&amount={amount}
// ============================================

export const withdrawMoney = async (userId, sourceWallet, amount) => {
  try {
    const url = `${BASE_URL}/transactions/withdrawal?userId=${userId}&sourceWallet=${sourceWallet}&amount=${amount}`;
    const token = localStorage.getItem('auth_token');
    
    const params = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    const response = await fetch(url, params);
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al retirar:', error);
    return { success: false, message: error.message };
  }
};

// ============================================
// TRANSFERIR ENTRE MIS PROPIAS BILLETERAS
// POST /api/transactions/transfer?userId={userId}&sourceWallet={sourceWallet}&targetWallet={targetWallet}&amount={amount}
// ============================================

export const transferToOwnWallet = async (userId, sourceWallet, targetWallet, amount) => {
  try {
    const url = `${BASE_URL}/transactions/transfer?userId=${userId}&sourceWallet=${sourceWallet}&targetWallet=${targetWallet}&amount=${amount}`;
    const token = localStorage.getItem('auth_token');
    
    const params = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    const response = await fetch(url, params);
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al transferir:', error);
    return { success: false, message: error.message };
  }
};

// ============================================
// TRANSFERIR A OTRO USUARIO
// POST /api/transactions/transfer-to-user?userId={userId}&receiverUserId={receiverUserId}&sourceWallet={sourceWallet}&targetWallet={targetWallet}&amount={amount}
// ============================================

export const transferToUser = async (userId, receiverUserId, sourceWallet, targetWallet, amount) => {
  try {
    const url = `${BASE_URL}/transactions/transfer-to-user?userId=${userId}&receiverUserId=${receiverUserId}&sourceWallet=${sourceWallet}&targetWallet=${targetWallet}&amount=${amount}`;
    const token = localStorage.getItem('auth_token');
    
    const params = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    const response = await fetch(url, params);
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al transferir a usuario:', error);
    return { success: false, message: error.message };
  }
};

// ============================================
// REVERTIR TRANSACCIÓN
// PUT /api/transactions/reverseTransaction?userId={userId}&transactionId={transactionId}
// ============================================

export const reverseTransaction = async (userId, transactionId) => {
  try {
    const url = `${BASE_URL}/transactions/reverseTransaction?userId=${userId}&transactionId=${transactionId}`;
    const token = localStorage.getItem('auth_token');
    
    const params = {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    const response = await fetch(url, params);
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al revertir transacción:', error);
    return { success: false, message: error.message };
  }
};

// ============================================
// OBTENER HISTORIAL DE TRANSACCIONES POR USUARIO
// GET /api/transactions/user/{userId}
// ============================================

export const getUserTransactions = async (userId) => {
  try {
    const url = `${BASE_URL}/transactions/user/${userId}`;
    const token = localStorage.getItem('auth_token');
    
    const params = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    const response = await fetch(url, params);
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    return { success: false, message: error.message, data: [] };
  }
};

// ============================================
// OBTENER HISTORIAL DE TRANSACCIONES POR BILLETERA
// GET /api/transactions/wallet/{walletId}
// ============================================

export const getWalletTransactions = async (walletId) => {
  try {
    const url = `${BASE_URL}/transactions/wallet/${walletId}`;
    const token = localStorage.getItem('auth_token');
    
    const params = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    const response = await fetch(url, params);
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al obtener transacciones de billetera:', error);
    return { success: false, message: error.message, data: [] };
  }
};