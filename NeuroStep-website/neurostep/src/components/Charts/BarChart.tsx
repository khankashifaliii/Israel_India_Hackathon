'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  title?: string;
  description?: string;
  data: DataPoint[];
  color?: 'purple' | 'cyan' | 'lime' | 'orange' | 'red';
  height?: number;
  className?: string;
  animated?: boolean;
  showGrid?: boolean;
  showValues?: boolean;
  orientation?: 'vertical' | 'horizontal';
}

const colorVariants = {
  purple: {
    bar: 'bg-gradient-to-t from-purple-600 to-purple-400',
    glow: 'shadow-purple-500/10'
  },
  cyan: {
    bar: 'bg-gradient-to-t from-cyan-600 to-cyan-400',
    glow: 'shadow-cyan-500/10'
  },
  lime: {
    bar: 'bg-gradient-to-t from-lime-600 to-lime-400',
    glow: 'shadow-lime-500/10'
  },
  orange: {
    bar: 'bg-gradient-to-t from-orange-600 to-orange-400',
    glow: 'shadow-orange-500/10'
  },
  red: {
    bar: 'bg-gradient-to-t from-red-600 to-red-400',
    glow: 'shadow-red-500/10'
  }
};

export function BarChart({ 
  title,
  description,
  data, 
  color = 'purple',
  height = 200,
  className,
  animated = true,
  showGrid = true,
  showValues = true,
  orientation = 'vertical'
}: BarChartProps) {
  const colorClasses = colorVariants[color];
  
  if (!data || data.length === 0) {
    return (
      <Card className={cn('bg-white border-slate-200 shadow-sm', className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  return (
    <motion.div
      initial={animated ? { opacity: 0, y: 20 } : false}
      animate={animated ? { opacity: 1, y: 0 } : false}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={className}
    >
      <Card className={cn('bg-white border-slate-200 shadow-sm')}>
        {(title || description) && (
          <CardHeader>
            {title && (
              <CardTitle className="text-foreground flex items-center">
                {title}
              </CardTitle>
            )}
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </CardHeader>
        )}
        <CardContent className="p-6">
          <div className="relative" style={{ height: `${height}px` }}>
            {orientation === 'vertical' ? (
              <div className="flex items-end justify-between h-full space-x-2">
                {data.map((item, index) => {
                  const barHeight = ((item.value - minValue) / range) * (height - 40);
                  
                  return (
                    <div key={item.label} className="flex flex-col items-center flex-1">
                      <div className="relative flex-1 flex items-end w-full">
                        {/* Grid lines */}
                        {showGrid && index === 0 && (
                          <div className="absolute inset-0 flex flex-col justify-between opacity-20">
                            {[0, 0.25, 0.5, 0.75, 1].map((ratio, gridIndex) => (
                              <div
                                key={`grid-${gridIndex}`}
                                className="w-full border-t border-current"
                              />
                            ))}
                          </div>
                        )}
                        
                        {/* Bar */}
                        <motion.div
                          className={cn(
                            'w-full rounded-t-md relative overflow-hidden',
                            item.color || colorClasses.bar,
                            colorClasses.glow
                          )}
                          initial={animated ? { height: 0, opacity: 0 } : { height: barHeight }}
                          animate={{ height: barHeight, opacity: 1 }}
                          transition={{ 
                            duration: 0.8, 
                            delay: animated ? index * 0.1 + 0.3 : 0, 
                            ease: 'easeOut' 
                          }}
                          whileHover={{ scale: 1.05, y: -2 }}
                        >
                          {/* Shimmer effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
                          
                          {/* Value label */}
                          {showValues && (
                            <motion.div
                              initial={animated ? { opacity: 0, scale: 0.8 } : false}
                              animate={animated ? { opacity: 1, scale: 1 } : false}
                              transition={{ duration: 0.3, delay: index * 0.1 + 0.8 }}
                              className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-foreground"
                            >
                              {item.value}
                            </motion.div>
                          )}
                        </motion.div>
                      </div>
                      
                      {/* Label */}
                      <motion.div
                        initial={animated ? { opacity: 0, y: 10 } : false}
                        animate={animated ? { opacity: 1, y: 0 } : false}
                        transition={{ duration: 0.3, delay: index * 0.05 + 1 }}
                        className="mt-2 text-xs text-muted-foreground text-center truncate w-full"
                        title={item.label}
                      >
                        {item.label}
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Horizontal orientation
              <div className="flex flex-col justify-between h-full space-y-2">
                {data.map((item, index) => {
                  const barWidth = ((item.value - minValue) / range) * 100;
                  
                  return (
                    <div key={item.label} className="flex items-center space-x-3">
                      <div className="w-20 text-xs text-muted-foreground text-right truncate" title={item.label}>
                        {item.label}
                      </div>
                      
                      <div className="flex-1 relative">
                        {/* Background bar */}
                        <div className="w-full h-6 bg-background/20 rounded-md" />
                        
                        {/* Value bar */}
                        <motion.div
                          className={cn(
                            'absolute top-0 left-0 h-6 rounded-md overflow-hidden',
                            item.color || colorClasses.bar,
                            colorClasses.glow
                          )}
                          initial={animated ? { width: 0, opacity: 0 } : { width: `${barWidth}%` }}
                          animate={{ width: `${barWidth}%`, opacity: 1 }}
                          transition={{ 
                            duration: 0.8, 
                            delay: animated ? index * 0.1 + 0.3 : 0, 
                            ease: 'easeOut' 
                          }}
                          whileHover={{ scale: 1.02 }}
                        >
                          {/* Shimmer effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
                        </motion.div>
                        
                        {/* Value label */}
                        {showValues && (
                          <motion.div
                            initial={animated ? { opacity: 0, scale: 0.8 } : false}
                            animate={animated ? { opacity: 1, scale: 1 } : false}
                            transition={{ duration: 0.3, delay: index * 0.1 + 0.8 }}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-medium text-foreground"
                          >
                            {item.value}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}