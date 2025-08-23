'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// Base animated skeleton with shimmer effect
const AnimatedSkeleton: React.FC<{ className?: string; delay?: number; style?: React.CSSProperties }> = ({ 
  className, 
  delay = 0,
  style 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
      style={style}
    >
      <Skeleton className={cn('animate-pulse bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 bg-[length:200%_100%] animate-shimmer', className)} />
    </motion.div>
  );
};

// Chart skeleton components
const ChartSkeleton: React.FC<{ className?: string; height?: number }> = ({ 
  className, 
  height = 300 
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Chart title */}
      <div className="flex items-center justify-between">
        <AnimatedSkeleton className="h-6 w-48" />
        <AnimatedSkeleton className="h-8 w-24" delay={0.1} />
      </div>
      
      {/* Chart area */}
      <div className="relative" style={{ height }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <AnimatedSkeleton key={i} className="h-4 w-8" delay={0.2 + i * 0.05} />
          ))}
        </div>
        
        {/* Chart content */}
        <div className="ml-12 h-full relative">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {Array.from({ length: 5 }).map((_, i) => (
              <AnimatedSkeleton key={i} className="h-px w-full" delay={0.3 + i * 0.02} />
            ))}
          </div>
          
          {/* Chart bars/lines */}
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-4 h-full">
            {Array.from({ length: 8 }).map((_, i) => (
              <AnimatedSkeleton 
                key={i} 
                className="w-8" 
                style={{ height: `${Math.random() * 80 + 20}%` }}
                delay={0.4 + i * 0.05}
              />
            ))}
          </div>
        </div>
        
        {/* X-axis labels */}
        <div className="absolute bottom-0 left-12 right-0 flex justify-between pt-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <AnimatedSkeleton key={i} className="h-4 w-12" delay={0.6 + i * 0.03} />
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center space-x-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-2">
            <AnimatedSkeleton className="h-3 w-3 rounded-full" delay={0.8 + i * 0.1} />
            <AnimatedSkeleton className="h-4 w-16" delay={0.8 + i * 0.1} />
          </div>
        ))}
      </div>
    </div>
  );
};

