import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Mock user data
const MOCK_USERS = [
  {
    id: '1',
    email: 'athlete@demo.com',
    password: 'athlete123',
    name: 'John Athlete',
    role: 'athlete' as const
  },
  {
    id: '2',
    email: 'nutritionist@demo.com',
    password: 'nutritionist123',
    name: 'Dr. Sarah Nutritionist',
    role: 'nutritionist' as const
  },
  {
    id: '3',
    email: 'demo@athlete.com',
    password: 'demo123',
    name: 'NeuroStep Athlete 1',
    role: 'athlete' as const
  },
  {
    id: '4',
    email: 'demo@nutritionist.com',
    password: 'demo123',
    name: 'NeuroStep Nutritionist 1',
    role: 'nutritionist' as const
  }
];

interface User {
  id: string;
  email: string;
  name: string;
  role: 'athlete' | 'nutritionist';
}

interface MockAuthState {
  user: User | null;
  role: 'athlete' | 'nutritionist' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tempLoggedIn: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setTempLoggedIn: (temp: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const useMockAuthStore = create<MockAuthState>()(persist(
  (set, get) => ({
    user: null,
    role: null,
    isAuthenticated: false,
    isLoading: false,
    tempLoggedIn: false,

    login: async (email: string, password: string) => {
      set({ isLoading: true });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = MOCK_USERS.find(u => u.email === email && u.password === password);
      
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        set({ 
          user: userWithoutPassword, 
          role: user.role, 
          isAuthenticated: true, 
          isLoading: false,
          tempLoggedIn: false
        });
        return { success: true };
      } else {
        set({ isLoading: false });
        return { success: false, error: 'Invalid email or password' };
      }
    },

    logout: () => {
      set({ 
        user: null, 
        role: null, 
        isAuthenticated: false, 
        tempLoggedIn: false 
      });
    },

    setTempLoggedIn: (temp: boolean) => {
      set({ tempLoggedIn: temp });
    },

    setLoading: (loading: boolean) => {
      set({ isLoading: loading });
    }
  }),
  {
    name: 'mock-auth-storage',
    partialize: (state) => ({ 
      user: state.user, 
      role: state.role, 
      isAuthenticated: state.isAuthenticated,
      tempLoggedIn: state.tempLoggedIn
    })
  }
));

// Export mock users for reference
export const getMockUsers = () => MOCK_USERS.map(({ password, ...user }) => user);