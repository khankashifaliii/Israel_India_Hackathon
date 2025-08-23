import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { GaitStore, GaitSample, FallSample } from '@/lib/contracts';

/**
 * Gait analysis store for managing real-time sensor data streams and buffers
 */
export const useGaitStore = create<GaitStore>()(subscribeWithSelector(
  (set, get) => ({
    isStreaming: false,
    samples: [],
    fallSamples: [],
    currentSession: null,
    bufferSize: 1000, // Maximum number of samples to keep in memory

    startStream: (sessionId: string) => {
      set({ 
        isStreaming: true, 
        currentSession: sessionId,
        samples: [], // Clear previous samples
        fallSamples: [] // Clear previous fall samples
      });
      
      // In a real implementation, this would establish WebSocket connection
      console.log(`Starting gait stream for session: ${sessionId}`);
    },

    stopStream: () => {
      set({ 
        isStreaming: false, 
        currentSession: null 
      });
      
      console.log('Stopping gait stream');
    },

    addSample: (sample: GaitSample) => {
      const { samples, bufferSize, isStreaming } = get();
      
      if (!isStreaming) {
        console.warn('Received sample while not streaming');
        return;
      }
      
      // Add new sample and maintain buffer size
      const newSamples = [...samples, sample];
      if (newSamples.length > bufferSize) {
        newSamples.shift(); // Remove oldest sample
      }
      
      set({ samples: newSamples });
    },

    addFallSample: (sample: FallSample) => {
      const { fallSamples, bufferSize, isStreaming } = get();
      
      if (!isStreaming) {
        console.warn('Received fall sample while not streaming');
        return;
      }
      
      // Add new fall sample and maintain buffer size
      const newFallSamples = [...fallSamples, sample];
      if (newFallSamples.length > bufferSize) {
        newFallSamples.shift(); // Remove oldest sample
      }
      
      set({ fallSamples: newFallSamples });
      
      // Log fall events for monitoring
      if (sample.event === 'fall_detected') {
        console.warn('Fall detected!', sample);
      }
    },

    clearBuffer: () => {
      set({ 
        samples: [], 
        fallSamples: [] 
      });
    },

    getLatestSamples: (count: number) => {
      const { samples } = get();
      return samples.slice(-count);
    },
  })
));

// Selectors for easier access
export const useIsStreaming = () => useGaitStore(state => state.isStreaming);
export const useGaitSamples = () => useGaitStore(state => state.samples);
export const useFallSamples = () => useGaitStore(state => state.fallSamples);
export const useCurrentSession = () => useGaitStore(state => state.currentSession);
export const useBufferSize = () => useGaitStore(state => state.bufferSize);

// Computed selectors
export const useLatestGaitSample = () => useGaitStore(state => {
  const samples = state.samples;
  return samples.length > 0 ? samples[samples.length - 1] : null;
});

export const useLatestFallSample = () => useGaitStore(state => {
  const fallSamples = state.fallSamples;
  return fallSamples.length > 0 ? fallSamples[fallSamples.length - 1] : null;
});

export const useGaitMetrics = () => useGaitStore(state => {
  const samples = state.samples;
  if (samples.length === 0) return null;
  
  // Calculate real-time metrics from samples
  const recentSamples = samples.slice(-100); // Last 100 samples
  
  const avgCadence = recentSamples.reduce((sum, s) => sum + s.cadence, 0) / recentSamples.length;
  const avgStrideLength = recentSamples.reduce((sum, s) => sum + s.strideLength, 0) / recentSamples.length;
  const avgStepWidth = recentSamples.reduce((sum, s) => sum + s.stepWidth, 0) / recentSamples.length;
  
  // Calculate pressure balance
  const leftPressureAvg = recentSamples.reduce((sum, s) => sum + s.leftPressure, 0) / recentSamples.length;
  const rightPressureAvg = recentSamples.reduce((sum, s) => sum + s.rightPressure, 0) / recentSamples.length;
  const pressureBalance = leftPressureAvg / (leftPressureAvg + rightPressureAvg) * 100;
  
  return {
    avgCadence: Math.round(avgCadence * 100) / 100,
    avgStrideLength: Math.round(avgStrideLength * 100) / 100,
    avgStepWidth: Math.round(avgStepWidth * 100) / 100,
    pressureBalance: Math.round(pressureBalance * 100) / 100,
    sampleCount: samples.length,
    streamDuration: samples.length > 0 ? samples[samples.length - 1].timestamp - samples[0].timestamp : 0,
  };
});

export const useFallRiskStatus = () => useGaitStore(state => {
  const fallSamples = state.fallSamples;
  if (fallSamples.length === 0) return 'normal';
  
  const recentSamples = fallSamples.slice(-10); // Last 10 fall samples
  const hasWarning = recentSamples.some(s => s.event === 'warning');
  const hasFall = recentSamples.some(s => s.event === 'fall_detected');
  
  if (hasFall) return 'fall_detected';
  if (hasWarning) return 'warning';
  return 'normal';
});

// Mock data generator for development
export const generateMockGaitSample = (sessionId: string, userId: string): GaitSample => ({
  timestamp: Date.now(),
  leftPressure: Math.random() * 800 + 100, // 100-900N
  rightPressure: Math.random() * 800 + 100, // 100-900N
  copX: (Math.random() - 0.5) * 200, // -100 to 100
  copY: (Math.random() - 0.5) * 200, // -100 to 100
  strideLength: Math.random() * 40 + 60, // 60-100cm
  strideFreq: Math.random() * 0.5 + 0.8, // 0.8-1.3Hz
  cadence: Math.random() * 40 + 100, // 100-140 steps/min
  stepWidth: Math.random() * 10 + 8, // 8-18cm
  sessionId,
  userId,
});

export const generateMockFallSample = (sessionId: string, userId: string): FallSample => {
  const events: FallSample['event'][] = ['normal', 'normal', 'normal', 'warning', 'fall_detected'];
  const event = events[Math.floor(Math.random() * events.length)];
  
  return {
    timestamp: Date.now(),
    ax: (Math.random() - 0.5) * 20, // -10 to 10 m/s²
    ay: (Math.random() - 0.5) * 20, // -10 to 10 m/s²
    az: Math.random() * 5 + 7.5, // 7.5-12.5 m/s² (gravity + movement)
    event,
    confidence: event === 'normal' ? Math.random() * 0.3 + 0.7 : Math.random() * 0.4 + 0.6,
    sessionId,
    userId,
  };
};