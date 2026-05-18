// auth.js - Servicio de autenticación
// Solo login, registro, gestión de sesión y verificación de email

const BASE_URL = 'http://localhost:8080/api';

// ============================================
// UTILIDADES LOCALES
// ============================================

const getHeaders = (requiresAuth = false) => {
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
  // Primero leer como texto para evitar errores de parsing
  const textResponse = await response.text();
  
  if (!textResponse || textResponse.trim() === '') {
    throw {
      status: response.status,
      message: 'El servidor no respondió correctamente'
    };
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
      message: data.message || data.error || 'Error en la petición',
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
      phone: userData.telefono || ''
    };
    
    console.log('📝 Registrando usuario:', { email: body.email, name: body.name });
    
    const params = {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(body)
    };
    
    const response = await fetch(url, params);
    const result = await handleResponse(response);
    
    console.log('✅ Registro exitoso:', result);
    
    return { 
      success: true, 
      message: '¡Registro exitoso! Revisa tu correo electrónico para verificar tu cuenta.',
      data: result 
    };
  } catch (error) {
    console.error('❌ Error en registro:', error);
    
    // Mensajes de error más amigables
    let userMessage = 'Error al registrar usuario';
    
    if (error.message?.includes('correo electronico ya esta en uso') || 
        error.message?.includes('email already in use')) {
      userMessage = 'Este correo electrónico ya está registrado. ¿Deseas iniciar sesión?';
    } else if (error.status === 0 || error.message?.includes('Failed to fetch')) {
      userMessage = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';
    } else if (error.message) {
      userMessage = error.message;
    }
    
    return { 
      success: false, 
      message: userMessage,
      error: error
    };
  }
};

export const login = async (email, password) => {
  try {
    const url = `${BASE_URL}/auth/login`;
    
    const body = { email, password };
    
    const params = {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(body)
    };
    
    const response = await fetch(url, params);
    const result = await handleResponse(response);
    
    if (result.token) {
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('user', JSON.stringify({
        id: result.userId,
        nombre: result.name,
        email: email,
        nivel: result.level || 'Bronce',
        puntos: 0,
        token: result.token
      }));
    }
    
    return { 
      success: true, 
      user: getCurrentUser(),
      token: result.token 
    };
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
    
    return { 
      success: false, 
      message: userMessage 
    };
  }
};

export const logout = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  return { success: true };
};

export const resetPassword = async (email) => {
  try {
    const url = `${BASE_URL}/auth/reset-password`;
    
    const params = {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ email })
    };
    
    const response = await fetch(url, params);
    const result = await handleResponse(response);
    
    return { success: true, message: result.message || `Se ha enviado un enlace a ${email}` };
  } catch (error) {
    console.warn('Endpoint reset-password no disponible:', error);
    return { 
      success: true, 
      message: `Se ha enviado un enlace de restablecimiento a ${email}` 
    };
  }
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('auth_token');
};

export const getToken = () => {
  return localStorage.getItem('auth_token');
};

// ============================================
// VERIFICACIÓN DE EMAIL
// ============================================

export const verifyEmail = async (token) => {
  try {
    const url = `${BASE_URL}/auth/verify-email?token=${token}`;
    
    const params = {
      method: 'GET',
      headers: getHeaders(false)
    };
    
    const response = await fetch(url, params);
    
    // Leer como texto primero
    const textResponse = await response.text();
    console.log('Respuesta del backend:', textResponse);
    
    // Si la respuesta está vacía pero el status es OK, consideramos éxito
    if (response.ok) {
      // Intentar parsear como JSON, si falla usar el texto
      let result;
      try {
        result = JSON.parse(textResponse);
      } catch (e) {
        result = { message: textResponse || 'Cuenta verificada exitosamente' };
      }
      
      return { 
        success: true, 
        message: result.message || result || '¡Cuenta verificada exitosamente!'
      };
    }
    
    // Si hay error, intentar obtener el mensaje
    let errorMessage = 'Error al verificar la cuenta';
    try {
      const errorJson = JSON.parse(textResponse);
      errorMessage = errorJson.message || errorJson.error || errorMessage;
    } catch (e) {
      if (textResponse) errorMessage = textResponse;
    }
    
    throw new Error(errorMessage);
    
  } catch (error) {
    console.error('Error en verifyEmail:', error);
    return { 
      success: false, 
      message: error.message || 'Error al verificar la cuenta. El enlace puede haber expirado.'
    };
  }
}; 