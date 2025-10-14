'use client';
import { useState, useEffect, useCallback } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { useAccount } from 'wagmi';

interface Player {
  fid: number;
  username: string;
  score: number;
  avatar: string;
  isOnline: boolean;
  level: number;
}

interface Challenge {
  id: string;
  from: Player;
  to: Player;
  type: 'score' | 'time' | 'combo';
  target: number;
  timeLimit: number;
  status: 'pending' | 'accepted' | 'completed' | 'expired';
  createdAt: number;
}

interface Tournament {
  id: string;
  name: string;
  participants: Player[];
  startTime: number;
  endTime: number;
  prize: string;
  status: 'upcoming' | 'active' | 'completed';
}

export default function MultiplayerSystem() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [isInBattle, setIsInBattle] = useState(false);
  const [battleScore, setBattleScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const { address } = useAccount();

  // Initialize multiplayer system
  useEffect(() => {
    initializeMultiplayer();
  }, []);

  const initializeMultiplayer = useCallback(async () => {
    try {
      // Get user context from Base mini app
      const context = await sdk.context;
      if (context?.user) {
        // Add current user to players list
        const currentUser: Player = {
          fid: context.user.fid,
          username: context.user.username || 'Anonymous',
          score: 0,
          avatar: '🐲', // Default dragon emoji since pfp is not available
          isOnline: true,
          level: 1
        };
        setPlayers(prev => [...prev.filter(p => p.fid !== currentUser.fid), currentUser]);
      }
    } catch (error) {
      console.error('Failed to initialize multiplayer:', error);
    }
  }, []);

  // Send challenge to friend
  const sendChallenge = useCallback(async (targetFid: number, type: Challenge['type'], target: number) => {
    const currentUser = players.find(p => p.isOnline);
    if (!currentUser) return;

    const challenge: Challenge = {
      id: Date.now().toString(),
      from: currentUser,
      to: players.find(p => p.fid === targetFid)!,
      type,
      target,
      timeLimit: 30000, // 30 seconds
      status: 'pending',
      createdAt: Date.now()
    };

    setChallenges(prev => [...prev, challenge]);

    // Send challenge via Base mini app
    try {
      await sdk.actions.openUrl(`https://dragman.xyz/challenge/${challenge.id}`);
    } catch (error) {
      console.error('Failed to send challenge:', error);
    }
  }, [players]);

  // Accept challenge
  const acceptChallenge = useCallback((challengeId: string) => {
    setChallenges(prev => 
      prev.map(c => 
        c.id === challengeId 
          ? { ...c, status: 'accepted' as const }
          : c
      )
    );

    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
      setActiveChallenge(challenge);
      setIsInBattle(true);
      setBattleScore(0);
      setOpponentScore(0);
    }
  }, [challenges]);

  // Start tournament
  const createTournament = useCallback((name: string, prize: string) => {
    const tournament: Tournament = {
      id: Date.now().toString(),
      name,
      participants: players.filter(p => p.isOnline),
      startTime: Date.now() + 60000, // Start in 1 minute
      endTime: Date.now() + 3600000, // End in 1 hour
      prize,
      status: 'upcoming'
    };

    setTournaments(prev => [...prev, tournament]);
  }, [players]);

  // Join tournament
  const joinTournament = useCallback((tournamentId: string) => {
    const currentUser = players.find(p => p.isOnline);
    if (!currentUser) return;

    setTournaments(prev =>
      prev.map(t =>
        t.id === tournamentId
          ? { ...t, participants: [...t.participants, currentUser] }
          : t
      )
    );
  }, [players]);

  // Share score with friends
  const shareScore = useCallback(async (score: number) => {
    try {
      const shareData = {
        text: `I just scored ${score.toLocaleString()} points in Dragman! ?? Can you beat my score?`,
        url: 'https://dragman.xyz',
        embeds: [{
          url: 'https://dragman.xyz',
          castId: {
            fid: 12345,
            hash: '0x1234567890abcdef'
          }
        }]
      };

      await sdk.actions.openUrl(`https://dragman.xyz/share?score=${score}`);
    } catch (error) {
      console.error('Failed to share score:', error);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Active Battle */}
      {isInBattle && activeChallenge && (
        <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6 rounded-lg text-white">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold">BATTLE MODE</h2>
            <p>Challenge: {activeChallenge.type} - Target: {activeChallenge.target}</p>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-3xl font-bold">{battleScore}</div>
              <div className="text-sm">Your Score</div>
            </div>
            
            <div className="text-4xl">??</div>
            
            <div className="text-center">
              <div className="text-3xl font-bold">{opponentScore}</div>
              <div className="text-sm">{activeChallenge.to.username}</div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setIsInBattle(false)}
              className="px-4 py-2 bg-white text-red-600 rounded-lg font-bold"
            >
              End Battle
            </button>
          </div>
        </div>
      )}

      {/* Pending Challenges */}
      {challenges.filter(c => c.status === 'pending').length > 0 && (
        <div className="bg-blue-600 p-4 rounded-lg text-white">
          <h3 className="text-lg font-bold mb-2">Pending Challenges</h3>
          {challenges.filter(c => c.status === 'pending').map(challenge => (
            <div key={challenge.id} className="flex justify-between items-center mb-2">
              <div>
                <span className="font-bold">{challenge.from.username}</span> challenged you to {challenge.type}!
              </div>
              <button
                onClick={() => acceptChallenge(challenge.id)}
                className="px-3 py-1 bg-green-500 rounded text-sm font-bold"
              >
                Accept
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Online Players */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-bold text-white mb-3">Online Players</h3>
        <div className="space-y-2">
          {players.filter(p => p.isOnline).map(player => (
            <div key={player.fid} className="flex justify-between items-center bg-gray-700 p-3 rounded">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{player.avatar}</span>
                <div>
                  <div className="font-bold text-white">{player.username}</div>
                  <div className="text-sm text-gray-300">Level {player.level}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => sendChallenge(player.fid, 'score', 1000)}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                >
                  Challenge
                </button>
                <button
                  onClick={() => shareScore(player.score)}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                >
                  Share
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tournaments */}
      <div className="bg-purple-600 p-4 rounded-lg text-white">
        <h3 className="text-lg font-bold mb-3">Active Tournaments</h3>
        {tournaments.map(tournament => (
          <div key={tournament.id} className="bg-purple-700 p-3 rounded mb-2">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold">{tournament.name}</div>
                <div className="text-sm">Prize: {tournament.prize}</div>
                <div className="text-sm">{tournament.participants.length} participants</div>
              </div>
              <button
                onClick={() => joinTournament(tournament.id)}
                className="px-3 py-1 bg-yellow-500 text-black rounded font-bold"
              >
                Join
              </button>
            </div>
          </div>
        ))}
        
        <button
          onClick={() => createTournament('Daily Dragon Battle', '?? Trophy + 1000 Points')}
          className="w-full mt-3 px-4 py-2 bg-yellow-500 text-black rounded font-bold"
        >
          Create Tournament
        </button>
      </div>
    </div>
  );
}