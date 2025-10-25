import React, { useState, useEffect } from 'react';
import type { Question } from '../types';

interface QuizProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (isCorrect: boolean) => void;
  onNextQuestion: () => void;
  onToggleBookmark: (question: Question) => void;
  isBookmarked: boolean;
  isTimerActive: boolean;
}

const BookmarkIcon: React.FC<{ isBookmarked: boolean }> = ({ isBookmarked }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors duration-300 ${isBookmarked ? 'text-pink-500' : 'text-zinc-500 hover:text-white'}`} fill={isBookmarked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
);

const TimerIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const Quiz: React.FC<QuizProps> = ({ question, questionNumber, totalQuestions, onAnswer, onNextQuestion, onToggleBookmark, isBookmarked, isTimerActive }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimeout, setIsTimeout] = useState(false);
  
  // Effect to reset state for each new question
  useEffect(() => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowHint(false);
    setTimeLeft(30);
    setIsTimeout(false);
  }, [question]);

  // Effect for the countdown timer
  useEffect(() => {
    if (!isTimerActive || isAnswered) {
      return;
    }

    if (timeLeft <= 0) {
      handleAnswerClick(''); // Timeout, pass empty string
      return;
    }

    const timerId = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [timeLeft, isTimerActive, isAnswered]);


  const handleAnswerClick = (option: string) => {
    if (isAnswered) return;
    
    if(option === '') setIsTimeout(true);

    setSelectedAnswer(option);
    setIsAnswered(true);
    const isCorrect = option === question.correctAnswer;
    onAnswer(isCorrect);
  };

  const getButtonClass = (option: string) => {
    if (!isAnswered) {
      return "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 hover:border-pink-500";
    }
    
    const isCorrect = option === question.correctAnswer;
    const isSelected = option === selectedAnswer;

    if (isCorrect) {
        return isSelected ? "bg-green-500/20 border-green-500 animate-pop" : "bg-green-500/20 border-green-500 animate-pulse";
    }

    if (isSelected && !isCorrect) {
        return "bg-red-500/20 border-red-500 animate-shake";
    }
    
    return "bg-zinc-800 border-zinc-700 opacity-60 cursor-not-allowed";
  };
  
  const progressPercentage = (questionNumber / totalQuestions) * 100;

  return (
    <div className="bg-zinc-900 p-8 rounded-2xl shadow-2xl w-full max-w-3xl border border-zinc-800">
      <div className="mb-2">
        <div className="flex justify-between items-center text-sm font-semibold mb-2">
            <p className="text-pink-400">Question {questionNumber} of {totalQuestions}</p>
            {isTimerActive && (
                <div className={`flex items-center gap-1 ${timeLeft <= 5 && !isAnswered ? 'text-red-500 animate-pulse' : 'text-zinc-400'}`}>
                    <TimerIcon className="h-4 w-4" />
                    <span>{timeLeft}s</span>
                </div>
            )}
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-2">
            <div
                className="bg-instagram h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
            ></div>
        </div>
        <div className="flex justify-between items-start mt-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white flex-grow" dangerouslySetInnerHTML={{ __html: question.question }}></h2>
          <button
              onClick={() => onToggleBookmark(question)}
              title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Question'}
              className="flex-shrink-0 ml-4 p-2 rounded-full hover:bg-zinc-800 transition-colors duration-300"
          >
              <BookmarkIcon isBookmarked={isBookmarked} />
          </button>
        </div>
      </div>

      <div className="my-4 text-right h-10">
          {!isAnswered && !showHint && question.hint && (
              <button
                  onClick={() => setShowHint(true)}
                  className="bg-zinc-800 text-pink-400 font-semibold py-2 px-4 rounded-lg hover:bg-zinc-700 transition-colors duration-300 text-sm"
              >
                  Show Hint
              </button>
          )}
      </div>

      {showHint && !isAnswered && question.hint && (
          <div className="mb-6 p-4 bg-black/50 rounded-lg border border-zinc-800 animate-fade-in">
              <p className="text-zinc-300 italic"><span className="font-bold not-italic text-pink-400">Hint:</span> {question.hint}</p>
          </div>
      )}

      <div className="space-y-4">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerClick(option)}
            disabled={isAnswered}
            className={`w-full text-left p-4 rounded-lg text-white font-medium transition-all duration-300 text-lg border-2 ${getButtonClass(option)}`}
          >
            <span className="mr-4 font-bold text-pink-400">{String.fromCharCode(65 + index)}.</span>
            {option}
          </button>
        ))}
      </div>
      {isAnswered && (
         <>
            <div className="mt-6 p-4 bg-black/30 rounded-lg border border-zinc-800 animate-fade-in">
                {isTimeout ? (
                    <h3 className="font-bold text-lg text-red-500 mb-2">Time's Up!</h3>
                ) : (
                    <h3 className="font-bold text-lg text-pink-400 mb-2">Explanation</h3>
                )}
                <p className="text-zinc-300" dangerouslySetInnerHTML={{ __html: question.explanation }}></p>
            </div>
            <div className="mt-6 flex justify-end">
                <button
                    onClick={onNextQuestion}
                    className="bg-instagram text-white font-bold py-3 px-8 rounded-lg text-lg hover:opacity-90 transition-opacity duration-300 shadow-lg focus:outline-none focus:ring-4 focus:ring-pink-400/50 transform hover:-translate-y-1 active:scale-95"
                >
                    {questionNumber === totalQuestions ? 'Finish Quiz' : 'Next Question'}
                </button>
            </div>
         </>
      )}
    </div>
  );
};

export default Quiz;