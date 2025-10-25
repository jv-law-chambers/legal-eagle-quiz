import type { UserStats, Difficulty, PerformanceRecord, QuizRecord, Badge } from '../types';
import { ALL_BADGES } from '../components/Badges';

const STATS_STORAGE_KEY = 'legalEagleStats';

const POINTS_MAP: Record<Difficulty, number> = {
    Beginner: 10,
    Intermediate: 15,
    Expert: 20,
};

export const getDefaultStats = (): UserStats => ({
    totalQuizzesCompleted: 0,
    totalQuestionsAnswered: 0,
    totalCorrectAnswers: 0,
    performanceByTopic: {},
    performanceByDifficulty: {
        Beginner: { correct: 0, total: 0 },
        Intermediate: { correct: 0, total: 0 },
        Expert: { correct: 0, total: 0 },
    },
    quizHistory: [],
    // Gamification
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastQuizDate: null,
    badges: [],
});

export const loadStats = (): UserStats => {
    try {
        const storedStats = localStorage.getItem(STATS_STORAGE_KEY);
        if (storedStats) {
            const parsed = JSON.parse(storedStats);
            // Ensure quizHistory is always an array
            if (!Array.isArray(parsed.quizHistory)) {
                parsed.quizHistory = [];
            }
            return { ...getDefaultStats(), ...parsed };
        }
    } catch (error) {
        console.error("Failed to load stats from localStorage:", error);
    }
    return getDefaultStats();
};

export const saveStats = (stats: UserStats): void => {
    try {
        localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch (error) {
        console.error("Failed to save stats to localStorage:", error);
    }
};

export const resetStats = (): UserStats => {
    const defaultStats = getDefaultStats();
    saveStats(defaultStats);
    return defaultStats;
};

const updateStreak = (stats: UserStats): void => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to the start of the day
    const todayStr = today.toISOString().split('T')[0];

    if (!stats.lastQuizDate) {
        stats.currentStreak = 1;
    } else if (stats.lastQuizDate !== todayStr) {
        const lastDate = new Date(stats.lastQuizDate);
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (lastDate.getTime() === yesterday.getTime()) {
            stats.currentStreak += 1;
        } else {
            stats.currentStreak = 1; // Streak is broken
        }
    }
    // If lastQuizDate is today, streak doesn't change

    stats.lastQuizDate = todayStr;
    if (stats.currentStreak > stats.longestStreak) {
        stats.longestStreak = stats.currentStreak;
    }
};

const checkAndAwardBadges = (
    stats: UserStats,
    quizContext: { score: number; totalQuestions: number; topic: string; difficulty: Difficulty }
): { updatedBadges: string[]; newBadges: Badge[] } => {
    const newlyEarnedBadges: Badge[] = [];
    
    const award = (badge: Badge) => {
        if (!stats.badges.includes(badge.id)) {
            stats.badges.push(badge.id);
            newlyEarnedBadges.push(badge);
        }
    }

    // --- Check all badge conditions ---
    
    // First Quiz
    if (stats.totalQuizzesCompleted === 1) award(ALL_BADGES.novice_jurist);
    
    // Perfectionist
    if (quizContext.score === quizContext.totalQuestions && quizContext.totalQuestions > 0) award(ALL_BADGES.perfectionist);
    
    // Streaks
    if (stats.currentStreak >= 3) award(ALL_BADGES.consistent_3_day);
    if (stats.currentStreak >= 7) award(ALL_BADGES.consistent_7_day);
    
    // Difficulty Master
    const hasPlayedAllDifficulties = (['Beginner', 'Intermediate', 'Expert'] as Difficulty[])
        .every(d => stats.performanceByDifficulty[d].total > 0);
    if (hasPlayedAllDifficulties) award(ALL_BADGES.difficulty_master);
    
    // Topic Dabbler
    if (Object.keys(stats.performanceByTopic).length >= 3) award(ALL_BADGES.topic_dabbler);
    if (Object.keys(stats.performanceByTopic).length >= 5) award(ALL_BADGES.topic_expert);

    // Points Milestones
    if (stats.totalPoints >= 1000) award(ALL_BADGES.points_1000);
    if (stats.totalPoints >= 5000) award(ALL_BADGES.points_5000);

    return { updatedBadges: stats.badges, newBadges: newlyEarnedBadges };
};


export const awardBadge = (
    currentStats: UserStats,
    badgeId: keyof typeof ALL_BADGES
): { updatedStats: UserStats; newBadges: Badge[] } => {
     const stats = JSON.parse(JSON.stringify(currentStats));
     if (stats.badges.includes(badgeId)) {
        return { updatedStats: stats, newBadges: [] };
     }
     const badge = ALL_BADGES[badgeId];
     if (badge) {
         stats.badges.push(badgeId);
         return { updatedStats: stats, newBadges: [badge] };
     }
     return { updatedStats: stats, newBadges: [] };
};


export const updateStatsOnQuizCompletion = (
    currentStats: UserStats,
    score: number,
    topic: string,
    difficulty: Difficulty,
    totalQuestions: number
): { updatedStats: UserStats; newBadges: Badge[] } => {
    const newStats: UserStats = JSON.parse(JSON.stringify(currentStats)); // Deep copy

    // Update base stats
    newStats.totalQuizzesCompleted += 1;
    newStats.totalQuestionsAnswered += totalQuestions;
    newStats.totalCorrectAnswers += score;

    // Update points
    newStats.totalPoints += score * POINTS_MAP[difficulty];

    // Update streak
    updateStreak(newStats);

    // Update difficulty stats
    newStats.performanceByDifficulty[difficulty].correct += score;
    newStats.performanceByDifficulty[difficulty].total += totalQuestions;

    // Update topic stats
    if (!newStats.performanceByTopic[topic]) {
        newStats.performanceByTopic[topic] = { correct: 0, total: 0 };
    }
    newStats.performanceByTopic[topic].correct += score;
    newStats.performanceByTopic[topic].total += totalQuestions;

    // Add to quiz history
    const newQuizRecord: QuizRecord = {
        topic,
        difficulty,
        score,
        totalQuestions,
        date: new Date().toISOString(),
    };
    if (!newStats.quizHistory) newStats.quizHistory = [];
    newStats.quizHistory.unshift(newQuizRecord);
    if (newStats.quizHistory.length > 100) newStats.quizHistory.pop();

    // Check for new badges
    const { newBadges } = checkAndAwardBadges(newStats, { score, totalQuestions, topic, difficulty });

    return { updatedStats: newStats, newBadges };
};