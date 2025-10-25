import React from 'react';
import type { Badge } from '../types';

// Icon Components
const FirstQuizIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2zM12 9v4" />
    </svg>
);
const PerfectionistIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const StreakIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.657 7.343A8 8 0 0117.657 18.657z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1014.12 11.88a3 3 0 00-4.242 4.242z" />
    </svg>
);
const DifficultyIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);
const TopicIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
);
const BookwormIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
);
const PointsIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
);


export const ALL_BADGES: Record<string, Badge> = {
    novice_jurist: {
        id: 'novice_jurist',
        name: 'Novice Jurist',
        description: 'Complete your first quiz.',
        icon: FirstQuizIcon
    },
    perfectionist: {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Get a perfect score on any quiz.',
        icon: PerfectionistIcon
    },
    consistent_3_day: {
        id: 'consistent_3_day',
        name: 'Consistent Learner',
        description: 'Complete a quiz on 3 consecutive days.',
        icon: StreakIcon
    },
     consistent_7_day: {
        id: 'consistent_7_day',
        name: 'Dedicated Scholar',
        description: 'Complete a quiz on 7 consecutive days.',
        icon: StreakIcon
    },
    difficulty_master: {
        id: 'difficulty_master',
        name: 'Difficulty Master',
        description: 'Complete a quiz on all three difficulty levels.',
        icon: DifficultyIcon
    },
    topic_dabbler: {
        id: 'topic_dabbler',
        name: 'Topic Dabbler',
        description: 'Play quizzes in 3 different topics.',
        icon: TopicIcon
    },
    topic_expert: {
        id: 'topic_expert',
        name: 'Topic Expert',
        description: 'Play quizzes in 5 different topics.',
        icon: TopicIcon
    },
    bookworm: {
        id: 'bookworm',
        name: 'Bookworm',
        description: 'Bookmark 10 questions for review.',
        icon: BookwormIcon
    },
    points_1000: {
        id: 'points_1000',
        name: 'Point Collector',
        description: 'Accumulate a total of 1,000 points.',
        icon: PointsIcon
    },
    points_5000: {
        id: 'points_5000',
        name: 'Point Mogul',
        description: 'Accumulate a total of 5,000 points.',
        icon: PointsIcon
    }
};
