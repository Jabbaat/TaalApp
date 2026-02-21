import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

interface Vocabulary {
    id: number;
    word: string;
    translation: string;
}

const Practice = () => {
    const { token } = useAuth();
    const [reviewItems, setReviewItems] = useState<Vocabulary[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showTranslation, setShowTranslation] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchReviewItems();
    }, []);

    const fetchReviewItems = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/vocabulary/review`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setReviewItems(data);
            }
        } catch (error) {
            console.error('Failed to fetch review items', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRate = async (quality: number) => {
        if (currentIndex >= reviewItems.length) return;

        const currentItem = reviewItems[currentIndex];
        try {
            await fetch(`${API_BASE_URL}/api/vocabulary/review/${currentItem.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ quality }),
            });

            setShowTranslation(false);
            setCurrentIndex((prev) => prev + 1);
        } catch (error) {
            console.error('Failed to update progress', error);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading practice items...</div>;

    if (reviewItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold mb-4">All caught up!</h2>
                <p className="mb-4">You have no words to review right now.</p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    if (currentIndex >= reviewItems.length) {
        return (
            <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold mb-4">Session Complete!</h2>
                <p className="mb-4">You reviewed {reviewItems.length} words.</p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const currentItem = reviewItems[currentIndex];

    return (
        <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center justify-center">
            <div className="bg-white p-12 rounded-lg shadow-lg w-full max-w-lg text-center">
                <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-2">Translate this word</h2>
                <h1 className="text-4xl font-bold text-gray-800 mb-8">{currentItem.word}</h1>

                {showTranslation ? (
                    <div>
                        <h3 className="text-2xl text-blue-600 mb-8">{currentItem.translation}</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <button onClick={() => handleRate(1)} className="bg-red-100 text-red-800 py-2 rounded hover:bg-red-200">Hard</button>
                            <button onClick={() => handleRate(3)} className="bg-yellow-100 text-yellow-800 py-2 rounded hover:bg-yellow-200">Good</button>
                            <button onClick={() => handleRate(5)} className="bg-green-100 text-green-800 py-2 rounded hover:bg-green-200">Easy</button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowTranslation(true)}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                        Show Answer
                    </button>
                )}
            </div>
            <div className="mt-8 text-gray-500">
                Card {currentIndex + 1} of {reviewItems.length}
            </div>
        </div>
    );
};

export default Practice;
