import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export type UserRole = 'athlete' | 'nutritionist';

interface AuthState {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setRole: (role: UserRole | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User, role: UserRole) => void;
  logout: () => void;
  
  // Firebase auth methods
  signInWithEmail: (email: string, password: string, role: UserRole) => Promise<void>;
  signUpWithEmail: (email: string, password: string, role: UserRole) => Promise<void>;
  signInWithGoogle: (role: UserRole) => Promise<void>;
  signOutUser: () => Promise<void>;
  
  // Temporary flag for development
  tempLoggedIn: boolean;
  setTempLoggedIn: (loggedIn: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      role: null,
      isAuthenticated: false,
      isLoading: true,
      tempLoggedIn: false, // For development purposes
      
      setUser: (user) => {
        set({ 
          user, 
          isAuthenticated: !!user,
          isLoading: false 
        });
      },
      
      setRole: (role) => {
        set({ role });
      },
      
      setLoading: (loading) => {
        set({ isLoading: loading });
      },
      
      login: (user, role) => {
        set({ 
          user, 
          role, 
          isAuthenticated: true, 
          isLoading: false,
          tempLoggedIn: true 
        });
      },
      
      logout: () => {
        set({ 
          user: null, 
          role: null, 
          isAuthenticated: false, 
          isLoading: false,
          tempLoggedIn: false 
        });
      },
      
      // Firebase authentication methods
      signInWithEmail: async (email: string, password: string, role: UserRole) => {
        try {
          set({ isLoading: true });
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          
          set({ 
            user, 
            role, 
            isAuthenticated: true, 
            isLoading: false,
            tempLoggedIn: true 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      signUpWithEmail: async (email: string, password: string, role: UserRole) => {
        try {
          set({ isLoading: true });
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          
          set({ 
            user, 
            role, 
            isAuthenticated: true, 
            isLoading: false,
            tempLoggedIn: true 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      signInWithGoogle: async (role: UserRole) => {
        try {
          set({ isLoading: true });
          const provider = new GoogleAuthProvider();
          const userCredential = await signInWithPopup(auth, provider);
          const user = userCredential.user;
          
          set({ 
            user, 
            role, 
            isAuthenticated: true, 
            isLoading: false,
            tempLoggedIn: true 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      signOutUser: async () => {
        try {
          await signOut(auth);
          set({ 
            user: null, 
            role: null, 
            isAuthenticated: false, 
            isLoading: false,
            tempLoggedIn: false 
          });
        } catch (error) {
          console.error('Error signing out:', error);
          throw error;
        }
      },
      
      setTempLoggedIn: (loggedIn) => {
        set({ 
          tempLoggedIn: loggedIn,
          isAuthenticated: loggedIn,
          role: loggedIn ? 'athlete' : null // Default to athlete for demo
        });
      }
    }),
    {
      name: 'neurostep-auth',
      partialize: (state) => ({ 
        tempLoggedIn: state.tempLoggedIn,
        role: state.role 
      })
    }
  )
);