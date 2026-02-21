import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProgressChart from '../components/ProgressChart';
import { API_BASE_URL } from '../config';

interface Lesson {
    id: number;
    title: string;
    content: string;
    difficultyLevel: string;
}

const Dashboard = () => {
    const { user, token, logout } = useAuth();
    const { t } = useTranslation();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchLessons();
    }, []);

    const fetchLessons = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/lessons`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setLessons(data);
            }
        } catch (error) {
            console.error('Failed to fetch lessons', error);
        }
    };

    const handleGenerateLesson = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/lessons/generate`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                await fetchLessons(); // Refresh list
            } else {
                const errData = await response.json();
                setError(errData.error || 'Failed to generate lesson');
            }
        } catch (error) {
            console.error('Error generating lesson', error);
            setError('Network error or server unavailable');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        <strong>Error:</strong> {error}
                    </div>
                )}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">{t('welcome')}, {user?.email}</h1>
                    <button
                        onClick={logout}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                    >
                        {t('logout')}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="text-xl font-semibold mb-2 text-blue-800">{t('your_profile')}</h3>
                        <p><strong>{t('native_language')}:</strong> {user?.nativeLanguage}</p>
                        <p><strong>{t('target_language')}:</strong> {user?.targetLanguage}</p>
                        <p><strong>{t('skill_level')}:</strong> {user?.skillLevel}</p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="text-xl font-semibold mb-2 text-green-800">{t('action_center')}</h3>
                        <div className="flex flex-col space-y-2">
                            <button
                                onClick={handleGenerateLesson}
                                disabled={loading}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:bg-gray-400"
                            >
                                {loading ? t('generating') : t('generate_lesson')}
                            </button>
                            <button
                                onClick={() => navigate('/practice')}
                                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
                            >
                                {t('practice_vocab')}
                            </button>
                            <button
                                onClick={() => navigate('/pronunciation')}
                                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
                            >
                                {t('pronunciation_check')}
                            </button>
                            <button
                                onClick={() => navigate('/chat')}
                                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                            >
                                {t('chat_tutor')}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <ProgressChart />
                </div>

                <h2 className="text-2xl font-bold mb-4 text-gray-800">{t('your_lessons')}</h2>
                <div className="space-y-4">
                    {lessons.length === 0 ? (
                        <p className="text-gray-500">{t('no_lessons')}</p>
                    ) : (
                        lessons.map((lesson) => (
                            <div
                                key={lesson.id}
                                onClick={() => navigate(`/lessons/${lesson.id}`)}
                                className="border p-4 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer hover:bg-gray-50"
                            >
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-indigo-700">{lesson.title}</h3>
                                    <span className="text-xs font-semibold bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full uppercase tracking-wide">{lesson.difficultyLevel}</span>
                                </div>
                                <p className="text-gray-500 text-sm mt-2">Click to start lesson</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
