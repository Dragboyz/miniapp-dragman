'use client';
import { useState, useEffect, useCallback } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

interface BaseContext {
  user?: {
    fid: number;
    username?: string;
    displayName?: string;
    pfp?: {
      url: string;
    };
    bio?: string;
    followerCount?: number;
    followingCount?: number;
  };
  client?: {
    version: string;
    platform: string;
  };
  cast?: {
    hash: string;
    author: {
      fid: number;
      username: string;
    };
  };
}

interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  action?: {
    type: 'open_url' | 'launch_miniapp';
    url: string;
  };
}

export default function BaseIntegration() {
  const [context, setContext] = useState<BaseContext | null>(null);
  const [isInMiniApp, setIsInMiniApp] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [userPreferences, setUserPreferences] = useState({
    soundEnabled: true,
    hapticEnabled: true,
    notificationsEnabled: true,
    theme: 'dark'
  });
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // Initialize Base integration
  useEffect(() => {
    initializeBaseIntegration();
  }, []);

  const initializeBaseIntegration = useCallback(async () => {
    try {
      // Check if we're in Base mini app
      const isInApp = await sdk.context;
      setIsInMiniApp(!!isInApp);

      if (isInApp) {
        setContext(isInApp as unknown as BaseContext);
        
        // Get user preferences from localStorage
        const preferences = localStorage.getItem('userPreferences');
        if (preferences) {
          setUserPreferences(JSON.parse(preferences));
        }

        // Note: Event listeners are not available in the current Base mini app SDK
        // These would be set up when the SDK supports them

        // Notify Base that app is ready
        await sdk.actions.ready();
      }
    } catch (error) {
      console.error('Failed to initialize Base integration:', error);
    }
  }, []);

  // Note: Event handlers would be implemented when the SDK supports events
  // For now, we'll handle updates through other means

  // Send notification to Base
  const sendNotification = useCallback(async (notification: NotificationData) => {
    if (!userPreferences.notificationsEnabled) return;

    try {
      // For now, we'll just log the notification
      // In a real implementation, this would be handled by the Base app
      console.log('Notification:', notification);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }, [userPreferences.notificationsEnabled]);

  // Share content to Base
  const shareToBase = useCallback(async (content: {
    text: string;
    embeds?: Array<{
      url: string;
      castId?: {
        fid: number;
        hash: string;
      };
    }>;
  }) => {
    try {
      // Use the share URL with query parameters
      const shareUrl = `https://dragman.xyz/share?text=${encodeURIComponent(content.text)}`;
      await sdk.actions.openUrl(shareUrl);
    } catch (error) {
      console.error('Failed to share to Base:', error);
    }
  }, []);

  // Get user's social graph
  const getSocialGraph = useCallback(async () => {
    if (!context?.user) return null;

    try {
      const response = await fetch(`https://dragman.xyz/api/social/${context.user.fid}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get social graph:', error);
      return null;
    }
  }, [context?.user]);

  // Save user preferences
  const saveUserPreferences = useCallback(async (preferences: typeof userPreferences) => {
    setUserPreferences(preferences);
    
    try {
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }, [isInMiniApp]);

  // Trigger haptic feedback
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (userPreferences.hapticEnabled && 'vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [50]
      };
      navigator.vibrate(patterns[type]);
    }
  }, [userPreferences.hapticEnabled]);

  // Get user's location (if permitted)
  const getUserLocation = useCallback(async () => {
    if (!isInMiniApp) return null;

    try {
      // Use browser's geolocation API instead
      if ('geolocation' in navigator) {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }),
            (error) => {
              console.error('Geolocation error:', error);
              resolve(null);
            }
          );
        });
      }
      return null;
    } catch (error) {
      console.error('Failed to get location:', error);
      return null;
    }
  }, [isInMiniApp]);

  // Open external URL
  const openExternalUrl = useCallback(async (url: string) => {
    try {
      await sdk.actions.openUrl(url);
    } catch (error) {
      console.error('Failed to open URL:', error);
    }
  }, []);

  // Get app context
  const getAppContext = useCallback(() => {
    return {
      isInMiniApp,
      context,
      user: context?.user,
      client: context?.client,
      cast: context?.cast
    };
  }, [isInMiniApp, context]);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    if (!isConnected && connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  }, [isConnected, connect, connectors]);

  // Disconnect wallet
  const disconnectWallet = useCallback(async () => {
    if (isConnected) {
      disconnect();
    }
  }, [isConnected, disconnect]);

  // Share game score
  const shareGameScore = useCallback(async (score: number, gameMode: string) => {
    const shareContent = {
      text: `I just scored ${score.toLocaleString()} points in ${gameMode} mode on Dragman! ?? Can you beat my score?`,
      embeds: [{
        url: 'https://dragman.xyz',
        castId: {
          fid: context?.user?.fid || 0,
          hash: '0x' + Date.now().toString(16)
        }
      }]
    };

    await shareToBase(shareContent);
  }, [context?.user?.fid, shareToBase]);

  // Send friend challenge
  const sendFriendChallenge = useCallback(async (friendFid: number, challengeType: string, target: number) => {
    const challengeData = {
      from: context?.user,
      to: friendFid,
      type: challengeType,
      target,
      timestamp: Date.now()
    };

    try {
      // Use the challenge URL with query parameters
      const challengeUrl = `https://dragman.xyz/challenge?type=${challengeType}&target=${target}&to=${friendFid}`;
      await sdk.actions.openUrl(challengeUrl);
    } catch (error) {
      console.error('Failed to send friend challenge:', error);
    }
  }, [context?.user]);

  // Get user's achievements for sharing
  const getUserAchievements = useCallback(async () => {
    if (!context?.user) return [];

    try {
      const response = await fetch(`https://dragman.xyz/api/achievements/${context.user.fid}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get achievements:', error);
      return [];
    }
  }, [context?.user]);

  // Expose methods for use in other components
  useEffect(() => {
    (window as any).baseIntegration = {
      getAppContext,
      sendNotification,
      shareToBase,
      getSocialGraph,
      saveUserPreferences,
      triggerHaptic,
      getUserLocation,
      openExternalUrl,
      connectWallet,
      disconnectWallet,
      shareGameScore,
      sendFriendChallenge,
      getUserAchievements
    };
  }, [
    getAppContext,
    sendNotification,
    shareToBase,
    getSocialGraph,
    saveUserPreferences,
    triggerHaptic,
    getUserLocation,
    openExternalUrl,
    connectWallet,
    disconnectWallet,
    shareGameScore,
    sendFriendChallenge,
    getUserAchievements
  ]);

  return (
    <div className="space-y-4">
      {/* Base Context Display */}
      {context && context.user && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-lg text-white">
          <div className="flex items-center gap-3 mb-3">
            <img 
              src={context.user.pfp?.url || '/icon.svg'} 
              alt={context.user.username || 'User'}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <div className="font-bold">{context.user.displayName || 'Anonymous'}</div>
              <div className="text-sm opacity-90">@{context.user.username || 'user'}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="opacity-90">Followers</div>
              <div className="font-bold">{context.user.followerCount?.toLocaleString() || '0'}</div>
            </div>
            <div>
              <div className="opacity-90">Following</div>
              <div className="font-bold">{context.user.followingCount?.toLocaleString() || '0'}</div>
            </div>
          </div>
          
          {context.user.bio && (
            <div className="mt-3 text-sm opacity-90">{context.user.bio}</div>
          )}
        </div>
      )}

      {/* User Preferences */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-bold text-white mb-3">Preferences</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 text-white">
            <input
              type="checkbox"
              checked={userPreferences.soundEnabled}
              onChange={(e) => saveUserPreferences({
                ...userPreferences,
                soundEnabled: e.target.checked
              })}
              className="w-4 h-4"
            />
            Sound Effects
          </label>
          
          <label className="flex items-center gap-3 text-white">
            <input
              type="checkbox"
              checked={userPreferences.hapticEnabled}
              onChange={(e) => saveUserPreferences({
                ...userPreferences,
                hapticEnabled: e.target.checked
              })}
              className="w-4 h-4"
            />
            Haptic Feedback
          </label>
          
          <label className="flex items-center gap-3 text-white">
            <input
              type="checkbox"
              checked={userPreferences.notificationsEnabled}
              onChange={(e) => saveUserPreferences({
                ...userPreferences,
                notificationsEnabled: e.target.checked
              })}
              className="w-4 h-4"
            />
            Notifications
          </label>
        </div>
      </div>

      {/* Wallet Connection */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-bold text-white mb-3">Wallet</h3>
        <div className="flex items-center justify-between">
          <div className="text-white">
            {isConnected ? `Connected: ${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Not connected'}
          </div>
          <button
            onClick={isConnected ? disconnectWallet : connectWallet}
            className={`px-4 py-2 rounded font-bold ${
              isConnected 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isConnected ? 'Disconnect' : 'Connect'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((notification, index) => (
            <div key={index} className="bg-yellow-600 p-3 rounded-lg text-black">
              <div className="font-bold">{notification.title}</div>
              <div className="text-sm">{notification.body}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}