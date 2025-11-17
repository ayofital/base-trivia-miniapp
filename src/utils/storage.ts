import { QuizSession, TipHistory } from '../types';

const QUIZ_SESSION_KEY = 'trivia_quiz_session';
const TIP_HISTORY_KEY = 'trivia_tip_history';
const ASKED_QUESTIONS_KEY = 'trivia_asked_questions';

export const storage = {
  // Quiz session methods
  getQuizSession: (): QuizSession | null => {
    const data = localStorage.getItem(QUIZ_SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },

  setQuizSession: (session: QuizSession): void => {
    localStorage.setItem(QUIZ_SESSION_KEY, JSON.stringify(session));
  },

  canPlayQuiz: (): boolean => {
    // Always return true - no cooldown
    return true;
  },

  getTimeUntilNextPlay: (): string => {
    // No cooldown, so always return empty string
    return '';
  },

  // Tip history methods
  getTipHistory: (): TipHistory[] => {
    const data = localStorage.getItem(TIP_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  },

  addTipToHistory: (tip: TipHistory): void => {
    const history = storage.getTipHistory();
    history.unshift(tip);
    localStorage.setItem(TIP_HISTORY_KEY, JSON.stringify(history.slice(0, 10))); // Keep last 10
  },

  updateTipStatus: (id: string, status: 'success' | 'failed', txHash?: string): void => {
    const history = storage.getTipHistory();
    const tip = history.find(t => t.id === id);
    if (tip) {
      tip.status = status;
      if (txHash) tip.txHash = txHash;
      localStorage.setItem(TIP_HISTORY_KEY, JSON.stringify(history));
    }
  },

  // Question tracking methods to prevent repeats
  getAskedQuestions: (): Set<string> => {
    try {
      const data = localStorage.getItem(ASKED_QUESTIONS_KEY);
      return data ? new Set(JSON.parse(data)) : new Set();
    } catch (error) {
      console.error('Error reading asked questions:', error);
      return new Set();
    }
  },

  addAskedQuestion: (questionHash: string): void => {
    try {
      const asked = storage.getAskedQuestions();
      asked.add(questionHash);
      // Keep only last 500 questions to prevent unlimited growth
      const askedArray = Array.from(asked);
      const trimmed = askedArray.slice(-500);
      localStorage.setItem(ASKED_QUESTIONS_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.error('Error saving asked question:', error);
    }
  },

  hasAskedQuestion: (questionHash: string): boolean => {
    const asked = storage.getAskedQuestions();
    return asked.has(questionHash);
  },

  clearAskedQuestions: (): void => {
    localStorage.removeItem(ASKED_QUESTIONS_KEY);
  }
};

export const decodeHTML = (html: string): string => {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};

export const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
