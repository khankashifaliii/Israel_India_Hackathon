/**
 * Centralized exports for all Zustand stores
 * 
 * This file provides a single entry point for importing stores throughout the application.
 * It also includes store initialization and cleanup utilities.
 */

// Store exports
export * from './auth-store';
export * from './role-store';
export * from './gait-store';
export * from './session-store';
export * from './ui-store';

// Import store hooks for debugging
import { useAuthStore } from './auth-store';
import { useRoleStore } from './role-store';
import { useGaitStore } from './gait-store';
import { useSessionStore } from './session-store';
import { useUiStore } from './ui-store';

// Re-export store hooks for convenience
export {
  useAuthStore,
  useUser,
  useIsAuthenticated,
  useAuthLoading,
  useUserRole as useAuthUserRole,
  useUserPreferences,
} from './auth-store';

export {
  useRoleStore,
  usePermissions,
  useCanAccess,
  useHasPermission,
  useUserRole,
  useCanViewDashboard,
  useCanAccessGait,
  useCanAccessSession,
  useCanAccessNutrition,
  useCanManageUsers,
  useCanExportData,
  useCanCreatePlans,
} from './role-store';

export {
  useGaitStore,
  useIsStreaming,
  useGaitSamples,
  useFallSamples,
  useCurrentSession as useGaitCurrentSession,
  useBufferSize,
  useLatestGaitSample,
  useLatestFallSample,
  useGaitMetrics,
  useFallRiskStatus,
  generateMockGaitSample,
  generateMockFallSample,
} from './gait-store';

export {
  useSessionStore,
  useCurrentSession,
  useSessions,
  useSessionLoading,
  useSessionStatus,
  useExerciseConfig,
  useIsSessionActive,
  useSessionDuration,
  useRecentSessions,
  useSessionsByType,
  useSessionStats,
} from './session-store';

export {
  useUiStore,
  useTheme,
  useSidebarOpen,
  useModals,
  useNotifications,
  useIsModalOpen,
  useNotificationCount,
  useNotificationsByType,
  useHasUnreadNotifications,
  useIsDarkMode,
  useNotificationActions,
  useModalActions,
  MODAL_IDS,
} from './ui-store';

// Store initialization utilities
export const initializeStores = () => {
  // Initialize auth store with persisted data
  const authStore = useAuthStore.getState();
  
  // If user is authenticated, update role permissions
  if (authStore.user) {
    const roleStore = useRoleStore.getState();
    roleStore.updatePermissions(authStore.user.role);
  }
  
  // Initialize UI theme
  const uiStore = useUiStore.getState();
  uiStore.setTheme(uiStore.theme);
  
  // Load session history
  const sessionStore = useSessionStore.getState();
  sessionStore.loadSessions().catch(console.error);
};

// Store cleanup utilities
export const cleanupStores = () => {
  // Stop any active streams
  const gaitStore = useGaitStore.getState();
  if (gaitStore.isStreaming) {
    gaitStore.stopStream();
  }
  
  // Clear sensitive data
  gaitStore.clearBuffer();
  
  // Clear notifications
  const uiStore = useUiStore.getState();
  uiStore.clearNotifications();
};

// Store reset utilities (useful for testing)
export const resetStores = () => {
  // Reset auth store
  useAuthStore.getState().logout();
  
  // Reset role store
  useRoleStore.setState({ permissions: null });
  
  // Reset gait store
  const gaitStore = useGaitStore.getState();
  gaitStore.stopStream();
  gaitStore.clearBuffer();
  
  // Reset session store (keep persisted data)
  useSessionStore.setState({
    currentSession: null,
    isLoading: false,
    status: 'pending',
  });
  
  // Reset UI store (keep theme and sidebar preferences)
  const uiStore = useUiStore.getState();
  uiStore.clearNotifications();
  useUiStore.setState({ modals: {} });
};

// Store subscription utilities
export const subscribeToAuthChanges = (callback: (user: any) => void) => {
  return useAuthStore.subscribe(
    (state) => callback(state.user)
  );
};

export const subscribeToThemeChanges = (callback: (theme: string) => void) => {
  return useUiStore.subscribe(
    (state) => callback(state.theme)
  );
};

export const subscribeToStreamingChanges = (callback: (isStreaming: boolean) => void) => {
  return useGaitStore.subscribe(
    (state) => callback(state.isStreaming)
  );
};

// Store debugging utilities (development only)
if (process.env.NODE_ENV === 'development') {
  // Add stores to window for debugging
  if (typeof window !== 'undefined') {
    (window as any).stores = {
      auth: useAuthStore,
      role: useRoleStore,
      gait: useGaitStore,
      session: useSessionStore,
      ui: useUiStore,
    };
  }
}