// Line chart skeleton
const LineChartSkeleton: React.FC<{ className?: string; height?: number }> = ({ 
  className, 
  height = 300 
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <AnimatedSkeleton className="h-6 w-40" />
        <div className="flex space-x-2">
          <AnimatedSkeleton className="h-8 w-20" delay={0.1} />
          <AnimatedSkeleton className="h-8 w-20" delay={0.15} />
        </div>
      </div>
      
      <div className="relative" style={{ height }}>
        {/* Curved line paths */}
        <svg className="absolute inset-0 w-full h-full">
          {Array.from({ length: 3 }).map((_, lineIndex) => (
            <motion.path
              key={lineIndex}
              d={`M 0,${height * 0.3 + lineIndex * 20} Q ${height * 0.25},${height * 0.2} ${height * 0.5},${height * 0.4 + lineIndex * 15} T ${height},${height * 0.6 + lineIndex * 10}`}
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-slate-300"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ 
                duration: 1.5, 
                delay: 0.3 + lineIndex * 0.2,
                ease: "easeInOut" 
              }}
            />
          ))}
        </svg>
        
        {/* Data points */}
        <div className="absolute inset-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-slate-300 rounded-full"
              style={{
                left: `${(i / 5) * 100}%`,
                top: `${30 + Math.random() * 40}%`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8 + i * 0.1, duration: 0.3 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Table skeleton
const TableSkeleton: React.FC<{ 
  className?: string; 
  rows?: number; 
  columns?: number;
  showHeader?: boolean;
}> = ({ 
  className, 
  rows = 5, 
  columns = 4, 
  showHeader = true 
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Table header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <AnimatedSkeleton className="h-6 w-32" />
          <div className="flex space-x-2">
            <AnimatedSkeleton className="h-8 w-24" delay={0.1} />
            <AnimatedSkeleton className="h-8 w-20" delay={0.15} />
          </div>
        </div>
      )}
      
      {/* Search/filter bar */}
      <div className="flex items-center space-x-4">
        <AnimatedSkeleton className="h-10 w-64" delay={0.2} />
        <AnimatedSkeleton className="h-10 w-32" delay={0.25} />
      </div>
      
      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        {/* Table header */}
        <div className="bg-slate-50 border-b">
          <div className="flex items-center px-4 py-3">
            {Array.from({ length: columns }).map((_, i) => (
              <div key={i} className="flex-1 px-2">
                <AnimatedSkeleton className="h-4 w-full" delay={0.3 + i * 0.05} />
              </div>
            ))}
          </div>
        </div>
        
        {/* Table rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="border-b last:border-b-0">
            <div className="flex items-center px-4 py-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="flex-1 px-2">
                  <AnimatedSkeleton 
                    className={cn(
                      'h-4',
                      colIndex === 0 ? 'w-3/4' : colIndex === columns - 1 ? 'w-1/2' : 'w-full'
                    )} 
                    delay={0.4 + rowIndex * 0.1 + colIndex * 0.02} 
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between">
        <AnimatedSkeleton className="h-4 w-32" delay={0.8} />
        <div className="flex space-x-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <AnimatedSkeleton key={i} className="h-8 w-8" delay={0.85 + i * 0.05} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Card skeleton
const CardSkeleton: React.FC<{ className?: string; showHeader?: boolean }> = ({ 
  className, 
  showHeader = true 
}) => {
  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      {showHeader && (
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <AnimatedSkeleton className="h-6 w-48" />
              <AnimatedSkeleton className="h-4 w-64" delay={0.1} />
            </div>
            <AnimatedSkeleton className="h-8 w-24" delay={0.15} />
          </div>
        </div>
      )}
      
      <div className="p-6 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <AnimatedSkeleton className="h-10 w-10 rounded-full" delay={0.2 + i * 0.1} />
            <div className="flex-1 space-y-2">
              <AnimatedSkeleton className="h-4 w-3/4" delay={0.25 + i * 0.1} />
              <AnimatedSkeleton className="h-3 w-1/2" delay={0.3 + i * 0.1} />
            </div>
            <AnimatedSkeleton className="h-6 w-16" delay={0.35 + i * 0.1} />
          </div>
        ))}
      </div>
    </div>
  );
};

// Dashboard skeleton
const DashboardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <AnimatedSkeleton className="h-8 w-64" />
          <AnimatedSkeleton className="h-4 w-96" delay={0.1} />
        </div>
        <AnimatedSkeleton className="h-10 w-32" delay={0.15} />
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <AnimatedSkeleton className="h-4 w-20" delay={0.2 + i * 0.05} />
                <AnimatedSkeleton className="h-8 w-16" delay={0.25 + i * 0.05} />
              </div>
              <AnimatedSkeleton className="h-8 w-8 rounded" delay={0.3 + i * 0.05} />
            </div>
            <div className="mt-4">
              <AnimatedSkeleton className="h-3 w-full" delay={0.35 + i * 0.05} />
            </div>
          </div>
        ))}
      </div>
      
      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton height={400} />
        <TableSkeleton rows={6} columns={3} />
      </div>
    </div>
  );
};

// Profile skeleton
const ProfileSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center space-x-6">
        <AnimatedSkeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2">
          <AnimatedSkeleton className="h-6 w-48" delay={0.1} />
          <AnimatedSkeleton className="h-4 w-32" delay={0.15} />
          <AnimatedSkeleton className="h-4 w-64" delay={0.2} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} showHeader={false} />
        ))}
      </div>
    </div>
  );
};

// List skeleton
const ListSkeleton: React.FC<{ 
  className?: string; 
  items?: number;
  showAvatar?: boolean;
}> = ({ 
  className, 
  items = 5, 
  showAvatar = true 
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          {showAvatar && (
            <AnimatedSkeleton className="h-12 w-12 rounded-full" delay={i * 0.1} />
          )}
          <div className="flex-1 space-y-2">
            <AnimatedSkeleton className="h-4 w-3/4" delay={0.05 + i * 0.1} />
            <AnimatedSkeleton className="h-3 w-1/2" delay={0.1 + i * 0.1} />
          </div>
          <AnimatedSkeleton className="h-8 w-20" delay={0.15 + i * 0.1} />
        </div>
      ))}
    </div>
  );
};

export {
  AnimatedSkeleton,
  ChartSkeleton,
  LineChartSkeleton,
  TableSkeleton,
  CardSkeleton,
  DashboardSkeleton,
  ProfileSkeleton,
  ListSkeleton,
};