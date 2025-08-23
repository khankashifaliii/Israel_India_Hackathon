'use client';

import { QueryClient, DefaultOptions } from '@tanstack/react-query';
import { toast } from 'sonner';

// Default query options for optimal performance
const queryConfig: DefaultOptions = {
  queries: {
    // Cache data for 5 minutes by default
    staleTime: 1000 * 60 * 5,
    // Keep data in cache for 10 minutes
    gcTime: 1000 * 60 * 10,
    // Retry failed requests 3 times with exponential backoff
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Refetch on window focus for critical data
    refetchOnWindowFocus: false,
    // Don't refetch on reconnect by default
    refetchOnReconnect: 'always',
    // Background refetch interval (disabled by default)
    refetchInterval: false,
    // Network mode configuration
    networkMode: 'online',
  },
  mutations: {
    // Retry mutations once
    retry: 1,
    // Network mode for mutations
    networkMode: 'online',
    // Global error handler for mutations
    onError: (error: any) => {
      const message = error?.message || 'An error occurred';
      toast.error(message);
    },
  },
};

// Create query client with performance optimizations
export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});

// Query keys factory for consistent caching
export const queryKeys = {
  // User-related queries
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    settings: () => [...queryKeys.user.all, 'settings'] as const,
    preferences: () => [...queryKeys.user.all, 'preferences'] as const,
  },
  
  // Gait analysis queries
  gaitAnalysis: {
    all: ['gait-analysis'] as const,
    list: (filters?: Record<string, any>) => 
      [...queryKeys.gaitAnalysis.all, 'list', filters] as const,
    detail: (id: string) => 
      [...queryKeys.gaitAnalysis.all, 'detail', id] as const,
    metrics: (id: string) => 
      [...queryKeys.gaitAnalysis.all, 'metrics', id] as const,
    history: (userId: string, limit?: number) => 
      [...queryKeys.gaitAnalysis.all, 'history', userId, limit] as const,
  },
  
  // Session analysis queries
  sessionAnalysis: {
    all: ['session-analysis'] as const,
    list: (filters?: Record<string, any>) => 
      [...queryKeys.sessionAnalysis.all, 'list', filters] as const,
    detail: (id: string) => 
      [...queryKeys.sessionAnalysis.all, 'detail', id] as const,
    summary: (id: string) => 
      [...queryKeys.sessionAnalysis.all, 'summary', id] as const,
  },
  
  // Athlete data queries
  athlete: {
    all: ['athlete'] as const,
    profile: (id: string) => 
      [...queryKeys.athlete.all, 'profile', id] as const,
    metrics: (id: string, timeRange?: string) => 
      [...queryKeys.athlete.all, 'metrics', id, timeRange] as const,
    progress: (id: string) => 
      [...queryKeys.athlete.all, 'progress', id] as const,
  },
  
  // Nutritionist queries
  nutrition: {
    all: ['nutrition'] as const,
    recommendations: (userId: string) => 
      [...queryKeys.nutrition.all, 'recommendations', userId] as const,
    plans: (userId: string) => 
      [...queryKeys.nutrition.all, 'plans', userId] as const,
    tracking: (userId: string, date?: string) => 
      [...queryKeys.nutrition.all, 'tracking', userId, date] as const,
  },
  
  // Dashboard queries
  dashboard: {
    all: ['dashboard'] as const,
    overview: (userId: string) => 
      [...queryKeys.dashboard.all, 'overview', userId] as const,
    stats: (userId: string, timeRange?: string) => 
      [...queryKeys.dashboard.all, 'stats', userId, timeRange] as const,
    recent: (userId: string, limit?: number) => 
      [...queryKeys.dashboard.all, 'recent', userId, limit] as const,
  },
  
  // Chat queries
  chat: {
    all: ['chat'] as const,
    history: (sessionId?: string) => 
      [...queryKeys.chat.all, 'history', sessionId] as const,
    context: (page: string) => 
      [...queryKeys.chat.all, 'context', page] as const,
  },
};

