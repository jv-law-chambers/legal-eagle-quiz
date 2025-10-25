// FIX: Add React import to use React.FC type.
import React from 'react';

export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  hint: string;
}

export interface Domain {
  name: string;
  description: string;
  icon: string; // A keyword like 'Constitution', 'Criminal', etc.
  subdomains: string[];
}

export type Difficulty = 'Beginner' | 'Intermediate' | 'Expert';

export interface PerformanceRecord {
    correct: number;
    total: number;
}

export interface QuizRecord {
    topic: string;
    difficulty: Difficulty;
    score: number;
    totalQuestions: number;
    date: string; // ISO string date
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: React.FC<{className?: string}>;
}

export interface UserStats {
    totalQuizzesCompleted: number;
    totalQuestionsAnswered: number;
    totalCorrectAnswers: number;
    performanceByTopic: Record<string, PerformanceRecord>;
    performanceByDifficulty: Record<Difficulty, PerformanceRecord>;
    quizHistory: QuizRecord[];
    // Gamification
    totalPoints: number;
    currentStreak: number;
    longestStreak: number;
    lastQuizDate: string | null; // ISO Date string (YYYY-MM-DD)
    badges: string[]; // Array of badge IDs
}