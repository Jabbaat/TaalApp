import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            login(data.token, data.user);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cyan-400 p-4">
            <div className="w-full max-w-md brutal-card">
                <h2 className="text-3xl font-black mb-6 text-center text-black uppercase tracking-wider">Login</h2>
                {error && <div className="brutal-border bg-red-400 text-black font-bold p-3 mb-4">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-black font-bold mb-2 uppercase">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="brutal-input"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-black font-bold mb-2 uppercase">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="brutal-input"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="brutal-btn w-full text-xl"
                    >
                        SIGN IN
                    </button>
                </form>
                <p className="mt-6 text-center text-black font-bold">
                    Don't have an account? <Link to="/register" className="text-blue-700 hover:text-blue-900 underline decoration-4 underline-offset-4">Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
