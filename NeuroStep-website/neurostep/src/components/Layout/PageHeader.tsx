'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  className?: string;
  animated?: boolean;
}

export function PageHeader({ 
  title, 
  description, 
  icon: Icon, 
  actions, 
  className,
  animated = true 
}: PageHeaderProps) {
  const HeaderComponent = animated ? motion.div : 'div';
  const animationProps = animated ? {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  } : {};

  return (
    <HeaderComponent
      className={cn('mb-8', className)}
      {...animationProps}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {Icon && (
            <motion.div
              initial={animated ? { scale: 0, rotate: -180 } : false}
              animate={animated ? { scale: 1, rotate: 0 } : false}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md"
            >
              <Icon className="h-6 w-6 text-white" />
            </motion.div>
          )}
          
          <div>
            <motion.h1 
              initial={animated ? { opacity: 0, x: -20 } : false}
              animate={animated ? { opacity: 1, x: 0 } : false}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl font-heading font-bold text-black mb-2"
            >
              {title}
            </motion.h1>
            
            {description && (
              <motion.p 
                initial={animated ? { opacity: 0, x: -20 } : false}
                animate={animated ? { opacity: 1, x: 0 } : false}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-muted-foreground max-w-2xl"
              >
                {description}
              </motion.p>
            )}
          </div>
        </div>
        
        {actions && (
          <motion.div
            initial={animated ? { opacity: 0, x: 20 } : false}
            animate={animated ? { opacity: 1, x: 0 } : false}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center space-x-3"
          >
            {actions}
          </motion.div>
        )}
      </div>
    </HeaderComponent>
  );
}