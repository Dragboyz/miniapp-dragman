import { useState, useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

export interface AuthenticatedUser {
  fid: number;
  authenticated: boolean;
  timestamp?: number;
  expires?: number;
}

export function useAuth() {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use context for authentication (simplified approach)
      const context = await sdk.context;
      if (context?.user?.fid) {
        setUser({
          fid: context.user.fid,
          authenticated: true,
          timestamp: Date.now(),
          expires: Date.now() + 3600000, // 1 hour
        });
        
        console.log('Authentication successful:', context.user);
      } else {
        throw new Error('No user context available');
      }
    } catch (error) {
      console.error("Authentication failed:", error);
      setError(error instanceof Error ? error.message : 'Authentication failed');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    setError(null);
  };

  const isAuthenticated = !!user?.authenticated;

  return {
    user,
    loading,
    error,
    isAuthenticated,
    signIn,
    signOut,
  };
}