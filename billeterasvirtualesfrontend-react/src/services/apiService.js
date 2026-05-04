// apiService.js - Servicio base para peticiones con autenticación JWT
// Maneja el token JWT en todas las peticiones protegidas

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Obtener token JWT del localStorage
const getToken = () => {
  const user = localStorage.getItem('finwallet_current_user');
  if (user) {
    const userData = JSON.parse(user);
    return userData.token;
  }
  return null;
};

// Petición fetch con autenticación JWT
export const authenticatedFetch = async (url, options = {}) => {
  const token = getToken();
  console.log('Token JWT encontrado:', token ? 'SÍ' : 'NO');
  console.log('Token length:', token ? token.length : 0);
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };

  console.log('Headers enviados:', finalOptions.headers);
  console.log('URL completa:', `${API_BASE_URL}${url}`);

  return fetch(`${API_BASE_URL}${url}`, finalOptions);
};

// Verificar si el token es válido
export const isTokenValid = () => {
  const token = getToken();
  return token !== null && token !== '';
};

// Refrescar token si es necesario (implementación futura)
export const refreshToken = async () => {
  // Implementación futura para refrescar el token
  console.log('Token refresh no implementado aún');
  return false;
};
