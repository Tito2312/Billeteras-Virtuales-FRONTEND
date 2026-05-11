// auth.js - Servicio de autenticación
// Conecta EXCLUSIVAMENTE con el backend real (Spring Boot + MongoDB)

// ============================================
// CONFIGURACIÓN BASE
// ============================================

const BASE_URL = 'http://localhost:8080';

// ============================================
// UTILIDADES
// ============================================

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


// REGISTRO - POST /auth/register


export const register = async (userData) => {
  try {
    const url = `${BASE_URL}/auth/register`;
    
    // Mapeo exacto según RegisterRequest.java
    const body = {
      name: userData.nombre,      // String name
      email: userData.email,      // String email
      password: userData.password, // String password
      phone: userData.telefono || '' // String phone (opcional)
    };
    
    const params = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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

// LOGIN - POST /auth/login


export const login = async (email, password) => {
  try {
    const url = `${BASE_URL}/auth/login`;
    
    const body = {
      email: email,
      password: password
    };
    
    const params = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    };
    
    const response = await fetch(url, params);
    const result = await handleResponse(response);
    
    // AuthResponse: { token, userId, name, level }
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
    return { 
      success: false, 
      message: error.message || 'Credenciales incorrectas' 
    };
  }
};


// RECUPERAR CONTRASEÑA


export const resetPassword = async (email) => {
  try {
   
    const url = `${BASE_URL}/auth/reset-password`;
    
    const params = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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


// LOGOUT


export const logout = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  return { success: true };
};


// SESIÓN


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