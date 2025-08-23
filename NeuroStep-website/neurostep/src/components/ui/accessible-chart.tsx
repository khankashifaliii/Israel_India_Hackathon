'use client';

import React, { useId, useRef, useEffect } from 'react';
import { chartA11y, aria } from '@/lib/accessibility';
import { cn } from '@/lib/utils';

interface AccessibleChartProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  data: any[];
  type: 'line' | 'bar' | 'pie' | 'area';
  headers?: string[];
  className?: string;
  summary?: string;
  onDataFocus?: (dataPoint: any, index: number) => void;
}

const AccessibleChart: React.FC<AccessibleChartProps> = ({
  children,
  title,
  description,
  data,
  type,
  headers = ['Label', 'Value'],
  className,
  summary,
  onDataFocus
}) => {
  const chartId = useId();
  const descriptionId = useId();
  const tableId = useId();
  const chartRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // Generate automatic description if not provided
  const autoDescription = description || chartA11y.generateDescription(data, type, title);
  const finalSummary = summary || `Interactive ${type} chart showing ${title.toLowerCase()}. Use arrow keys to navigate data points.`;

  useEffect(() => {
    // Create data table for screen readers
    if (tableRef.current && data.length > 0) {
      const table = chartA11y.generateDataTable(data, headers);
      table.id = tableId;
      table.setAttribute('aria-label', `Data table for ${title}`);
      
      // Clear existing table and append new one
      tableRef.current.innerHTML = '';
      tableRef.current.appendChild(table);
    }
  }, [data, headers, title, tableId]);

  const handleKeyDown = (event: KeyboardEvent) => {
    // Handle keyboard navigation for chart data points
    if (!onDataFocus || data.length === 0) return;

    const currentIndex = parseInt(chartRef.current?.getAttribute('data-current-index') || '0');
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        newIndex = currentIndex < data.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : data.length - 1;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = data.length - 1;
        break;
      default:
        return;
    }

    if (newIndex !== currentIndex) {
      chartRef.current?.setAttribute('data-current-index', newIndex.toString());
      onDataFocus(data[newIndex], newIndex);
      
      // Announce the data point
      const dataPoint = data[newIndex];
      const announcement = `Data point ${newIndex + 1} of ${data.length}: ${JSON.stringify(dataPoint)}`;
      
      // Create live region for announcement
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.textContent = announcement;
      
      document.body.appendChild(liveRegion);
      setTimeout(() => document.body.removeChild(liveRegion), 1000);
    }
  };

  useEffect(() => {
    const chartElement = chartRef.current;
    if (chartElement && onDataFocus) {
      chartElement.addEventListener('keydown', handleKeyDown as any);
      return () => chartElement.removeEventListener('keydown', handleKeyDown as any);
    }
  }, [data, onDataFocus]);

  return (
    <div className={cn('relative', className)}>
      {/* Chart title */}
      <h3 id={chartId} className="text-lg font-semibold mb-2 text-foreground">
        {title}
      </h3>
      
      {/* Chart description */}
      <p id={descriptionId} className="sr-only">
        {autoDescription}
      </p>
      
      {/* Chart summary for screen readers */}
      <div className="sr-only" aria-live="polite">
        {finalSummary}
      </div>
      
      {/* Interactive chart container */}
      <div
        ref={chartRef}
        className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
        role="img"
        aria-labelledby={chartId}
        aria-describedby={descriptionId}
        tabIndex={onDataFocus ? 0 : -1}
        data-current-index="0"
        {...(onDataFocus && {
          'aria-label': `Interactive ${type} chart. Use arrow keys to navigate data points.`,
          onFocus: () => onDataFocus(data[0], 0)
        })}
      >
        {children}
      </div>
      
      {/* Data table for screen readers */}
      <div ref={tableRef} className="sr-only" />
      
      {/* Chart instructions for screen readers */}
      {onDataFocus && (
        <div className="sr-only">
          <p>Chart navigation instructions:</p>
          <ul>
            <li>Use arrow keys to navigate between data points</li>
            <li>Press Home to go to the first data point</li>
            <li>Press End to go to the last data point</li>
            <li>Data values will be announced as you navigate</li>
          </ul>
        </div>
      )}
    </div>
  );
};

// Accessible chart data point component
interface ChartDataPointProps {
  value: any;
  label?: string;
  index: number;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

const ChartDataPoint: React.FC<ChartDataPointProps> = ({
  value,
  label,
  index,
  isActive,
  onClick,
  className
}) => {
  const pointId = useId();
  
  return (
    <g
      className={cn(
        'focus:outline-none',
        isActive && 'opacity-100',
        !isActive && 'opacity-70',
        className
      )}
      role="button"
      tabIndex={0}
      aria-label={aria.label('Data point', label || `${index + 1}`, `value ${value}`)}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Visual indicator for active state */}
      {isActive && (
        <circle
          cx="0"
          cy="0"
          r="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="animate-pulse"
        />
      )}
    </g>
  );
};

// Chart legend with accessibility support
interface ChartLegendProps {
  items: Array<{
    label: string;
    color: string;
    value?: string | number;
  }>;
  className?: string;
}

const ChartLegend: React.FC<ChartLegendProps> = ({ items, className }) => {
  const legendId = useId();
  
  return (
    <div
      className={cn('flex flex-wrap gap-4 mt-4', className)}
      role="list"
      aria-labelledby={`${legendId}-title`}
    >
      <h4 id={`${legendId}-title`} className="sr-only">
        Chart Legend
      </h4>
      {items.map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-2"
          role="listitem"
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: item.color }}
            aria-hidden="true"
          />
          <span className="text-sm text-muted-foreground">
            {item.label}
            {item.value && (
              <span className="ml-1 font-medium text-foreground">
                {item.value}
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
};

// Chart loading state with accessibility
const ChartLoadingState: React.FC<{ title: string; className?: string }> = ({ 
  title, 
  className 
}) => {
  return (
    <div 
      className={cn('flex items-center justify-center p-8', className)}
      role="status"
      aria-label={`Loading ${title} chart`}
    >
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      <span className="sr-only">Loading {title} chart data...</span>
    </div>
  );
};

// Chart error state with accessibility
const ChartErrorState: React.FC<{ 
  title: string; 
  error?: string; 
  onRetry?: () => void;
  className?: string;
}> = ({ title, error, onRetry, className }) => {
  return (
    <div 
      className={cn('flex flex-col items-center justify-center p-8 text-center', className)}
      role="alert"
      aria-live="assertive"
    >
      <p className="text-muted-foreground mb-2">
        Failed to load {title} chart
      </p>
      {error && (
        <p className="text-sm text-red-500 mb-4">
          {error}
        </p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label={`Retry loading ${title} chart`}
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export {
  AccessibleChart,
  ChartDataPoint,
  ChartLegend,
  ChartLoadingState,
  ChartErrorState
};