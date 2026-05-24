import { API_URL as BASE_URL } from './config';

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

export const transferToUser = async (userId, sourceWallet, transferKey, amount) => {
  try {
    const url = `${BASE_URL}/transactions/transfer-to-user?userId=${userId}&sourceWallet=${sourceWallet}&transferkey=${transferKey}&amount=${amount}`;
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

export const getWalletByKey = async (transferKey) => {
  try {
    const url = `${BASE_URL}/wallets/by-transfer-key?transferKey=${transferKey}`;
    const token = getAuthToken();

    const params = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    console.log('🔑 Verificando clave:', transferKey);
    console.log('📤 URL:', url);

    const response = await fetch(url, params);
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al obtener billetera por clave:', error);
    return { success: false, message: error.message };
  }
};
export const reverseTransactionPila = async (userId) => {
  try {
    const url = `${BASE_URL}/transactions/reverse-pila?userId=${userId}`;
    const token = getAuthToken();
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al revertir con pila:', error);
    return { success: false, message: error.message };
  }
};
