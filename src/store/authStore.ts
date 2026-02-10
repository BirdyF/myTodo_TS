import { create } from 'zustand';
import { User, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

interface AuthState {
  user: User | null;
  syncEnabled: boolean;
  setUser: (user: User | null) => void;
  setSyncEnabled: (enabled: boolean) => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  syncEnabled: false,
  setUser: (user) => set({ user }),
  setSyncEnabled: (syncEnabled) => set({ syncEnabled }),
  signInWithGoogle: async () => {
    const result = await signInWithPopup(auth, googleProvider);
    set({ user: result.user, syncEnabled: true });
  },
  signOut: async () => {
    await firebaseSignOut(auth);
    set({ user: null, syncEnabled: false });
  },
}));
