'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

// Performance metrics interface
interface PerformanceMetrics {
  cls: number | null;
  fid: number | null;
  fcp: number | null;
  lcp: number | null;
  ttfb: number | null;
  renderTime: number | null;
  memoryUsage: number | null;
}

// Component performance tracking
interface ComponentPerformance {
  name: string;
  renderCount: number;
  averageRenderTime: number;
  lastRenderTime: number;
  totalRenderTime: number;
}

// Performance thresholds (Google's recommended values)
const PERFORMANCE_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
};

// Hook for tracking Core Web Vitals
export function useWebVitals() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cls: null,
    fid: null,
    fcp: null,
    lcp: null,
    ttfb: null,
    renderTime: null,
    memoryUsage: null,
  });

  useEffect(() => {
    // Track Core Web Vitals
    onCLS((metric) => {
      setMetrics(prev => ({ ...prev, cls: metric.value }));
    });

    onFID((metric) => {
      setMetrics(prev => ({ ...prev, fid: metric.value }));
    });

    onFCP((metric) => {
      setMetrics(prev => ({ ...prev, fcp: metric.value }));
    });

    onLCP((metric) => {
      setMetrics(prev => ({ ...prev, lcp: metric.value }));
    });

    onTTFB((metric) => {
      setMetrics(prev => ({ ...prev, ttfb: metric.value }));
    });

    // Track memory usage if available
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / 1024 / 1024, // Convert to MB
        }));
      }
    };

    updateMemoryUsage();
    const memoryInterval = setInterval(updateMemoryUsage, 5000);

    return () => clearInterval(memoryInterval);
  }, []);

  // Get performance score based on thresholds
  const getPerformanceScore = useCallback(() => {
    let score = 0;
    let totalMetrics = 0;

    if (metrics.lcp !== null) {
      totalMetrics++;
      if (metrics.lcp <= PERFORMANCE_THRESHOLDS.LCP.good) score += 100;
      else if (metrics.lcp <= PERFORMANCE_THRESHOLDS.LCP.poor) score += 50;
    }

    if (metrics.fid !== null) {
      totalMetrics++;
      if (metrics.fid <= PERFORMANCE_THRESHOLDS.FID.good) score += 100;
      else if (metrics.fid <= PERFORMANCE_THRESHOLDS.FID.poor) score += 50;
    }

    if (metrics.cls !== null) {
      totalMetrics++;
      if (metrics.cls <= PERFORMANCE_THRESHOLDS.CLS.good) score += 100;
      else if (metrics.cls <= PERFORMANCE_THRESHOLDS.CLS.poor) score += 50;
    }

    if (metrics.fcp !== null) {
      totalMetrics++;
      if (metrics.fcp <= PERFORMANCE_THRESHOLDS.FCP.good) score += 100;
      else if (metrics.fcp <= PERFORMANCE_THRESHOLDS.FCP.poor) score += 50;
    }

    if (metrics.ttfb !== null) {
      totalMetrics++;
      if (metrics.ttfb <= PERFORMANCE_THRESHOLDS.TTFB.good) score += 100;
      else if (metrics.ttfb <= PERFORMANCE_THRESHOLDS.TTFB.poor) score += 50;
    }

    return totalMetrics > 0 ? Math.round(score / totalMetrics) : 0;
  }, [metrics]);

  return {
    metrics,
    score: getPerformanceScore(),
    thresholds: PERFORMANCE_THRESHOLDS,
  };
}

// Hook for tracking component render performance
export function useRenderPerformance(componentName: string) {
  const renderStartTime = useRef<number>(0);
  const [performance, setPerformance] = useState<ComponentPerformance>({
    name: componentName,
    renderCount: 0,
    averageRenderTime: 0,
    lastRenderTime: 0,
    totalRenderTime: 0,
  });

  // Start timing before render
  const startTiming = useCallback(() => {
    renderStartTime.current = window.performance.now();
  }, []);

  // End timing after render
  const endTiming = useCallback(() => {
    if (renderStartTime.current > 0) {
      const renderTime = window.performance.now() - renderStartTime.current;
      
      setPerformance(prev => {
        const newRenderCount = prev.renderCount + 1;
        const newTotalRenderTime = prev.totalRenderTime + renderTime;
        
        return {
          ...prev,
          renderCount: newRenderCount,
          lastRenderTime: renderTime,
          totalRenderTime: newTotalRenderTime,
          averageRenderTime: newTotalRenderTime / newRenderCount,
        };
      });
      
      renderStartTime.current = 0;
    }
  }, []);

  // Auto-track render performance
  useEffect(() => {
    startTiming();
    return () => {
      endTiming();
    };
  });

  return {
    performance,
    startTiming,
    endTiming,
  };
}

// Hook for tracking network performance
export function useNetworkPerformance() {
  const [networkInfo, setNetworkInfo] = useState<{
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  } | null>(null);

  useEffect(() => {
    const updateNetworkInfo = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        setNetworkInfo({
          effectiveType: connection.effectiveType || 'unknown',
          downlink: connection.downlink || 0,
          rtt: connection.rtt || 0,
          saveData: connection.saveData || false,
        });
      }
    };

    updateNetworkInfo();

    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', updateNetworkInfo);
      
      return () => {
        connection.removeEventListener('change', updateNetworkInfo);
      };
    }
  }, []);

  return networkInfo;
}

