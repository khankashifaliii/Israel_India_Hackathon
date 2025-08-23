'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

type ButtonProps = React.ComponentProps<typeof Button>;

interface GlowButtonProps extends ButtonProps {
  glowColor?: 'purple' | 'cyan' | 'lime' | 'orange' | 'red';
  intensity?: 'low' | 'medium' | 'high';
}

const glowVariants = {
  purple: {
    low: 'shadow-purple-500/20 hover:shadow-purple-500/40',
    medium: 'shadow-purple-500/30 hover:shadow-purple-500/60 neon-glow-purple',
    high: 'shadow-purple-500/50 hover:shadow-purple-500/80 neon-glow-purple'
  },
  cyan: {
    low: 'shadow-cyan-500/20 hover:shadow-cyan-500/40',
    medium: 'shadow-cyan-500/30 hover:shadow-cyan-500/60 neon-glow-cyan',
    high: 'shadow-cyan-500/50 hover:shadow-cyan-500/80 neon-glow-cyan'
  },
  lime: {
    low: 'shadow-lime-500/20 hover:shadow-lime-500/40',
    medium: 'shadow-lime-500/30 hover:shadow-lime-500/60 neon-glow-lime',
    high: 'shadow-lime-500/50 hover:shadow-lime-500/80 neon-glow-lime'
  },
  orange: {
    low: 'shadow-orange-500/20 hover:shadow-orange-500/40',
    medium: 'shadow-orange-500/30 hover:shadow-orange-500/60 neon-glow-orange',
    high: 'shadow-orange-500/50 hover:shadow-orange-500/80 neon-glow-orange'
  },
  red: {
    low: 'shadow-red-500/20 hover:shadow-red-500/40',
    medium: 'shadow-red-500/30 hover:shadow-red-500/60 neon-glow-red',
    high: 'shadow-red-500/50 hover:shadow-red-500/80 neon-glow-red'
  }
};

export const GlowButton = forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ className, glowColor = 'purple', intensity = 'medium', children, ...props }, ref) => {
    const glowClass = glowVariants[glowColor][intensity];

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
      >
        <Button
          ref={ref}
          className={cn(
            'relative overflow-hidden transition-all duration-300',
            'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent',
            'before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700',
            glowClass,
            className
          )}
          {...props}
        >
          <span className="relative z-10">{children}</span>
        </Button>
      </motion.div>
    );
  }
);

GlowButton.displayName = 'GlowButton';