'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { useAccount } from 'wagmi';

interface DragonState {
  level: number;
  health: number;
  maxHealth: number;
  experience: number;
  abilities: string[];
  evolution: string;
}

interface PowerUp {
  id: string;
  type: 'fire' | 'lightning' | 'ice' | 'combo';
  duration: number;
  multiplier: number;
  active: boolean;
}

interface ComboSystem {
  current: number;
  max: number;
  multiplier: number;
  timer: number;
}

export default function EnhancedDragonGame() {
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dragon, setDragon] = useState<DragonState>({
    level: 1,
    health: 100,
    maxHealth: 100,
    experience: 0,
    abilities: ['basic_tap'],
    evolution: 'baby'
  });
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [combo, setCombo] = useState<ComboSystem>({
    current: 0,
    max: 0,
    multiplier: 1,
    timer: 0
  });
  const [particles, setParticles] = useState<any[]>([]);
  const [gameTime, setGameTime] = useState(0);
  const [isBossBattle, setIsBossBattle] = useState(false);
  const [bossHealth, setBossHealth] = useState(0);
  const gameRef = useRef<HTMLDivElement>(null);
  const { address } = useAccount();

  // Haptic feedback
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

  // Dragon tap handler with enhanced effects
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
    const baseScore = 10 * dragon.level;
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
  }, [isPlaying, combo, dragon.level, score, createParticle, triggerHaptic]);

  // Power-up system
  const activateRandomPowerUp = useCallback(() => {
    const types: PowerUp['type'][] = ['fire', 'lightning', 'ice', 'combo'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const powerUp: PowerUp = {
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

  // Game loop
  useEffect(() => {
    if (!isPlaying) return;

    const gameLoop = setInterval(() => {
      setGameTime(prev => prev + 1);
      
      // Update particles
      setParticles(prev => 
        prev.map(p => ({
          ...p,
          x: p.x + p.velocity.x,
          y: p.y + p.velocity.y,
          life: p.life - 1
        })).filter(p => p.life > 0)
      );

      // Update combo timer
      setCombo(prev => ({
        ...prev,
        timer: prev.timer > 0 ? prev.timer - 100 : 0
      }));

      // Boss battle logic
      if (isBossBattle && bossHealth > 0) {
        setBossHealth(prev => Math.max(0, prev - 1));
        if (bossHealth <= 0) {
          setIsBossBattle(false);
          setScore(prev => prev + 500); // Boss defeat bonus
        }
      }
    }, 100);

    return () => clearInterval(gameLoop);
  }, [isPlaying, isBossBattle, bossHealth]);

  // Dragon evolution system
  useEffect(() => {
    const expNeeded = dragon.level * 100;
    if (dragon.experience >= expNeeded) {
      setDragon(prev => ({
        ...prev,
        level: prev.level + 1,
        experience: prev.experience - expNeeded,
        maxHealth: prev.maxHealth + 50,
        health: prev.maxHealth + 50,
        evolution: prev.level >= 5 ? 'adult' : prev.level >= 3 ? 'teen' : 'baby'
      }));
    }
  }, [dragon.experience, dragon.level]);

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900">
      {/* Game Area */}
      <div 
        ref={gameRef}
        className="relative w-full h-full cursor-pointer"
        onClick={handleDragonTap}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/50 to-transparent" />
        
        {/* Dragon */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className={`text-8xl transition-all duration-300 ${
            isBossBattle ? 'animate-pulse scale-125' : 'hover:scale-110'
          }`}>
            {dragon.evolution === 'adult' ? '??' : 
             dragon.evolution === 'teen' ? '??' : '??'}
          </div>
          
          {/* Dragon Health Bar */}
          <div className="mt-4 w-32 h-2 bg-gray-700 rounded-full mx-auto">
            <div 
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${(dragon.health / dragon.maxHealth) * 100}%` }}
            />
          </div>
          
          {/* Dragon Level */}
          <div className="text-center mt-2 text-white font-bold">
            Level {dragon.level}
          </div>
        </div>

        {/* Boss Battle UI */}
        {isBossBattle && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-red-600 text-white px-4 py-2 rounded-lg text-center">
              <div className="text-lg font-bold">BOSS BATTLE!</div>
              <div className="w-48 h-3 bg-gray-700 rounded-full mt-2">
                <div 
                  className="h-full bg-red-500 rounded-full transition-all duration-300"
                  style={{ width: `${bossHealth}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Combo Display */}
        {combo.current > 0 && (
          <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full font-bold">
            {combo.current}x COMBO! x{combo.multiplier}
          </div>
        )}

        {/* Power-ups Display */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          {powerUps.map(powerUp => (
            <div 
              key={powerUp.id}
              className={`px-3 py-1 rounded-full text-white font-bold ${
                powerUp.type === 'fire' ? 'bg-red-500' :
                powerUp.type === 'lightning' ? 'bg-yellow-500' :
                powerUp.type === 'ice' ? 'bg-blue-500' : 'bg-purple-500'
              }`}
            >
              {powerUp.type.toUpperCase()} x{powerUp.multiplier}
            </div>
          ))}
        </div>

        {/* Score Display */}
        <div className="absolute top-4 left-4 bg-black/50 text-white px-4 py-2 rounded-lg">
          <div className="text-2xl font-bold">{score.toLocaleString()}</div>
          <div className="text-sm">Time: {Math.floor(gameTime / 10)}s</div>
        </div>

        {/* Particles */}
        {particles.map(particle => (
          <div
            key={particle.id}
            className={`absolute w-2 h-2 rounded-full pointer-events-none ${
              particle.type === 'gold' ? 'bg-yellow-400' : 'bg-orange-400'
            }`}
            style={{
              left: particle.x,
              top: particle.y,
              opacity: particle.life / particle.maxLife,
              transform: `scale(${particle.life / particle.maxLife})`
            }}
          />
        ))}

        {/* Game Controls */}
        <div className="absolute bottom-4 right-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-6 py-3 rounded-lg font-bold text-white ${
              isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
        </div>
      </div>
    </div>
  );
}