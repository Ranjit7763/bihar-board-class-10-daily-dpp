
import React from 'react';
import { Question } from '../types';

interface QuizCardProps {
  question: Question;
  onAnswer: (index: number) => void;
  selectedAnswer: number | null;
  showExplanation: boolean;
}

const QuizCard: React.FC<QuizCardProps> = ({ question, onAnswer, selectedAnswer, showExplanation }) => {
  return (
    <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700 animate-fadeIn">
      <div className="mb-6">
        <span className="px-3 py-1 bg-blue-600/20 text-blue-400 text-xs font-bold rounded-full uppercase tracking-wider">
          {question.difficulty}
        </span>
        <h2 className="text-xl font-semibold mt-4 leading-relaxed">
          {question.question}
        </h2>
      </div>

      <div className="space-y-3">
        {question.options.map((option, idx) => {
          let bgClass = "bg-slate-700 hover:bg-slate-600";
          if (selectedAnswer !== null) {
            if (idx === question.correctAnswerIndex) {
              bgClass = "bg-green-600/40 border-green-500 border";
            } else if (idx === selectedAnswer) {
              bgClass = "bg-red-600/40 border-red-500 border";
            } else {
              bgClass = "bg-slate-700 opacity-50";
            }
          }

          return (
            <button
              key={idx}
              disabled={selectedAnswer !== null}
              onClick={() => onAnswer(idx)}
              className={`w-full text-left p-4 rounded-xl transition-all duration-200 flex items-center gap-4 ${bgClass}`}
            >
              <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold border border-slate-600">
                {String.fromCharCode(65 + idx)}
              </span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>

      {showExplanation && (
        <div className="mt-8 p-4 bg-blue-900/30 border-l-4 border-blue-500 rounded-r-xl animate-slideIn">
          <p className="text-sm font-bold text-blue-400 mb-1">💡 Explanation:</p>
          <p className="text-sm text-slate-300">{question.explanation}</p>
        </div>
      )}
    </div>
  );
};

export default QuizCard;
