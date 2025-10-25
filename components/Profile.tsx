import React from 'react';
import type { UserStats, PerformanceRecord, Difficulty, QuizRecord, Badge } from '../types';
import { ALL_BADGES } from './Badges';

interface ProfileProps {
    stats: UserStats;
    onExit: () => void;
    onResetStats: () => void;
}

const ProgressBar: React.FC<{ record: PerformanceRecord; colorClass?: string }> = ({ record, colorClass = 'bg-instagram' }) => {
    const percentage = record.total > 0 ? (record.correct / record.total) * 100 : 0;
    return (
        <div className="w-full bg-zinc-800 rounded-full h-2">
            <div
                className={`h-2 rounded-full ${colorClass}`}
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
    );
};

const StatCard: React.FC<{ title: string; value: string | number; description?: string; children?: React.ReactNode }> = ({ title, value, description, children }) => (
    <div className="bg-zinc-900 p-4 rounded-lg text-center flex flex-col justify-center">
        <div>
            <p className="text-3xl font-bold text-white">{value}</p>
            <p className="text-sm text-zinc-400">{title}</p>
        </div>
    </div>
);

const BadgeDisplay: React.FC<{badge: Badge, isUnlocked: boolean}> = ({ badge, isUnlocked }) => (
    <div className={`text-center p-4 rounded-lg transition-all duration-300 ${isUnlocked ? 'bg-zinc-800' : 'bg-zinc-900'}`}>
        <badge.icon className={`h-12 w-12 mx-auto mb-2 ${isUnlocked ? 'text-yellow-400' : 'text-zinc-600'}`} />
        <h4 className={`font-bold ${isUnlocked ? 'text-white' : 'text-zinc-500'}`}>{badge.name}</h4>
        <p className={`text-xs ${isUnlocked ? 'text-zinc-300' : 'text-zinc-600'}`}>{badge.description}</p>
    </div>
);


const Profile: React.FC<ProfileProps> = ({ stats, onExit, onResetStats }) => {
    const overallAccuracy = stats.totalQuestionsAnswered > 0
        ? Math.round((stats.totalCorrectAnswers / stats.totalQuestionsAnswered) * 100)
        : 0;

    const sortedTopics = (Object.entries(stats.performanceByTopic) as [string, PerformanceRecord][])
        .sort(([, a], [, b]) => b.total - a.total);

    return (
        <div className="w-full max-w-5xl animate-fade-in">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Profile</h1>
                <button
                    onClick={onExit}
                    className="bg-zinc-800 text-white font-bold py-2 px-6 rounded-lg hover:bg-zinc-700 transition-colors"
                >
                    Back
                </button>
            </header>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard title="Overall Accuracy" value={`${overallAccuracy}%`} />
                    <StatCard title="Total Points" value={stats.totalPoints} />
                    <StatCard title="Current Streak" value={stats.currentStreak} />
                    <StatCard title="Quizzes Done" value={stats.totalQuizzesCompleted} />
                </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Achievements</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {Object.values(ALL_BADGES).map(badge => (
                        <BadgeDisplay key={badge.id} badge={badge} isUnlocked={stats.badges.includes(badge.id)} />
                    ))}
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                    <h2 className="text-2xl font-bold text-white mb-4">Difficulty</h2>
                    <div className="space-y-4">
                        {(['Beginner', 'Intermediate', 'Expert'] as Difficulty[]).map(level => {
                            const record = stats.performanceByDifficulty[level];
                            return (
                                <div key={level}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-semibold text-zinc-300">{level}</h3>
                                        <p className="text-sm text-zinc-400">{record.correct} / {record.total}</p>
                                    </div>
                                    <ProgressBar record={record} />
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                    <h2 className="text-2xl font-bold text-white mb-4">Topics</h2>
                    {sortedTopics.length > 0 ? (
                        <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                            {sortedTopics.map(([topic, record]) => (
                                <div key={topic}>
                                     <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-semibold text-zinc-300 truncate pr-4" title={topic}>{topic}</h3>
                                        <p className="text-sm text-zinc-400 flex-shrink-0">{record.correct} / {record.total}</p>
                                    </div>
                                    <ProgressBar record={record} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-zinc-400 text-center py-8">Complete a quiz to see topic performance.</p>
                    )}
                </div>
            </div>

            <div className="mt-8 bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                <h2 className="text-2xl font-bold text-white mb-4">Quiz History</h2>
                {stats.quizHistory && stats.quizHistory.length > 0 ? (
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                        {stats.quizHistory.map((quiz, index) => (
                            <div key={index} className="bg-zinc-800 p-4 rounded-lg flex justify-between items-center border border-zinc-700">
                                <div>
                                    <p className="font-bold text-white">{quiz.topic}</p>
                                    <p className="text-sm text-zinc-400">
                                        {quiz.difficulty} - {new Date(quiz.date).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right flex-shrink-0 ml-4">
                                    <p className="text-xl font-bold text-white">{quiz.score}/{quiz.totalQuestions}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                     <p className="text-zinc-400 text-center py-8">No quizzes taken yet. Complete a quiz to see your history!</p>
                )}
            </div>
            
            <footer className="text-center mt-8">
                <button
                    onClick={onResetStats}
                    className="text-zinc-500 hover:text-red-400 transition-colors text-sm underline"
                >
                    Reset All Stats
                </button>
            </footer>
        </div>
    );
};

export default Profile;