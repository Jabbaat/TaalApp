import React, { useState, useEffect } from 'react';
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
        <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center justify-center">
            <div className="bg-white p-12 rounded-lg shadow-lg w-full max-w-lg text-center">
                <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-2">Speak this phrase</h2>
                <h1 className="text-3xl font-bold text-gray-800 mb-8">{targetPhrase}</h1>

                <div className="mb-8">
                    <button
                        onClick={startRecording}
                        disabled={isRecording}
                        className={`w-20 h-20 rounded-full flex items-center justify-center transition ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                    </button>
                    <p className="mt-4 text-gray-600 h-6">{feedback}</p>
                </div>

                {spokenText && (
                    <div className={`p-4 rounded-lg mb-6 ${accuracy && accuracy > 80 ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <p className="text-sm text-gray-500 mb-1">You said:</p>
                        <p className="text-lg font-medium text-gray-800">"{spokenText}"</p>
                        {accuracy !== null && (
                            <div className="mt-2">
                                <span className={`text-2xl font-bold ${accuracy > 80 ? 'text-green-600' : accuracy > 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {accuracy}%
                                </span>
                                <span className="text-sm text-gray-500 ml-2">Accuracy</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-between mt-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        Back to Dashboard
                    </button>
                    <button
                        onClick={nextPhrase}
                        className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-900 transition"
                    >
                        Next Phrase
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Pronunciation;
