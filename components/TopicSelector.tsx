import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { generateLegalDomains } from '../services/geminiService';
import type { Domain, UserStats } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface TopicSelectorProps {
    onStartQuiz: (topic: string, difficulty: string, isTimerEnabled: boolean, questionCount?: number) => void;
    onViewBookmarks: () => void;
    bookmarksCount: number;
    onViewProfile: () => void;
    stats: UserStats;
}

const ICON_CLASS = "h-10 w-10 text-pink-400";

const ConstitutionIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className={ICON_CLASS} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.25278C12 6.25278 6.75 3 4.5 3C2.25 3 1.5 4.5 1.5 6.75C1.5 9 1.5 15.75 1.5 15.75C1.5 18 2.25 21 4.5 21C6.75 21 12 17.7472 12 17.7472" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.25278C12 6.25278 17.25 3 19.5 3C21.75 3 22.5 4.5 22.5 6.75C22.5 9 22.5 15.75 22.5 15.75C22.5 18 21.75 21 19.5 21C17.25 21 12 17.7472 12 17.7472" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.25278V17.7472" />
    </svg>
);
const CriminalLawIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className={ICON_CLASS} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);
const CivilLawIcon: React.FC = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className={ICON_CLASS} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const GavelIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className={ICON_CLASS} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10l5-5 11 11-5 5-11-11zM10 5l9 9" />
    </svg>
);
const ScalesIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className={ICON_CLASS} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M5 9h14M5 9l-2 5h6l-2-5zm14 0l2 5h-6l2-5zM8 9V6m8 0V6" />
    </svg>
);
const ProfileIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);
const PointsIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const ICONS: { [key: string]: React.FC<any> } = {
    'Constitution': ConstitutionIcon, 'Criminal': CriminalLawIcon, 'Civil': CivilLawIcon,
    'Gavel': GavelIcon, 'Scales': ScalesIcon, 'Book': ConstitutionIcon, 'Default': ConstitutionIcon
};

