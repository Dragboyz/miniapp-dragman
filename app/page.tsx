'use client';
import { useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import Image from "next/image";

export default function Home() {
  useEffect(() => {
    // Hide loading splash screen and display your app
    const initializeSDK = async () => {
      try {
        console.log('Initializing Base Mini App SDK...');
        
        // Check if SDK is available
        if (typeof window !== 'undefined' && window.parent !== window) {
          console.log('Running in iframe context - SDK should be available');
          await sdk.actions.ready();
          console.log('SDK ready called successfully');
        } else {
          console.log('Not running in iframe context - SDK may not be available');
          // Still try to call ready in case SDK is available
          await sdk.actions.ready();
          console.log('SDK ready called successfully (outside iframe)');
        }
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

        {/* Game Description */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            Challenge friends in this exciting dragman game! Tap the dragon to score points and compete with friends.
          </p>
        </div>

        {/* Play Button */}
        <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
          🎮 Play Now
        </button>

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
    </div>
  );
}
