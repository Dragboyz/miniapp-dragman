'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import Image from "next/image";
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function Home() {
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState([
    { fid: 12345, username: "DragonMaster", score: 1500, avatar: "🐉" },
    { fid: 67890, username: "FireBreath", score: 1200, avatar: "🔥" },
    { fid: 11111, username: "ScaleKing", score: 980, avatar: "👑" },
    { fid: 22222, username: "WingRider", score: 850, avatar: "🦅" },
    { fid: 33333, username: "ClawSlayer", score: 720, avatar: "⚔️" }
  ]);
  const [dailyChallenge, setDailyChallenge] = useState({
    id: 1,
    title: "Dragon Tamer",
    description: "Score 500 points in a single game",
    target: 500,
    reward: "🏆 Dragon Tamer Badge",
    completed: false,
    progress: 0
  });
  const [achievements, setAchievements] = useState([
    { id: 1, name: "First Steps", description: "Play your first game", icon: "👶", unlocked: false },
    { id: 2, name: "Dragon Slayer", description: "Score 1000 points", icon: "⚔️", unlocked: false },
    { id: 3, name: "Speed Demon", description: "Complete 10 games", icon: "⚡", unlocked: false },
    { id: 4, name: "Social Butterfly", description: "Share your score", icon: "🦋", unlocked: false },
    { id: 5, name: "Legend", description: "Score 5000 points", icon: "👑", unlocked: false }
  ]);
  const [gameStats, setGameStats] = useState({
    gamesPlayed: 0,
    totalScore: 0,
    gamesShared: 0
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const [showAchievement, setShowAchievement] = useState<any>(null);
  
  // Enhanced game features
  const [combo, setCombo] = useState({ current: 0, max: 0, multiplier: 1, timer: 0 });
  const [powerUps, setPowerUps] = useState<any[]>([]);
  const [particles, setParticles] = useState<any[]>([]);
  const [isBossBattle, setIsBossBattle] = useState(false);
  const [bossHealth, setBossHealth] = useState(0);
  const [dragonLevel, setDragonLevel] = useState(1);
  const [dragonExp, setDragonExp] = useState(0);
  const gameRef = useRef<HTMLDivElement>(null);
  
  // Context state
  const [isInMiniApp, setIsInMiniApp] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [location, setLocation] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [features, setFeatures] = useState<any>(null);
  
  // Authentication state
  const [token, setToken] = useState<string | null>(null);
  const [authenticatedUser, setAuthenticatedUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Wallet connection state
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors, error: connectError, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  
  // Base Account features
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showBaseAccountDemo, setShowBaseAccountDemo] = useState(false);
  const [walletBalance, setWalletBalance] = useState<string>('0');
  const [networkName, setNetworkName] = useState<string>('Unknown');
  
  // Paymaster features
  const [paymasterCredits, setPaymasterCredits] = useState<number>(500);
  const [gasFreeEnabled, setGasFreeEnabled] = useState<boolean>(true);
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);

  // Enhanced haptic feedback (using browser vibration API)
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [50]
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  // Particle system
  const createParticle = useCallback((x: number, y: number, type: string) => {
    const particle = {
      id: Date.now() + Math.random(),
      x,
      y,
      type,
      life: 60,
      maxLife: 60,
      velocity: {
        x: (Math.random() - 0.5) * 10,
        y: (Math.random() - 0.5) * 10
      }
    };
    setParticles(prev => [...prev, particle]);
  }, []);

  // Enhanced dragon tap handler
  const handleDragonTap = useCallback((event: React.MouseEvent) => {
    if (!isPlaying) return;

    const rect = gameRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Calculate combo
    const now = Date.now();
    if (combo.timer > now - 1000) {
      setCombo(prev => ({
        ...prev,
        current: prev.current + 1,
        max: Math.max(prev.max, prev.current + 1),
        multiplier: Math.min(5, Math.floor(prev.current / 5) + 1),
        timer: now + 2000
      }));
    } else {
      setCombo(prev => ({
        ...prev,
        current: 1,
        multiplier: 1,
        timer: now + 2000
      }));
    }

    // Calculate score with combo multiplier
    const baseScore = 10 * dragonLevel;
    const comboBonus = combo.current * 2;
    const totalScore = Math.floor((baseScore + comboBonus) * combo.multiplier);

    setScore(prev => prev + totalScore);

    // Create particles based on combo level
    const particleCount = Math.min(combo.current, 10);
    for (let i = 0; i < particleCount; i++) {
      setTimeout(() => {
        createParticle(x, y, combo.multiplier > 3 ? 'gold' : 'fire');
      }, i * 50);
    }

    // Haptic feedback based on combo
    if (combo.multiplier >= 3) {
      triggerHaptic('heavy');
    } else if (combo.multiplier >= 2) {
      triggerHaptic('medium');
    } else {
      triggerHaptic('light');
    }

    // Check for power-up activation
    if (Math.random() < 0.1) {
      activateRandomPowerUp();
    }

    // Check for boss battle
    if (score > 0 && score % 1000 === 0) {
      startBossBattle();
    }
  }, [isPlaying, combo, dragonLevel, score, createParticle, triggerHaptic]);

  // Power-up system
  const activateRandomPowerUp = useCallback(() => {
    const types = ['fire', 'lightning', 'ice', 'combo'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const powerUp = {
      id: Date.now().toString(),
      type,
      duration: 5000,
      multiplier: type === 'combo' ? 3 : 2,
      active: true
    };

    setPowerUps(prev => [...prev, powerUp]);

    // Auto-remove after duration
    setTimeout(() => {
      setPowerUps(prev => prev.filter(p => p.id !== powerUp.id));
    }, powerUp.duration);
  }, []);

  // Boss battle system
  const startBossBattle = useCallback(() => {
    setIsBossBattle(true);
    setBossHealth(100);
    triggerHaptic('heavy');
  }, [triggerHaptic]);

  const handleShare = async () => {
    try {
      const shareText = score > highScore 
        ? `🏆 NEW HIGH SCORE! Just scored ${score} points in Dragman! Can you beat my score? 🐉`
        : `🐉 Just scored ${score} points in Dragman! Can you beat my score?`;
        
      await sdk.actions.composeCast({
        text: shareText,
        embeds: ['https://dragman.xyz']
      });
      
      // Update stats
      setGameStats(prev => ({
        ...prev,
        gamesShared: prev.gamesShared + 1
      }));

      // Track sharing event
      trackEvent('score_shared', {
        label: 'Score Shared',
        value: score,
        high_score: score > highScore,
        games_shared: gameStats.gamesShared + 1
      });
      
      // Check Social Butterfly achievement
      const newAchievements = [...achievements];
      if (!newAchievements[3].unlocked) {
        newAchievements[3].unlocked = true;
        setAchievements(newAchievements);
        setShowAchievement(newAchievements[3]);
        playSound('achievement');
        setTimeout(() => setShowAchievement(null), 3000);
      }
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const handleAddMiniApp = async () => {
    try {
      await sdk.actions.addMiniApp();
      setShowOnboarding(false);
    } catch (error) {
      console.error('Failed to add mini app:', error);
    }
  };

  const handleSignIn = async () => {
    try {
      console.log('Starting Quick Auth...');
      // Note: quickAuth method may not be available in current SDK version
      // Using context-based authentication for now
      const context = await sdk.context;
      if (context?.user?.fid) {
        // Simulate authentication with context data
        const mockAuthData = {
          fid: context.user.fid,
          authenticated: true,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        };
        
        setAuthenticatedUser(mockAuthData);
        setIsAuthenticated(true);
        console.log('Authentication successful (context-based):', mockAuthData);
      } else {
        console.error('No user context available');
      }
    } catch (error) {
      console.error("Authentication failed:", error);
    }
  };

  const handleSignOut = () => {
    setToken(null);
    setAuthenticatedUser(null);
    setIsAuthenticated(false);
    console.log('Signed out');
  };

  // Wallet connection functions
  const handleConnectWallet = async (connector: any) => {
    try {
      await connect({ connector });
      setShowWalletModal(false);
      
      // Track wallet connection
      trackEvent('wallet_connected', {
        label: 'Wallet Connected',
        value: connector.name,
        wallet_type: connector.name
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnectWallet = () => {
    disconnect();
    
    // Track wallet disconnection
    trackEvent('wallet_disconnected', {
      label: 'Wallet Disconnected',
      value: connector?.name || 'Unknown'
    });
  };

  const handleSwitchNetwork = async () => {
    try {
      // Note: Network switching would be handled by the wallet
      // This is a placeholder for future implementation
      console.log('Network switch requested - handled by wallet');
      
      // Track network switch request
      trackEvent('network_switch_requested', {
        label: 'Network Switch Requested',
        value: 'Base Mainnet',
        network: 'Base'
      });
      
      alert('Please switch to Base network in your wallet');
    } catch (error) {
      console.error('Failed to request network switch:', error);
    }
  };

  // Base Account demo functions with Paymaster integration
  const handleGasFreeTransaction = async () => {
    try {
      if (!isConnected) {
        alert('Please connect your wallet first');
        return;
      }

      console.log('Gas-free transaction initiated with Paymaster');
      
      // Simulate Paymaster gas-free transaction
      const transaction = {
        to: address, // Self-transfer for demo
        value: '0', // No ETH transfer
        data: '0x', // Empty data
        gasLimit: '21000', // Standard gas limit
        // Paymaster will handle gas fees automatically
      };

      // Simulate transaction success
      const mockTransactionHash = '0x' + Math.random().toString(16).substr(2, 64);
      
      // Add to transaction history
      const newTransaction = {
        hash: mockTransactionHash,
        type: 'gas_free',
        timestamp: Date.now(),
        gasUsed: '21000',
        gasPrice: '0', // Gas-free
        status: 'success'
      };
      
      setTransactionHistory(prev => [newTransaction, ...prev]);
      
      // Deduct Paymaster credits (simulate)
      const gasCost = 0.001; // Simulate gas cost
      setPaymasterCredits(prev => Math.max(0, prev - gasCost));
      
      // Track successful gas-free transaction
      trackEvent('gas_free_transaction_success', {
        label: 'Gas-Free Transaction Success',
        value: 1,
        transaction_hash: mockTransactionHash,
        gas_cost: gasCost,
        credits_remaining: paymasterCredits - gasCost
      });
      
      alert(`✅ Gas-free transaction successful!\nHash: ${mockTransactionHash.slice(0, 10)}...\nCredits remaining: $${(paymasterCredits - gasCost).toFixed(3)}`);
      
    } catch (error) {
      console.error('Gas-free transaction failed:', error);
      
      // Track failed transaction
      trackEvent('gas_free_transaction_failed', {
        label: 'Gas-Free Transaction Failed',
        value: 0,
        error: error instanceof Error ? error.message : String(error)
      });
      
      alert('❌ Gas-free transaction failed. Please try again.');
    }
  };

  const handleMultiStepTransaction = async () => {
    try {
      if (!isConnected) {
        alert('Please connect your wallet first');
        return;
      }

      console.log('Multi-step transaction initiated with Paymaster');
      
      // Simulate multi-step transaction with Paymaster
      const steps = [
        { name: 'Step 1: Approve', gasUsed: '46000' },
        { name: 'Step 2: Transfer', gasUsed: '21000' },
        { name: 'Step 3: Update', gasUsed: '35000' }
      ];
      
      let totalGasUsed = 0;
      const transactionHashes = [];
      
      // Simulate each step
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const mockHash = '0x' + Math.random().toString(16).substr(2, 64);
        transactionHashes.push(mockHash);
        
        // Add to transaction history
        const newTransaction = {
          hash: mockHash,
          type: 'multi_step',
          step: i + 1,
          stepName: step.name,
          timestamp: Date.now(),
          gasUsed: step.gasUsed,
          gasPrice: '0', // Gas-free
          status: 'success'
        };
        
        setTransactionHistory(prev => [newTransaction, ...prev]);
        totalGasUsed += parseInt(step.gasUsed);
      }
      
      // Deduct Paymaster credits (simulate)
      const gasCost = totalGasUsed * 0.00000002; // Simulate gas cost
      setPaymasterCredits(prev => Math.max(0, prev - gasCost));
      
      // Track successful multi-step transaction
      trackEvent('multi_step_transaction_success', {
        label: 'Multi-Step Transaction Success',
        value: 1,
        steps_completed: steps.length,
        total_gas_used: totalGasUsed,
        gas_cost: gasCost,
        credits_remaining: paymasterCredits - gasCost
      });
      
      alert(`✅ Multi-step transaction successful!\nSteps completed: ${steps.length}\nTotal gas used: ${totalGasUsed}\nCredits remaining: $${(paymasterCredits - gasCost).toFixed(3)}`);
      
    } catch (error) {
      console.error('Multi-step transaction failed:', error);
      
      // Track failed transaction
      trackEvent('multi_step_transaction_failed', {
        label: 'Multi-Step Transaction Failed',
        value: 0,
        error: error instanceof Error ? error.message : String(error)
      });
      
      alert('❌ Multi-step transaction failed. Please try again.');
    }
  };

  // Sound effects
  const playSound = (type: string) => {
    if (typeof window !== 'undefined' && window.AudioContext) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      switch (type) {
        case 'tap':
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.1);
          break;
        case 'score':
          oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(1400, audioContext.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.2);
          break;
        case 'achievement':
          oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.3);
          break;
      }
    }
  };

  // Analytics tracking
  const trackEvent = (eventName: string, properties: any = {}) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, {
        event_category: 'Dragman Mini App',
        event_label: properties.label || '',
        value: properties.value || 0,
        ...properties
      });
    }
    console.log('Analytics Event:', eventName, properties);
  };

  // Achievement checking
  const checkAchievements = (newScore: number) => {
    const newAchievements = [...achievements];
    let hasNewAchievement = false;

    // First Steps
    if (gameStats.gamesPlayed === 0 && !newAchievements[0].unlocked) {
      newAchievements[0].unlocked = true;
      hasNewAchievement = true;
    }

    // Dragon Slayer
    if (newScore >= 1000 && !newAchievements[1].unlocked) {
      newAchievements[1].unlocked = true;
      hasNewAchievement = true;
    }

    // Speed Demon
    if (gameStats.gamesPlayed >= 9 && !newAchievements[2].unlocked) {
      newAchievements[2].unlocked = true;
      hasNewAchievement = true;
    }

    // Legend
    if (newScore >= 5000 && !newAchievements[4].unlocked) {
      newAchievements[4].unlocked = true;
      hasNewAchievement = true;
    }

    if (hasNewAchievement) {
      const latestAchievement = newAchievements.find(a => a.unlocked && !achievements.find(old => old.id === a.id)?.unlocked);
      if (latestAchievement) {
        setShowAchievement(latestAchievement);
        playSound('achievement');
        
        // Track achievement unlock
        trackEvent('achievement_unlocked', {
          label: latestAchievement.name,
          value: latestAchievement.id,
          achievement_type: latestAchievement.name
        });
        
        setTimeout(() => setShowAchievement(null), 3000);
      }
    }

    setAchievements(newAchievements);
  };

  const handlePlay = async () => {
    setIsPlaying(true);
    setIsAnimating(true);
    
    // Trigger haptic feedback if available
    if (features?.haptics && navigator.vibrate) {
      navigator.vibrate(50); // Short vibration
    }
    
    // Simulate scoring with sound effects
    const interval = setInterval(() => {
      setScore(prev => {
        const newScore = prev + 1;
        
        // Play sound effects
        if (newScore % 10 === 0) {
          playSound('score');
        } else {
          playSound('tap');
        }
        
        return newScore;
      });
    }, 100);
    
    setTimeout(async () => {
      clearInterval(interval);
      setIsPlaying(false);
      setIsAnimating(false);
      
      // Update stats
      setGameStats(prev => ({
        gamesPlayed: prev.gamesPlayed + 1,
        totalScore: prev.totalScore + score + 1,
        gamesShared: prev.gamesShared
      }));

      // Track game completion
      trackEvent('game_completed', {
        label: 'Game Finished',
        value: score + 1,
        high_score: score + 1 > highScore,
        games_played: gameStats.gamesPlayed + 1
      });
      
      // Check achievements
      checkAchievements(score + 1);
      
      // Check daily challenge
      if (score + 1 >= dailyChallenge.target && !dailyChallenge.completed) {
        setDailyChallenge(prev => ({ ...prev, completed: true, progress: score + 1 }));
      }
      
      // Update high score
      if (score + 1 > highScore) {
        setHighScore(score + 1);
        
        // Trigger haptic feedback for new high score
        if (features?.haptics && navigator.vibrate) {
          navigator.vibrate([100, 50, 100]); // Pattern vibration
        }
      }
      
      // Send achievement notification
      try {
        const context = await sdk.context;
        if (context?.user?.fid) {
          const notificationTitle = score > highScore 
            ? '🏆 NEW HIGH SCORE!' 
            : 'Great Game! 🎮';
            
          await fetch('/api/webhook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fid: context.user.fid,
              event: { event: 'achievement' },
              notification: {
                title: notificationTitle,
                body: `You scored ${score} points! ${score > highScore ? 'New personal best!' : 'Keep it up!'}`,
              }
            }),
          });
        }
      } catch (error) {
        console.error('Failed to send notification:', error);
      }
      
      // Show onboarding for first-time users
      if (isFirstTime) {
        setIsFirstTime(false);
        setShowOnboarding(true);
      }
      
      // Trigger share prompt after game
      if (score > 0) {
        handleShare();
      }
    }, 3000);
  };

  useEffect(() => {
    // Initialize SDK and load context
    const initializeSDK = async () => {
      try {
        console.log('Initializing Base Mini App SDK...');
        
        // Check if we're in a Mini App
        const miniAppStatus = await sdk.isInMiniApp();
        setIsInMiniApp(miniAppStatus);
        console.log('Mini App status:', miniAppStatus);
        
        if (miniAppStatus) {
          // Get full context
          const context = await sdk.context;
          console.log('Mini App context:', context);
          
          // Extract context data
          if (context.user) {
            setUser(context.user);
            console.log('User:', context.user);
          }
          
          if (context.location) {
            setLocation(context.location);
            console.log('Location:', context.location);
          }
          
          if (context.client) {
            setClient(context.client);
            console.log('Client:', context.client);
          }
          
          if (context.features) {
            setFeatures(context.features);
            console.log('Features:', context.features);
          }
        }
        
        // Hide loading splash screen and display your app
        await sdk.actions.ready();
        console.log('SDK ready called successfully');
        
      } catch (error) {
        console.error('SDK initialization failed:', error);
        console.log('This is normal if not running in Base app environment');
      }
    };
    
    // Add a small delay to ensure SDK is loaded
    setTimeout(initializeSDK, 100);
  }, []);

  // Update wallet balance and network info
  useEffect(() => {
    if (balance) {
      setWalletBalance(balance.formatted);
    }
    
    if (connector) {
      setNetworkName(connector.name);
    }
  }, [balance, connector]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Dragon Icon */}
        <div className="mb-6">
          <div className={`w-24 h-24 mx-auto bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
            isAnimating ? 'animate-pulse scale-110 shadow-2xl' : 'hover:scale-105 shadow-lg'
          }`}>
            <div className={`text-white text-4xl transition-all duration-300 ${
              isAnimating ? 'animate-bounce' : ''
            }`}>🐉</div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">DRAGMAN</h1>
        <p className="text-gray-600 mb-6">Fast, Fun, Social Dragon Game</p>
        
        {/* User Profile Display */}
        {isInMiniApp && user && (
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-center space-x-3">
              {user.pfpUrl && (
                <img 
                  src={user.pfpUrl} 
                  alt="Profile" 
                  width={32} 
                  height={32} 
                  className="rounded-full"
                />
              )}
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-800">
                  Welcome, {user.displayName || user.username || `FID ${user.fid}`}!
                </p>
                {location && (
                  <p className="text-xs text-gray-600">
                    {location.type === 'cast_embed' && 'Opened from cast'}
                    {location.type === 'notification' && 'Opened from notification'}
                    {location.type === 'launcher' && 'Opened from app catalog'}
                    {location.type === 'channel' && `Opened from ${location.channel?.name} channel`}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Wallet Connection Status */}
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="text-center">
            {isConnected ? (
              <div>
                <p className="text-sm font-semibold text-blue-800">
                  🔗 Wallet Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
                <p className="text-xs text-gray-600">
                  Balance: {walletBalance} ETH | Network: {networkName}
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleSwitchNetwork}
                    className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                  >
                    Switch to Base
                  </button>
                  <button
                    onClick={handleDisconnectWallet}
                    className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  🔓 Wallet Not Connected
                </p>
                <button
                  onClick={() => setShowWalletModal(true)}
                  className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                >
                  Connect Wallet
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Paymaster Status */}
        {isConnected && (
          <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="text-center">
              <p className="text-sm font-semibold text-green-800">
                ⛽ Gas-Free Transactions Enabled
              </p>
              <p className="text-xs text-gray-600">
                Paymaster Credits: ${paymasterCredits.toFixed(3)} Available
              </p>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(paymasterCredits / 500) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {((paymasterCredits / 500) * 100).toFixed(1)}% credits remaining
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Authentication Status */}
        <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <div className="text-center">
            {isAuthenticated ? (
              <div>
                <p className="text-sm font-semibold text-green-800">
                  🔐 Authenticated as FID: {authenticatedUser?.fid}
                </p>
                <p className="text-xs text-gray-600">
                  Token expires: {authenticatedUser?.exp ? new Date(authenticatedUser.exp * 1000).toLocaleTimeString() : 'Unknown'}
                </p>
                <button
                  onClick={handleSignOut}
                  className="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  🔓 Not Authenticated
                </p>
                <button
                  onClick={handleSignIn}
                  className="mt-2 px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                >
                  Sign In (Context-based)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Game Description */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            Challenge friends in this exciting dragman game! Tap the dragon to score points and compete with friends.
          </p>
        </div>

        {/* Score Display */}
        {score > 0 && (
          <div className="mb-4 text-2xl font-bold text-gray-800">
            Score: {score}
            {highScore > 0 && (
              <div className="text-sm text-gray-600 mt-1">
                High Score: {highScore}
              </div>
            )}
          </div>
        )}

        {/* Play Button */}
        <button
          onClick={handlePlay}
          disabled={isPlaying}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-purple-300"
          aria-label={isPlaying ? 'Game in progress' : 'Start playing Dragman game'}
          role="button"
          tabIndex={0}
        >
          {isPlaying ? '🎮 Playing...' : '🎮 Play Now'}
        </button>

        {/* Share Button */}
        {score > 0 && (
          <button 
            onClick={handleShare}
            className="w-full mt-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-2 px-6 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            📤 Share Score
          </button>
        )}

        {/* New Features Buttons */}
        <div className="mt-6 space-y-3">
          <button
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-semibold py-2 px-6 rounded-lg hover:from-yellow-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            🏆 Leaderboard
          </button>

          {/* Base Account Features */}
          {isConnected && (
            <div className="space-y-2">
              <button
                onClick={() => setShowBaseAccountDemo(!showBaseAccountDemo)}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-2 px-6 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                🏦 Base Account Features
              </button>
              
              {showBaseAccountDemo && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">🏦 Base Account Features</h3>
                  <div className="space-y-2">
                    <button
                      onClick={handleGasFreeTransaction}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-2 px-4 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      ⛽ Gas-Free Transaction (Paymaster)
                    </button>
                    <button
                      onClick={handleMultiStepTransaction}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold py-2 px-4 rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      🔄 Multi-Step Transaction (Paymaster)
                    </button>
                    <div className="text-center mt-3">
                      <p className="text-xs text-gray-600">
                        Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                      </p>
                      <p className="text-xs text-gray-600">
                        Balance: {walletBalance} ETH
                      </p>
                      <p className="text-xs text-green-600 font-semibold">
                        Paymaster Credits: ${paymasterCredits.toFixed(3)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Leaderboard Modal */}
          {showLeaderboard && (
            <div className="space-y-2">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">🏆 Leaderboard</h3>
                <div className="space-y-2">
                  {leaderboard.map((player, index) => (
                    <div key={player.fid} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{player.avatar}</span>
                        <div>
                          <p className="font-semibold text-gray-800">{player.username}</p>
                          <p className="text-xs text-gray-500">FID: {player.fid}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">{player.score}</p>
                        <p className="text-xs text-gray-500">#{index + 1}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Daily Challenge */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
            <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">🎯 Daily Challenge</h3>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700">{dailyChallenge.title}</p>
              <p className="text-xs text-gray-600 mb-2">{dailyChallenge.description}</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((dailyChallenge.progress / dailyChallenge.target) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600">
                {dailyChallenge.progress}/{dailyChallenge.target} points
                {dailyChallenge.completed && <span className="text-green-600 font-semibold"> ✅ Completed!</span>}
              </p>
              {dailyChallenge.completed && (
                <p className="text-sm font-semibold text-green-600 mt-1">{dailyChallenge.reward}</p>
              )}
            </div>
          </div>

          {/* Game Stats */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
            <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">📊 Your Stats</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-2xl font-bold text-purple-600">{gameStats.gamesPlayed}</p>
                <p className="text-xs text-gray-600">Games</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-2xl font-bold text-blue-600">{gameStats.totalScore}</p>
                <p className="text-xs text-gray-600">Total Score</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-2xl font-bold text-green-600">{gameStats.gamesShared}</p>
                <p className="text-xs text-gray-600">Shared</p>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
            <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">🏅 Achievements</h3>
            <div className="grid grid-cols-2 gap-2">
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id} 
                  className={`bg-white rounded-lg p-3 shadow-sm text-center ${
                    achievement.unlocked ? 'opacity-100' : 'opacity-50'
                  }`}
                >
                  <p className="text-2xl mb-1">{achievement.icon}</p>
                  <p className="text-xs font-semibold text-gray-800">{achievement.name}</p>
                  <p className="text-xs text-gray-600">{achievement.description}</p>
                  {achievement.unlocked && (
                    <div className="mt-1">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Unlocked!</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Transaction History */}
          {isConnected && transactionHistory.length > 0 && (
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">📋 Transaction History</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {transactionHistory.slice(0, 5).map((tx, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">
                          {tx.type === 'gas_free' ? '⛽' : '🔄'}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-gray-800">
                            {tx.type === 'gas_free' ? 'Gas-Free' : `Step ${tx.step}: ${tx.stepName}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {tx.hash.slice(0, 10)}...{tx.hash.slice(-6)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-green-600 font-semibold">
                          Gas: {tx.gasUsed}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(tx.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {transactionHistory.length > 5 && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  +{transactionHistory.length - 5} more transactions
                </p>
              )}
            </div>
          )}

          {/* Base Account Demo removed to avoid wallet detection banner */}
        </div>

        {/* Features */}
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center justify-center text-gray-600">
            <span className="mr-2">⚡</span>
            Fast Gameplay
          </div>
          <div className="flex items-center justify-center text-gray-600">
            <span className="mr-2">👥</span>
            Social Features
          </div>
        </div>

        {/* Powered by Base */}
        <div className="mt-6 text-xs text-gray-500">
          Powered by Base
        </div>
      </div>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Great Job!</h3>
            <p className="text-gray-600 mb-4">
              You've completed your first game! Add Dragman to your Base app for easy access and notifications.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowOnboarding(false)}
                className="flex-1 bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Maybe Later
              </button>
              <button
                onClick={handleAddMiniApp}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Add to Base
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Notification */}
      {showAchievement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-8 max-w-sm w-full text-center animate-bounce">
            <div className="text-6xl mb-4">{showAchievement.icon}</div>
            <h3 className="text-2xl font-bold text-white mb-2">Achievement Unlocked!</h3>
            <p className="text-lg font-semibold text-white mb-2">{showAchievement.name}</p>
            <p className="text-sm text-yellow-100 mb-4">{showAchievement.description}</p>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <p className="text-sm text-white">🎉 Congratulations! 🎉</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading States */}
      {isPlaying && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-700 font-semibold">Playing...</p>
            <p className="text-sm text-gray-500">Tap the dragon to score!</p>
          </div>
        </div>
      )}

      {/* Wallet Connection Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <div className="text-4xl mb-4">🔗</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Connect Wallet</h3>
            <p className="text-gray-600 mb-4">
              Choose your wallet to connect to Dragman and access Base Account features.
            </p>
            <div className="space-y-3">
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => handleConnectWallet(connector)}
                  disabled={isPending}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? 'Connecting...' : `Connect ${connector.name}`}
                </button>
              ))}
            </div>
            {connectError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">
                  Connection failed: {connectError.message}
                </p>
              </div>
            )}
            <button
              onClick={() => setShowWalletModal(false)}
              className="mt-4 w-full bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Error Boundary */}
      <div className="error-boundary" style={{ display: 'none' }}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
          <h3 className="text-red-800 font-semibold">Something went wrong</h3>
          <p className="text-red-600 text-sm">Please refresh the page and try again.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
}
