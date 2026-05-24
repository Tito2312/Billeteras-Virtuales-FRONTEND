import React, { useState, useEffect, useRef } from 'react';
import { sendMessageToAssistant } from '../../API/assistant';
import './AssistantBot.css';

const AssistantBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: '¡Hola! Soy tu asistente financiero de FinWallet. ¿En qué puedo ayudarte? 💰' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        const response = await sendMessageToAssistant(input);

        setMessages(prev => [...prev, {
            role: 'assistant',
            content: response.message
        }]);

        setLoading(false);
    };

    const handleSuggestedQuestion = (question) => {
        setInput(question);
        setTimeout(() => handleSend(), 100);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
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
                                <p>Asistente financiero</p>
                            </div>
                        </div>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
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
