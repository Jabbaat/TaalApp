import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    const { token } = useAuth();
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
                const response = await fetch(`/api/lessons/${id}`, {
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

    const checkAnswer = (option: string, correctAnswer: string) => {
        setSelectedOption(option);
        if (option === correctAnswer) {
            setExerciseFeedback('Correct! 🎉');
        } else {
            setExerciseFeedback('Incorrect. Try again!');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
                    <h1 className="text-2xl font-bold">{lesson.title}</h1>
                    <button onClick={() => navigate('/')} className="text-indigo-200 hover:text-white">Exit</button>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 h-2">
                    <div className="bg-indigo-500 h-2 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>

                {/* Content Area */}
                <div className="p-8 min-h-[400px]">
                    {currentStep === 0 && (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-gray-800">Introduction</h2>
                            <p className="text-lg text-gray-600 leading-relaxed">{parsedContent.introduction}</p>
                            <div className="mt-8 flex justify-end">
                                <button onClick={handleNext} className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition">Start Lesson</button>
                            </div>
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-gray-800">Vocabulary</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {parsedContent.vocabulary.map((vocab, index) => (
                                    <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition bg-gray-50">
                                        <div className="text-xl font-bold text-indigo-700">{vocab.word}</div>
                                        <div className="text-gray-600">{vocab.translation}</div>
                                        {vocab.note && <div className="text-sm text-gray-400 mt-2 italic">{vocab.note}</div>}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 flex justify-end">
                                <button onClick={handleNext} className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition">Continue to Exercises</button>
                            </div>
                        </div>
                    )}

                    {currentStep >= 2 && (
                        <div className="space-y-8">
                            <h2 className="text-2xl font-bold text-gray-800">Exercise {currentStep - 1}</h2>
                            {(() => {
                                const exerciseIndex = currentStep - 2;
                                const exercise = parsedContent.exercises[exerciseIndex];
                                return (
                                    <div className="space-y-6">
                                        <p className="text-xl text-gray-700">{exercise.question}</p>
                                        <div className="space-y-3">
                                            {exercise.options.map((option, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => checkAnswer(option, exercise.answer)}
                                                    className={`w-full p-4 text-left rounded-lg border transition ${selectedOption === option
                                                        ? option === exercise.answer
                                                            ? 'bg-green-100 border-green-500 text-green-800'
                                                            : 'bg-red-100 border-red-500 text-red-800'
                                                        : 'bg-white border-gray-300 hover:bg-indigo-50 hover:border-indigo-300'
                                                        }`}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                        {exerciseFeedback && (
                                            <div className="flex justify-between items-center mt-6 animate-fade-in">
                                                <div className={`font-bold text-lg ${exerciseFeedback.includes('Correct') ? 'text-green-600' : 'text-red-600'}`}>
                                                    {exerciseFeedback}
                                                </div>
                                                {exerciseFeedback.includes('Correct') && (
                                                    <button onClick={handleNext} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">
                                                        {currentStep === totalSteps - 1 ? 'Finish Lesson' : 'Next Question'}
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
