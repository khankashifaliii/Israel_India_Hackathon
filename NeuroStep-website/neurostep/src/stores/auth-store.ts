import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthStore, LoginRequest, User, UserProfile } from '@/lib/contracts';

/**
 * Authentication store for managing user login state, profile, and authentication flow
 */
export const useAuthStore = create<AuthStore>()(persist(
  (set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,

    login: async (credentials: LoginRequest) => {
      set({ isLoading: true });
      
      try {
        // Mock login - replace with actual API call
        const mockUser: User = {
          id: 'user-123',
          email: credentials.email,
          name: credentials.email.split('@')[0],
          role: 'patient', // Default role, should come from API
          isActive: true,
          createdAt: new Date().toISOString(),
          profile: {
            firstName: 'John',
            lastName: 'Doe',
            preferences: {
              theme: 'system',
              language: 'en',
              notifications: true,
              dataSharing: false,
            },
          },
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        set({ 
          user: mockUser, 
          isAuthenticated: true, 
          isLoading: false 
        });
      } catch (error) {
        set({ isLoading: false });
        throw new Error('Login failed');
      }
    },

    logout: () => {
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      });
    },

    refreshToken: async () => {
      const { user } = get();
      if (!user) return;
      
      try {
        // Mock token refresh - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update last login time
        set({ 
          user: { 
            ...user, 
            lastLogin: new Date().toISOString() 
          } 
        });
      } catch (error) {
        // If refresh fails, logout user
        get().logout();
        throw new Error('Token refresh failed');
      }
    },

    updateProfile: async (profileUpdates: Partial<UserProfile>) => {
      const { user } = get();
      if (!user) throw new Error('No user logged in');
      
      set({ isLoading: true });
      
      try {
        // Mock profile update - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const updatedUser: User = {
          ...user,
          profile: {
            ...user.profile,
            ...profileUpdates,
          },
        };
        
        set({ 
          user: updatedUser, 
          isLoading: false 
        });
      } catch (error) {
        set({ isLoading: false });
        throw new Error('Profile update failed');
      }
    },
  }),
  {
    name: 'neurostep-auth',
    partialize: (state) => ({ 
      user: state.user, 
      isAuthenticated: state.isAuthenticated 
    }),
  }
));

// Selectors for easier access to specific parts of the store
export const useUser = () => useAuthStore(state => state.user);
export const useIsAuthenticated = () => useAuthStore(state => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore(state => state.isLoading);
export const useUserRole = () => useAuthStore(state => state.user?.role);
export const useUserPreferences = () => useAuthStore(state => state.user?.profile.preferences);