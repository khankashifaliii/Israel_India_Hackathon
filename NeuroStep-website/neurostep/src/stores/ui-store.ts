import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UiStore } from '@/lib/contracts';

/**
 * UI state management store for theme, modals, notifications, and global UI state
 */
export const useUiStore = create<UiStore>()(persist(
  (set, get) => ({
    theme: 'system',
    sidebarOpen: true,
    modals: {},
    notifications: [],

    setTheme: (theme: 'light' | 'dark' | 'system') => {
      set({ theme });
      
      // Apply theme to document
      const root = document.documentElement;
      
      if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', prefersDark);
      } else {
        root.classList.toggle('dark', theme === 'dark');
      }
    },

    toggleSidebar: () => {
      set(state => ({ sidebarOpen: !state.sidebarOpen }));
    },

    openModal: (modalId: string) => {
      set(state => ({
        modals: {
          ...state.modals,
          [modalId]: true,
        },
      }));
    },

    closeModal: (modalId: string) => {
      set(state => ({
        modals: {
          ...state.modals,
          [modalId]: false,
        },
      }));
    },

    addNotification: (notification) => {
      const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = Date.now();
      
      const newNotification = {
        ...notification,
        id,
        timestamp,
      };
      
      set(state => ({
        notifications: [...state.notifications, newNotification],
      }));
      
      // Auto-remove notification after 5 seconds (except for error notifications)
      if (notification.type !== 'error') {
        setTimeout(() => {
          get().removeNotification(id);
        }, 5000);
      }
    },

    removeNotification: (id: string) => {
      set(state => ({
        notifications: state.notifications.filter(n => n.id !== id),
      }));
    },

    clearNotifications: () => {
      set({ notifications: [] });
    },
  }),
  {
    name: 'neurostep-ui',
    partialize: (state) => ({ 
      theme: state.theme,
      sidebarOpen: state.sidebarOpen,
    }),
  }
));

// Selectors for easier access
export const useTheme = () => useUiStore(state => state.theme);
export const useSidebarOpen = () => useUiStore(state => state.sidebarOpen);
export const useModals = () => useUiStore(state => state.modals);
export const useNotifications = () => useUiStore(state => state.notifications);

// Modal-specific selectors
export const useIsModalOpen = (modalId: string) => useUiStore(state => 
  state.modals[modalId] ?? false
);

// Notification-specific selectors
export const useNotificationCount = () => useUiStore(state => state.notifications.length);

export const useNotificationsByType = (type: 'success' | 'error' | 'warning' | 'info') => 
  useUiStore(state => state.notifications.filter(n => n.type === type));

export const useHasUnreadNotifications = () => useUiStore(state => {
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  return state.notifications.some(n => n.timestamp > fiveMinutesAgo);
});

// Theme utilities
export const useIsDarkMode = () => useUiStore(state => {
  if (state.theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return state.theme === 'dark';
});

// Common modal IDs (for consistency across the app)
export const MODAL_IDS = {
  PROFILE_SETTINGS: 'profile-settings',
  SESSION_CONFIG: 'session-config',
  EXPORT_DATA: 'export-data',
  NUTRITION_PLAN: 'nutrition-plan',
  GAIT_SNAPSHOT: 'gait-snapshot',
  CONFIRM_DELETE: 'confirm-delete',
  HELP_TUTORIAL: 'help-tutorial',
  ACCESSIBILITY_AUDIT: 'accessibility-audit',
} as const;

// Notification helpers
export const useNotificationActions = () => {
  const { addNotification, removeNotification, clearNotifications } = useUiStore();
  
  return {
    showSuccess: (message: string) => addNotification({ type: 'success', message }),
    showError: (message: string) => addNotification({ type: 'error', message }),
    showWarning: (message: string) => addNotification({ type: 'warning', message }),
    showInfo: (message: string) => addNotification({ type: 'info', message }),
    removeNotification,
    clearAll: clearNotifications,
  };
};

// Modal helpers
export const useModalActions = () => {
  const { openModal, closeModal } = useUiStore();
  
  return {
    openModal,
    closeModal,
    openProfileSettings: () => openModal(MODAL_IDS.PROFILE_SETTINGS),
    openSessionConfig: () => openModal(MODAL_IDS.SESSION_CONFIG),
    openExportData: () => openModal(MODAL_IDS.EXPORT_DATA),
    openNutritionPlan: () => openModal(MODAL_IDS.NUTRITION_PLAN),
    openGaitSnapshot: () => openModal(MODAL_IDS.GAIT_SNAPSHOT),
    openConfirmDelete: () => openModal(MODAL_IDS.CONFIRM_DELETE),
    openHelpTutorial: () => openModal(MODAL_IDS.HELP_TUTORIAL),
    openAccessibilityAudit: () => openModal(MODAL_IDS.ACCESSIBILITY_AUDIT),
  };
};

// Initialize theme on app start
if (typeof window !== 'undefined') {
  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleThemeChange = () => {
    const { theme, setTheme } = useUiStore.getState();
    if (theme === 'system') {
      setTheme('system'); // Trigger theme update
    }
  };
  
  mediaQuery.addEventListener('change', handleThemeChange);
  
  // Apply initial theme
  const { theme, setTheme } = useUiStore.getState();
  setTheme(theme);
}