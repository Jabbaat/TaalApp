import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

interface LessonContent {
    introduction: string;
    vocabulary: { word: string; translation: string; note?: string }[];
    exercises: { type: string; question: string; options: string[]; answer: string }[];
}

interface Lesson {
    id: number;
    title: string;
    content: string; // JSON string
    difficultyLevel: string;
}

const LessonRunner: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [parsedContent, setParsedContent] = useState<LessonContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(0); // 0: Intro, 1: Vocab, 2+: Exercises
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [exerciseFeedback, setExerciseFeedback] = useState<string | null>(null);

    useEffect(() => {
        const fetchLesson = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/lessons/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Failed to fetch lesson');
                const data = await response.json();
                setLesson(data);

                try {
                    const content = JSON.parse(data.content);
                    setParsedContent(content);
                } catch (e) {
                    setError('Failed to parse lesson content');
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (token && id) fetchLesson();
    }, [id, token]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading lesson...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
    if (!lesson || !parsedContent) return <div className="p-8 text-center text-gray-500">Lesson not found</div>;

    const totalSteps = 2 + parsedContent.exercises.length; // Intro + Vocab + Exercises
    const progress = ((currentStep + 1) / totalSteps) * 100;

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
            setSelectedOption(null);
            setExerciseFeedback(null);
        } else {
            navigate('/'); // Finish lesson
        }
    };

    const playAudio = (text: string) => {
        // Map simplified language codes to full BCP 47 tags for accurate pronunciation
        const languageMap: Record<string, string> = {
            'nl': 'nl-NL',
            'sv': 'sv-SE',
            'fr': 'fr-FR',
            'it': 'it-IT',
            'en': 'en-US',
            'es': 'es-ES'
        };

        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            const targetLang = user?.targetLanguage || 'nl';
            const langCode = languageMap[targetLang] || targetLang;
            utterance.lang = langCode;

            const setVoiceAndSpeak = () => {
                const voices = window.speechSynthesis.getVoices();
                // Find a voice that matches the langCode exactly, or at least the base language 
                const voice = voices.find(v => v.lang === langCode) || voices.find(v => v.lang.startsWith(langCode.split('-')[0]));
                if (voice) {
                    utterance.voice = voice;
                }
                window.speechSynthesis.speak(utterance);
            };

            // Voices might not be loaded immediately, add listener if empty
            if (window.speechSynthesis.getVoices().length === 0) {
                window.speechSynthesis.addEventListener('voiceschanged', setVoiceAndSpeak, { once: true });
            } else {
                setVoiceAndSpeak();
            }
        } else {
            alert('Text-to-speech is not supported in this browser.');
        }
    };

    const checkAnswer = (option: string, correctAnswer: string) => {
        setSelectedOption(option);
        if (option === correctAnswer) {
            setExerciseFeedback('Correct! 🎉');
        } else {
            setExerciseFeedback('Incorrect. Try again!');
        }
    };

    return (
        <div className="min-h-screen bg-purple-400 p-8 font-sans">
            <div className="max-w-3xl mx-auto brutal-card p-0 overflow-hidden">
                {/* Header */}
                <div className="bg-yellow-400 p-6 text-black border-b-4 border-black flex justify-between items-center">
                    <h1 className="text-3xl font-black uppercase tracking-wider">{lesson.title}</h1>
                    <button onClick={() => navigate('/')} className="brutal-btn bg-white py-2 px-4 text-sm font-black">EXIT</button>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white h-6 border-b-4 border-black">
                    <div className="bg-pink-500 h-full border-r-4 border-black transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>

                {/* Content Area */}
                <div className="p-8 min-h-[400px]">
                    {currentStep === 0 && (
                        <div className="space-y-6">
                            <h2 className="text-4xl font-black text-black uppercase">Introduction</h2>
                            <p className="text-xl text-black font-bold leading-relaxed bg-blue-200 brutal-border p-4">{parsedContent.introduction}</p>
                            <div className="mt-8 flex justify-end">
                                <button onClick={handleNext} className="brutal-btn bg-green-400 text-xl">START LESSON</button>
                            </div>
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-4xl font-black text-black uppercase">Vocabulary</h2>
                            <div className="grid gap-6 md:grid-cols-2">
                                {parsedContent.vocabulary.map((vocab, index) => (
                                    <div key={index} className="brutal-card brutal-shadow-hover bg-lime-300 flex justify-between items-start">
                                        <div>
                                            <div className="text-2xl font-black text-black uppercase">{vocab.word}</div>
                                            <div className="text-black font-bold text-lg">{vocab.translation}</div>
                                            {vocab.note && <div className="text-sm text-black mt-2 font-bold bg-white border-2 border-black inline-block px-2 py-1">{vocab.note}</div>}
                                        </div>
                                        <button
                                            onClick={() => playAudio(vocab.word)}
                                            className="brutal-btn bg-cyan-400 p-2 text-black"
                                            title="Listen to pronunciation"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 flex justify-end">
                                <button onClick={handleNext} className="brutal-btn bg-pink-400 text-xl">CONTINUE TO EXERCISES</button>
                            </div>
                        </div>
                    )}

                    {currentStep >= 2 && (
                        <div className="space-y-8">
                            <h2 className="text-3xl font-black text-black uppercase">Exercise {currentStep - 1}</h2>
                            {(() => {
                                const exerciseIndex = currentStep - 2;
                                const exercise = parsedContent.exercises[exerciseIndex];
                                return (
                                    <div className="space-y-6">
                                        <p className="text-2xl font-bold text-black bg-yellow-200 brutal-border p-4">{exercise.question}</p>
                                        <div className="space-y-4 pt-4">
                                            {exercise.options.map((option, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => checkAnswer(option, exercise.answer)}
                                                    className={`w-full p-4 text-left font-bold text-lg brutal-border brutal-shadow-hover transition ${selectedOption === option
                                                        ? option === exercise.answer
                                                            ? 'bg-green-400 text-black'
                                                            : 'bg-red-500 text-white'
                                                        : 'bg-white hover:bg-blue-300'
                                                        }`}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                        {exerciseFeedback && (
                                            <div className="flex flex-col sm:flex-row justify-between items-center mt-8 bg-gray-100 brutal-border p-4 gap-4 animate-fade-in">
                                                <div className={`font-black text-2xl uppercase ${exerciseFeedback.includes('Correct') ? 'text-green-600' : 'text-red-600'}`}>
                                                    {exerciseFeedback}
                                                </div>
                                                {exerciseFeedback.includes('Correct') && (
                                                    <button onClick={handleNext} className="brutal-btn bg-cyan-400 text-lg">
                                                        {currentStep === totalSteps - 1 ? 'FINISH LESSON' : 'NEXT QUESTION'}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LessonRunner;
