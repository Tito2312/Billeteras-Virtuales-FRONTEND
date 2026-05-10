// auth.js - Servicio de autenticación
// Conecta login, registro y recuperación de contraseña


// CONFIGURACIÓN BASE


const BASE_URL = 'http://localhost:8080/api'; 


// UTILIDADES


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
// REGISTRO - Endpoint: /api/auth/register
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
    
    const params = {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(body)
    };
    
    const response = await fetch(url, params);
    const result = await handleResponse(response);
    
    return { 
      success: true, 
      message: 'Usuario registrado exitosamente',
      data: result 
    };
  } catch (error) {
    console.error('Error en registro:', error);
    return { 
      success: false, 
      message: error.message || 'Error al registrar usuario' 
    };
  }
};


// LOGIN - Endpoint: /api/auth/login


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
        puntos: 0
      }));
    }
    
    return { 
      success: true, 
      user: getCurrentUser(),
      token: result.token 
    };
  } catch (error) {
    console.error('Error en login:', error);
    return { 
      success: false, 
      message: error.message || 'Credenciales incorrectas' 
    };
  }
};


// RECUPERAR CONTRASEÑA (SIMULADO POR AHORA)


export const resetPassword = async (email) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `Se ha enviado un enlace de restablecimiento a ${email}`
      });
    }, 1000);
  });
};


// LOGOUT


export const logout = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  return { success: true };
};

// UTILIDADES DE SESIÓN


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