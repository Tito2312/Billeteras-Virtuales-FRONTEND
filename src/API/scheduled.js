// scheduled.js - Servicio de operaciones programadas

const BASE_URL = 'http://localhost:8080/api';

const getAuthToken = () => localStorage.getItem('auth_token');

const getHeaders = (requiresAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (requiresAuth) {
    const token = getAuthToken();
    console.log('🔑 Token:', token ? `${token.substring(0, 30)}...` : 'NO HAY TOKEN');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

const handleResponse = async (response) => {
  const textResponse = await response.text();
  console.log('📡 Respuesta raw:', textResponse);
  
  let data;
  try {
    data = JSON.parse(textResponse);
  } catch (e) {
    data = { message: textResponse || 'Error en la petición' };
  }
  
  if (!response.ok) {
    throw {
      status: response.status,
      message: data.message || data.error || 'Error en la petición',
    };
  }
  
  return data;
};

export const createScheduledOperation = async (operationData) => {
  try {
    const url = `${BASE_URL}/scheduledOperation`;
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('No hay sesión activa. Por favor inicia sesión nuevamente.');
    }
    
    const amount = parseFloat(operationData.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error('El monto debe ser un número válido mayor a 0');
    }
    
    const body = {
      userId: operationData.userId,
      targetWalletId: operationData.targetWalletId,
      type: operationData.type,
      amount: amount,
      scheduledDate: operationData.scheduledDate
    };
    
    if (operationData.sourceWalletId && (operationData.type === 'TRANSFER' || operationData.type === 'WITHDRAWAL')) {
      body.sourceWalletId = operationData.sourceWalletId;
    }
    
    console.log('📤 POST', url);
    console.log('📤 Headers:', { Authorization: `Bearer ${token.substring(0, 20)}...` });
    console.log('📤 Body:', JSON.stringify(body, null, 2));
    
    const params = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    };
    
    const response = await fetch(url, params);
    const result = await handleResponse(response);
    console.log('✅ Éxito:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, message: error.message };
  }
};

export const getUserScheduledOperations = async (userId) => {
  try {
    const url = `${BASE_URL}/scheduledOperation/${userId}`;
    const token = getAuthToken();
    
    console.log('📤 GET', url);
    
    const params = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    
    const response = await fetch(url, params);
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al obtener operaciones programadas:', error);
    return { success: false, message: error.message, data: [] };
  }
};

export const getAllScheduledOperations = async () => {
  try {
    const url = `${BASE_URL}/scheduledOperation`;
    const token = getAuthToken();
    
    const params = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    
    const response = await fetch(url, params);
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al obtener operaciones programadas:', error);
    return { success: false, message: error.message, data: [] };
  }
};