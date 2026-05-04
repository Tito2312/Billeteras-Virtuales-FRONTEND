// userService.js - Servicio para consumir APIs de usuario
import { authenticatedFetch } from './apiService';

// Obtener perfil del usuario por ID
export const getPerfil = async (userId) => {
  try {
    console.log(`Haciendo petición a: /api/perfil/${userId}`);
    
    // PRUEBA: Primero intentamos sin autenticación para ver si el endpoint existe
    const testResponse = await fetch(`http://localhost:8080/api/perfil/${userId}`);
    console.log('Test sin auth:', testResponse.status, testResponse.statusText);
    
    // Ahora intentamos con autenticación
    const response = await authenticatedFetch(`/api/perfil/${userId}`);
    
    console.log('Respuesta HTTP con auth:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response body:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Datos JSON recibidos:', data);
    return data;
  } catch (error) {
    console.error('Error completo en getPerfil:', error);
    throw error;
  }
};

// Actualizar perfil del usuario
export const updatePerfil = async (userId, userData) => {
  try {
    const response = await authenticatedFetch(`/api/perfil/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    throw error;
  }
};

// Cambiar contraseña
export const changePassword = async (userId, passwordData) => {
  try {
    const response = await authenticatedFetch(`/api/perfil/${userId}/password`, {
      method: 'PUT',
      body: JSON.stringify(passwordData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    throw error;
  }
};
