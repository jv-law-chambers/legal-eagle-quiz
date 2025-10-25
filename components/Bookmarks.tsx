import React from 'react';
import type { Question } from '../types';

interface BookmarksProps {
    bookmarks: Question[];
    onExit: () => void;
    onToggleBookmark: (question: Question) => void;
}

const BookmarkIconFilled: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
);

const Bookmarks: React.FC<BookmarksProps> = ({ bookmarks, onExit, onToggleBookmark }) => {
    return (
        <div className="w-full max-w-4xl animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-extrabold text-white">Bookmarks</h1>
                <button
                    onClick={onExit}
                    className="bg-zinc-800 text-white font-bold py-2 px-6 rounded-lg hover:bg-zinc-700 transition-colors duration-300"
                >
                    Back
                </button>
            </div>

            {bookmarks.length > 0 ? (
                <div className="space-y-6">
                    {bookmarks.map((question, index) => (
                        <div key={index} className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                            <div className="flex justify-between items-start gap-4">
                                <h2 className="text-xl font-bold text-white mb-4 flex-grow" dangerouslySetInnerHTML={{ __html: question.question }}></h2>
                                <button
                                    onClick={() => onToggleBookmark(question)}
                                    title="Remove Bookmark"
                                    className="flex-shrink-0 p-2 rounded-full hover:bg-zinc-800 transition-colors duration-300"
                                >
                                    <BookmarkIconFilled />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {question.options.map((option, optIndex) => {
                                    const isCorrect = option === question.correctAnswer;
                                    return (
                                        <div
                                            key={optIndex}
                                            className={`w-full text-left p-3 rounded-md text-white border ${isCorrect ? 'bg-green-500/20 border-green-700' : 'bg-zinc-800/50 border-zinc-700'}`}
                                        >
                                            <span className={`mr-3 font-bold ${isCorrect ? 'text-green-400' : 'text-pink-400'}`}>{String.fromCharCode(65 + optIndex)}.</span>
                                            {option}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-4 pt-4 border-t border-zinc-800">
                                <h3 className="font-bold text-lg text-pink-400 mb-2">Explanation</h3>
                                <p className="text-zinc-300" dangerouslySetInnerHTML={{ __html: question.explanation }}></p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-zinc-500 bg-zinc-900/50 rounded-lg">
                    <h3 className="text-2xl font-semibold text-white">No Bookmarks Yet</h3>
                    <p className="mt-2 max-w-md mx-auto">You haven't bookmarked any questions. Click the bookmark icon during a quiz to save it for review.</p>
                </div>
            )}
        </div>
    );
};

export default Bookmarks;