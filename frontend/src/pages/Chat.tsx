import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const Chat = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: `Hallo ${user?.email?.split('@')[0]}! Ik ben je AI-taalmaatje. Waar wil je over praten?` }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ message: input }),
            });

            if (response.ok) {
                const data = await response.json();
                const aiMessage: Message = { role: 'assistant', content: data.reply };
                setMessages((prev) => [...prev, aiMessage]);
            } else {
                console.error('Failed to get response');
            }
        } catch (error) {
            console.error('Error sending message', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <header className="bg-white shadow p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-800">Chat Practice (Dutch)</h1>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="text-gray-600 hover:text-gray-900"
                >
                    Back to Dashboard
                </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-white text-gray-800 shadow rounded-bl-none'
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-200 text-gray-500 px-4 py-2 rounded-lg rounded-bl-none animate-pulse">
                            Typing...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message in Dutch..."
                    className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default Chat;
