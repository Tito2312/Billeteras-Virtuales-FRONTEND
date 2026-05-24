const BASE_URL = 'http://localhost:8080/api';

const getHeaders = (requiresAuth = true, userId = null) => {
  const headers = { 'Content-Type': 'application/json' };
  if (requiresAuth) {
    const token = localStorage.getItem('auth_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  if (userId) {
    headers['userId'] = userId;
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

const toLocalDateTime = (isoString) => {
  if (!isoString) return null;
  let dateStr = isoString;
  if (dateStr.includes('Z')) dateStr = dateStr.replace('Z', '');
  if (dateStr.includes('+')) dateStr = dateStr.split('+')[0];
  if (dateStr.includes('-') && dateStr.match(/-\d{2}:\d{2}$/)) dateStr = dateStr.replace(/-\d{2}:\d{2}$/, '');
  return dateStr.split('.')[0];
};

export const createScheduledOperation = async (operationData) => {
  try {
    const body = {
      userId: operationData.userId,
      type: operationData.type,
      amount: operationData.amount,
      scheduledDate: toLocalDateTime(operationData.scheduledDate),
      sourceWalletId: operationData.sourceWalletId || null,
      targetWalletId: operationData.targetWalletId || null,
      transferKey: operationData.transferKey || null
    };
    console.log('📤 Creando operación programada:', body);
    const response = await fetch(`${BASE_URL}/scheduledOperation`, {
      method: 'POST',
      headers: getHeaders(true, operationData.userId),
      body: JSON.stringify(body)
    });
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al crear operación programada:', error);
    return { success: false, message: error.message || 'Error interno del servidor' };
  }
};

export const getUserScheduledOperations = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/scheduledOperation/${userId}`, {
      headers: getHeaders(true, userId)
    });
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al obtener operaciones programadas:', error);
    return { success: false, message: error.message, data: [] };
  }
};

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

export const deleteScheduledOperation = async (operationId, userId) => {
  try {
    const response = await fetch(`${BASE_URL}/scheduledOperation/${operationId}`, {
      method: 'DELETE',
      headers: getHeaders(true, userId)
    });
    if (response.status === 204) return { success: true };
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al eliminar operación:', error);
    return { success: false, message: error.message };
  }
};

export const updateScheduledOperation = async (id, operationData, userId) => {
  try {
    const body = {
      userId: operationData.userId,
      type: operationData.type,
      amount: operationData.amount,
      scheduledDate: toLocalDateTime(operationData.scheduledDate),
      sourceWalletId: operationData.sourceWalletId || null,
      targetWalletId: operationData.targetWalletId || null,
      transferKey: operationData.transferKey || null
    };
    console.log('📝 Editando operación programada:', body);
    const response = await fetch(`${BASE_URL}/scheduledOperation/${id}`, {
      method: 'PUT',
      headers: getHeaders(true, userId),
      body: JSON.stringify(body)
    });
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al editar operación programada:', error);
    return { success: false, message: error.message || 'Error interno del servidor' };
  }
};
