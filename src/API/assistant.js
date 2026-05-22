// API/assistant.js
const OLLAMA_URL = 'http://localhost:11434';

// Contexto financiero para el asistente
const getSystemPrompt = () => {
    return `Eres un asistente financiero experto de FinWallet. Responde SIEMPRE en español, de manera clara y amigable. 
Tu especialidad son billeteras digitales, transacciones, recargas, transferencias, retiros, programación de operaciones, puntos de recompensa y niveles de usuario (Bronce, Plata, Oro, Platino).

Reglas importantes:
1. SIEMPRE responde en español
2. Sé conciso pero útil
3. Si no sabes algo, di "No tengo información sobre eso"
4. Ofrece ayuda relacionada con finanzas y billeteras digitales

Pregunta del usuario: `;
};

export const sendMessageToAssistant = async (prompt, model = 'tinyllama') => {
    try {
        // Prompt con instrucciones en español
        const fullPrompt = getSystemPrompt() + prompt;
        
        const response = await fetch(`${OLLAMA_URL}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model,
                prompt: fullPrompt,
                stream: false,
                options: {
                    temperature: 0.5,  // Más bajo = más consistente
                    num_predict: 300,   // Respuestas más cortas
                    top_k: 40,
                    top_p: 0.9
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        let responseText = data.response || 'Lo siento, no pude procesar tu solicitud.';
        
        // Limpiar respuesta
        responseText = responseText.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
        
        return { 
            success: true, 
            message: responseText
        };
    } catch (error) {
        console.error('Error al conectar con Ollama:', error);
        return { 
            success: false, 
            message: '❌ Error de conexión. Asegúrate que Ollama esté ejecutándose (ollama serve)'
        };
    }
};

export const getAvailableModels = async () => {
    try {
        const response = await fetch(`${OLLAMA_URL}/api/tags`);
        if (!response.ok) return ['tinyllama', 'mistral', 'phi'];
        const data = await response.json();
        if (data.models && data.models.length > 0) {
            return data.models.map(m => m.name);
        }
        return ['tinyllama', 'mistral', 'phi'];
    } catch (error) {
        return ['tinyllama', 'mistral', 'phi'];
    }
};