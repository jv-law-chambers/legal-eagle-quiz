import React, { useState } from 'react';
import type { Badge } from '../types';

interface ResultProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
  onViewBookmarks: () => void;
  bookmarksCount: number;
  onViewProfile: () => void;
  newlyEarnedBadges: Badge[];
  topic: string;
  difficulty: string;
}

const Result: React.FC<ResultProps> = ({ score, totalQuestions, onRestart, onViewBookmarks, bookmarksCount, onViewProfile, newlyEarnedBadges, topic, difficulty }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  let feedback = '';
  if (percentage === 100) {
    feedback = 'Perfect Score! You are a true Legal Eagle!';
  } else if (percentage >= 80) {
    feedback = 'Excellent work! Your legal knowledge is impressive.';
  } else if (percentage >= 50) {
    feedback = 'Good effort! Keep studying to sharpen your skills.';
  } else {
    feedback = 'Keep trying! Every expert was once a beginner.';
  }

  const handleShare = async () => {
    const shareText = `I just scored ${score}/${totalQuestions} on the "${topic}" (${difficulty}) quiz in Legal Eagle! Think you can do better? #LegalEagleQuiz`;

    // 1. Try Web Share API
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Legal Eagle Quiz Challenge!',
                text: shareText,
                url: window.location.href,
            });
            return; // Success!
        } catch (error) {
            if (error.name === 'AbortError') return; // User cancelled share.
            console.warn('Web Share API failed, falling back.', error);
        }
    }

    // 2. Fallback to copying to clipboard
    try {
        // Modern async clipboard API (requires secure context)
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(shareText);
        } else {
            // Older execCommand for broader compatibility
            const textArea = document.createElement('textarea');
            textArea.value = shareText;
            textArea.style.position = 'fixed';
            textArea.style.top = '-9999px';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
        
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 2500);

    } catch (err) {
        console.error('Failed to copy results to clipboard:', err);
        // Final fallback if all else fails
        prompt("Auto-sharing failed. Please copy this text:", shareText);
    }
  };


  return (
    <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl text-center max-w-2xl w-full">
      <h2 className="text-4xl font-bold text-instagram mb-4">Quiz Complete!</h2>
      
      <div className="my-6 flex justify-center items-center">
        <div className="relative w-48 h-48">
          <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100">
              <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f09433" />
                      <stop offset="50%" stopColor="#dc2743" />
                      <stop offset="100%" stopColor="#bc1888" />
                  </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="45" stroke="url(#gradient)" strokeWidth="4" fill="none" />
          </svg>
          <div className="w-full h-full flex flex-col items-center justify-center">
              <p className="text-5xl font-bold text-white">
                {score} / {totalQuestions}
              </p>
              <p className="text-lg font-semibold text-zinc-400">{percentage}%</p>
          </div>
        </div>
      </div>
      
       <p className="text-2xl font-semibold text-zinc-200 mb-8">{feedback}</p>

       {newlyEarnedBadges.length > 0 && (
          <div className="mb-8 p-4 bg-black/50 rounded-lg border border-pink-500 animate-fade-in">
              <h3 className="text-xl font-bold text-pink-400 mb-3">New Achievements!</h3>
              <div className="flex flex-wrap justify-center gap-4">
                  {newlyEarnedBadges.map(badge => (
                      <div key={badge.id} className="flex items-center gap-2 bg-zinc-800 p-2 rounded-md" title={badge.description}>
                          <badge.icon className="h-6 w-6 text-yellow-400" />
                          <span className="font-semibold text-white">{badge.name}</span>
                      </div>
                  ))}
              </div>
          </div>
       )}

       <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4">
          <button
            onClick={onRestart}
            className="bg-zinc-800 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-zinc-700 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-zinc-600 transform hover:-translate-y-1 active:scale-95"
          >
            Play Again
          </button>
            <button
                onClick={handleShare}
                disabled={copyStatus === 'copied'}
                className={`bg-instagram text-white font-bold py-3 px-8 rounded-lg text-lg hover:opacity-90 transition-all duration-300 shadow-lg focus:outline-none focus:ring-4 focus:ring-pink-400/50 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 ${copyStatus === 'copied' ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {copyStatus === 'copied' ? (
                  <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Copied!</span>
                  </>
              ) : (
                  <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                      </svg>
                      <span>Share</span>
                  </>
              )}
            </button>
            <button
                onClick={onViewProfile}
                className="bg-zinc-800 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-zinc-700 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-zinc-600 transform hover:-translate-y-1 active:scale-95"
            >
                Profile
            </button>
           {bookmarksCount > 0 && (
                <button
                    onClick={onViewBookmarks}
                    className="bg-zinc-800 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-zinc-700 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-zinc-600 transform hover:-translate-y-1 active:scale-95"
                >
                    Bookmarks ({bookmarksCount})
                </button>
            )}
       </div>
    </div>
  );
};

export default Result;