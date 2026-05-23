// API/auth.js - Servicio de autenticación
// Incluye login, registro, verificación de email, recuperación y cambio de contraseña

const BASE_URL = 'http://localhost:8080/api';

// ============================================
// UTILIDADES LOCALES
// ============================================

const getHeaders = (requiresAuth = false) => {
  const headers = { 'Content-Type': 'application/json' };
  if (requiresAuth) {
    const token = localStorage.getItem('auth_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const textResponse = await response.text();
  
  // Si es una respuesta exitosa y no hay contenido (204 No Content)
  if (response.status === 204) {
    return { success: true, message: 'Operación exitosa' };
  }
  
  // Si la respuesta está vacía
  if (!textResponse || textResponse.trim() === '') {
    if (response.ok) return { success: true };
    throw { status: response.status, message: 'El servidor no respondió correctamente' };
  }
  
  // Intentar parsear como JSON
  let data;
  try {
    data = JSON.parse(textResponse);
  } catch (e) {
    // No es JSON, es texto plano → asumir que es un mensaje de éxito o error
    if (response.ok) {
      // Éxito: devolver el texto como mensaje
      return { success: true, message: textResponse };
    } else {
      throw { status: response.status, message: textResponse };
    }
  }
  
  if (!response.ok) {
    throw {
      status: response.status,
      message: data.message || data.error || 'Error en la petición'
    };
  }
  
  return data;
};

// ============================================
// AUTENTICACIÓN
// ============================================

export const register = async (userData) => {
  try {
    const url = `${BASE_URL}/auth/register`;
    const body = {
      name: userData.nombre,
      email: userData.email,
      password: userData.password,
      phone: userData.telefono || '',
      documentNumber: userData.documento || ''
    };
    console.log('📝 Registrando usuario:', { email: body.email, name: body.name });
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(body)
    });
    const result = await handleResponse(response);
    return { 
      success: true, 
      message: '¡Registro exitoso! Revisa tu correo electrónico para verificar tu cuenta.',
      data: result 
    };
  } catch (error) {
    console.error('❌ Error en registro:', error);
    let userMessage = 'Error al registrar usuario';
    if (error.message?.includes('correo electronico ya esta en uso') || 
        error.message?.includes('email already in use')) {
      userMessage = 'Este correo electrónico ya está registrado. ¿Deseas iniciar sesión?';
    } else if (error.status === 0 || error.message?.includes('Failed to fetch')) {
      userMessage = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';
    } else if (error.message) {
      userMessage = error.message;
    }
    return { success: false, message: userMessage, error };
  }
};

export const login = async (email, password) => {
  try {
    const url = `${BASE_URL}/auth/login`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ email, password })
    });
    const result = await handleResponse(response);
    console.log('🔍 Resultado del login:', result);
    if (result.token) {
      let userRole = 'USER';
      if (result.role) {
        const roleUpper = result.role.toUpperCase();
        if (roleUpper === 'ROLE_ADMIN' || roleUpper === 'ADMIN') userRole = 'ROLE_ADMIN';
      }
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('user', JSON.stringify({
        id: result.userId,
        nombre: result.name,
        email: email,
        nivel: result.level || 'Bronce',
        puntos: 0,
        role: userRole,
        token: result.token
      }));
      console.log('👤 Usuario guardado con role:', userRole);
    }
    return { success: true, user: getCurrentUser(), token: result.token };
  } catch (error) {
    console.error('Error en login:', error);
    let userMessage = 'Credenciales incorrectas';
    if (error.message?.includes('Account is disabled') || error.message?.includes('cuenta no verificada')) {
      userMessage = 'Cuenta no verificada. Revisa tu correo para activar tu cuenta.';
    } else if (error.status === 0 || error.message?.includes('Failed to fetch')) {
      userMessage = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';
    } else if (error.message) {
      userMessage = error.message;
    }
    return { success: false, message: userMessage };
  }
};

export const logout = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  return { success: true };
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => !!localStorage.getItem('auth_token');
export const getToken = () => localStorage.getItem('auth_token');

// ============================================
// VERIFICACIÓN DE EMAIL
// ============================================

export const verifyEmail = async (token) => {
  try {
    const url = `${BASE_URL}/auth/verify-email?token=${token}`;
    const response = await fetch(url, { method: 'GET', headers: getHeaders(false) });
    const result = await handleResponse(response);
    if (result.success) {
      return { success: true, message: result.message || '¡Cuenta verificada exitosamente!' };
    }
    return { success: false, message: result.message || 'Error al verificar la cuenta' };
  } catch (error) {
    console.error('Error en verifyEmail:', error);
    return { success: false, message: error.message || 'El enlace puede haber expirado' };
  }
};

// ============================================
// RECUPERACIÓN Y CAMBIO DE CONTRASEÑA
// ============================================

export const resetPassword = async (email) => {
  try {
    const url = `${BASE_URL}/auth/forgot-password`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const result = await handleResponse(response);
    return { success: true, message: result.message || `Se ha enviado un enlace a ${email}` };
  } catch (error) {
    console.error('Error al solicitar reset:', error);
    return { success: false, message: error.message || 'Error al procesar la solicitud' };
  }
};

export const changePasswordWithToken = async (token, newPassword) => {
  try {
    const url = `${BASE_URL}/auth/reset-password`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    });
    const result = await handleResponse(response);
    return { success: true, message: result.message || 'Contraseña actualizada exitosamente' };
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    return { success: false, message: error.message };
  }
};

export const changePasswordLogged = async (currentPassword, newPassword, confirmPassword) => {
  try {
    const url = `${BASE_URL}/auth/change-password`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
    });
    const result = await handleResponse(response);
    return { success: true, message: result.message || 'Contraseña cambiada exitosamente' };
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return { success: false, message: error.message };
  }
};

// ============================================
// USUARIOS
// ============================================

export const getUserById = async (id) => {
  try {
    const url = `${BASE_URL}/users/${id}`;
    const token = getToken();
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });
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
    const token = getToken();
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        name: userData.name || userData.nombre,
        email: userData.email,
        phoneNumber: userData.phoneNumber || userData.telefono
      })
    });
    const result = await handleResponse(response);
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === id) {
      const updatedUser = { ...currentUser, nombre: result.name, email: result.email, telefono: result.phoneNumber };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return { success: false, message: error.message };
  }
};

// ============================================
// BILLETERAS
// ============================================

export const getUserWallets = async (userId) => {
  try {
    const url = `${BASE_URL}/wallets/user/${userId}`;
    const token = getToken();
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });
    const result = await handleResponse(response);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error al obtener billeteras:', error);
    return { success: false, message: error.message, data: [] };
  }
};

// ============================================
// ADMIN
// ============================================

export const isAdmin = () => {
  const user = getCurrentUser();
  const role = user?.role;
  return role === 'ROLE_ADMIN' || role === 'ADMIN';
};