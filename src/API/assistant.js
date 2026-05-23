// API/assistant.js
const BASE_URL = 'http://localhost:8080';

const getAuthToken = () => localStorage.getItem('auth_token');

export const sendMessageToAssistant = async (prompt) => {
    try {
        const token = getAuthToken();
        const response = await fetch(`${BASE_URL}/chatGpt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(prompt)
        });

        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }

        const text = await response.text();
        return { success: true, message: text };
    } catch (error) {
        console.error('Error al conectar con el asistente:', error);
        return {
            success: false,
            message: '❌ Error de conexión con el servidor. Asegúrate que el backend esté ejecutándose.'
        };
    }
};
