
// API/graph.js
const BASE_URL = 'http://localhost:8080/api';

const getHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

const handleResponse = async (response) => {
    const textResponse = await response.text();
    if (!textResponse || textResponse.trim() === '') {
        if (response.ok) return {};
        throw { status: response.status, message: 'Error en la respuesta' };
    }
    let data;
    try {
        data = JSON.parse(textResponse);
    } catch (e) {
        data = { message: textResponse };
    }
    if (!response.ok) {
        throw { status: response.status, message: data.message || `Error ${response.status}` };
    }
    return data;
};

// Detectar ciclos financieros
export const hasCycles = async () => {
    try {
        const response = await fetch(`${BASE_URL}/graph/cycles`, {
            method: 'GET',
            headers: getHeaders()
        });
        const result = await handleResponse(response);
        return { success: true, hasCycle: result };
    } catch (error) {
        console.error('Error al detectar ciclos:', error);
        return { success: false, hasCycle: false, message: error.message };
    }
};

// Usuario más activo (más transferencias enviadas)
export const getMostActiveUser = async () => {
    try {
        const response = await fetch(`${BASE_URL}/graph/most-active`, {
            method: 'GET',
            headers: getHeaders()
        });
        const result = await handleResponse(response);
        
        // Si la respuesta es un objeto con propiedad 'message', significa que no hay datos
        if (result && typeof result === 'object' && result.message) {
            return { success: false, userId: null, message: result.message };
        }
        // Si es un string, es el userId
        if (typeof result === 'string') {
            return { success: true, userId: result };
        }
        // Si es un objeto con $oid (MongoDB)
        if (result && result.$oid) {
            return { success: true, userId: result.$oid };
        }
        // Fallback
        return { success: false, userId: null, message: 'No se pudo obtener el usuario más activo' };
    } catch (error) {
        console.error('Error al obtener usuario más activo:', error);
        return { success: false, userId: null, message: error.message };
    }
};

// Transferencias desde un usuario específico
export const getTransfersFromUser = async (userId) => {
    try {
        const response = await fetch(`${BASE_URL}/graph/transfers/${userId}`, {
            method: 'GET',
            headers: getHeaders()
        });
        const result = await handleResponse(response);
        return { success: true, transfers: result };
    } catch (error) {
        console.error('Error al obtener transferencias:', error);
        return { success: false, transfers: [], message: error.message };
    }
};

// Encontrar ruta entre dos usuarios
export const findPath = async (sourceUserId, targetUserId) => {
    try {
        const response = await fetch(`${BASE_URL}/graph/path?sourceUserId=${sourceUserId}&targetUserId=${targetUserId}`, {
            method: 'GET',
            headers: getHeaders()
        });
        const result = await handleResponse(response);
        return { success: true, path: result };
    } catch (error) {
        console.error('Error al encontrar ruta:', error);
        return { success: false, path: [], message: error.message };
    }
};

// Analizar transferencias frecuentes (conexiones recurrentes)
export const getFrequentTransfers = async (transactions) => {
    const connections = new Map();
    
    transactions.forEach(t => {
        if (t.type === 'TRANSFER' && t.receiverUserId) {
            const key = `${t.userId}->${t.receiverUserId}`;
            if (!connections.has(key)) {
                connections.set(key, { from: t.userId, to: t.receiverUserId, count: 0, totalAmount: 0 });
            }
            const conn = connections.get(key);
            conn.count++;
            conn.totalAmount += t.amount;
        }
    });
    
    const frequentTransfers = Array.from(connections.values())
        .filter(c => c.count >= 2)
        .sort((a, b) => b.count - a.count);
    
    return frequentTransfers;
};


