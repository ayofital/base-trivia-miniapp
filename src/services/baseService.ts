import { sdk } from '@farcaster/miniapp-sdk';
import { storage } from '../utils/storage';

// Detect if we're in a browser with wallet support (Baseapp/standard web3)
const getProvider = () => {
  // Check for browser wallet provider (Baseapp, MetaMask, Coinbase Wallet, etc.)
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    return (window as any).ethereum;
  }
  // Fallback to Farcaster SDK wallet provider
  return sdk.wallet?.ethProvider || null;
};

export const baseService = {
  // Initialize the Mini App SDK
  init: async (): Promise<void> => {
    try {
      // Try to initialize Farcaster SDK if available
      if (sdk?.actions?.ready) {
        await sdk.actions.ready();
        console.log('Mini App SDK initialized');
      } else {
        console.log('Running in standard web environment (Baseapp)');
      }
    } catch (error) {
      console.log('Running in standard web environment:', error);
    }
  },

  // Detect platform
  detectPlatform: (): 'farcaster' | 'baseapp' => {
    // Check if running in Farcaster context by checking if SDK wallet is available
    if (sdk?.wallet?.ethProvider) {
      return 'farcaster';
    }
    // Otherwise assume Baseapp or standard browser
    return 'baseapp';
  },

  // Share score with platform detection
  shareScore: async (score: number, total: number, platform: 'farcaster' | 'baseapp' | 'twitter'): Promise<void> => {
    const text = `Just scored ${score}/${total} on Base Trivia! 🎯\n\nCan you beat my score?`;
    const appUrl = window.location.href;
    
    try {
      if (platform === 'farcaster') {
        // Share to Farcaster/Warpcast
        if (sdk?.actions?.openUrl) {
          await sdk.actions.openUrl(`https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`);
        } else {
          window.open(`https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`, '_blank');
        }
      } else if (platform === 'twitter') {
        // Share to Twitter/X
        const twitterText = `${text}\n\n${appUrl}`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`, '_blank');
      } else {
        // Share via Baseapp (Web Share API or fallback)
        if (navigator.share) {
          await navigator.share({
            title: 'Base Trivia Score',
            text: text,
            url: appUrl
          });
        } else {
          // Fallback: copy to clipboard
          await navigator.clipboard.writeText(`${text}\n\n${appUrl}`);
          alert('Score copied to clipboard! Share it anywhere you like.');
        }
      }
    } catch (error) {
      console.error('Failed to share score:', error);
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`${text}\n\n${appUrl}`);
        alert('Score copied to clipboard!');
      } catch (e) {
        console.error('Clipboard fallback failed:', e);
      }
    }
  },

  // Send self-tip transaction on Base
  sendSelfTip: async (amount: string, userAddress: string): Promise<string> => {
    try {
      // Get the appropriate provider (Baseapp browser wallet or Farcaster SDK)
      const provider = getProvider();
      
      if (!provider) {
        throw new Error('No wallet provider found');
      }

      // Request wallet connection and get accounts
      const accounts = await provider.request({
        method: 'eth_requestAccounts'
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No wallet connected');
      }

      const walletAddress = accounts[0];

      // Create tip record
      const tipId = Date.now().toString();
      storage.addTipToHistory({
        id: tipId,
        amount,
        timestamp: new Date().toISOString(),
        txHash: '',
        status: 'pending'
      });

      // Convert amount to wei (assuming ETH)
      const amountInWei = (parseFloat(amount) * 1e18).toString(16);

      // Send transaction using the provider
      // Note: This sends to self (from wallet to wallet)
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletAddress,
          to: userAddress || walletAddress,
          value: `0x${amountInWei}`,
        }]
      });

      // Update tip status
      storage.updateTipStatus(tipId, 'success', txHash);

      return txHash;
    } catch (error) {
      console.error('Failed to send tip:', error);
      throw error;
    }
  },

  // Get user context
  getUserContext: async () => {
    try {
      return await sdk.context;
    } catch (error) {
      console.error('Failed to get user context:', error);
      return null;
    }
  }
};