const TopicSelector: React.FC<TopicSelectorProps> = ({ onStartQuiz, onViewBookmarks, bookmarksCount, onViewProfile, stats }) => {
    const [domains, setDomains] = useState<Domain[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('Intermediate');
    const [customTopic, setCustomTopic] = useState('');
    const [isTimerEnabled, setIsTimerEnabled] = useState(false);
    const difficulties = ['Beginner', 'Intermediate', 'Expert'];

    const fetchDomains = useCallback(async () => {
        try {
            setIsLoading(true); setError(null);
            const fetchedDomains = await generateLegalDomains();
            setDomains(fetchedDomains);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchDomains(); }, [fetchDomains]);

    const filteredDomains = useMemo(() => {
        if (!searchTerm) return domains;
        const lowercasedFilter = searchTerm.toLowerCase();
        return domains.filter(d => 
            d.name.toLowerCase().includes(lowercasedFilter) ||
            d.description.toLowerCase().includes(lowercasedFilter) ||
            d.subdomains.some(s => s.toLowerCase().includes(lowercasedFilter))
        );
    }, [domains, searchTerm]);

    if (isLoading) {
        return (
             <div className="flex flex-col items-center justify-center h-full min-h-[380px]">
                <LoadingSpinner />
                <p className="mt-4 text-zinc-400">Curating legal domains for you...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-400 min-h-[380px] flex flex-col items-center justify-center bg-zinc-900/50 p-8 rounded-xl">
                <h3 className="text-xl font-semibold mb-4 text-white">Something went wrong</h3>
                <p className="mb-6 max-w-md">{error}</p>
                <button
                    onClick={fetchDomains}
                    className="bg-instagram text-white font-bold py-2 px-6 rounded-lg hover:opacity-90 transition-opacity"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="w-full">
            <header className="flex justify-between items-center mb-10">
                 <h1 className="text-3xl font-bold text-white">LexRam</h1>
                 <div className="flex items-center gap-2">
                    <div className="bg-zinc-800 text-white font-bold p-2 rounded-lg flex items-center gap-2" title="Total Points">
                        <PointsIcon />
                        <span>{stats.totalPoints}</span>
                    </div>
                    {bookmarksCount > 0 && (
                        <button 
                            onClick={onViewBookmarks} 
                            className="bg-zinc-800 text-white font-bold p-2 rounded-lg hover:bg-zinc-700 transition-colors duration-300 flex items-center"
                            title="View Bookmarked Questions"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                        </button>
                    )}
                    <button
                        onClick={onViewProfile}
                        className="bg-zinc-800 text-white font-bold p-2 rounded-lg hover:bg-zinc-700 transition-colors duration-300 flex items-center"
                        title="View Your Profile"
                    >
                        <ProfileIcon />
                    </button>
                </div>
            </header>
            
            <div className="mb-6 flex flex-col sm:flex-row justify-center items-center gap-6 bg-zinc-900 p-3 rounded-full border border-zinc-800">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-400 flex-shrink-0">Difficulty:</span>
                    <div className="flex flex-wrap justify-center gap-2">
                        {difficulties.map((level) => (
                            <button
                                key={level}
                                onClick={() => setSelectedDifficulty(level)}
                                className={`font-bold py-2 px-4 rounded-full transition-all duration-200 text-sm ${
                                    selectedDifficulty === level
                                        ? 'bg-instagram text-white shadow-lg'
                                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                }`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-400">Timer:</span>
                    <label htmlFor="timer-toggle" className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={isTimerEnabled} onChange={() => setIsTimerEnabled(!isTimerEnabled)} id="timer-toggle" className="sr-only peer" />
                        <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                    </label>
                </div>
            </div>

            <div className="my-8 bg-zinc-900 p-6 rounded-xl border-2 border-pink-500/50">
                <h2 className="text-xl font-bold text-instagram mb-4 text-center">Mock Tests</h2>
                <div className="flex flex-col items-center">
                    <p className="text-zinc-400 text-center mb-4">Prepare for the real exam with a full-length mock test.</p>
                    <button
                        onClick={() => onStartQuiz("Comprehensive CLAT LLM Mock Test", "Expert", isTimerEnabled, 120)}
                        className="bg-instagram text-white font-bold py-3 px-8 rounded-lg text-lg hover:opacity-90 transition-opacity shadow-lg transform hover:-translate-y-1 active:scale-95"
                    >
                        Start CLAT LLM Mock Test (120 Questions)
                    </button>
                </div>
            </div>
            
            <div className="my-8">
                <p className="text-center text-zinc-400 font-semibold mb-3">Or create a custom 5-question quiz</p>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="e.g., 'Landmark Contract Law Cases'"
                        value={customTopic}
                        onChange={(e) => setCustomTopic(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && customTopic.trim() && onStartQuiz(customTopic, selectedDifficulty, isTimerEnabled)}
                        className="w-full bg-zinc-900 border-2 border-zinc-800 text-white placeholder-zinc-500 rounded-full py-3 pl-6 pr-32 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors"
                    />
                    <button
                        onClick={() => onStartQuiz(customTopic, selectedDifficulty, isTimerEnabled)}
                        disabled={!customTopic.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-instagram text-white font-bold py-2 px-6 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Start
                    </button>
                </div>
            </div>

             <div className="mb-8 relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                    <svg className="h-5 w-5 text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </span>
                <input
                    type="text"
                    placeholder="Search pre-generated topics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-zinc-900 border-2 border-zinc-800 text-white placeholder-zinc-500 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-300"
                />
            </div>
            {filteredDomains.length > 0 ? (
                <div className="space-y-6">
                    {filteredDomains.map((domain) => {
                        const IconComponent = ICONS[domain.icon] || ICONS['Default'];
                        return (
                            <div
                                key={domain.name}
                                className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 transition-all duration-300 animate-fade-in"
                            >
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="flex-shrink-0 mt-1"><IconComponent /></div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-1">{domain.name}</h3>
                                        <p className="text-zinc-400">{domain.description}</p>
                                    </div>
                                </div>
                                <div className="border-t border-zinc-800 pt-4 flex flex-wrap gap-3">
                                    {domain.subdomains.map((subdomain) => (
                                        <button
                                            key={subdomain}
                                            onClick={() => onStartQuiz(subdomain, selectedDifficulty, isTimerEnabled)}
                                            className="bg-zinc-800 text-zinc-200 font-medium py-2 px-4 rounded-full hover:bg-zinc-700 hover:text-white transition-colors duration-200 text-sm"
                                        >
                                            {subdomain}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
             ) : (
                <div className="text-center py-12 text-zinc-500 bg-zinc-900/50 rounded-lg">
                    <h3 className="text-xl font-semibold text-white">No Results Found</h3>
                    <p className="mt-2">Your search for "{searchTerm}" did not match any topics.</p>
                </div>
            )}
        </div>
    );
};

export default TopicSelector;