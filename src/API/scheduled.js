// scheduled.js - Servicio de operaciones programadas

const BASE_URL = 'http://localhost:8080/api';

const getHeaders = (requiresAuth = true) => {
  const headers = { 'Content-Type': 'application/json' };
  if (requiresAuth) {
    const token = localStorage.getItem('auth_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const textResponse = await response.text();

  if (!textResponse || textResponse.trim() === '') {
    if (response.ok) return {};
    throw { status: response.status, message: 'El servidor no respondió correctamente' };
  }

  let data;
  try {
    data = JSON.parse(textResponse);
  } catch (e) {
    throw {
      status: response.status,
      message: `Error en la respuesta del servidor: ${textResponse.substring(0, 100)}`
    };
  }

  if (!response.ok) {
    throw {
      status: response.status,
      message: data.message || data.error || 'Error interno del servidor'
    };
  }

  return data;
};

// Spring Boot LocalDateTime espera: "2026-05-18T12:00:00" (sin Z ni offset)
const toLocalDateTime = (isoString) => {
  if (!isoString) return null;
  return isoString.replace('Z', '').replace(/\+\d{2}:\d{2}$/, '').split('.')[0];
};

// ========== OPERACIONES PROGRAMADAS ==========

// POST /api/scheduledOperation
export const createScheduledOperation = async (operationData) => {
  try {
    const body = {
      userId: operationData.userId,
      type: operationData.type,
      amount: operationData.amount,
      scheduledDate: toLocalDateTime(operationData.scheduledDate),
      sourceWalletId: operationData.sourceWalletId || null,
      targetWalletId: operationData.targetWalletId || null,
    };

    console.log('📤 Body enviado al backend:', body);

    const response = await fetch(`${BASE_URL}/scheduledOperation`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(body)
    });

    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al crear operación programada:', error);
    return { success: false, message: error.message || 'Error interno del servidor' };
  }
};

// GET /api/scheduledOperation/{userId}
export const getUserScheduledOperations = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/scheduledOperation/${userId}`, {
      headers: getHeaders(true)
    });
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al obtener operaciones programadas:', error);
    return { success: false, message: error.message, data: [] };
  }
};

// GET /api/scheduledOperation
export const getAllScheduledOperations = async () => {
  try {
    const response = await fetch(`${BASE_URL}/scheduledOperation`, {
      headers: getHeaders(true)
    });
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al obtener operaciones:', error);
    return { success: false, message: error.message, data: [] };
  }
};

// POST /api/scheduledOperation/executeOperation/{id}
export const executeScheduledOperation = async (operation) => {
  try {
    const response = await fetch(`${BASE_URL}/scheduledOperation/executeOperation/${operation.id}`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(operation)
    });
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al ejecutar operación:', error);
    return { success: false, message: error.message };
  }
};