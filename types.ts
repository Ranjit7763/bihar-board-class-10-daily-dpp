
export type Subject = 'Mathematics' | 'Science' | 'Social Science' | 'Hindi' | 'English';

export interface Chapter {
  id: string;
  name: string;
  description: string;
  totalQuestions: number;
  completed: boolean;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  chapter?: string;
}

export interface QuizSession {
  subject: Subject;
  chapter?: string;
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  answers: number[];
  startTime: number;
  isCompleted: boolean;
}

export interface UserStats {
  totalQuizzes: number;
  totalScore: number;
  streak: number;
  level: number;
  lastActive: string;
}
