import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  SessionStore, 
  SessionSummary, 
  StartSessionRequest, 
  SessionStatus,
  SessionType 
} from '@/lib/contracts';

/**
 * Session management store for handling exercise sessions, their lifecycle, and metadata
 */
export const useSessionStore = create<SessionStore>()(persist(
  (set, get) => ({
    currentSession: null,
    sessions: [],
    isLoading: false,
    exerciseType: 'walking',
    reps: 10,
    status: 'pending',

    startSession: async (request: StartSessionRequest) => {
      set({ isLoading: true });
      
      try {
        // Mock session creation - replace with actual API call
        const sessionId = `session-${Date.now()}`;
        
        const newSession: SessionSummary = {
          sessionId,
          userId: request.userId,
          type: request.sessionType,
          status: 'active',
          startTime: new Date().toISOString(),
          duration: 0,
          kpis: {},
          hasAnalysis: false,
        };
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        set({ 
          currentSession: newSession,
          status: 'active',
          isLoading: false 
        });
        
        return sessionId;
      } catch (error) {
        set({ isLoading: false });
        throw new Error('Failed to start session');
      }
    },

    endSession: async (sessionId: string) => {
      const { currentSession, sessions } = get();
      if (!currentSession || currentSession.sessionId !== sessionId) {
        throw new Error('No active session found');
      }
      
      set({ isLoading: true });
      
      try {
        // Mock session completion - replace with actual API call
        const endTime = new Date().toISOString();
        const duration = new Date(endTime).getTime() - new Date(currentSession.startTime).getTime();
        
        const completedSession: SessionSummary = {
          ...currentSession,
          status: 'completed',
          endTime,
          duration: Math.floor(duration / 1000), // Convert to seconds
          hasAnalysis: true,
          kpis: {
            // Mock KPIs - would come from analysis service
            averageStepLength: Math.random() * 20 + 60, // 60-80cm
            averageCadence: Math.random() * 20 + 110, // 110-130 steps/min
            symmetryIndex: Math.random() * 0.3 + 0.7, // 0.7-1.0
            stabilityScore: Math.random() * 3 + 7, // 7-10
            fallRisk: Math.random() > 0.7 ? 'medium' : 'low',
          },
        };
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Update sessions list
        const updatedSessions = [completedSession, ...sessions.filter(s => s.sessionId !== sessionId)];
        
        set({ 
          currentSession: null,
          sessions: updatedSessions,
          status: 'completed',
          isLoading: false 
        });
      } catch (error) {
        set({ isLoading: false });
        throw new Error('Failed to end session');
      }
    },

    loadSessions: async () => {
      set({ isLoading: true });
      
      try {
        // Mock session loading - replace with actual API call
        const mockSessions: SessionSummary[] = [
          {
            sessionId: 'session-1',
            userId: 'user-123',
            type: 'gait_analysis',
            status: 'completed',
            startTime: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            endTime: new Date(Date.now() - 86400000 + 1800000).toISOString(), // 30 min session
            duration: 1800, // 30 minutes
            kpis: {
              averageStepLength: 72.5,
              averageCadence: 118,
              symmetryIndex: 0.85,
              stabilityScore: 8.2,
              fallRisk: 'low',
            },
            hasAnalysis: true,
          },
          {
            sessionId: 'session-2',
            userId: 'user-123',
            type: 'fall_detection',
            status: 'completed',
            startTime: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            endTime: new Date(Date.now() - 172800000 + 900000).toISOString(), // 15 min session
            duration: 900, // 15 minutes
            kpis: {
              averageStepLength: 68.3,
              averageCadence: 115,
              symmetryIndex: 0.78,
              stabilityScore: 7.8,
              fallRisk: 'medium',
            },
            hasAnalysis: true,
          },
        ];
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        set({ 
          sessions: mockSessions,
          isLoading: false 
        });
      } catch (error) {
        set({ isLoading: false });
        throw new Error('Failed to load sessions');
      }
    },

    updateStatus: (status: SessionStatus) => {
      const { currentSession } = get();
      
      set({ status });
      
      if (currentSession) {
        set({ 
          currentSession: { 
            ...currentSession, 
            status 
          } 
        });
      }
    },

    setExercise: (type: string, reps: number) => {
      set({ 
        exerciseType: type, 
        reps 
      });
    },
  }),
  {
    name: 'neurostep-session',
    partialize: (state) => ({ 
      sessions: state.sessions,
      exerciseType: state.exerciseType,
      reps: state.reps,
    }),
  }
));

// Selectors for easier access
export const useCurrentSession = () => useSessionStore(state => state.currentSession);
export const useSessions = () => useSessionStore(state => state.sessions);
export const useSessionLoading = () => useSessionStore(state => state.isLoading);
export const useSessionStatus = () => useSessionStore(state => state.status);
export const useExerciseConfig = () => useSessionStore(state => ({ 
  type: state.exerciseType, 
  reps: state.reps 
}));

// Computed selectors
export const useIsSessionActive = () => useSessionStore(state => 
  state.currentSession?.status === 'active'
);

export const useSessionDuration = () => useSessionStore(state => {
  const session = state.currentSession;
  if (!session || session.status !== 'active') return 0;
  
  return Math.floor((Date.now() - new Date(session.startTime).getTime()) / 1000);
});

export const useRecentSessions = (limit: number = 5) => useSessionStore(state => 
  state.sessions
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, limit)
);

export const useSessionsByType = (type: SessionType) => useSessionStore(state => 
  state.sessions.filter(session => session.type === type)
);

export const useSessionStats = () => useSessionStore(state => {
  const sessions = state.sessions.filter(s => s.status === 'completed');
  
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      totalDuration: 0,
      averageDuration: 0,
      averageStabilityScore: 0,
      improvementTrend: 0,
    };
  }
  
  const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
  const averageDuration = totalDuration / sessions.length;
  
  const stabilityScores = sessions
    .map(s => s.kpis.stabilityScore)
    .filter(score => typeof score === 'number') as number[];
  
  const averageStabilityScore = stabilityScores.length > 0 
    ? stabilityScores.reduce((sum, score) => sum + score, 0) / stabilityScores.length
    : 0;
  
  // Calculate improvement trend (comparing first half vs second half of sessions)
  const midpoint = Math.floor(stabilityScores.length / 2);
  const firstHalf = stabilityScores.slice(0, midpoint);
  const secondHalf = stabilityScores.slice(midpoint);
  
  const firstHalfAvg = firstHalf.length > 0 
    ? firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length 
    : 0;
  const secondHalfAvg = secondHalf.length > 0 
    ? secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length 
    : 0;
  
  const improvementTrend = secondHalfAvg - firstHalfAvg;
  
  return {
    totalSessions: sessions.length,
    totalDuration,
    averageDuration: Math.round(averageDuration),
    averageStabilityScore: Math.round(averageStabilityScore * 100) / 100,
    improvementTrend: Math.round(improvementTrend * 100) / 100,
  };
});