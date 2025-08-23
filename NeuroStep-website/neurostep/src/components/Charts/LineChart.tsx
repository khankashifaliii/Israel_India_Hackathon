'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  title?: string;
  description?: string;
  data: DataPoint[];
  color?: 'purple' | 'cyan' | 'lime' | 'orange' | 'red';
  height?: number;
  className?: string;
  animated?: boolean;
  showGrid?: boolean;
  showDots?: boolean;
}

const colorVariants = {
  purple: {
    line: 'stroke-purple-400',
    fill: 'fill-purple-400/20',
    dot: 'fill-purple-400',
    glow: 'drop-shadow-[0_0_2px_rgba(168,85,247,0.2)]'
  },
  cyan: {
    line: 'stroke-cyan-400',
    fill: 'fill-cyan-400/20',
    dot: 'fill-cyan-400',
    glow: 'drop-shadow-[0_0_2px_rgba(34,211,238,0.2)]'
  },
  lime: {
    line: 'stroke-lime-400',
    fill: 'fill-lime-400/20',
    dot: 'fill-lime-400',
    glow: 'drop-shadow-[0_0_2px_rgba(163,230,53,0.2)]'
  },
  orange: {
    line: 'stroke-orange-400',
    fill: 'fill-orange-400/20',
    dot: 'fill-orange-400',
    glow: 'drop-shadow-[0_0_2px_rgba(251,146,60,0.2)]'
  },
  red: {
    line: 'stroke-red-400',
    fill: 'fill-red-400/20',
    dot: 'fill-red-400',
    glow: 'drop-shadow-[0_0_2px_rgba(248,113,113,0.2)]'
  }
};

export function LineChart({ 
  title,
  description,
  data, 
  color = 'purple',
  height = 200,
  className,
  animated = true,
  showGrid = true,
  showDots = true
}: LineChartProps) {
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
  
  const padding = 20;
  const chartWidth = 400;
  const chartHeight = height;
  
  const points = data.map((point, index) => {
    const x = padding + (index / (data.length - 1)) * (chartWidth - 2 * padding);
    const y = padding + ((maxValue - point.value) / range) * (chartHeight - 2 * padding);
    return { x, y, ...point };
  });
  
  const pathData = points.reduce((path, point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${path} ${command} ${point.x} ${point.y}`;
  }, '');
  
  const areaData = `${pathData} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`;

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
          <div className="relative">
            <svg
              width={chartWidth}
              height={chartHeight}
              className="w-full h-auto"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            >
              {/* Grid lines */}
              {showGrid && (
                <g className="opacity-20">
                  {/* Horizontal grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                    const y = padding + ratio * (chartHeight - 2 * padding);
                    return (
                      <motion.line
                        key={`h-grid-${index}`}
                        x1={padding}
                        y1={y}
                        x2={chartWidth - padding}
                        y2={y}
                        stroke="currentColor"
                        strokeWidth="1"
                        initial={animated ? { pathLength: 0 } : false}
                        animate={animated ? { pathLength: 1 } : false}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      />
                    );
                  })}
                  
                  {/* Vertical grid lines */}
                  {points.map((point, index) => (
                    <motion.line
                      key={`v-grid-${index}`}
                      x1={point.x}
                      y1={padding}
                      x2={point.x}
                      y2={chartHeight - padding}
                      stroke="currentColor"
                      strokeWidth="1"
                      initial={animated ? { pathLength: 0 } : false}
                      animate={animated ? { pathLength: 1 } : false}
                      transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
                    />
                  ))}
                </g>
              )}
              
              {/* Area fill */}
              <motion.path
                d={areaData}
                className={cn(colorClasses.fill)}
                initial={animated ? { pathLength: 0, opacity: 0 } : false}
                animate={animated ? { pathLength: 1, opacity: 1 } : false}
                transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
              />
              
              {/* Line */}
              <motion.path
                d={pathData}
                fill="none"
                className={cn(colorClasses.line, colorClasses.glow)}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={animated ? { pathLength: 0 } : false}
                animate={animated ? { pathLength: 1 } : false}
                transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
              />
              
              {/* Data points */}
              {showDots && points.map((point, index) => (
                <motion.circle
                  key={`dot-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  className={cn(colorClasses.dot, colorClasses.glow)}
                  initial={animated ? { scale: 0, opacity: 0 } : false}
                  animate={animated ? { scale: 1, opacity: 1 } : false}
                  transition={{ duration: 0.3, delay: 0.8 + index * 0.1, ease: 'easeOut' }}
                />
              ))}
            </svg>
            
            {/* Labels */}
            <div className="flex justify-between mt-4 text-xs text-muted-foreground">
              {data.map((point, index) => (
                <motion.span
                  key={`label-${index}`}
                  initial={animated ? { opacity: 0, y: 10 } : false}
                  animate={animated ? { opacity: 1, y: 0 } : false}
                  transition={{ duration: 0.3, delay: 1 + index * 0.05 }}
                >
                  {point.label}
                </motion.span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}