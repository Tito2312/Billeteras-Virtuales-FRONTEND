const BASE_URL = 'http://localhost:8080/api';
const token = () => localStorage.getItem('auth_token');
const headers = () => ({ 'Authorization': `Bearer ${token()}` });

const safe = async (fn) => {
    try { return await fn(); }
    catch (e) { return { success: false, data: null, message: e.message }; }
};

export const getTransfersFrom = (userId) => safe(async () => {
    const res = await fetch(`${BASE_URL}/graph/transfers/${userId}`, { headers: headers() });
    const data = await res.json();
    return { success: true, data: Array.isArray(data) ? data : [] };
});

export const hasCycle = () => safe(async () => {
    const res = await fetch(`${BASE_URL}/graph/cycles`, { headers: headers() });
    const data = await res.json();
    return { success: true, data };
});

export const findPath = (sourceUserId, targetUserId) => safe(async () => {
    const res = await fetch(`${BASE_URL}/graph/path?sourceUserId=${sourceUserId}&targetUserId=${targetUserId}`, { headers: headers() });
    const data = await res.json();
    return { success: true, data: Array.isArray(data) ? data : [] };
});

export const getMostActiveUser = () => safe(async () => {
    const res = await fetch(`${BASE_URL}/graph/most-active`, { headers: headers() });
    const text = await res.text();
    return { success: true, data: text };
});
