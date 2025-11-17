import { useEffect, useState } from 'react';
import { QuestionCard } from './components/QuestionCard';
import { ScoreScreen } from './components/ScoreScreen';
import { TipBar } from './components/TipBar';
import { useTrivia } from './hooks/useTrivia';
import { baseService } from './services/baseService';
import { storage } from './utils/storage';
import './App.css';

function App() {
  const {
    currentQuestion,
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
    retryLoad,
    questions
  } = useTrivia();

  const [canPlay, setCanPlay] = useState(true);
  const [timeUntilNextPlay, setTimeUntilNextPlay] = useState('');

  useEffect(() => {
    baseService.init();
    checkPlayEligibility();
  }, []);

  useEffect(() => {
    if (quizComplete) {
      storage.setQuizSession({
        score,
        totalQuestions: questions.length,
        lastPlayedAt: new Date().toISOString()
      });
      checkPlayEligibility();
    }
  }, [quizComplete, score, questions.length]);

  const checkPlayEligibility = () => {
    const eligible = storage.canPlayQuiz();
    setCanPlay(eligible);
    
    if (!eligible) {
      const timeRemaining = storage.getTimeUntilNextPlay();
      setTimeUntilNextPlay(timeRemaining);
    }
  };

  const handlePlayAgain = () => {
    if (storage.canPlayQuiz()) {
      resetQuiz();
      setCanPlay(true);
    } else {
      checkPlayEligibility();
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading trivia questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <div className="error-screen">
          <h2>⚠️ Oops!</h2>
          <p>{error}</p>
          <button onClick={retryLoad} className="retry-button">
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!canPlay && !quizComplete) {
    return (
      <div className="app-container">
        <div className="cooldown-screen">
          <h1>⏰ Come Back Later!</h1>
          <p>You've already played today.</p>
          <div className="cooldown-timer">
            <p>Next play available in:</p>
            <div className="timer-value">{timeUntilNextPlay}</div>
          </div>
          <TipBar />
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">🎯 Base Trivia</h1>
        <div className="score-display">Score: {score}</div>
      </header>

      <main className="app-main">
        {quizComplete ? (
          <>
            <ScoreScreen
              score={score}
              total={questions.length}
              onPlayAgain={handlePlayAgain}
            />
            <TipBar />
          </>
        ) : (
          currentQuestion && (
            <QuestionCard
              question={currentQuestion}
              onAnswerSelect={handleAnswerSelect}
              onNext={handleNextQuestion}
              selectedAnswer={selectedAnswer}
              showFeedback={showFeedback}
              isCorrect={isCorrect}
              currentIndex={currentQuestionIndex}
              total={questions.length}
            />
          )
        )}
      </main>

      <footer className="app-footer">
        <p>Built on Base by <a href="https://github.com/ayofital" target="_blank" rel="noopener noreferrer">ayofital</a></p>
      </footer>
    </div>
  );
}

export default App;
