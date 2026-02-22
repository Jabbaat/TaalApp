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
        <div className="flex flex-col h-screen bg-orange-400 font-sans">
            <header className="bg-yellow-400 border-b-4 border-black p-4 flex justify-between items-center">
                <h1 className="text-3xl font-black text-black uppercase tracking-wider">Chat Practice (Dutch)</h1>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="brutal-btn bg-white py-2 px-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
                >
                    BACK
                </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-xs md:max-w-xl px-6 py-4 brutal-border text-lg font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${msg.role === 'user'
                                ? 'bg-cyan-300 text-black border-r-8'
                                : 'bg-white text-black border-l-8'
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white text-black px-6 py-4 brutal-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black uppercase animate-pulse">
                            Typing...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 bg-white border-t-4 border-black flex gap-4">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message in Dutch..."
                    className="brutal-input text-xl"
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="brutal-btn bg-pink-400 text-xl disabled:bg-gray-400 disabled:opacity-50"
                >
                    SEND
                </button>
            </form>
        </div>
    );
};

export default Chat;
