// authService.js
// Conexión con API backend para autenticación

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const CURRENT_USER_KEY = 'finwallet_current_user';

// Registrar un nuevo usuario
export const register = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre: userData.nombre,
        email: userData.email,
        password: userData.password,
        telefono: userData.telefono,
        documento: userData.documento
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, user: data, message: 'Usuario registrado exitosamente' };
  } catch (error) {
    console.error('Error en registro:', error);
    return { success: false, message: error.message || 'Error al registrar usuario' };
  }
};

// Iniciar sesión
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Guardar token y usuario en localStorage
    const userData = {
      id: data.id,
      token: data.token,
      nombre: data.nombre,
      email: data.email,
      nivel: data.nivel
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
    
    return { success: true, user: userData };
  } catch (error) {
    console.error('Error en login:', error);
    return { success: false, message: error.message || 'Error al iniciar sesión' };
  }
};

// Cerrar sesión
export const logout = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
  return { success: true };
};

// Obtener usuario actual (sesión activa)
export const getCurrentUser = () => {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
};

// Restablecer contraseña
export const resetPassword = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return { 
      success: true, 
      message: `Se ha enviado un enlace de restablecimiento a ${email}` 
    };
  } catch (error) {
    console.error('Error en reset password:', error);
    return { success: false, message: error.message || 'Error al restablecer contraseña' };
  }
};

// Verificar si hay sesión activa (para rutas protegidas)
export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};