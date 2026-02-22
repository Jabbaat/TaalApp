import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MOCK_PHRASES = [
    "Hallo, hoe gaat het?",
    "Ik wil graag koffie bestellen.",
    "Dank je wel.",
    "Tot ziens!",
];

const Pronunciation = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [targetPhrase, setTargetPhrase] = useState('');
    const [spokenText, setSpokenText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [accuracy, setAccuracy] = useState<number | null>(null);
    const [feedback, setFeedback] = useState('');

    // Browser Speech Recognition Support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = SpeechRecognition ? new SpeechRecognition() : null;

    useEffect(() => {
        // Pick random phrase on mount
        setTargetPhrase(MOCK_PHRASES[Math.floor(Math.random() * MOCK_PHRASES.length)]);

        if (recognition) {
            recognition.continuous = false;
            recognition.lang = user?.targetLanguage === 'nl' ? 'nl-NL' : 'en-US';

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setSpokenText(transcript);
                evaluatePronunciation(transcript);
                setIsRecording(false);
            };

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsRecording(false);
                setFeedback("Error capturing audio. Please try again.");
            };
        }
    }, [user]);

    const startRecording = () => {
        if (!recognition) {
            setFeedback("Browser does not support Speech Recognition.");
            return;
        }
        setSpokenText('');
        setAccuracy(null);
        setFeedback("Listening...");
        setIsRecording(true);
        recognition.start();
    };

    const evaluatePronunciation = (spoken: string) => {
        // Simple string similarity (Levenshtein distance simplified)
        const distance = levenshteinDistance(targetPhrase.toLowerCase(), spoken.toLowerCase());
        const maxLength = Math.max(targetPhrase.length, spoken.length);
        const score = Math.max(0, Math.round(((maxLength - distance) / maxLength) * 100));

        setAccuracy(score);
        if (score > 80) setFeedback("Excellent!");
        else if (score > 60) setFeedback("Good, but could be better.");
        else setFeedback("Try again, focus on clarity.");
    };

    // Levenshtein distance implementation
    const levenshteinDistance = (a: string, b: string) => {
        const matrix = [];

        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) == a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
                    );
                }
            }
        }

        return matrix[b.length][a.length];
    };

    const nextPhrase = () => {
        const nextIndex = (MOCK_PHRASES.indexOf(targetPhrase) + 1) % MOCK_PHRASES.length;
        setTargetPhrase(MOCK_PHRASES[nextIndex]);
        setSpokenText('');
        setAccuracy(null);
        setFeedback('');
    };

    return (
        <div className="min-h-screen bg-cyan-400 p-8 flex flex-col items-center justify-center">
            <div className="brutal-card p-12 w-full max-w-lg text-center">
                <h2 className="text-xl text-black font-black uppercase tracking-wider mb-2 border-b-4 border-black pb-2">Speak this phrase</h2>
                <h1 className="text-5xl font-black text-black mb-12 mt-8 tracking-tighter uppercase">{targetPhrase}</h1>

                <div className="mb-10 flex flex-col items-center">
                    <button
                        onClick={startRecording}
                        disabled={isRecording}
                        className={`w-32 h-32 brutal-border brutal-shadow brutal-shadow-hover flex items-center justify-center transition active:shadow-none active:translate-x-[6px] active:translate-y-[6px] ${isRecording ? 'bg-red-500 animate-pulse outline outline-8 outline-red-300' : 'bg-yellow-400 hover:bg-yellow-300'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                    </button>
                    <p className="mt-6 text-black font-black text-xl h-8 uppercase bg-white px-4 py-1 brutal-border inline-block">{feedback || 'READY'}</p>
                </div>

                {spokenText && (
                    <div className={`p-6 brutal-border mb-8 ${accuracy && accuracy > 80 ? 'bg-green-400' : 'bg-white'}`}>
                        <p className="text-xl font-black uppercase mb-2 border-b-2 border-black">You said:</p>
                        <p className="text-3xl font-black text-black">"{spokenText}"</p>
                        {accuracy !== null && (
                            <div className="mt-4 flex justify-center items-center">
                                <span className="text-5xl font-black text-black">
                                    {accuracy}%
                                </span>
                                <span className="text-2xl font-black text-black ml-4 uppercase">Accuracy</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-between items-center mt-8 pt-6 border-t-4 border-black">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="brutal-btn bg-white py-2 px-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
                    >
                        BACK
                    </button>
                    <button
                        onClick={nextPhrase}
                        className="brutal-btn bg-pink-400"
                    >
                        NEXT PHRASE
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Pronunciation;
