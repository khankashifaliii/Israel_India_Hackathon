'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

// Glass panel variants
const glassVariants = {
  default: 'bg-white/10 backdrop-blur-md border border-white/20',
  strong: 'bg-white/20 backdrop-blur-lg border border-white/30',
  subtle: 'bg-white/5 backdrop-blur-sm border border-white/10',
  dark: 'bg-black/10 backdrop-blur-md border border-black/20',
  accent: 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-md border border-blue-500/20',
  success: 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-md border border-green-500/20',
  warning: 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-md border border-yellow-500/20',
  danger: 'bg-gradient-to-br from-red-500/10 to-pink-500/10 backdrop-blur-md border border-red-500/20',
};

interface GlassPanelProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode;
  variant?: keyof typeof glassVariants;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  glow?: boolean;
  animated?: boolean;
}

const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ 
    children, 
    className, 
    variant = 'default', 
    rounded = 'lg', 
    shadow = 'lg', 
    glow = false,
    animated = true,
    ...props 
  }, ref) => {
    const roundedClasses = {
      none: '',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      full: 'rounded-full',
    };

    const shadowClasses = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
      '2xl': 'shadow-2xl',
    };

    const baseClasses = cn(
      'relative overflow-hidden',
      glassVariants[variant],
      roundedClasses[rounded],
      shadowClasses[shadow],
      glow && 'shadow-2xl shadow-blue-500/25',
      'transition-all duration-300 ease-out',
      className
    );

    if (animated) {
      return (
        <motion.div
          ref={ref}
          className={baseClasses}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 0.4, 
            ease: [0.25, 0.46, 0.45, 0.94],
            staggerChildren: 0.1 
          }}
          whileHover={{ 
            scale: 1.02,
            transition: { duration: 0.2 }
          }}
          {...(({ onAnimationStart, onAnimationEnd, onDrag, onDragStart, onDragEnd, ...rest }) => rest)(props)}
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          
          {/* Glow effect */}
          {glow && (
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg blur-lg opacity-75 animate-pulse" />
          )}
          
          {/* Content */}
          <div className="relative z-10">
            {children}
          </div>
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={baseClasses} {...(({ style, onDrag, onDragStart, onDragEnd, onAnimationStart, onAnimationEnd, initial, animate, transition, whileHover, whileTap, whileFocus, whileInView, exit, variants, ...rest }) => ({ ...rest, style: style as React.CSSProperties }))(props)}>
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        
        {/* Glow effect */}
        {glow && (
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg blur-lg opacity-75 animate-pulse" />
        )}
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }
);

GlassPanel.displayName = 'GlassPanel';

// Glass Card component - extends shadcn Card with glass styling
interface GlassCardProps extends GlassPanelProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, header, footer, className, ...props }, ref) => {
    return (
      <GlassPanel
        ref={ref}
        className={cn('p-0', className)}
        {...props}
      >
        {header && (
          <div className="px-6 py-4 border-b border-white/10">
            {header}
          </div>
        )}
        
        <div className="p-6">
          {children}
        </div>
        
        {footer && (
          <div className="px-6 py-4 border-t border-white/10">
            {footer}
          </div>
        )}
      </GlassPanel>
    );
  }
);

GlassCard.displayName = 'GlassCard';

// Glass Button component
interface GlassButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ children, className, variant = 'default', size = 'md', glow = false, ...props }, ref) => {
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    const variantClasses = {
      default: 'bg-white/10 hover:bg-white/20 border-white/20 text-white',
      accent: 'bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/30 text-blue-100',
      success: 'bg-green-500/20 hover:bg-green-500/30 border-green-500/30 text-green-100',
      warning: 'bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/30 text-yellow-100',
      danger: 'bg-red-500/20 hover:bg-red-500/30 border-red-500/30 text-red-100',
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          'relative overflow-hidden backdrop-blur-md border rounded-lg',
          'transition-all duration-200 ease-out',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses[size],
          variantClasses[variant],
          glow && 'shadow-lg shadow-blue-500/25',
          className
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.1 }}
        {...props}
      >
        {/* Glow effect */}
        {glow && (
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-lg blur opacity-75" />
        )}
        
        {/* Content */}
        <span className="relative z-10">
          {children}
        </span>
      </motion.button>
    );
  }
);

GlassButton.displayName = 'GlassButton';

// Utility function to add glass styling to existing components
const glassStyles = {
  panel: (variant: keyof typeof glassVariants = 'default') => glassVariants[variant],
  focus: 'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-transparent',
  hover: 'hover:bg-white/5 transition-colors duration-200',
};

export { GlassPanel, GlassCard, GlassButton, glassStyles };
export type { GlassPanelProps, GlassCardProps, GlassButtonProps };