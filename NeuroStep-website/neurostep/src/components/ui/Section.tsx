'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { forwardRef, HTMLAttributes } from 'react';

interface SectionProps extends HTMLAttributes<HTMLElement> {
  animated?: boolean;
  delay?: number;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  background?: 'none' | 'subtle' | 'glass';
}

const spacingVariants = {
  sm: 'py-4 px-4',
  md: 'py-6 px-6',
  lg: 'py-8 px-8',
  xl: 'py-12 px-12'
};

const backgroundVariants = {
  none: '',
  subtle: 'bg-background/20',
  glass: 'glass backdrop-blur-xl bg-background/30 border border-purple-500/10 rounded-lg'
};

export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ 
    className, 
    animated = false,
    delay = 0,
    spacing = 'md',
    background = 'none',
    children, 
    ...props 
  }, ref) => {
    const spacingClass = spacingVariants[spacing];
    const backgroundClass = backgroundVariants[background];

    const Component = animated ? motion.section : 'section';
    const animationProps = animated ? {
      initial: { opacity: 0, y: 30 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5, delay }
    } : {};

    const { onAnimationStart, onAnimationEnd, onDrag, onDragStart, onDragEnd, ...restProps } = props;
    
    return (
      <Component
        ref={ref}
        className={cn(
          spacingClass,
          backgroundClass,
          'transition-all duration-300',
          className
        )}
        {...animationProps}
        {...restProps}
      >
        {children}
      </Component>
    );
  }
);

Section.displayName = 'Section';