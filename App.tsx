import React, { useState, useEffect } from 'react';
import { SUBJECTS, CHAPTERS_BY_SUBJECT, SAMPLE_QUESTIONS } from './constants';
import { Subject, Question, QuizSession, UserStats, Chapter } from './types';
import QuizCard from './components/QuizCard';
import { generateDailyDPP } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'chapters' | 'quiz' | 'result' | 'leaderboard'>('home');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  
  // Initialize session from localStorage
  const [session, setSession] = useState<QuizSession | null>(() => {
    const saved = localStorage.getItem('bseb_active_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.isCompleted ? null : parsed;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Initialize stats from localStorage
  const [userStats, setUserStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('bseb_user_stats');
    return saved ? JSON.parse(saved) : {
      totalQuizzes: 0,
      totalScore: 0,
      streak: 0,
      level: 1,
      lastActive: new Date().toISOString()
    };
  });

  // Initialize timer from localStorage or default to 10 mins
  const [timer, setTimer] = useState<number>(() => {
    const saved = localStorage.getItem('bseb_quiz_timer');
    return saved ? parseInt(saved, 10) : 600;
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Persistence side-effect: Save session and timer to localStorage
  useEffect(() => {
    if (session && !session.isCompleted) {
      localStorage.setItem('bseb_active_session', JSON.stringify(session));
      localStorage.setItem('bseb_quiz_timer', timer.toString());
    } else {
      localStorage.removeItem('bseb_active_session');
      localStorage.removeItem('bseb_quiz_timer');
    }
  }, [session, timer]);

  // Timer side-effect
  useEffect(() => {
    let interval: any;
    if (view === 'quiz' && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0 && view === 'quiz') {
      handleQuizFinish();
    }
    return () => clearInterval(interval);
  }, [view, timer]);

  const startQuiz = async (subject: Subject, chapterName?: string) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      let questions: Question[] = [];
      
      // 1. Try to find hardcoded samples for this specific chapter
      if (chapterName && SAMPLE_QUESTIONS[chapterName]) {
        questions = SAMPLE_QUESTIONS[chapterName];
      } else {
        // 2. Fallback: Use AI to generate specific questions for this topic
        questions = await generateDailyDPP(subject, 'Intermediate', chapterName);
      }

      if (!questions || questions.length === 0) {
        throw new Error("No questions available for this topic.");
      }

      const newSession: QuizSession = {
        subject,
        chapter: chapterName,
        questions,
        currentQuestionIndex: 0,
        score: 0,
        answers: [],
        startTime: Date.now(),
        isCompleted: false
      };

      setSession(newSession);
      setTimer(600);
      setView('quiz');
    } catch (err: any) {
      setError("Unable to load questions: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const resumeQuiz = () => {
    if (session) {
      setView('quiz');
    }
  };

  const selectSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setView('chapters');
  };

  const handleAnswer = (index: number) => {
    if (!session) return;
    const isCorrect = index === session.questions[session.currentQuestionIndex].correctAnswerIndex;
    
    setSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        score: isCorrect ? prev.score + 10 : prev.score,
        answers: [...prev.answers, index]
      };
    });
  };

  const handleQuizFinish = () => {
    if (!session) return;
    
    const newStats = {
      ...userStats,
      totalQuizzes: userStats.totalQuizzes + 1,
      totalScore: userStats.totalScore + session.score,
      lastActive: new Date().toISOString()
    };
    
    setUserStats(newStats);
    localStorage.setItem('bseb_user_stats', JSON.stringify(newStats));
    
    setSession(prev => prev ? { ...prev, isCompleted: true } : null);
    // Remove session from storage immediately on finish
    localStorage.removeItem('bseb_active_session');
    localStorage.removeItem('bseb_quiz_timer');
    setView('result');
  };

  const nextQuestion = () => {
    if (!session) return;
    if (session.currentQuestionIndex < session.questions.length - 1) {
      setSession(prev => prev ? { ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1 } : null);
    } else {
      handleQuizFinish();
    }
  };

  const discardSession = () => {
    if (window.confirm("Are you sure you want to delete your current progress?")) {
      localStorage.removeItem('bseb_active_session');
      localStorage.removeItem('bseb_quiz_timer');
      setSession(null);
    }
  };

  const renderHome = () => (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-fadeIn">
        <div>
          <h1 className="text-4xl font-extrabold text-white mb-2 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            BSEB Class 10 Quiz
          </h1>
          <p className="text-slate-400">Targeting 450+ Marks in Bihar Board Exams 🎯</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/50 flex items-center gap-3">
            <span className="text-orange-500 text-2xl">🔥</span>
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter">Streak</p>
              <p className="text-lg font-bold">{userStats.streak} Days</p>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/50 flex items-center gap-3">
            <span className="text-blue-500 text-2xl">🏆</span>
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter">Score</p>
              <p className="text-lg font-bold">{userStats.totalScore}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Resume Banner */}
      {session && !session.isCompleted && (
        <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 p-6 rounded-3xl mb-12 flex flex-col md:flex-row items-center justify-between gap-6 animate-slideIn">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-blue-600/20">⏳</div>
            <div>
              <h3 className="font-bold text-lg text-blue-100">Resume your practice?</h3>
              <p className="text-sm text-slate-400 italic">
                Topic: {session.chapter || session.subject} • Question {session.currentQuestionIndex + 1} of {session.questions.length}
              </p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={discardSession}
              className="px-6 py-3 rounded-2xl text-sm font-bold text-slate-400 hover:text-white transition-colors"
            >
              Discard
            </button>
            <button 
              onClick={resumeQuiz}
              className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-2xl font-bold shadow-xl shadow-blue-600/20 transition-all active:scale-95"
            >
              Resume Quiz →
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-2xl mb-8 flex items-center justify-between">
           <p className="text-sm">{error}</p>
           <button onClick={() => setError(null)} className="text-xs font-bold underline">Dismiss</button>
        </div>
      )}

      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
        Choose Your Subject
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
        {SUBJECTS.map((subject) => (
          <button
            key={subject}
            onClick={() => selectSubject(subject)}
            className="bg-slate-800/50 hover:bg-slate-700 p-6 rounded-3xl border border-slate-700/50 transition-all group flex flex-col items-center gap-4 hover:scale-105 active:scale-95"
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform ${
              subject === 'Mathematics' ? 'bg-amber-500/10 text-amber-500' : 
              subject === 'Science' ? 'bg-emerald-500/10 text-emerald-500' : 
              subject === 'Social Science' ? 'bg-sky-500/10 text-sky-500' : 
              subject === 'Hindi' ? 'bg-orange-500/10 text-orange-500' : 'bg-pink-500/10 text-pink-500'
            }`}>
              {subject === 'Mathematics' ? '📐' : 
               subject === 'Science' ? '🧪' : 
               subject === 'Social Science' ? '🌍' : 
               subject === 'Hindi' ? '🕉️' : '🔤'}
            </div>
            <span className="font-bold text-sm tracking-wide text-slate-300">{subject}</span>
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Daily Mix Challenge</h2>
            <p className="text-indigo-100 mb-6 text-sm">A balanced set of 10 questions across all main subjects.</p>
            <button 
              disabled={isGenerating}
              onClick={() => startQuiz('Mathematics')} 
              className="bg-white text-indigo-700 px-8 py-3 rounded-2xl font-bold hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {isGenerating ? 'Loading Questions...' : "Start Today's Mix"}
            </button>
          </div>
          <div className="absolute top-0 right-0 p-8 text-9xl opacity-10 group-hover:scale-110 transition-transform">📝</div>
        </div>

        <div className="bg-slate-800 p-8 rounded-[2rem] border border-slate-700 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Topic Leaderboard</h3>
            <p className="text-slate-400 text-sm mb-6">See how you rank against students across Bihar in specific subjects.</p>
          </div>
          <button 
            onClick={() => setView('leaderboard')}
            className="w-full bg-slate-700 hover:bg-slate-600 py-3 rounded-2xl font-bold transition-all"
          >
            View Rankings
          </button>
        </div>
      </div>
    </div>
  );

  const renderChapters = () => {
    if (!selectedSubject) return null;
    const chapters = CHAPTERS_BY_SUBJECT[selectedSubject];

    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
        <button onClick={() => setView('home')} className="mb-8 text-slate-400 hover:text-white flex items-center gap-2 font-bold uppercase text-xs tracking-widest">
          <span className="text-lg">←</span> All Subjects
        </button>
        
        <div className="flex items-center gap-6 mb-12">
           <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-xl border ${
              selectedSubject === 'Mathematics' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
              selectedSubject === 'Science' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
              selectedSubject === 'Social Science' ? 'bg-sky-500/10 text-sky-500 border-sky-500/20' : 
              selectedSubject === 'Hindi' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-pink-500/10 text-pink-500 border-pink-500/20'
           }`}>
              {selectedSubject === 'Mathematics' ? '📐' : 
               selectedSubject === 'Science' ? '🧪' : 
               selectedSubject === 'Social Science' ? '🌍' : 
               selectedSubject === 'Hindi' ? '🕉️' : '🔤'}
           </div>
           <div>
              <h1 className="text-3xl font-bold">{selectedSubject} Topics</h1>
              <p className="text-slate-400">Chapter-wise practice for excellence</p>
           </div>
        </div>

        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-bold">AI is curating your topic questions...</p>
          </div>
        )}

        {!isGenerating && (
          <div className="grid md:grid-cols-2 gap-4">
            {chapters.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => startQuiz(selectedSubject, chapter.name)}
                className="bg-slate-800/40 hover:bg-slate-800 p-6 rounded-3xl border border-slate-700/50 text-left transition-all hover:border-blue-500/50 group active:scale-[0.98]"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg group-hover:text-blue-400 transition-colors">{chapter.name}</h3>
                  {chapter.completed && <span className="text-green-500 text-xl">✅</span>}
                </div>
                <p className="text-sm text-slate-400 mb-6 leading-relaxed line-clamp-2">{chapter.description}</p>
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <span>{chapter.totalQuestions} Questions</span>
                  <span className="px-3 py-1 bg-slate-900 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">Start Chapter →</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderQuiz = () => {
    if (!session) return null;
    const currentQuestion = session.questions[session.currentQuestionIndex];
    const hasAnswered = session.answers.length > session.currentQuestionIndex;

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setView('home')} className="text-slate-400 hover:text-white flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest">
            <span className="text-lg">✕</span> Exit & Save
          </button>
          <div className="text-center">
            <p className="text-xs text-slate-500 font-bold uppercase">{session.chapter || session.subject}</p>
          </div>
          <div className="flex gap-4 items-center font-mono">
            <span className={`text-sm ${timer < 60 ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>
              ⏲️ {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="mb-8">
           <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Progress</span>
              <span className="text-sm font-bold text-blue-400">{session.currentQuestionIndex + 1} / {session.questions.length}</span>
           </div>
           <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
             <div 
               className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full transition-all duration-500" 
               style={{ width: `${((session.currentQuestionIndex + (hasAnswered ? 1 : 0)) / session.questions.length) * 100}%` }}
             />
           </div>
        </div>

        <QuizCard 
          question={currentQuestion}
          onAnswer={handleAnswer}
          selectedAnswer={hasAnswered ? session.answers[session.currentQuestionIndex] : null}
          showExplanation={hasAnswered}
        />

        {hasAnswered && (
          <button 
            onClick={nextQuestion}
            className="w-full mt-8 bg-blue-600 hover:bg-blue-500 py-5 rounded-[2rem] font-bold text-lg shadow-xl transition-all active:scale-95"
          >
            {session.currentQuestionIndex === session.questions.length - 1 ? 'Finish & See Results' : 'Next Question →'}
          </button>
        )}
      </div>
    );
  };

  const renderResult = () => {
    if (!session) return null;
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center animate-fadeIn">
        <div className="w-32 h-32 bg-blue-600/20 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 border border-blue-500/20 shadow-2xl shadow-blue-500/10">
          🎯
        </div>
        <h2 className="text-4xl font-extrabold mb-2">Quiz Finished!</h2>
        <p className="text-slate-400 mb-8 font-medium">Topic: {session.chapter || session.subject}</p>
        
        <div className="bg-slate-800/80 backdrop-blur p-8 rounded-[2.5rem] border border-slate-700 shadow-2xl mb-12">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold mb-1">Total Score</p>
              <p className="text-4xl font-black text-blue-400">{session.score}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold mb-1">Accuracy</p>
              <p className="text-4xl font-black text-green-400">
                {Math.round((session.score / (session.questions.length * 10)) * 100)}%
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button 
            onClick={() => startQuiz(session.subject, session.chapter)}
            className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-3xl font-bold transition-all shadow-lg"
          >
            Retake This Chapter
          </button>
          <button 
            onClick={() => setView('home')}
            className="w-full bg-slate-800 hover:bg-slate-700 py-4 rounded-3xl font-bold transition-all"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 selection:bg-blue-500/30">
      {view === 'home' && renderHome()}
      {view === 'chapters' && renderChapters()}
      {view === 'quiz' && renderQuiz()}
      {view === 'result' && renderResult()}
      
      {view === 'leaderboard' && (
        <div className="max-w-xl mx-auto px-4 py-16 animate-fadeIn">
          <button onClick={() => setView('home')} className="text-slate-400 hover:text-white mb-8 font-bold flex items-center gap-2">← Back</button>
          <div className="text-center mb-12">
             <h2 className="text-4xl font-black mb-2">Hall of Fame</h2>
             <p className="text-slate-400">Bihar Board Class 10 State-Level Rankings</p>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Aditya Kumar', score: 4500, rank: 1, dist: 'Patna' },
              { name: 'Neha Singh', score: 4200, rank: 2, dist: 'Muzaffarpur' },
              { name: 'Rahul Dev', score: 3900, rank: 3, dist: 'Gaya' },
              { name: 'Priya Sharma', score: 3600, rank: 4, dist: 'Bhagalpur' },
            ].map((user) => (
              <div key={user.rank} className="bg-slate-800/50 p-6 rounded-3xl flex items-center justify-between border border-slate-700/50">
                <div className="flex items-center gap-4">
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                    user.rank === 1 ? 'bg-yellow-500 text-slate-900' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {user.rank}
                  </span>
                  <div>
                    <p className="font-bold">{user.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">{user.dist}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-blue-400 font-bold">{user.score} XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;