import React, { useState, useEffect } from 'react';
import { baseService } from '../services/baseService';

interface ScoreScreenProps {
  score: number;
  total: number;
  onPlayAgain: () => void;
}

export const ScoreScreen: React.FC<ScoreScreenProps> = ({ score, total, onPlayAgain }) => {
  const [sharing, setSharing] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [platform, setPlatform] = useState<'farcaster' | 'baseapp' | 'twitter'>('baseapp');

  useEffect(() => {
    setPlatform(baseService.detectPlatform());
  }, []);

  const percentage = Math.round((score / total) * 100);

  const getScoreMessage = () => {
    if (percentage === 100) return '🎉 Perfect Score!';
    if (percentage >= 80) return '🌟 Excellent!';
    if (percentage >= 60) return '👍 Good Job!';
    if (percentage >= 40) return '💪 Keep Trying!';
    return '📚 Practice Makes Perfect!';
  };

  const handleShare = async (selectedPlatform?: 'farcaster' | 'baseapp' | 'twitter') => {
    try {
      setSharing(true);
      const targetPlatform = selectedPlatform || platform;
      await baseService.shareScore(score, total, targetPlatform);
      setShowShareOptions(false);
    } catch (error) {
      console.error('Share failed:', error);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="score-screen">
      <div className="score-animation">
        <div className="score-circle">
          <div className="score-value">{score}/{total}</div>
          <div className="score-percentage">{percentage}%</div>
        </div>
      </div>

      <h1 className="score-message">{getScoreMessage()}</h1>
      <p className="score-subtitle">You got {score} out of {total} questions correct</p>

      <div className="score-actions">
        <button 
          className="share-button"
          onClick={() => setShowShareOptions(!showShareOptions)}
          disabled={sharing}
        >
          {sharing ? 'Sharing...' : '📤 Share'}
        </button>

        {showShareOptions && (
          <div className="share-options">
            <button 
              className="share-option-btn"
              onClick={() => handleShare('farcaster')}
            >
              🐜 Share to Farcaster
            </button>
            <button 
              className="share-option-btn"
              onClick={() => handleShare('twitter')}
            >
              🐦 Share to Twitter/X
            </button>
            <button 
              className="share-option-btn"
              onClick={() => handleShare('baseapp')}
            >
              📤 Share to Baseapp
            </button>
          </div>
        )}

        <button 
          className="play-again-button"
          onClick={onPlayAgain}
        >
          🔄 Play Again
        </button>
      </div>
    </div>
  );
};
