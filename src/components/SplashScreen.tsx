import React from 'react';
import '../App.css';

export const SplashScreen: React.FC = () => {
  return (
    <div className="splash-container">
      <div className="splash-content">
        <div className="splash-icon">🎯</div>
        <h1 className="splash-title">Base Trivia</h1>
        <p className="splash-subtitle">Test your knowledge and earn rewards on Base</p>
        <div className="splash-preview">
          <div className="preview-question">
            <div className="preview-category">General Knowledge</div>
            <div className="preview-text">How many planets are in our solar system?</div>
            <div className="preview-answers">
              <div className="preview-answer"></div>
              <div className="preview-answer"></div>
              <div className="preview-answer"></div>
              <div className="preview-answer"></div>
            </div>
          </div>
        </div>
        <div className="splash-wallet">
          <div className="wallet-icon">💰</div>
          <span>Earn BASE tokens for playing!</span>
        </div>
      </div>
    </div>
  );
};