// Cache invalidation helpers
export const cacheUtils = {
  // Invalidate all user-related data
  invalidateUser: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
  },
  
  // Invalidate specific data types
  invalidateGaitAnalysis: (id?: string) => {
    if (id) {
      queryClient.invalidateQueries({ queryKey: queryKeys.gaitAnalysis.detail(id) });
    } else {
      queryClient.invalidateQueries({ queryKey: queryKeys.gaitAnalysis.all });
    }
  },
  
  invalidateSessionAnalysis: (id?: string) => {
    if (id) {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessionAnalysis.detail(id) });
    } else {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessionAnalysis.all });
    }
  },
  
  invalidateDashboard: (userId?: string) => {
    if (userId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview(userId) });
    } else {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    }
  },
  
  // Clear all cache
  clearAll: () => {
    queryClient.clear();
  },
  
  // Remove specific queries from cache
  removeQueries: (queryKey: readonly unknown[]) => {
    queryClient.removeQueries({ queryKey });
  },
};

// Prefetch helpers for performance optimization
export const prefetchUtils = {
  // Prefetch user profile
  prefetchUserProfile: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.user.profile(),
      queryFn: () => fetch('/api/user/profile').then(res => res.json()),
      staleTime: 1000 * 60 * 10, // 10 minutes
    });
  },
  
  // Prefetch dashboard data
  prefetchDashboard: async (userId: string) => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.dashboard.overview(userId),
        queryFn: () => fetch(`/api/dashboard/overview?userId=${userId}`).then(res => res.json()),
        staleTime: 1000 * 60 * 5, // 5 minutes
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.dashboard.recent(userId, 5),
        queryFn: () => fetch(`/api/dashboard/recent?userId=${userId}&limit=5`).then(res => res.json()),
        staleTime: 1000 * 60 * 2, // 2 minutes
      }),
    ]);
  },
  
  // Prefetch gait analysis list
  prefetchGaitAnalysisList: async (filters?: Record<string, any>) => {
    const params = new URLSearchParams(filters).toString();
    await queryClient.prefetchQuery({
      queryKey: queryKeys.gaitAnalysis.list(filters),
      queryFn: () => fetch(`/api/gait-analysis?${params}`).then(res => res.json()),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  },
};

// Background sync for offline support
export const backgroundSync = {
  // Queue mutations for offline execution
  queueMutation: (mutationKey: string, variables: any) => {
    const queue = JSON.parse(localStorage.getItem('mutation-queue') || '[]');
    queue.push({ key: mutationKey, variables, timestamp: Date.now() });
    localStorage.setItem('mutation-queue', JSON.stringify(queue));
  },
  
  // Process queued mutations when online
  processQueue: async () => {
    const queue = JSON.parse(localStorage.getItem('mutation-queue') || '[]');
    if (queue.length === 0) return;
    
    for (const mutation of queue) {
      try {
        // Process mutation based on key
        await processMutation(mutation.key, mutation.variables);
      } catch (error) {
        console.error('Failed to process queued mutation:', error);
      }
    }
    
    // Clear processed queue
    localStorage.removeItem('mutation-queue');
  },
};

// Helper function to process mutations
async function processMutation(key: string, variables: any) {
  // Implementation would depend on specific mutation types
  switch (key) {
    case 'updateProfile':
      return fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(variables),
      });
    // Add other mutation cases as needed
    default:
      console.warn('Unknown mutation key:', key);
  }
}

// Performance monitoring for queries
export const queryPerformance = {
  // Log slow queries
  logSlowQueries: (threshold = 1000) => {
    queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'updated' && event.query.state.dataUpdatedAt) {
        const duration = Date.now() - event.query.state.dataUpdatedAt;
        if (duration > threshold) {
          console.warn(`Slow query detected: ${JSON.stringify(event.query.queryKey)} took ${duration}ms`);
        }
      }
    });
  },
  
  // Get cache statistics
  getCacheStats: () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    return {
      totalQueries: queries.length,
      activeQueries: queries.filter(q => q.getObserversCount() > 0).length,
      staleQueries: queries.filter(q => q.isStale()).length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
      cacheSize: JSON.stringify(queries.map(q => q.state.data)).length,
    };
  },
};