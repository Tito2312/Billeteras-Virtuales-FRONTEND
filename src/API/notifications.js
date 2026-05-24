const BASE_URL = 'http://localhost:8080/api';

const getAuthToken = () => localStorage.getItem('auth_token');

export const getUserNotifications = async (userId) => {
    try {
        const token = getAuthToken();
        const response = await fetch(`${BASE_URL}/notifications/queue/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        return { success: false, message: error.message, data: [] };
    }
};
