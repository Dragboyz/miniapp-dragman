'use client';
import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import Image from "next/image";
import { BaseAccountFeatures, GasFreeButton, MultiStepButton } from '../components/BaseAccountFeatures';
import { useGasFreeTransaction } from '../lib/sponsored-transactions';
import { useMultiStepTransaction } from '../lib/transaction-batching';
import { useBaseAccountFeatures } from '../lib/base-account';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function Home() {
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showBaseAccountDemo, setShowBaseAccountDemo] = useState(false);
  
  // Context state
  const [isInMiniApp, setIsInMiniApp] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [location, setLocation] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [features, setFeatures] = useState<any>(null);

  // Base Account features
  const { capabilities } = useBaseAccountFeatures();
  const { executeGasFreeTransaction, isGasFreeAvailable } = useGasFreeTransaction(capabilities);
  const { executeMultiStepTransaction, isMultiStepAvailable } = useMultiStepTransaction(capabilities);

  const handleShare = async () => {
    try {
      const shareText = score > highScore 
        ? `🏆 NEW HIGH SCORE! Just scored ${score} points in Dragman! Can you beat my score? 🐉`
        : `🐉 Just scored ${score} points in Dragman! Can you beat my score?`;
        
      await sdk.actions.composeCast({
        text: shareText,
        embeds: ['https://dragman.xyz']
      });
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

  const handleGasFreeDemo = async () => {
    try {
      // Demo gas-free transaction (this would be a real contract in production)
      console.log('Executing gas-free transaction demo...');
      // await executeGasFreeTransaction('0x...', contractAbi, 'mint', []);
      alert('Gas-free transaction demo completed! (In production, this would mint an NFT)');
    } catch (error) {
      console.error('Gas-free transaction failed:', error);
      alert('Gas-free transaction failed. Check console for details.');
    }
  };

  const handleMultiStepDemo = async () => {
    try {
      // Demo multi-step transaction (this would be real transactions in production)
      console.log('Executing multi-step transaction demo...');
      // await executeMultiStepTransaction([
      //   { to: '0x...', data: '0x...', value: 0n },
      //   { to: '0x...', data: '0x...', value: 0n },
      // ]);
      alert('Multi-step transaction demo completed! (In production, this would execute multiple operations)');
    } catch (error) {
      console.error('Multi-step transaction failed:', error);
      alert('Multi-step transaction failed. Check console for details.');
    }
  };

  const handlePlay = async () => {
    setIsPlaying(true);
    
    // Trigger haptic feedback if available
    if (features?.haptics && navigator.vibrate) {
      navigator.vibrate(50); // Short vibration
    }
    
    // Simulate scoring
    const interval = setInterval(() => {
      setScore(prev => prev + 1);
    }, 100);
    
    setTimeout(async () => {
      clearInterval(interval);
      setIsPlaying(false);
      
      // Update high score
      if (score > highScore) {
        setHighScore(score);
        
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
      {/* Base Account Features */}
      <BaseAccountFeatures />

      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Dragon Icon */}
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mb-4">
            <div className="text-white text-4xl">🐉</div>
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
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Base Account Demo Buttons */}
        <div className="mt-6 space-y-3">
          <button
            onClick={() => setShowBaseAccountDemo(!showBaseAccountDemo)}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-2 px-6 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            🔧 Base Account Features
          </button>

          {showBaseAccountDemo && (
            <div className="space-y-2">
              <GasFreeButton onClick={handleGasFreeDemo}>
                Demo Gas-Free Transaction
              </GasFreeButton>

              <MultiStepButton onClick={handleMultiStepDemo}>
                Demo Multi-Step Transaction
              </MultiStepButton>
            </div>
          )}
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
    </div>
  );
}
