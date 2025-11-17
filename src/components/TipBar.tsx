import React, { useState } from 'react';
import { baseService } from '../services/baseService';
import { storage } from '../utils/storage';

export const TipBar: React.FC = () => {
  const [amount, setAmount] = useState('0.001');
  const [sending, setSending] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const tipHistory = storage.getTipHistory();

  const handleSendTip = async () => {
    try {
      setSending(true);
      setError('');
      setTxHash('');

      const userContext = await baseService.getUserContext();
      const userFid = userContext?.user?.fid;

      if (!userFid) {
        throw new Error('User not connected. Please open this app in a Farcaster client.');
      }

      // Pass empty string as userAddress - baseService will get wallet from SDK context
      const hash = await baseService.sendSelfTip(amount, '');
      setTxHash(hash);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="tip-bar">
      <h3 className="tip-title">🎉 Reward Yourself!</h3>
      <p className="tip-description">Great job! Send yourself a tip on Base as a reward for your trivia skills</p>

      <div className="tip-input-group">
        <input
          type="number"
          step="0.001"
          min="0.001"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="tip-input"
          placeholder="Amount in ETH"
        />
        <button
          onClick={handleSendTip}
          disabled={sending || !amount || parseFloat(amount) <= 0}
          className="tip-button"
        >
          {sending ? '⏳ Sending...' : '💸 Send Tip'}
        </button>
      </div>

      {txHash && (
        <div className="tip-success">
          ✓ Transaction sent! 
          <a 
            href={`https://basescan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="tx-link"
          >
            View on BaseScan
          </a>
        </div>
      )}

      {error && (
        <div className="tip-error">
          ✗ {error}
        </div>
      )}

      <button
        onClick={() => setShowHistory(!showHistory)}
        className="history-toggle"
      >
        {showHistory ? '▼ Hide History' : '▶ Show History'}
      </button>

      {showHistory && (
        <div className="tip-history">
          <h4>Recent Tips</h4>
          {tipHistory.length === 0 ? (
            <p className="no-history">No tips yet</p>
          ) : (
            <div className="history-list">
              {tipHistory.map((tip) => (
                <div key={tip.id} className="history-item">
                  <div className="history-amount">{tip.amount} ETH</div>
                  <div className="history-status">
                    <span className={`status-badge ${tip.status}`}>
                      {tip.status}
                    </span>
                    {tip.txHash && (
                      <a
                        href={`https://basescan.org/tx/${tip.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="history-link"
                      >
                        View
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
