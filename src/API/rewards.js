// rewards.js - Servicio de recompensas y niveles
// Según documento del proyecto

const BASE_URL = 'http://localhost:8080/api';

const getAuthToken = () => localStorage.getItem('auth_token');

const getHeaders = (requiresAuth = true) => {
  const headers = { 'Content-Type': 'application/json' };
  if (requiresAuth) {
    const token = getAuthToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  let data;
  try { data = await response.json(); } catch (e) { data = {}; }
  if (!response.ok) throw { status: response.status, message: data.message || 'Error en la petición' };
  return data;
};

// Obtener puntos y nivel del usuario
export const getUserPoints = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/users/${userId}`, { headers: getHeaders(true) });
    const result = await handleResponse(response);
    return { success: true, points: result.points, level: result.level };
  } catch (error) {
    return { success: false, message: error.message, points: 0, level: 'Bronce' };
  }
};

// Obtener información completa de niveles según documento
export const getUserLevelInfo = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/users/${userId}`, { headers: getHeaders(true) });
    const user = await handleResponse(response);
    
    // Niveles según documento (4.5)
    const levels = [
      { 
        name: 'Bronce', 
        minPoints: 0, 
        maxPoints: 500, 
        color: '#cd7f32',
        benefits: [
          'Reducción de comisiones: 5%',
          'Prioridad: Baja',
          'Límite diario: $1,000,000',
          'Sin bono de puntos'
        ]
      },
      { 
        name: 'Plata', 
        minPoints: 501, 
        maxPoints: 1000, 
        color: '#c0c0c0',
        benefits: [
          'Reducción de comisiones: 3%',
          'Prioridad: Media',
          'Límite diario: $5,000,000',
          'Bono de puntos: +10%'
        ]
      },
      { 
        name: 'Oro', 
        minPoints: 1001, 
        maxPoints: 5000, 
        color: '#ffd700',
        benefits: [
          'Reducción de comisiones: 1.5%',
          'Prioridad: Alta',
          'Límite diario: $15,000,000',
          'Bono de puntos: +25%'
        ]
      },
      { 
        name: 'Platino', 
        minPoints: 5001, 
        maxPoints: Infinity, 
        color: '#e5e4e2',
        benefits: [
          'Reducción de comisiones: 0%',
          'Prioridad: Máxima',
          'Límite diario: Ilimitado',
          'Bono de puntos: +50%'
        ]
      }
    ];
    
    const currentLevel = levels.find(l => user.points >= l.minPoints && user.points <= l.maxPoints) || levels[0];
    const currentLevelIndex = levels.findIndex(l => l.name === currentLevel.name);
    const nextLevel = levels[currentLevelIndex + 1];
    
    return {
      success: true,
      data: {
        points: user.points,
        level: currentLevel.name,
        nextLevel: nextLevel?.name || null,
        pointsToNextLevel: nextLevel ? nextLevel.minPoints - user.points : 0,
        benefits: currentLevel.benefits,
        allLevels: levels
      }
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Reglas de puntos según documento (4.4)
export const getPointsRules = () => {
  return [
    { type: 'Recarga', points: '1 punto por cada $100', icon: '📥', multiplier: 0.01 },
    { type: 'Retiro', points: '2 puntos por cada $100', icon: '📤', multiplier: 0.02 },
    { type: 'Transferencia', points: '3 puntos por cada $100', icon: '🔄', multiplier: 0.03 },
    { type: 'Pago programado', points: 'Bono adicional', icon: '⏰', multiplier: 'bono' }
  ];
};
// ── Beneficios reales del backend ──────────────────────

export const getAvailableBenefits = async () => {
  try {
    const response = await fetch(`${BASE_URL}/benefits`, { headers: getHeaders(true) });
    const data = await handleResponse(response);
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message, data: [] };
  }
};

export const getRedeemedBenefits = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/benefits/redeemed/${userId}`, { headers: getHeaders(true) });
    const data = await handleResponse(response);
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message, data: [] };
  }
};

export const redeemBenefit = async (userId, benefitId, walletId) => {
  try {
    let url = `${BASE_URL}/benefits/redeem?userId=${userId}&benefitId=${benefitId}`;
    if (walletId) url += `&walletId=${walletId}`;
    const response = await fetch(url, { method: 'POST', headers: getHeaders(true) });
    const data = await handleResponse(response);
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
