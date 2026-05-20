// transactions.js - Servicio de transacciones

const BASE_URL = 'http://localhost:8080/api';

// ============================================
// UTILIDADES LOCALES
// ============================================

const getAuthToken = () => localStorage.getItem('auth_token');

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
    const token = getAuthToken();
    
    const params = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    console.log('💰 Recargando:', url);
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
    const token = getAuthToken();
    
    const params = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    console.log('💸 Retirando:', url);
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
    const token = getAuthToken();
    
    const params = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    console.log('🔄 Transfiriendo entre mis billeteras:', url);
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
    const token = getAuthToken();
    
    const params = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    console.log('👤 Transfiriendo a usuario:', url);
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
    const token = getAuthToken();
    
    const params = {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    console.log('↩️ Revirtiendo transacción:', url);
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
// GET /api/transactions/user/{userId}?userId={userId}
// ============================================

export const getUserTransactions = async (userId) => {
  try {
    const url = `${BASE_URL}/transactions/user/${userId}?userId=${userId}`;
    const token = getAuthToken();
    
    console.log('📋 Obteniendo transacciones desde:', url);
    
    const params = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    const response = await fetch(url, params);
    console.log('📋 Status:', response.status);
    
    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error('Error al parsear JSON:', e);
      data = [];
    }
    
    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || 'Error al obtener transacciones'
      };
    }
    
    const transactionsArray = Array.isArray(data) ? data : [];
    console.log('📋 Transacciones obtenidas:', transactionsArray.length);
    
    return { success: true, data: transactionsArray };
  } catch (error) {
    console.error('❌ Error al obtener transacciones:', error);
    return { success: false, message: error.message, data: [] };
  }
};

// ============================================
// OBTENER HISTORIAL DE TRANSACCIONES POR BILLETERA
// GET /api/transactions/wallet/{walletId}?walletId={walletId}
// ============================================

export const getWalletTransactions = async (walletId) => {
  try {
    const url = `${BASE_URL}/transactions/wallet/${walletId}?walletId=${walletId}`;
    const token = getAuthToken();
    
    const params = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
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

// ============================================
// NUEVAS FUNCIONES: TRANSFERENCIA POR TRANSFERKEY
// ============================================

/**
 * Obtener información de una billetera por su transferKey
 * GET /api/wallets/by-key/{transferKey}
 */
export const getWalletByKey = async (transferKey) => {
  try {
    const url = `${BASE_URL}/wallets/by-key/${transferKey}`;
    const token = getAuthToken();
    
    const params = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    console.log('🔑 Verificando clave:', transferKey);
    const response = await fetch(url, params);
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al obtener billetera por clave:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Transferir dinero usando transferKey (clave de la billetera destino)
 * NOTA: Este endpoint debe ser agregado por los del backend
 * POST /api/transactions/transfer-by-key
 */
export const transferByKey = async (userId, sourceWalletId, transferKey, amount, description = '') => {
  try {
    const url = `${BASE_URL}/transactions/transfer-by-key?userId=${userId}&sourceWalletId=${sourceWalletId}&transferKey=${transferKey}&amount=${amount}&description=${encodeURIComponent(description)}`;
    const token = getAuthToken();
    
    const params = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    console.log('🔑 Transfiriendo por clave:', url);
    const response = await fetch(url, params);
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al transferir por clave:', error);
    return { success: false, message: error.message };
  }
};