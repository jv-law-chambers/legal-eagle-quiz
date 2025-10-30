import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Quiz from './components/Quiz';
import Result from './components/Result';
import LoadingSpinner from './components/LoadingSpinner';
import TopicSelector from './components/TopicSelector';
import Bookmarks from './components/Bookmarks';
import Profile from './components/Profile';
import { generateQuizQuestions } from './services/geminiService';
// FIX: import resetStats from statsService to handle resetting user statistics.
import { loadStats, saveStats, updateStatsOnQuizCompletion, awardBadge, resetStats } from './services/statsService';
import type { Question, UserStats, Difficulty, Badge } from './types';

type GameState = 'start' | 'loading' | 'active' | 'finished';

const BOOKWORM_BADGE_THRESHOLD = 10;

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>('start');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [currentTopic, setCurrentTopic] = useState('');
    const [currentDifficulty, setCurrentDifficulty] = useState('');
    const [loadingMessage, setLoadingMessage] = useState('');
    const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Question[]>([]);
    const [isViewingBookmarks, setIsViewingBookmarks] = useState(false);
    const [stats, setStats] = useState<UserStats>(loadStats());
    const [isViewingProfile, setIsViewingProfile] = useState(false);
    const [newlyEarnedBadges, setNewlyEarnedBadges] = useState<Badge[]>([]);
    const [isTimerActive, setIsTimerActive] = useState(false);
    
    const bookmarkedQuestionsSet = useMemo(() => new Set(bookmarkedQuestions.map(q => q.question)), [bookmarkedQuestions]);

    useEffect(() => {
        setStats(loadStats());
    }, []);

    const startQuiz = useCallback(async (topic: string, difficulty: string, isTimerEnabled: boolean, questionCount: number = 5) => {
        setGameState('loading');
        setError(null);
        setIsViewingBookmarks(false);
        setIsViewingProfile(false);
        setNewlyEarnedBadges([]);
        
        const message = topic === "Comprehensive CLAT LLM Mock Test"
            ? `Generating your full-length CLAT LLM Mock Test... this may take a moment.`
            : `Generating your ${difficulty} quiz on "${topic}"...`;
        setLoadingMessage(message);

        try {
            setCurrentTopic(topic);
            setCurrentDifficulty(difficulty);
            setIsTimerActive(isTimerEnabled);
            const newQuestions = await generateQuizQuestions(topic, questionCount, difficulty);
            setQuestions(newQuestions);
            setCurrentQuestionIndex(0);
            setScore(0);
            setGameState('active');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setGameState('start');
        }
    }, []);

    const handleAnswer = (isCorrect: boolean) => {
        if (isCorrect) {
            setScore(prevScore => prevScore + 1);
        }
    };

    const handleQuizCompletion = () => {
        const { updatedStats, newBadges } = updateStatsOnQuizCompletion(
            stats,
            score,
            currentTopic,
            currentDifficulty as Difficulty,
            questions.length
        );
        setStats(updatedStats);
        saveStats(updatedStats);
        setNewlyEarnedBadges(newBadges);
        setGameState('finished');
    };

    const handleNextQuestion = () => {
        const nextQuestionIndex = currentQuestionIndex + 1;
        if (nextQuestionIndex < questions.length) {
            setCurrentQuestionIndex(nextQuestionIndex);
        } else {
            handleQuizCompletion();
        }
    };
    
    const toggleBookmark = useCallback((questionToToggle: Question) => {
        const isAlreadyBookmarked = bookmarkedQuestions.some(q => q.question === questionToToggle.question);
        
        setBookmarkedQuestions(prev => {
            if (isAlreadyBookmarked) {
                return prev.filter(q => q.question !== questionToToggle.question);
            } else {
                 const newBookmarks = [...prev, questionToToggle];
                 // Check for bookworm badge
                 if (newBookmarks.length >= BOOKWORM_BADGE_THRESHOLD) {
                    const { updatedStats, newBadges } = awardBadge(stats, 'bookworm');
                    if (newBadges.length > 0) {
                        setStats(updatedStats);
                        saveStats(updatedStats);
                        // Optional: show a toast/notification for the immediate badge award
                    }
                 }
                return newBookmarks;
            }
        });
    }, [stats, bookmarkedQuestions]);

    const restartQuiz = () => {
        setGameState('start');
        setIsViewingBookmarks(false);
        setIsViewingProfile(false);
    };
    
    const viewBookmarks = () => {
        setGameState('start');
        setIsViewingProfile(false);
        setIsViewingBookmarks(true);
    };

    const viewProfile = () => {
        setGameState('start');
        setIsViewingBookmarks(false);
        setIsViewingProfile(true);
    };

    const handleResetStats = () => {
        if (window.confirm("Are you sure you want to reset all your stats? This action cannot be undone.")) {
            const newStats = resetStats();
            setStats(newStats);
        }
    };

    const renderContent = () => {
        if (isViewingBookmarks) {
            return <Bookmarks bookmarks={bookmarkedQuestions} onExit={() => setIsViewingBookmarks(false)} onToggleBookmark={toggleBookmark} />;
        }

        if (isViewingProfile) {
            return <Profile stats={stats} onExit={() => setIsViewingProfile(false)} onResetStats={handleResetStats} />;
        }

        switch (gameState) {
            case 'loading':
                return (
                    <div className="text-center">
                        <LoadingSpinner />
                        <p className="text-zinc-300 text-lg mt-4 animate-pulse">{loadingMessage}</p>
                    </div>
                );
            case 'active':
                return (
                    <Quiz
                        question={questions[currentQuestionIndex]}
                        questionNumber={currentQuestionIndex + 1}
                        totalQuestions={questions.length}
                        onAnswer={handleAnswer}
                        onNextQuestion={handleNextQuestion}
                        onToggleBookmark={toggleBookmark}
                        isBookmarked={bookmarkedQuestionsSet.has(questions[currentQuestionIndex]?.question)}
                        isTimerActive={isTimerActive}
                    />
                );
            case 'finished':
                return <Result
                    score={score}
                    totalQuestions={questions.length}
                    onRestart={restartQuiz}
                    onViewBookmarks={viewBookmarks}
                    bookmarksCount={bookmarkedQuestions.length}
                    onViewProfile={viewProfile}
                    newlyEarnedBadges={newlyEarnedBadges}
                    topic={currentTopic}
                    difficulty={currentDifficulty} />;
            case 'start':
            default:
                return (
                    <div className="w-full max-w-4xl">
                        <TopicSelector onStartQuiz={startQuiz} onViewBookmarks={viewBookmarks} bookmarksCount={bookmarkedQuestions.length} onViewProfile={viewProfile} stats={stats} />
                        {error && <p className="text-red-400 mt-4 text-center bg-red-900/50 p-3 rounded-lg animate-fade-in w-full">{error}</p>}
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 font-sans">
            <main className="relative z-10 w-full flex items-center justify-center">
                {renderContent()}
            </main>
             <footer className="absolute bottom-4 text-zinc-600 text-sm">
                Curated with Love, by LexRam
            </footer>
        </div>
    );
};

export default App;