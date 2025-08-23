import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Predefined user credentials
const PREDEFINED_USERS = [
  // Athletes
  {
    id: 'athlete-001',
    username: 'athlete1',
    password: 'athlete123',
    name: 'John Smith',
    role: 'athlete' as const,
    email: 'john.athlete@neurostep.com'
  },
  {
    id: 'athlete-002',
    username: 'athlete2',
    password: 'athlete123',
    name: 'Sarah Johnson',
    role: 'athlete' as const,
    email: 'sarah.athlete@neurostep.com'
  },
  {
    id: 'athlete-003',
    username: 'demo_athlete',
    password: 'demo123',
    name: 'NeuroStep Athlete 1',
    role: 'athlete' as const,
    email: 'demo.athlete@neurostep.com'
  },
  // Physiotherapists
  {
    id: 'physio-001',
    username: 'physio1',
    password: 'physio123',
    name: 'Dr. Michael Brown',
    role: 'physiotherapist' as const,
    email: 'michael.physio@neurostep.com'
  },
  {
    id: 'physio-002',
    username: 'physio2',
    password: 'physio123',
    name: 'Dr. Emily Davis',
    role: 'physiotherapist' as const,
    email: 'emily.physio@neurostep.com'
  },
  {
    id: 'physio-003',
    username: 'demo_physio',
    password: 'demo123',
    name: 'NeuroStep Physiotherapist 1',
    role: 'physiotherapist' as const,
    email: 'demo.physio@neurostep.com'
  },
  // Nutritionists
  {
    id: 'nutritionist-001',
    username: 'nutritionist1',
    password: 'nutri123',
    name: 'Dr. Lisa Wilson',
    role: 'nutritionist' as const,
    email: 'lisa.nutritionist@neurostep.com'
  },
  {
    id: 'nutritionist-002',
    username: 'nutritionist2',
    password: 'nutri123',
    name: 'Dr. Mark Thompson',
    role: 'nutritionist' as const,
    email: 'mark.nutritionist@neurostep.com'
  },
  {
    id: 'nutritionist-003',
    username: 'demo_nutritionist',
    password: 'demo123',
    name: 'NeuroStep Nutritionist 1',
    role: 'nutritionist' as const,
    email: 'demo.nutritionist@neurostep.com'
  }
];

interface User {
  id: string;
  username: string;
  name: string;
  role: 'athlete' | 'nutritionist' | 'physiotherapist';
  email: string;
}

interface SimpleAuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setTempLoggedIn: (temp: boolean) => void;
}

export const useSimpleAuthStore = create<SimpleAuthState>()(persist(
  (set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,

    login: async (username: string, password: string) => {
      set({ isLoading: true });
      
      // Simulate minimal loading time for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const user = PREDEFINED_USERS.find(u => u.username === username && u.password === password);
      
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        set({ 
          user: userWithoutPassword, 
          isAuthenticated: true, 
          isLoading: false
        });
        return { success: true };
      } else {
        set({ isLoading: false });
        return { success: false, error: 'Invalid username or password' };
      }
    },

    logout: () => {
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false
      });
    },

    setTempLoggedIn: (temp: boolean) => {
      if (temp) {
        // Set a default athlete user for temp login
        const defaultUser = PREDEFINED_USERS.find(u => u.username === 'demo_athlete');
        if (defaultUser) {
          const { password: _, ...userWithoutPassword } = defaultUser;
          set({ 
            user: userWithoutPassword, 
            isAuthenticated: true 
          });
        }
      } else {
        set({ 
          user: null, 
          isAuthenticated: false 
        });
      }
    }
  }),
  {
    name: 'simple-auth-storage',
    partialize: (state) => ({ 
      user: state.user, 
      isAuthenticated: state.isAuthenticated
    })
  }
));

// Export predefined users for reference (without passwords)
export const getPredefinedUsers = () => PREDEFINED_USERS.map(({ password, ...user }) => user);

// Helper function to get demo credentials
export const getDemoCredentials = () => ({
  athlete: { username: 'demo_athlete', password: 'demo123' },
  physiotherapist: { username: 'demo_physio', password: 'demo123' },
  nutritionist: { username: 'demo_nutritionist', password: 'demo123' }
});