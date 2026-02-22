import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        nativeLanguage: 'en',
        targetLanguage: 'nl',
        skillLevel: 'beginner',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            login(data.token, data.user);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-pink-400 p-4">
            <div className="w-full max-w-md brutal-card">
                <h2 className="text-3xl font-black mb-6 text-center text-black uppercase tracking-wider">Register</h2>
                {error && <div className="brutal-border bg-red-400 text-black font-bold p-3 mb-4">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-black font-bold mb-2 uppercase text-sm">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="brutal-input"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-black font-bold mb-2 uppercase text-sm">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="brutal-input"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-black font-bold mb-2 uppercase text-sm">Native Language</label>
                        <select
                            name="nativeLanguage"
                            value={formData.nativeLanguage}
                            onChange={handleChange}
                            className="brutal-input"
                        >
                            <option value="en">English</option>
                            <option value="nl">Dutch</option>
                            <option value="es">Spanish</option>
                            <option value="sv">Swedish</option>
                            <option value="fr">French</option>
                            <option value="it">Italian</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-black font-bold mb-2 uppercase text-sm">Target Language</label>
                        <select
                            name="targetLanguage"
                            value={formData.targetLanguage}
                            onChange={handleChange}
                            className="brutal-input"
                        >
                            <option value="nl">Dutch</option>
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="sv">Swedish</option>
                            <option value="fr">French</option>
                            <option value="it">Italian</option>
                        </select>
                    </div>
                    <div className="mb-6">
                        <label className="block text-black font-bold mb-2 uppercase text-sm">Skill Level</label>
                        <select
                            name="skillLevel"
                            value={formData.skillLevel}
                            onChange={handleChange}
                            className="brutal-input"
                        >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="brutal-btn w-full text-xl mt-4 disabled:bg-gray-400 disabled:opacity-50"
                    >
                        {isLoading ? 'Laden...' : 'CREATE ACCOUNT'}
                    </button>
                </form>
                <p className="mt-6 text-center text-black font-bold">
                    Already have an account? <Link to="/login" className="text-blue-700 hover:text-blue-900 underline decoration-4 underline-offset-4">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
