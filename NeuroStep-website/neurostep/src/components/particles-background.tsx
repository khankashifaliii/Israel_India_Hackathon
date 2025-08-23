'use client';

import { useEffect, useRef } from 'react';

interface ParticlesBackgroundProps {
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
  dimmed?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  glowIntensity: number;
  pulsePhase: number;
}

const ParticlesBackground: React.FC<ParticlesBackgroundProps> = ({ 
  intensity = 'medium',
  className = 'absolute inset-0 z-0',
  dimmed = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles based on intensity
    const particleCount = {
      low: 40,
      medium: 70,
      high: 100
    }[intensity];

    const colors = [
      '#8B5CF6', // Purple
      '#06B6D4', // Cyan
      '#10B981', // Emerald
      '#F59E0B', // Amber
      '#EF4444', // Red
      '#3B82F6'  // Blue
    ];

    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.6 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        glowIntensity: Math.random() * 0.5 + 0.5,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }
    particlesRef.current = particles;

    const animate = () => {
      timeRef.current += 0.016; // ~60fps
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const dimFactor = dimmed ? 0.3 : 1;

      particles.forEach((particle, i) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges with some randomness
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -0.8;
          particle.vx += (Math.random() - 0.5) * 0.2;
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -0.8;
          particle.vy += (Math.random() - 0.5) * 0.2;
        }

        // Keep particles in bounds
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));

        // Calculate pulsing effect
        const pulse = Math.sin(timeRef.current * 2 + particle.pulsePhase) * 0.3 + 0.7;
        const currentSize = particle.size * pulse;
        const currentOpacity = particle.opacity * pulse * dimFactor;

        // Create glow effect
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, currentSize * 3
        );
        
        // Parse hex color to RGB
        const hex = particle.color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${currentOpacity})`);
        gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${currentOpacity * 0.6})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        // Draw glow
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, currentSize * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw core particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.min(currentOpacity * 1.5, 1)})`;
        ctx.fill();

        // Draw connections with dynamic glow
        particles.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = 120;

          if (distance < maxDistance) {
            const connectionOpacity = (1 - distance / maxDistance) * 0.4 * dimFactor;
            
            // Create gradient for connection line
            const lineGradient = ctx.createLinearGradient(
              particle.x, particle.y,
              otherParticle.x, otherParticle.y
            );
            
            const r1 = parseInt(particle.color.replace('#', '').substr(0, 2), 16);
            const g1 = parseInt(particle.color.replace('#', '').substr(2, 2), 16);
            const b1 = parseInt(particle.color.replace('#', '').substr(4, 2), 16);
            
            const r2 = parseInt(otherParticle.color.replace('#', '').substr(0, 2), 16);
            const g2 = parseInt(otherParticle.color.replace('#', '').substr(2, 2), 16);
            const b2 = parseInt(otherParticle.color.replace('#', '').substr(4, 2), 16);
            
            lineGradient.addColorStop(0, `rgba(${r1}, ${g1}, ${b1}, ${connectionOpacity})`);
            lineGradient.addColorStop(1, `rgba(${r2}, ${g2}, ${b2}, ${connectionOpacity})`);

            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = lineGradient;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
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
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ pointerEvents: 'none' }}
    />
  );
};

export default ParticlesBackground;