export interface TriviaQuestion {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export interface ParsedQuestion {
  id: number;
  category: string;
  difficulty: string;
  question: string;
  answers: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface QuizSession {
  score: number;
  totalQuestions: number;
  lastPlayedAt: string;
}

export interface TipHistory {
  id: string;
  amount: string;
  timestamp: string;
  txHash: string;
  status: 'pending' | 'success' | 'failed';
}
