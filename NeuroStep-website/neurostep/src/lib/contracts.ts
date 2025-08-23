/**
 * API Contracts and TypeScript Interfaces for Neurostep Application
 * 
 * This file contains all the TypeScript interfaces and types used for API communication,
 * data structures, and integration with external services.
 */

// ============================================================================
// REAL-TIME DATA STREAMS
// ============================================================================

/**
 * Gait analysis sample data from sensors
 */
export interface GaitSample {
  timestamp: number; // Unix timestamp in milliseconds
  leftPressure: number; // Pressure in Newtons (0-1000)
  rightPressure: number; // Pressure in Newtons (0-1000)
  copX: number; // Center of Pressure X coordinate (-100 to 100)
  copY: number; // Center of Pressure Y coordinate (-100 to 100)
  strideLength: number; // Stride length in centimeters
  strideFreq: number; // Stride frequency in Hz
  cadence: number; // Steps per minute
  stepWidth: number; // Step width in centimeters
  sessionId: string; // Session identifier
  userId: string; // User identifier
}

/**
 * Fall detection sample data from accelerometer
 */
export interface FallSample {
  timestamp: number; // Unix timestamp in milliseconds
  ax: number; // Acceleration X-axis (m/s²)
  ay: number; // Acceleration Y-axis (m/s²)
  az: number; // Acceleration Z-axis (m/s²)
  event: 'normal' | 'warning' | 'fall_detected' | 'recovery';
  confidence: number; // Confidence score (0-1)
  sessionId: string;
  userId: string;
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Session types available in the system
 */
export type SessionType = 'gait_analysis' | 'fall_detection' | 'rehabilitation';

/**
 * Session status states
 */
export type SessionStatus = 'pending' | 'active' | 'paused' | 'completed' | 'cancelled' | 'error';

/**
 * Session metadata for configuration
 */
export interface SessionMetadata {
  patientHeight: number; // cm
  patientWeight: number; // kg
  exerciseType: string;
  difficulty: 'easy' | 'medium' | 'hard';
  notes?: string;
  targetDuration?: number; // seconds
  targetSteps?: number;
}

/**
 * Request to start a new session
 */
export interface StartSessionRequest {
  userId: string;
  sessionType: SessionType;
  duration: number; // seconds
  metadata: SessionMetadata;
}

/**
 * Response when starting a session
 */
export interface StartSessionResponse {
  sessionId: string;
  status: SessionStatus;
  startTime: string; // ISO 8601
  estimatedEndTime: string; // ISO 8601
  wsEndpoint: string;
}

/**
 * Response when ending a session
 */
export interface EndSessionResponse {
  sessionId: string;
  status: SessionStatus;
  endTime: string; // ISO 8601
  duration: number; // seconds
  sampleCount: number;
  analysisId: string;
}

// ============================================================================
// ANALYSIS RESULTS
// ============================================================================

/**
 * Key Performance Indicators from session analysis
 */
export interface SessionKPIs {
  averageStepLength: number;
  averageCadence: number;
  symmetryIndex: number; // 0-1, higher is better
  stabilityScore: number; // 0-10, higher is better
  fallRisk: 'low' | 'medium' | 'high';
  improvementAreas: string[];
}

/**
 * Detailed metrics from session
 */
export interface SessionMetrics {
  totalSteps: number;
  totalDistance: number; // meters
  averageSpeed: number; // m/s
  maxPressure: number;
  pressureVariability: number; // coefficient of variation
  leftRightBalance: number; // percentage
  gaitCycleTime: number; // seconds
  doubleSupport: number; // percentage of gait cycle
}

/**
 * Recommendation for improvement
 */
export interface Recommendation {
  category: 'exercise' | 'nutrition' | 'lifestyle' | 'medical';
  priority: 'low' | 'medium' | 'high';
  description: string;
  duration: string;
  frequency?: string;
  targetMetric?: string;
}

/**
 * Chart data for visualization
 */
export interface ChartData {
  pressureOverTime: Array<{
    timestamp: number;
    left: number;
    right: number;
  }>;
  copTrajectory: Array<{
    timestamp: number;
    x: number;
    y: number;
  }>;
  gaitCycle: Array<{
    phase: string;
    duration: number;
    pressure: number;
  }>;
  cadenceOverTime?: Array<{
    timestamp: number;
    cadence: number;
  }>;
  symmetryOverTime?: Array<{
    timestamp: number;
    symmetry: number;
  }>;
}

/**
 * Complete session analysis result
 */
export interface SessionAnalysis {
  sessionId: string;
  analysisId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string; // ISO 8601
  kpis: SessionKPIs;
  metrics: SessionMetrics;
  recommendations: Recommendation[];
  chartData: ChartData;
  mlModelVersion?: string;
  processingTime?: number; // milliseconds
}

/**
 * Session summary for lists
 */
export interface SessionSummary {
  sessionId: string;
  userId: string;
  type: SessionType;
  status: SessionStatus;
  startTime: string; // ISO 8601
  endTime?: string; // ISO 8601
  duration: number; // seconds
  kpis: Partial<SessionKPIs>;
  hasAnalysis: boolean;
}

/**
 * Paginated session list response
 */
export interface SessionListResponse {
  sessions: SessionSummary[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// ============================================================================
// NUTRITION MANAGEMENT
// ============================================================================

/**
 * Nutritionist plan for patients
 */
export interface NutritionPlan {
  id: string;
  patientId: string;
  nutritionistId: string;
  title: string;
  description: string;
  goals: string[];
  restrictions: string[];
  meals: NutritionMeal[];
  supplements?: NutritionSupplement[];
  duration: number; // days
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * Individual meal in nutrition plan
 */
export interface NutritionMeal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: NutritionFood[];
  totalCalories: number;
  macros: {
    protein: number; // grams
    carbs: number; // grams
    fat: number; // grams
    fiber: number; // grams
  };
  instructions?: string;
  prepTime?: number; // minutes
}

/**
 * Food item in meal
 */
export interface NutritionFood {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

/**
 * Supplement recommendation
 */
export interface NutritionSupplement {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timing: string;
  purpose: string;
}

/**
 * Patient feedback on nutrition plan
 */
export interface NutritionFeedback {
  id: string;
  planId: string;
  patientId: string;
  date: string; // ISO 8601
  adherence: number; // 0-10 scale
  satisfaction: number; // 0-10 scale
  comments: string;
  sideEffects?: string[];
  weightChange?: number; // kg
  energyLevel?: number; // 0-10 scale
}

/**
 * Request to create nutrition plan
 */
export interface CreateNutritionPlanRequest {
  patientId: string;
  title: string;
  description: string;
  goals: string[];
  restrictions: string[];
  duration: number;
  targetCalories: number;
  targetMacros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

// ============================================================================
// USER AUTHENTICATION & AUTHORIZATION
// ============================================================================

/**
 * User roles in the system
 */
export type UserRole = 'patient' | 'therapist' | 'nutritionist' | 'admin';

/**
 * User authentication data
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  lastLogin?: string; // ISO 8601
  createdAt: string; // ISO 8601
  profile: UserProfile;
}

/**
 * User profile information
 */
export interface UserProfile {
  firstName: string;
  lastName: string;
  dateOfBirth?: string; // ISO 8601
  gender?: 'male' | 'female' | 'other';
  height?: number; // cm
  weight?: number; // kg
  medicalConditions?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications: boolean;
    dataSharing: boolean;
  };
}

/**
 * Login request
 */
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Login response
 */
export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

/**
 * Role-based permissions
 */
export interface RolePermissions {
  role: UserRole;
  permissions: {
    canViewDashboard: boolean;
    canAccessGaitPortal: boolean;
    canAccessSessionPortal: boolean;
    canAccessNutritionPortal: boolean;
    canManageUsers: boolean;
    canExportData: boolean;
    canViewReports: boolean;
    canCreatePlans: boolean;
  };
}

// ============================================================================
// WEBSOCKET MESSAGES
// ============================================================================

/**
 * WebSocket message types
 */
export type WSMessageType = 
  | 'connection'
  | 'gait_data'
  | 'fall_data'
  | 'session_status'
  | 'error'
  | 'heartbeat';

/**
 * Base WebSocket message structure
 */
export interface WSMessage<T = any> {
  type: WSMessageType;
  timestamp: number;
  sessionId?: string;
  data: T;
}

/**
 * WebSocket connection message
 */
export interface WSConnectionMessage {
  status: 'connected' | 'disconnected' | 'reconnecting';
  clientId: string;
  sessionId?: string;
}

/**
 * WebSocket error message
 */
export interface WSErrorMessage {
  code: string;
  message: string;
  details?: any;
}

/**
 * Session status update via WebSocket
 */
export interface WSSessionStatusMessage {
  sessionId: string;
  status: SessionStatus;
  progress?: number; // 0-100
  sampleCount?: number;
  duration?: number;
}

// ============================================================================
// DATA EXPORT
// ============================================================================

/**
 * Export format options
 */
export type ExportFormat = 'pdf' | 'csv' | 'json' | 'xlsx';

/**
 * Export request
 */
export interface ExportRequest {
  type: 'session' | 'user_report' | 'nutrition_plan';
  format: ExportFormat;
  entityId: string;
  dateRange?: {
    start: string; // ISO 8601
    end: string; // ISO 8601
  };
  includeCharts?: boolean;
  includeRawData?: boolean;
}

/**
 * Export response
 */
export interface ExportResponse {
  exportId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  expiresAt?: string; // ISO 8601
  fileSize?: number; // bytes
  createdAt: string; // ISO 8601
}

// ============================================================================
// API RESPONSE WRAPPERS
// ============================================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// ============================================================================
// FIRESTORE COLLECTIONS
// ============================================================================

/**
 * Firestore collection names
 */
export const COLLECTIONS = {
  USERS: 'users',
  SESSIONS: 'sessions',
  ANALYSES: 'analyses',
  NUTRITION_PLANS: 'nutrition_plans',
  NUTRITION_FEEDBACK: 'nutrition_feedback',
  EXPORTS: 'exports',
  CHAT_MESSAGES: 'chat_messages',
} as const;

/**
 * Firestore document with metadata
 */
export interface FirestoreDoc<T = any> {
  id: string;
  data: T;
  createdAt: string;
  updatedAt: string;
  version: number;
}

// ============================================================================
// ZUSTAND STORE INTERFACES
// ============================================================================

/**
 * Authentication store state
 */
export interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

/**
 * Role-based access store
 */
export interface RoleStore {
  permissions: RolePermissions | null;
  canAccess: (resource: string) => boolean;
  hasPermission: (permission: keyof RolePermissions['permissions']) => boolean;
  updatePermissions: (role: UserRole) => void;
}

/**
 * Gait analysis store state
 */
export interface GaitStore {
  isStreaming: boolean;
  samples: GaitSample[];
  fallSamples: FallSample[];
  currentSession: string | null;
  bufferSize: number;
  startStream: (sessionId: string) => void;
  stopStream: () => void;
  addSample: (sample: GaitSample) => void;
  addFallSample: (sample: FallSample) => void;
  clearBuffer: () => void;
  getLatestSamples: (count: number) => GaitSample[];
}

/**
 * Session management store
 */
export interface SessionStore {
  currentSession: SessionSummary | null;
  sessions: SessionSummary[];
  isLoading: boolean;
  exerciseType: string;
  reps: number;
  status: SessionStatus;
  startSession: (request: StartSessionRequest) => Promise<string>;
  endSession: (sessionId: string) => Promise<void>;
  loadSessions: () => Promise<void>;
  updateStatus: (status: SessionStatus) => void;
  setExercise: (type: string, reps: number) => void;
}

/**
 * UI state management store
 */
export interface UiStore {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  modals: {
    [key: string]: boolean;
  };
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: number;
  }>;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  addNotification: (notification: Omit<UiStore['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Data validation utilities
 */
export interface DataValidator {
  validateGaitSample: (sample: any) => ValidationResult;
  validateFallSample: (sample: any) => ValidationResult;
  validateSessionRequest: (request: any) => ValidationResult;
  validateNutritionPlan: (plan: any) => ValidationResult;
  validateUser: (user: any) => ValidationResult;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Extract keys of type T that are of type U
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * Omit multiple keys from type
 */
export type OmitMultiple<T, K extends keyof T> = Omit<T, K>;

/**
 * Create a type with required fields
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Environment configuration type
 */
export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  NEXT_PUBLIC_API_BASE: string;
  NEXT_PUBLIC_WS_URL: string;
  NEXT_PUBLIC_FIREBASE_API_KEY: string;
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: string;
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string;
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
  NEXT_PUBLIC_FIREBASE_APP_ID: string;
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
}

export interface GaitMetrics {
  gaitCyclePhases: {
    stance: number;
    swing: number;
    doubleSupport: number;
  };
  posturalSwayIndex: number;
  equilibriumScore: number;
  walkingSpeedEstimate: number;
}

export interface SnapshotRecord {
  id: string;
  timestamp: number;
  duration: number;
  gaitSamples: GaitSample[];
  fallSamples: FallSample[];
  metrics: GaitMetrics;
}