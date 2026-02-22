import { useState, useEffect } from 'react';
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
        <div className="min-h-screen bg-green-400 p-8">
            <div className="max-w-4xl mx-auto brutal-card mb-8">
                {error && (
                    <div className="mb-6 brutal-border bg-red-400 text-black font-bold p-4">
                        <strong>Error:</strong> {error}
                    </div>
                )}
                <div className="flex justify-between items-center mb-8 border-b-4 border-black pb-4">
                    <h1 className="text-4xl font-black text-black uppercase tracking-tight">{t('welcome')}, {user?.email}</h1>
                    <button
                        onClick={logout}
                        className="brutal-btn bg-red-500 text-white border-2 hover:bg-red-400"
                    >
                        {t('logout')}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <div className="brutal-border bg-blue-300 p-6">
                        <h3 className="text-2xl font-black mb-4 text-black uppercase">{t('your_profile')}</h3>
                        <div className="space-y-2 text-lg font-bold">
                            <p className="flex justify-between border-b-2 border-black pb-1"><span>{t('native_language')}:</span> <span>{user?.nativeLanguage}</span></p>
                            <p className="flex justify-between border-b-2 border-black pb-1"><span>{t('target_language')}:</span> <span>{user?.targetLanguage}</span></p>
                            <p className="flex justify-between border-b-2 border-black pb-1"><span>{t('skill_level')}:</span> <span>{user?.skillLevel}</span></p>
                        </div>
                    </div>

                    <div className="brutal-border bg-yellow-300 p-6">
                        <h3 className="text-2xl font-black mb-4 text-black uppercase">{t('action_center')}</h3>
                        <div className="flex flex-col space-y-4">
                            <button
                                onClick={handleGenerateLesson}
                                disabled={loading}
                                className="brutal-btn bg-pink-400 disabled:bg-gray-400 disabled:opacity-50"
                            >
                                {loading ? t('generating') : t('generate_lesson')}
                            </button>
                            <button
                                onClick={() => navigate('/practice')}
                                className="brutal-btn bg-purple-400"
                            >
                                {t('practice_vocab')}
                            </button>
                            <button
                                onClick={() => navigate('/pronunciation')}
                                className="brutal-btn bg-cyan-400"
                            >
                                {t('pronunciation_check')}
                            </button>
                            <button
                                onClick={() => navigate('/chat')}
                                className="brutal-btn bg-orange-400"
                            >
                                {t('chat_tutor')}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mb-10 brutal-border p-4 bg-white">
                    <ProgressChart />
                </div>

                <h2 className="text-3xl font-black mb-6 text-black uppercase border-b-4 border-black pb-2">{t('your_lessons')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {lessons.length === 0 ? (
                        <p className="text-black font-bold text-xl col-span-full">{t('no_lessons')}</p>
                    ) : (
                        lessons.map((lesson) => (
                            <div
                                key={lesson.id}
                                onClick={() => navigate(`/lessons/${lesson.id}`)}
                                className="brutal-card brutal-shadow-hover bg-lime-300 cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-2xl font-black text-black leading-tight">{lesson.title}</h3>
                                    <span className="text-sm font-bold bg-white border-2 border-black text-black px-3 py-1 uppercase">{lesson.difficultyLevel}</span>
                                </div>
                                <p className="text-black font-bold">CLICK TO START LESSON &rarr;</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
