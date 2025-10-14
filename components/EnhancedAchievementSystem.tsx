'use client';
import { useState, useEffect, useCallback } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'basic' | 'social' | 'combat' | 'special' | 'seasonal';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  progress: number;
  target: number;
  reward: string;
  unlockedAt?: number;
}

interface SeasonalEvent {
  id: string;
  name: string;
  description: string;
  startDate: number;
  endDate: number;
  achievements: Achievement[];
  rewards: string[];
  active: boolean;
}

export default function EnhancedAchievementSystem() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [seasonalEvents, setSeasonalEvents] = useState<SeasonalEvent[]>([]);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState<Achievement | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [friendsChallenged, setFriendsChallenged] = useState(0);
  const [comboStreak, setComboStreak] = useState(0);

  // Initialize achievements
  useEffect(() => {
    initializeAchievements();
    initializeSeasonalEvents();
  }, []);

  const initializeAchievements = useCallback(() => {
    const baseAchievements: Achievement[] = [
      // Basic Achievements
      {
        id: 'first_game',
        name: 'First Steps',
        description: 'Play your first game',
        icon: '??',
        category: 'basic',
        rarity: 'common',
        unlocked: false,
        progress: 0,
        target: 1,
        reward: '100 points'
      },
      {
        id: 'score_100',
        name: 'Century Club',
        description: 'Score 100 points in a single game',
        icon: '??',
        category: 'basic',
        rarity: 'common',
        unlocked: false,
        progress: 0,
        target: 100,
        reward: '200 points'
      },
      {
        id: 'score_1000',
        name: 'Dragon Slayer',
        description: 'Score 1000 points in a single game',
        icon: '??',
        category: 'basic',
        rarity: 'rare',
        unlocked: false,
        progress: 0,
        target: 1000,
        reward: '500 points + Fire Dragon'
      },
      {
        id: 'score_5000',
        name: 'Legend',
        description: 'Score 5000 points in a single game',
        icon: '??',
        category: 'basic',
        rarity: 'legendary',
        unlocked: false,
        progress: 0,
        target: 5000,
        reward: '2000 points + Golden Dragon'
      },
      
      // Social Achievements
      {
        id: 'share_score',
        name: 'Social Butterfly',
        description: 'Share your score with friends',
        icon: '??',
        category: 'social',
        rarity: 'common',
        unlocked: false,
        progress: 0,
        target: 1,
        reward: '150 points'
      },
      {
        id: 'challenge_friends',
        name: 'Challenger',
        description: 'Challenge 5 friends',
        icon: '??',
        category: 'social',
        rarity: 'rare',
        unlocked: false,
        progress: 0,
        target: 5,
        reward: '300 points + Challenge Badge'
      },
      {
        id: 'win_challenges',
        name: 'Champion',
        description: 'Win 10 friend challenges',
        icon: '??',
        category: 'social',
        rarity: 'epic',
        unlocked: false,
        progress: 0,
        target: 10,
        reward: '1000 points + Champion Crown'
      },
      
      // Combat Achievements
      {
        id: 'combo_10',
        name: 'Combo Master',
        description: 'Achieve a 10x combo',
        icon: '??',
        category: 'combat',
        rarity: 'rare',
        unlocked: false,
        progress: 0,
        target: 10,
        reward: '400 points + Combo Boost'
      },
      {
        id: 'combo_50',
        name: 'Combo Legend',
        description: 'Achieve a 50x combo',
        icon: '?',
        category: 'combat',
        rarity: 'epic',
        unlocked: false,
        progress: 0,
        target: 50,
        reward: '1500 points + Lightning Dragon'
      },
      {
        id: 'defeat_boss',
        name: 'Boss Slayer',
        description: 'Defeat 5 boss dragons',
        icon: '??',
        category: 'combat',
        rarity: 'epic',
        unlocked: false,
        progress: 0,
        target: 5,
        reward: '800 points + Boss Slayer Badge'
      },
      
      // Special Achievements
      {
        id: 'daily_streak_7',
        name: 'Dedicated Dragon',
        description: 'Play for 7 days in a row',
        icon: '??',
        category: 'special',
        rarity: 'rare',
        unlocked: false,
        progress: 0,
        target: 7,
        reward: '500 points + Streak Bonus'
      },
      {
        id: 'total_games_100',
        name: 'Veteran Player',
        description: 'Play 100 games total',
        icon: '??',
        category: 'special',
        rarity: 'epic',
        unlocked: false,
        progress: 0,
        target: 100,
        reward: '1000 points + Veteran Badge'
      },
      {
        id: 'perfect_game',
        name: 'Perfectionist',
        description: 'Score without missing a single tap',
        icon: '?',
        category: 'special',
        rarity: 'legendary',
        unlocked: false,
        progress: 0,
        target: 1,
        reward: '2000 points + Perfect Dragon'
      }
    ];

    setAchievements(baseAchievements);
  }, []);

  const initializeSeasonalEvents = useCallback(() => {
    const currentDate = Date.now();
    
    const events: SeasonalEvent[] = [
      {
        id: 'halloween_2024',
        name: 'Halloween Dragon Hunt',
        description: 'Special spooky dragons and challenges',
        startDate: new Date('2024-10-01').getTime(),
        endDate: new Date('2024-11-01').getTime(),
        active: currentDate >= new Date('2024-10-01').getTime() && currentDate <= new Date('2024-11-01').getTime(),
        achievements: [
          {
            id: 'spooky_dragon',
            name: 'Spooky Dragon Tamer',
            description: 'Defeat 10 spooky dragons',
            icon: '??',
            category: 'seasonal',
            rarity: 'rare',
            unlocked: false,
            progress: 0,
            target: 10,
            reward: 'Halloween Dragon + 500 points'
          },
          {
            id: 'trick_or_treat',
            name: 'Trick or Treat Master',
            description: 'Complete all Halloween challenges',
            icon: '??',
            category: 'seasonal',
            rarity: 'epic',
            unlocked: false,
            progress: 0,
            target: 5,
            reward: 'Exclusive Halloween Badge + 1000 points'
          }
        ],
        rewards: ['Halloween Dragon', 'Spooky Badge', 'Candy Points']
      },
      {
        id: 'christmas_2024',
        name: 'Christmas Dragon Festival',
        description: 'Festive dragons and holiday challenges',
        startDate: new Date('2024-12-01').getTime(),
        endDate: new Date('2025-01-01').getTime(),
        active: currentDate >= new Date('2024-12-01').getTime() && currentDate <= new Date('2025-01-01').getTime(),
        achievements: [
          {
            id: 'santa_dragon',
            name: 'Santa Dragon Helper',
            description: 'Help Santa Dragon deliver presents',
            icon: '??',
            category: 'seasonal',
            rarity: 'rare',
            unlocked: false,
            progress: 0,
            target: 1,
            reward: 'Santa Dragon + 750 points'
          }
        ],
        rewards: ['Santa Dragon', 'Christmas Badge', 'Gift Points']
      }
    ];

    setSeasonalEvents(events);
  }, []);

  // Check and unlock achievements
  const checkAchievements = useCallback((gameStats: {
    score: number;
    gamesPlayed: number;
    friendsChallenged: number;
    comboStreak: number;
    bossDefeated: boolean;
    perfectGame: boolean;
  }) => {
    setAchievements(prev => 
      prev.map(achievement => {
        if (achievement.unlocked) return achievement;

        let newProgress = achievement.progress;
        let shouldUnlock = false;

        switch (achievement.id) {
          case 'first_game':
            newProgress = Math.min(achievement.target, gameStats.gamesPlayed);
            shouldUnlock = gameStats.gamesPlayed >= 1;
            break;
          case 'score_100':
          case 'score_1000':
          case 'score_5000':
            newProgress = Math.min(achievement.target, gameStats.score);
            shouldUnlock = gameStats.score >= achievement.target;
            break;
          case 'share_score':
            newProgress = gameStats.friendsChallenged > 0 ? 1 : 0;
            shouldUnlock = gameStats.friendsChallenged > 0;
            break;
          case 'challenge_friends':
            newProgress = Math.min(achievement.target, gameStats.friendsChallenged);
            shouldUnlock = gameStats.friendsChallenged >= achievement.target;
            break;
          case 'combo_10':
          case 'combo_50':
            newProgress = Math.min(achievement.target, gameStats.comboStreak);
            shouldUnlock = gameStats.comboStreak >= achievement.target;
            break;
          case 'defeat_boss':
            newProgress = gameStats.bossDefeated ? 1 : 0;
            shouldUnlock = gameStats.bossDefeated;
            break;
          case 'perfect_game':
            newProgress = gameStats.perfectGame ? 1 : 0;
            shouldUnlock = gameStats.perfectGame;
            break;
        }

        if (shouldUnlock && !achievement.unlocked) {
          setShowUnlockAnimation(achievement);
          // Trigger haptic feedback
          if ('vibrate' in navigator) {
            navigator.vibrate([50]);
          }
          // Show notification
          if (sdk.actions.openUrl) {
            sdk.actions.openUrl(`https://dragman.xyz/achievement/${achievement.id}`);
          }
        }

        return {
          ...achievement,
          progress: newProgress,
          unlocked: shouldUnlock,
          unlockedAt: shouldUnlock ? Date.now() : achievement.unlockedAt
        };
      })
    );
  }, []);

  // Get rarity color
  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  // Get rarity border
  const getRarityBorder = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'border-gray-400';
      case 'rare': return 'border-blue-400';
      case 'epic': return 'border-purple-400';
      case 'legendary': return 'border-yellow-400';
      default: return 'border-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Unlock Animation */}
      {showUnlockAnimation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-8 rounded-lg text-center animate-bounce">
            <div className="text-6xl mb-4">{showUnlockAnimation.icon}</div>
            <div className="text-2xl font-bold text-black mb-2">ACHIEVEMENT UNLOCKED!</div>
            <div className="text-xl font-bold text-black mb-2">{showUnlockAnimation.name}</div>
            <div className="text-black mb-4">{showUnlockAnimation.description}</div>
            <div className="text-black font-bold">Reward: {showUnlockAnimation.reward}</div>
            <button
              onClick={() => setShowUnlockAnimation(null)}
              className="mt-4 px-6 py-2 bg-black text-white rounded font-bold"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}

      {/* Achievement Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {['basic', 'social', 'combat', 'special'].map(category => {
          const categoryAchievements = achievements.filter(a => a.category === category);
          const unlockedCount = categoryAchievements.filter(a => a.unlocked).length;
          const totalCount = categoryAchievements.length;
          
          return (
            <div key={category} className="bg-gray-800 p-4 rounded-lg text-center">
              <div className="text-2xl mb-2">
                {category === 'basic' ? '??' : 
                 category === 'social' ? '??' : 
                 category === 'combat' ? '??' : '?'}
              </div>
              <div className="text-white font-bold capitalize">{category}</div>
              <div className="text-sm text-gray-400">{unlockedCount}/{totalCount}</div>
            </div>
          );
        })}
      </div>

      {/* Achievements List */}
      <div className="space-y-3">
        {achievements.map(achievement => (
          <div
            key={achievement.id}
            className={`p-4 rounded-lg border-2 ${
              achievement.unlocked 
                ? `bg-gradient-to-r from-yellow-400/20 to-orange-500/20 ${getRarityBorder(achievement.rarity)}` 
                : 'bg-gray-800 border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-3xl">{achievement.icon}</div>
                <div>
                  <div className={`font-bold ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
                    {achievement.name}
                  </div>
                  <div className="text-sm text-gray-400">{achievement.description}</div>
                  <div className={`text-sm font-bold ${getRarityColor(achievement.rarity)}`}>
                    {achievement.rarity.toUpperCase()}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-400 mb-1">Progress</div>
                <div className="text-lg font-bold text-white">
                  {achievement.progress}/{achievement.target}
                </div>
                <div className="w-24 h-2 bg-gray-700 rounded-full mt-1">
                  <div
                    className={`h-full rounded-full ${
                      achievement.unlocked ? 'bg-yellow-400' : 'bg-blue-500'
                    }`}
                    style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                  />
                </div>
                {achievement.unlocked && (
                  <div className="text-sm text-yellow-400 font-bold mt-1">
                    Reward: {achievement.reward}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Seasonal Events */}
      {seasonalEvents.filter(e => e.active).length > 0 && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-lg text-white">
          <h3 className="text-2xl font-bold mb-4">?? Seasonal Events</h3>
          {seasonalEvents.filter(e => e.active).map(event => (
            <div key={event.id} className="bg-white/20 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <div className="text-xl font-bold">{event.name}</div>
                  <div className="text-sm opacity-90">{event.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm">Time Left</div>
                  <div className="font-bold">
                    {Math.ceil((event.endDate - Date.now()) / (1000 * 60 * 60 * 24))} days
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {event.achievements.map(achievement => (
                  <div key={achievement.id} className="bg-white/10 p-2 rounded text-sm">
                    <div className="flex items-center gap-2">
                      <span>{achievement.icon}</span>
                      <span className="font-bold">{achievement.name}</span>
                    </div>
                    <div className="text-xs opacity-90">{achievement.description}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}