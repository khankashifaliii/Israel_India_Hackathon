'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'purple' | 'cyan' | 'lime' | 'orange' | 'red';
  className?: string;
  animated?: boolean;
  delay?: number;
}

const colorVariants = {
  purple: {
    border: 'border-purple-500/20',
    glow: 'shadow-sm',
    icon: 'text-purple-400',
    value: 'text-purple-400'
  },
  cyan: {
    border: 'border-cyan-500/20',
    glow: 'shadow-sm',
    icon: 'text-cyan-400',
    value: 'text-cyan-400'
  },
  lime: {
    border: 'border-lime-500/20',
    glow: 'shadow-sm',
    icon: 'text-lime-400',
    value: 'text-lime-400'
  },
  orange: {
    border: 'border-orange-500/20',
    glow: 'shadow-sm',
    icon: 'text-orange-400',
    value: 'text-orange-400'
  },
  red: {
    border: 'border-red-500/20',
    glow: 'shadow-sm',
    icon: 'text-red-400',
    value: 'text-red-400'
  }
};

export function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  color = 'purple',
  className,
  animated = true,
  delay = 0
}: StatCardProps) {
  const colorClasses = colorVariants[color];
  
  const CardComponent = animated ? motion.div : 'div';
  const animationProps = animated ? {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.5, delay },
    whileHover: { scale: 1.02, y: -2 },
    whileTap: { scale: 0.98 }
  } : {};

  return (
    <CardComponent
      className={cn('group cursor-pointer', className)}
      {...animationProps}
    >
      <Card className={cn(
        'glass backdrop-blur-xl bg-background/30 transition-all duration-300',
        colorClasses.border,
        colorClasses.glow,
        'hover:bg-background/40 hover:border-opacity-40'
      )}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {title}
                </p>
                {Icon && (
                  <motion.div
                    initial={animated ? { rotate: -180, opacity: 0 } : false}
                    animate={animated ? { rotate: 0, opacity: 1 } : false}
                    transition={{ duration: 0.5, delay: delay + 0.2 }}
                  >
                    <Icon className={cn('h-5 w-5', colorClasses.icon)} />
                  </motion.div>
                )}
              </div>
              
              <motion.div
                initial={animated ? { scale: 0.8, opacity: 0 } : false}
                animate={animated ? { scale: 1, opacity: 1 } : false}
                transition={{ duration: 0.5, delay: delay + 0.1 }}
                className={cn('text-3xl font-bold mb-1', colorClasses.value)}
              >
                {value}
              </motion.div>
              
              <div className="flex items-center justify-between">
                {description && (
                  <p className="text-xs text-muted-foreground">
                    {description}
                  </p>
                )}
                
                {trend && (
                  <motion.div
                    initial={animated ? { x: 10, opacity: 0 } : false}
                    animate={animated ? { x: 0, opacity: 1 } : false}
                    transition={{ duration: 0.5, delay: delay + 0.3 }}
                    className={cn(
                      'text-xs font-medium flex items-center',
                      trend.isPositive ? 'text-lime-400' : 'text-red-400'
                    )}
                  >
                    <span className="mr-1">
                      {trend.isPositive ? '↗' : '↘'}
                    </span>
                    {Math.abs(trend.value)}%
                  </motion.div>
                )}
              </div>
            </div>
          </div>
          
          {/* Subtle hover effect */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </CardContent>
      </Card>
    </CardComponent>
  );
}