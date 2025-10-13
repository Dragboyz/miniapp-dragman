'use client';

import React from 'react';
import { useAuth } from '../lib/useAuth';

interface AuthButtonProps {
  onAuthSuccess?: (user: any) => void;
  className?: string;
}

export function AuthButton({ onAuthSuccess, className = '' }: AuthButtonProps) {
  const { user, loading, error, isAuthenticated, signIn, signOut } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated && user && onAuthSuccess) {
      onAuthSuccess(user);
    }
  }, [isAuthenticated, user, onAuthSuccess]);

  if (loading) {
    return (
      <button
        disabled
        className={`w-full bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg cursor-not-allowed ${className}`}
      >
        ?? Authenticating...
      </button>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <button
          onClick={signIn}
          className={`w-full bg-red-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-red-600 transition-colors ${className}`}
        >
          ?? Sign In (Retry)
        </button>
        <p className="text-red-600 text-sm text-center">{error}</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="space-y-2">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <p className="text-green-700 text-sm">
            ? Authenticated as FID: {user?.fid}
          </p>
        </div>
        <button
          onClick={signOut}
          className={`w-full bg-gray-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors ${className}`}
        >
          ?? Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={signIn}
      className={`w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg ${className}`}
    >
      ?? Sign In with Quick Auth
    </button>
  );
}