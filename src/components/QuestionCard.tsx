import React from 'react';
import { ParsedQuestion } from '../types';

interface QuestionCardProps {
  question: ParsedQuestion;
  onAnswerSelect: (answer: string) => void;
  onNext: () => void;
  selectedAnswer: string | null;
  showFeedback: boolean;
  isCorrect: boolean;
  currentIndex: number;
  total: number;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onAnswerSelect,
  onNext,
  selectedAnswer,
  showFeedback,
  isCorrect,
  currentIndex,
  total
}) => {
  const getButtonClass = (answer: string) => {
    const baseClass = 'answer-button';
    
    if (!showFeedback) {
      return selectedAnswer === answer ? `${baseClass} selected` : baseClass;
    }

    if (answer === question.correctAnswer) {
      return `${baseClass} correct`;
    }

    if (selectedAnswer === answer && !isCorrect) {
      return `${baseClass} incorrect`;
    }

    return `${baseClass} disabled`;
  };

  return (
    <div className="question-card">
      <div className="progress-counter">
        Question {currentIndex + 1} of {total}
      </div>
      
      <div className="category-badge">
        {question.category}
      </div>

      <h2 className="question-text">{question.question}</h2>

      <div className="answers-grid">
        {question.answers.map((answer, index) => (
          <button
            key={index}
            className={getButtonClass(answer)}
            onClick={() => onAnswerSelect(answer)}
            disabled={showFeedback}
          >
            {answer}
          </button>
        ))}
      </div>

      {showFeedback && (
        <>
          <div className={`feedback ${isCorrect ? 'correct-feedback' : 'incorrect-feedback'}`}>
            {isCorrect ? '✓ Correct!' : `✗ Wrong! Correct answer: ${question.correctAnswer}`}
          </div>
          
          {question.explanation && (
            <div className="explanation-box">
              <h4>💡 Explanation:</h4>
              <p>{question.explanation}</p>
            </div>
          )}
          
          <button onClick={onNext} className="next-button">
            {currentIndex < total - 1 ? 'Next Question →' : 'See Results →'}
          </button>
        </>
      )}
    </div>
  );
};
