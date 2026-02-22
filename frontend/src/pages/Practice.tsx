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
            <div className="min-h-screen bg-pink-400 p-8 flex flex-col items-center justify-center">
                <div className="brutal-card text-center p-12">
                    <h2 className="text-4xl font-black mb-4 uppercase">All caught up!</h2>
                    <p className="mb-8 font-bold text-xl">You have no words to review right now.</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="brutal-btn bg-blue-400 text-xl"
                    >
                        BACK TO DASHBOARD
                    </button>
                </div>
            </div>
        );
    }

    if (currentIndex >= reviewItems.length) {
        return (
            <div className="min-h-screen bg-pink-400 p-8 flex flex-col items-center justify-center">
                <div className="brutal-card text-center p-12">
                    <h2 className="text-4xl font-black mb-4 uppercase">Session Complete!</h2>
                    <p className="mb-8 font-bold text-xl">You reviewed {reviewItems.length} words.</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="brutal-btn bg-blue-400 text-xl"
                    >
                        BACK TO DASHBOARD
                    </button>
                </div>
            </div>
        );
    }

    const currentItem = reviewItems[currentIndex];

    return (
        <div className="min-h-screen bg-pink-400 p-8 flex flex-col items-center justify-center">
            <div className="brutal-card p-12 w-full max-w-lg text-center">
                <h2 className="text-xl text-black font-black uppercase tracking-wider mb-2 border-b-4 border-black pb-2">Translate this word</h2>
                <h1 className="text-6xl font-black text-black mb-12 mt-8 tracking-tighter uppercase">{currentItem.word}</h1>

                {showTranslation ? (
                    <div>
                        <h3 className="text-4xl font-black text-black mb-8 p-4 bg-yellow-300 brutal-border uppercase">{currentItem.translation}</h3>
                        <div className="grid grid-cols-3 gap-6">
                            <button onClick={() => handleRate(1)} className="brutal-btn bg-red-400 py-4 text-xl">HARD</button>
                            <button onClick={() => handleRate(3)} className="brutal-btn bg-yellow-400 py-4 text-xl">GOOD</button>
                            <button onClick={() => handleRate(5)} className="brutal-btn bg-green-400 py-4 text-xl">EASY</button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowTranslation(true)}
                        className="brutal-btn bg-blue-400 text-2xl px-10 py-4 w-full"
                    >
                        SHOW ANSWER
                    </button>
                )}
            </div>
            <div className="mt-8 text-black font-black text-xl bg-white brutal-border px-4 py-2">
                CARD {currentIndex + 1} OF {reviewItems.length}
            </div>
        </div>
    );
};

export default Practice;
