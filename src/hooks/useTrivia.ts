import { useState, useEffect } from 'react';
import { ParsedQuestion } from '../types';
import { triviaService } from '../services/triviaService';
import { explanationService } from '../services/explanationService';

export const useTrivia = () => {
  const [questions, setQuestions] = useState<ParsedQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedQuestions = await triviaService.retryFetch();
      setQuestions(fetchedQuestions);
    } catch (err) {
      setError((err as Error).message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = async (answer: string) => {
    if (showFeedback) return;

    setSelectedAnswer(answer);
    const correct = answer === questions[currentQuestionIndex].correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setScore(prev => prev + 1);
    }

    // Fetch explanation
    const explanation = await explanationService.fetchExplanation(
      questions[currentQuestionIndex].question,
      questions[currentQuestionIndex].correctAnswer,
      correct
    );
    
    // Update question with explanation
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex].explanation = explanation;
    setQuestions(updatedQuestions);
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setQuizComplete(false);
    // Clear cache to ensure fresh questions
    localStorage.removeItem('trivia_questions_cache');
    localStorage.removeItem('trivia_cache_timestamp');
    loadQuestions();
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      setQuizComplete(true);
    }
  };

  return {
    questions,
    currentQuestion: questions[currentQuestionIndex],
    currentQuestionIndex,
    score,
    loading,
    error,
    selectedAnswer,
    showFeedback,
    isCorrect,
    quizComplete,
    handleAnswerSelect,
    handleNextQuestion,
    resetQuiz,
    retryLoad: loadQuestions
  };
};
