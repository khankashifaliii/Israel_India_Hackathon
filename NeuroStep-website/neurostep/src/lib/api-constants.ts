// FastAPI Integration Constants for Session Analysis Portal
// These endpoints will be implemented when the backend is ready

export const SESSION_API_ENDPOINTS = {
  START_SESSION: '/api/session/start',
  STREAM_FRAME: '/api/session/frame',
  STOP_SESSION: '/api/session/stop',
  GET_REPORT: '/api/session/{id}/report'
} as const;

// Expected Request/Response Types for Future Backend Integration

export interface StartSessionRequest {
  exercise_type: 'push-ups' | 'squats' | 'lunges' | 'running';
  patient_id?: string;
  settings: {
    joint_overlay: boolean;
    play_beeps: boolean;
    record_video: boolean;
    demo_playback: boolean;
  };
}

export interface StartSessionResponse {
  session_id: string;
  status: 'started';
  timestamp: string;
}

export interface FrameData {
  session_id: string;
  timestamp: number;
  frame_data: string; // base64 encoded image
  sequence_number: number;
}

export interface PartialAnalysisResponse {
  session_id: string;
  timestamp: number;
  joint_positions?: {
    [joint_name: string]: {
      x: number;
      y: number;
      confidence: number;
    };
  };
  rep_count?: number;
  current_phase?: 'up' | 'down' | 'hold';
  form_score?: number;
}

export interface StopSessionRequest {
  session_id: string;
}

export interface FinalKPIs {
  total_reps: number;
  avg_pace: number; // seconds per rep
  range_of_motion: number; // percentage
  symmetry_index: number; // 0-1 scale
  stability_score: number; // 0-100 scale
  form_consistency: number; // 0-100 scale
  peak_velocity: number;
  time_under_tension: number;
}

export interface PerFrameMetrics {
  timestamp: number;
  joint_angles: {
    [joint_name: string]: number;
  };
  velocity: number;
  acceleration: number;
  form_score: number;
  rep_phase: 'up' | 'down' | 'hold';
}

export interface StopSessionResponse {
  session_id: string;
  status: 'completed';
  duration: number; // seconds
  final_kpis: FinalKPIs;
  per_frame_metrics: PerFrameMetrics[];
  summary: {
    best_rep: number;
    worst_rep: number;
    consistency_rating: 'excellent' | 'good' | 'fair' | 'poor';
    recommendations: string[];
  };
}

export interface SessionReportResponse {
  session_id: string;
  metadata: {
    patient_id?: string;
    exercise_type: string;
    date: string;
    duration: number;
    settings: {
      joint_overlay: boolean;
      play_beeps: boolean;
      record_video: boolean;
    };
  };
  kpis: FinalKPIs;
  time_series_data: {
    timestamps: number[];
    rep_counts: number[];
    form_scores: number[];
    velocity_data: number[];
    joint_angle_series: {
      [joint_name: string]: number[];
    };
  };
  charts: {
    performance_over_time: {
      x_axis: number[]; // timestamps
      y_axis: number[]; // form scores
    };
    rep_consistency: {
      rep_numbers: number[];
      rep_durations: number[];
    };
    joint_range_analysis: {
      joint_names: string[];
      min_angles: number[];
      max_angles: number[];
      avg_angles: number[];
    };
  };
  recommendations: string[];
  video_url?: string; // if recording was enabled
}

// Demo Data for Presentation Mode
export const DEMO_SESSION_DATA = {
  duration: 30, // seconds
  exercise: 'push-ups',
  timeline: [
    { time: 0, event: 'session_start', data: null },
    { time: 3, event: 'rep_complete', data: { rep: 1, form_score: 85 } },
    { time: 6, event: 'rep_complete', data: { rep: 2, form_score: 88 } },
    { time: 9, event: 'rep_complete', data: { rep: 3, form_score: 82 } },
    { time: 12, event: 'rep_complete', data: { rep: 4, form_score: 90 } },
    { time: 15, event: 'rep_complete', data: { rep: 5, form_score: 87 } },
    { time: 18, event: 'rep_complete', data: { rep: 6, form_score: 89 } },
    { time: 21, event: 'rep_complete', data: { rep: 7, form_score: 86 } },
    { time: 24, event: 'rep_complete', data: { rep: 8, form_score: 91 } },
    { time: 27, event: 'rep_complete', data: { rep: 9, form_score: 88 } },
    { time: 30, event: 'session_end', data: null }
  ],
  final_kpis: {
    total_reps: 9,
    avg_pace: 3.33,
    range_of_motion: 87.5,
    symmetry_index: 0.92,
    stability_score: 88.2,
    form_consistency: 87.1,
    peak_velocity: 1.2,
    time_under_tension: 18.5
  }
};

// Utility functions for API integration
export const createSessionApiClient = (baseUrl: string) => {
  return {
    startSession: async (data: StartSessionRequest): Promise<StartSessionResponse> => {
      const response = await fetch(`${baseUrl}${SESSION_API_ENDPOINTS.START_SESSION}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    
    streamFrame: async (data: FrameData): Promise<PartialAnalysisResponse> => {
      const response = await fetch(`${baseUrl}${SESSION_API_ENDPOINTS.STREAM_FRAME}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    
    stopSession: async (data: StopSessionRequest): Promise<StopSessionResponse> => {
      const response = await fetch(`${baseUrl}${SESSION_API_ENDPOINTS.STOP_SESSION}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    
    getReport: async (sessionId: string): Promise<SessionReportResponse> => {
      const response = await fetch(
        `${baseUrl}${SESSION_API_ENDPOINTS.GET_REPORT.replace('{id}', sessionId)}`
      );
      return response.json();
    }
  };
};