import { TriviaQuestion, ParsedQuestion } from '../types';
import { decodeHTML, shuffleArray } from '../utils/storage';
import { storage } from '../utils/storage';

// Use easier questions: mix of easy and medium difficulty
// Focus on general knowledge categories
const CATEGORIES = [
  '9',   // General Knowledge
  '11',  // Film
  '12',  // Music
  '17',  // Science & Nature
  '22',  // Geography
  '23',  // History
  '27',  // Animals
];

const CACHE_KEY = 'trivia_questions_cache';
const CACHE_TIMESTAMP_KEY = 'trivia_cache_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getRandomCategory = () => CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

// Build API URL with easier questions (70% easy, 30% medium)
// Fetch more questions to increase randomness
const buildApiUrl = () => {
  const difficulty = Math.random() < 0.7 ? 'easy' : 'medium';
  const category = getRandomCategory();
  // Fetch 50 questions to have a larger pool for randomization
  return `https://opentdb.com/api.php?amount=50&category=${category}&difficulty=${difficulty}&type=multiple`;
};

export const triviaService = {
  // Get cached questions if available and fresh
  getCachedQuestions: (): ParsedQuestion[] | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
      
      if (cached && timestamp) {
        const age = Date.now() - parseInt(timestamp);
        if (age < CACHE_DURATION) {
          return JSON.parse(cached);
        }
      }
    } catch (error) {
      console.error('Error reading cache:', error);
    }
    return null;
  },

  // Cache questions
  cacheQuestions: (questions: ParsedQuestion[]): void => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(questions));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error caching questions:', error);
    }
  },
  fetchQuestions: async (): Promise<ParsedQuestion[]> => {
    // Try to use cached questions first
    const cached = triviaService.getCachedQuestions();
    if (cached) {
      console.log('Using cached questions');
      return cached;
    }

    try {
      const apiUrl = buildApiUrl();
      const response = await fetch(apiUrl);
      
      if (response.status === 429) {
        // Rate limited - try to use any cached questions even if expired
        const oldCache = localStorage.getItem(CACHE_KEY);
        if (oldCache) {
          console.log('Rate limited, using old cache');
          return JSON.parse(oldCache);
        }
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch questions: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.response_code !== 0) {
        throw new Error('No questions available. Please try again later.');
      }

      const questions = triviaService.parseQuestions(data.results);
      triviaService.cacheQuestions(questions);
      return questions;
    } catch (error) {
      console.error('Error fetching trivia questions:', error);
      throw error;
    }
  },

  parseQuestions: (questions: TriviaQuestion[]): ParsedQuestion[] => {
    // Create hash for each question to track if it's been asked
    const createQuestionHash = (q: TriviaQuestion): string => {
      return `${q.question}-${q.correct_answer}`;
    };

    // Filter out already asked questions
    const newQuestions = questions.filter(q => {
      const hash = createQuestionHash(q);
      return !storage.hasAskedQuestion(hash);
    });

    // If we filtered out too many, use all questions (player has seen most questions)
    const questionsToUse = newQuestions.length >= 5 ? newQuestions : questions;

    // Randomly select 5 questions from the pool
    const shuffled = shuffleArray(questionsToUse);
    const selected = shuffled.slice(0, 5);

    // Mark selected questions as asked
    selected.forEach(q => {
      const hash = createQuestionHash(q);
      storage.addAskedQuestion(hash);
    });

    return selected.map((q, index) => {
      const correctAnswer = decodeHTML(q.correct_answer);
      const incorrectAnswers = q.incorrect_answers.map(decodeHTML);
      const allAnswers = shuffleArray([correctAnswer, ...incorrectAnswers]);

      return {
        id: index + 1,
        category: decodeHTML(q.category),
        difficulty: q.difficulty,
        question: decodeHTML(q.question),
        answers: allAnswers,
        correctAnswer: correctAnswer
      };
    });
  },

  retryFetch: async (maxRetries = 3): Promise<ParsedQuestion[]> => {
    let lastError: Error | null = null;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await triviaService.fetchQuestions();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          // Wait longer between retries: 2s, 4s, 6s
          await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
        }
      }
    }

    throw lastError || new Error('Unable to load questions. Please try again in a few moments.');
  }
};
