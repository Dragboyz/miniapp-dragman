'use client';
import { useEffect, useRef, useCallback } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'fire' | 'lightning' | 'ice' | 'gold' | 'combo' | 'explosion';
}

interface VisualEffect {
  id: number;
  x: number;
  y: number;
  type: 'dragon_breath' | 'lightning_strike' | 'ice_shard' | 'golden_spark' | 'combo_burst';
  duration: number;
  particles: Particle[];
}

export default function VisualEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const effectsRef = useRef<VisualEffect[]>([]);
  const animationRef = useRef<number | undefined>(undefined);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;
        particle.vy += 0.1; // gravity
        
        // Draw particle
        const alpha = particle.life / particle.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        return particle.life > 0;
      });

      // Update and draw effects
      effectsRef.current = effectsRef.current.filter(effect => {
        effect.duration--;
        
        // Draw effect based on type
        drawEffect(ctx, effect);
        
        return effect.duration > 0;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Draw different types of effects
  const drawEffect = useCallback((ctx: CanvasRenderingContext2D, effect: VisualEffect) => {
    const alpha = effect.duration / 100;
    
    switch (effect.type) {
      case 'dragon_breath':
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = 'radial-gradient(circle, #ff6b35, #f7931e, #ffd23f)';
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, 50 * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;
        
      case 'lightning_strike':
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 5;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00ffff';
        ctx.beginPath();
        ctx.moveTo(effect.x - 20, effect.y - 50);
        ctx.lineTo(effect.x + 10, effect.y - 20);
        ctx.lineTo(effect.x - 10, effect.y + 10);
        ctx.lineTo(effect.x + 20, effect.y + 40);
        ctx.stroke();
        ctx.restore();
        break;
        
      case 'ice_shard':
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#87ceeb';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#87ceeb';
        ctx.beginPath();
        ctx.moveTo(effect.x, effect.y - 30);
        ctx.lineTo(effect.x - 15, effect.y + 15);
        ctx.lineTo(effect.x + 15, effect.y + 15);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        break;
        
      case 'golden_spark':
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = 'radial-gradient(circle, #ffd700, #ffed4e)';
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#ffd700';
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, 30 * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;
        
      case 'combo_burst':
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#ff00ff';
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI * 2) / 8;
          const x1 = effect.x + Math.cos(angle) * 20;
          const y1 = effect.y + Math.sin(angle) * 20;
          const x2 = effect.x + Math.cos(angle) * 60;
          const y2 = effect.y + Math.sin(angle) * 60;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
        ctx.restore();
        break;
    }
  }, []);

  // Create particle explosion
  const createParticleExplosion = useCallback((
    x: number, 
    y: number, 
    type: Particle['type'] = 'fire',
    count: number = 20
  ) => {
    const colors = {
      fire: ['#ff6b35', '#f7931e', '#ffd23f', '#ff4757'],
      lightning: ['#00ffff', '#ffffff', '#87ceeb'],
      ice: ['#87ceeb', '#b0e0e6', '#ffffff'],
      gold: ['#ffd700', '#ffed4e', '#fff8dc'],
      combo: ['#ff00ff', '#ff69b4', '#ff1493'],
      explosion: ['#ff4757', '#ff6b35', '#ffa502', '#ffd23f']
    };

    for (let i = 0; i < count; i++) {
      const particle: Particle = {
        id: Date.now() + i,
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10 - 5,
        life: 60 + Math.random() * 40,
        maxLife: 100,
        size: 2 + Math.random() * 4,
        color: colors[type][Math.floor(Math.random() * colors[type].length)],
        type
      };
      particlesRef.current.push(particle);
    }
  }, []);

  // Create visual effect
  const createVisualEffect = useCallback((
    x: number,
    y: number,
    type: VisualEffect['type'],
    duration: number = 100
  ) => {
    const effect: VisualEffect = {
      id: Date.now(),
      x,
      y,
      type,
      duration,
      particles: []
    };
    effectsRef.current.push(effect);
  }, []);

  // Dragon breath effect
  const createDragonBreath = useCallback((x: number, y: number) => {
    createVisualEffect(x, y, 'dragon_breath', 80);
    createParticleExplosion(x, y, 'fire', 30);
  }, [createVisualEffect, createParticleExplosion]);

  // Lightning strike effect
  const createLightningStrike = useCallback((x: number, y: number) => {
    createVisualEffect(x, y, 'lightning_strike', 60);
    createParticleExplosion(x, y, 'lightning', 15);
  }, [createVisualEffect, createParticleExplosion]);

  // Ice shard effect
  const createIceShard = useCallback((x: number, y: number) => {
    createVisualEffect(x, y, 'ice_shard', 70);
    createParticleExplosion(x, y, 'ice', 20);
  }, [createVisualEffect, createParticleExplosion]);

  // Golden spark effect
  const createGoldenSpark = useCallback((x: number, y: number) => {
    createVisualEffect(x, y, 'golden_spark', 90);
    createParticleExplosion(x, y, 'gold', 25);
  }, [createVisualEffect, createParticleExplosion]);

  // Combo burst effect
  const createComboBurst = useCallback((x: number, y: number) => {
    createVisualEffect(x, y, 'combo_burst', 120);
    createParticleExplosion(x, y, 'combo', 40);
  }, [createVisualEffect, createParticleExplosion]);

  // Screen shake effect
  const createScreenShake = useCallback((intensity: number = 10) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let shakeX = 0;
    let shakeY = 0;
    let shakeCount = 0;
    const maxShakes = 20;

    const shake = () => {
      if (shakeCount < maxShakes) {
        shakeX = (Math.random() - 0.5) * intensity;
        shakeY = (Math.random() - 0.5) * intensity;
        canvas.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
        shakeCount++;
        requestAnimationFrame(shake);
      } else {
        canvas.style.transform = 'translate(0px, 0px)';
      }
    };

    shake();
  }, []);

  // Expose methods for use in other components
  useEffect(() => {
    (window as any).visualEffects = {
      createDragonBreath,
      createLightningStrike,
      createIceShard,
      createGoldenSpark,
      createComboBurst,
      createScreenShake,
      createParticleExplosion
    };
  }, [
    createDragonBreath,
    createLightningStrike,
    createIceShard,
    createGoldenSpark,
    createComboBurst,
    createScreenShake,
    createParticleExplosion
  ]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      style={{ background: 'transparent' }}
    />
  );
}