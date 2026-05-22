// components/assistant/AssistantBot.js
import React, { useState, useEffect, useRef } from 'react';
import { sendMessageToAssistant, getAvailableModels } from '../../API/assistant';
import './AssistantBot.css';

const AssistantBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: '¡Hola! Soy tu asistente financiero de FinWallet. ¿En qué puedo ayudarte? 💰' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState('tinyllama');
    const [models, setModels] = useState(['tinyllama', 'mistral', 'phi']);
    const messagesEndRef = useRef(null);

    // Respuestas predefinidas para preguntas comunes
    const getPredefinedAnswer = (question) => {
        const q = question.toLowerCase().trim();
        
        if (q.includes('recargo') || q.includes('recargar')) {
            return "💰 Para recargar tu billetera:\n1. Ve a la sección 'Billeteras'\n2. Selecciona la billetera que quieres recargar\n3. Haz clic en 'Recargar'\n4. Ingresa el monto y confirma\n\n¡La recarga se aplicará automáticamente a tu saldo!";
        }
        
        if (q.includes('transfer') || q.includes('transferir') || q.includes('enviar')) {
            return "🔄 Para transferir dinero:\n1. Ve a la sección 'Transacciones'\n2. Selecciona 'Transferencia'\n3. Elige la billetera origen\n4. Ingresa la clave de la billetera destino o selecciona una de tus billeteras\n5. Ingresa el monto y confirma\n\n¿Necesitas la clave de una billetera? Aparece en la tarjeta de cada billetera.";
        }
        
        if (q.includes('punto') || q.includes('recompensa')) {
            return "⭐ Los puntos de recompensa se generan por cada transacción:\n• Recarga: 1 punto por cada 100 unidades\n• Retiro: 2 puntos por cada 100 unidades\n• Transferencia: 3 puntos por cada 100 unidades\n\nLos puntos determinan tu nivel: Bronce (0-500), Plata (501-1000), Oro (1001-5000), Platino (5000+).";
        }
        
        if (q.includes('programar') || q.includes('operación programada') || q.includes('automatica')) {
            return "📅 Para programar una operación automática:\n1. Ve a 'Operaciones Programadas'\n2. Haz clic en 'Programar Operación'\n3. Selecciona el tipo (Recarga, Retiro, Transferencia)\n4. Elige la billetera origen/destino\n5. Ingresa el monto y la fecha/hora\n6. Confirma\n\nLas operaciones se ejecutarán automáticamente a la hora programada.";
        }
        
        if (q.includes('nivel') || q.includes('bronce') || q.includes('plata') || q.includes('oro') || q.includes('platino')) {
            return "🏆 Niveles de usuario según puntos acumulados:\n• Bronce: 0 - 500 puntos\n• Plata: 501 - 1000 puntos\n• Oro: 1001 - 5000 puntos\n• Platino: Más de 5000 puntos\n\n¡Entre más puntos, más beneficios! Los Platino tienen prioridad en operaciones programadas.";
        }
        
        if (q.includes('retirar') || q.includes('retiro')) {
            return "💸 Para retirar dinero:\n1. Ve a la sección 'Transacciones'\n2. Selecciona 'Retiro'\n3. Elige la billetera origen\n4. Ingresa el monto a retirar\n5. Confirma la operación\n\nEl dinero se transferirá a tu cuenta bancaria asociada.";
        }
        
        if (q.includes('saldo') || q.includes('balance')) {
            return "💰 Puedes consultar tu saldo en:\n• El dashboard principal muestra tu balance total\n• En 'Billeteras' verás el saldo de cada billetera individual\n• También puedes hacer clic en 'Consultar saldo' en cada billetera";
        }
        
        if (q.includes('historial') || q.includes('movimiento')) {
            return "📊 Para ver tu historial de transacciones:\n1. Ve a la sección 'Transacciones'\n2. Verás todas tus operaciones\n3. Puedes filtrar por fecha, tipo o billetera\n4. También puedes generar reportes en la sección 'Analítica'";
        }
        
        return null; // No es una pregunta predefinida
    };

    useEffect(() => {
        const loadModels = async () => {
            try {
                const availableModels = await getAvailableModels();
                if (availableModels && availableModels.length > 0) {
                    setModels(availableModels);
                    if (!availableModels.includes(selectedModel) && availableModels.length > 0) {
                        setSelectedModel(availableModels[0]);
                    }
                }
            } catch (error) {
                console.error('Error cargando modelos:', error);
            }
        };
        loadModels();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        // Primero verificar si hay respuesta predefinida
        const predefinedAnswer = getPredefinedAnswer(input);
        
        let response;
        if (predefinedAnswer) {
            // Usar respuesta predefinida
            response = { success: true, message: predefinedAnswer };
        } else {
            // Consultar a Ollama
            response = await sendMessageToAssistant(input, selectedModel);
        }
        
        setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: response.success ? response.message : response.message
        }]);
        
        setLoading(false);
    };

    const handleSuggestedQuestion = (question) => {
        setInput(question);
        // Enviar automáticamente después de un breve delay
        setTimeout(() => {
            handleSend();
        }, 100);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatModelName = (modelName) => {
        return modelName.replace(':latest', '');
    };

    const suggestedQuestions = [
        "¿Cómo recargo mi billetera?",
        "¿Cómo transfiero dinero?",
        "¿Qué son los puntos de recompensa?",
        "¿Cómo programo una operación?",
        "¿Cuáles son los niveles de usuario?"
    ];

    return (
        <>
            <button className="assistant-button" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? '✕' : '💬'}
            </button>

            {isOpen && (
                <div className="assistant-window">
                    <div className="assistant-header">
                        <div className="assistant-header-info">
                            <span className="assistant-icon">🤖</span>
                            <div>
                                <h3>Asistente FinWallet</h3>
                                <p>Ollama - {formatModelName(selectedModel)}</p>
                            </div>
                        </div>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
                    </div>

                    <div className="model-selector">
                        <label>Modelo:</label>
                        <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
                            {models.map(m => (
                                <option key={m} value={m}>{formatModelName(m)}</option>
                            ))}
                        </select>
                    </div>

                    <div className="assistant-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`message ${msg.role}`}>
                                <div className="message-avatar">
                                    {msg.role === 'user' ? '👤' : '🤖'}
                                </div>
                                <div className="message-content">
                                    <p style={{ whiteSpace: 'pre-line' }}>{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="message assistant">
                                <div className="message-avatar">🤖</div>
                                <div className="message-content">
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {messages.length === 1 && (
                        <div className="suggested-questions">
                            <p>Sugerencias:</p>
                            <div className="suggestions-list">
                                {suggestedQuestions.map((q, idx) => (
                                    <button key={idx} onClick={() => handleSuggestedQuestion(q)}>
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="assistant-input">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Escribe tu pregunta aquí..."
                            disabled={loading}
                            rows={1}
                        />
                        <button onClick={handleSend} disabled={loading || !input.trim()}>
                            {loading ? '⏳' : '📤'}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default AssistantBot;