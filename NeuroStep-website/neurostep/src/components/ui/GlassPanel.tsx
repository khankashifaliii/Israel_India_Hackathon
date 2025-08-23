'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { forwardRef, HTMLAttributes } from 'react';

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  glowColor?: 'purple' | 'cyan' | 'lime' | 'orange' | 'red' | 'none';
  intensity?: 'low' | 'medium' | 'high';
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
}

const glowVariants = {
  purple: {
    low: 'border-purple-500/20 shadow-purple-500/10',
    medium: 'border-purple-500/30 shadow-purple-500/20 neon-glow',
    high: 'border-purple-500/50 shadow-purple-500/30 neon-glow'
  },
  cyan: {
    low: 'border-cyan-500/20 shadow-cyan-500/10',
    medium: 'border-cyan-500/30 shadow-cyan-500/20 neon-glow',
    high: 'border-cyan-500/50 shadow-cyan-500/30 neon-glow'
  },
  lime: {
    low: 'border-lime-500/20 shadow-lime-500/10',
    medium: 'border-lime-500/30 shadow-lime-500/20 neon-glow',
    high: 'border-lime-500/50 shadow-lime-500/30 neon-glow'
  },
  orange: {
    low: 'border-orange-500/20 shadow-orange-500/10',
    medium: 'border-orange-500/30 shadow-orange-500/20 neon-glow',
    high: 'border-orange-500/50 shadow-orange-500/30 neon-glow'
  },
  red: {
    low: 'border-red-500/20 shadow-red-500/10',
    medium: 'border-red-500/30 shadow-red-500/20 neon-glow',
    high: 'border-red-500/50 shadow-red-500/30 neon-glow'
  },
  none: {
    low: 'border-gray-500/10',
    medium: 'border-gray-500/20',
    high: 'border-gray-500/30'
  }
};

const blurVariants = {
  sm: 'backdrop-blur-sm',
  md: 'backdrop-blur-md',
  lg: 'backdrop-blur-lg',
  xl: 'backdrop-blur-xl'
};

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ 
    className, 
    glowColor = 'purple', 
    intensity = 'medium', 
    blur = 'xl',
    animated = false,
    children, 
    ...props 
  }, ref) => {
    const glowClass = glowVariants[glowColor][intensity];
    const blurClass = blurVariants[blur];

    const Component = animated ? motion.div : 'div';
    const animationProps = animated ? {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3 }
    } : {};

    return (
      <Component
        ref={ref}
        className={cn(
          'glass relative rounded-lg border bg-background/30',
          blurClass,
          glowClass,
          'transition-all duration-300',
          className
        )}
        {...animationProps}
        {...(animated ? (({ onAnimationStart, onAnimationEnd, onDrag, onDragStart, onDragEnd, ...rest }) => rest)(props) : props)}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/5 via-transparent to-black/5 pointer-events-none" />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
        
        {/* Animated border effect */}
        {glowColor !== 'none' && (
          <div className="absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className={cn(
              'absolute inset-0 rounded-lg',
              `bg-gradient-to-r from-${glowColor}-500/0 via-${glowColor}-500/10 to-${glowColor}-500/0`,
              'animate-pulse'
            )} />
          </div>
        )}
      </Component>
    );
  }
);

GlassPanel.displayName = 'GlassPanel';