// Hook for performance budgets and alerts
export function usePerformanceBudget(budgets: {
  maxRenderTime?: number;
  maxMemoryUsage?: number;
  maxBundleSize?: number;
}) {
  const [violations, setViolations] = useState<string[]>([]);
  const { metrics } = useWebVitals();
  const networkInfo = useNetworkPerformance();

  useEffect(() => {
    const newViolations: string[] = [];

    // Check render time budget
    if (budgets.maxRenderTime && metrics.renderTime && metrics.renderTime > budgets.maxRenderTime) {
      newViolations.push(`Render time exceeded budget: ${metrics.renderTime.toFixed(2)}ms > ${budgets.maxRenderTime}ms`);
    }

    // Check memory usage budget
    if (budgets.maxMemoryUsage && metrics.memoryUsage && metrics.memoryUsage > budgets.maxMemoryUsage) {
      newViolations.push(`Memory usage exceeded budget: ${metrics.memoryUsage.toFixed(2)}MB > ${budgets.maxMemoryUsage}MB`);
    }

    // Check LCP budget
    if (metrics.lcp && metrics.lcp > PERFORMANCE_THRESHOLDS.LCP.poor) {
      newViolations.push(`LCP is poor: ${metrics.lcp.toFixed(2)}ms > ${PERFORMANCE_THRESHOLDS.LCP.poor}ms`);
    }

    // Check CLS budget
    if (metrics.cls && metrics.cls > PERFORMANCE_THRESHOLDS.CLS.poor) {
      newViolations.push(`CLS is poor: ${metrics.cls.toFixed(3)} > ${PERFORMANCE_THRESHOLDS.CLS.poor}`);
    }

    // Check FID budget
    if (metrics.fid && metrics.fid > PERFORMANCE_THRESHOLDS.FID.poor) {
      newViolations.push(`FID is poor: ${metrics.fid.toFixed(2)}ms > ${PERFORMANCE_THRESHOLDS.FID.poor}ms`);
    }

    setViolations(newViolations);
  }, [metrics, budgets]);

  return {
    violations,
    hasViolations: violations.length > 0,
    networkInfo,
  };
}

// Hook for resource loading performance
export function useResourcePerformance() {
  const [resources, setResources] = useState<PerformanceResourceTiming[]>([]);
  const [slowResources, setSlowResources] = useState<PerformanceResourceTiming[]>([]);

  useEffect(() => {
    const updateResources = () => {
      const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      setResources(entries);
      
      // Find slow resources (>1s load time)
      const slow = entries.filter(entry => entry.duration > 1000);
      setSlowResources(slow);
    };

    updateResources();

    // Update periodically
    const interval = setInterval(updateResources, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const getResourceStats = useCallback(() => {
    const totalSize = resources.reduce((sum, resource) => {
      return sum + (resource.transferSize || 0);
    }, 0);

    const averageLoadTime = resources.length > 0 
      ? resources.reduce((sum, resource) => sum + resource.duration, 0) / resources.length
      : 0;

    const resourceTypes = resources.reduce((acc, resource) => {
      const type = getResourceType(resource.name);
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalResources: resources.length,
      totalSize: Math.round(totalSize / 1024), // KB
      averageLoadTime: Math.round(averageLoadTime),
      slowResourcesCount: slowResources.length,
      resourceTypes,
    };
  }, [resources, slowResources]);

  return {
    resources,
    slowResources,
    stats: getResourceStats(),
  };
}

// Helper function to determine resource type
function getResourceType(url: string): string {
  if (url.includes('.js')) return 'javascript';
  if (url.includes('.css')) return 'stylesheet';
  if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
  if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
  if (url.includes('/api/')) return 'api';
  return 'other';
}

// Performance optimization recommendations
export function usePerformanceRecommendations() {
  const { metrics, score } = useWebVitals();
  const { stats } = useResourcePerformance();
  const networkInfo = useNetworkPerformance();

  const getRecommendations = useCallback(() => {
    const recommendations: string[] = [];

    // LCP recommendations
    if (metrics.lcp && metrics.lcp > PERFORMANCE_THRESHOLDS.LCP.good) {
      recommendations.push('Optimize Largest Contentful Paint by reducing server response times and optimizing critical resources');
    }

    // CLS recommendations
    if (metrics.cls && metrics.cls > PERFORMANCE_THRESHOLDS.CLS.good) {
      recommendations.push('Improve Cumulative Layout Shift by setting dimensions for images and avoiding dynamic content insertion');
    }

    // FID recommendations
    if (metrics.fid && metrics.fid > PERFORMANCE_THRESHOLDS.FID.good) {
      recommendations.push('Reduce First Input Delay by minimizing JavaScript execution time and using code splitting');
    }

    // Resource recommendations
    if (stats.slowResourcesCount > 0) {
      recommendations.push(`Optimize ${stats.slowResourcesCount} slow-loading resources using compression, CDN, or lazy loading`);
    }

    // Memory recommendations
    if (metrics.memoryUsage && metrics.memoryUsage > 50) {
      recommendations.push('Consider reducing memory usage by optimizing images, removing unused code, and implementing virtual scrolling');
    }

    // Network-specific recommendations
    if (networkInfo?.effectiveType === '2g' || networkInfo?.effectiveType === 'slow-2g') {
      recommendations.push('Optimize for slow networks by reducing bundle size and implementing aggressive caching');
    }

    return recommendations;
  }, [metrics, stats, networkInfo]);

  return {
    recommendations: getRecommendations(),
    score,
    canOptimize: score < 80,
  };
}