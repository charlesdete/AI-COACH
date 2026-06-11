import { create } from 'zustand';
import type { User, UserRole } from '../shared/types/user';

const DEMO_USERS: Record<string, User & { password: string }> = {
  'admin@school.com': {
    id: 'admin-1',
    email: 'admin@school.com',
    name: 'Admin User',
    role: 'admin',
    password: 'admin123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'coach@school.com': {
    id: 'coach-1',
    email: 'coach@school.com',
    name: 'Coach Sarah',
    role: 'coach',
    password: 'coach123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'teacher@school.com': {
    id: 'teacher-1',
    email: 'teacher@school.com',
    name: 'Mr. Johnson',
    role: 'teacher',
    password: 'teacher123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'teacher2@school.com': {
    id: 'teacher-2',
    email: 'teacher2@school.com',
    name: 'Ms. Williams',
    role: 'teacher',
    password: 'teacher123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'teacher3@school.com': {
    id: 'teacher-3',
    email: 'teacher3@school.com',
    name: 'Mr. Davis',
    role: 'teacher',
    password: 'teacher123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User | null) => void;
  clearError: () => void;
  getDefaultRoute: () => string;
}

const getSavedUser = (): User | null => {
  try {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getSavedUser(),
  isAuthenticated: !!getSavedUser(),
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    await new Promise((r) => setTimeout(r, 600));
    const match = DEMO_USERS[email.toLowerCase()];
    if (match && match.password === password) {
      const { password: _p, ...user } = match;
      localStorage.setItem('auth_user', JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
      return true;
    }
    set({ error: 'Invalid email or password', isLoading: false });
    return false;
  },

  logout: () => {
    localStorage.removeItem('auth_user');
    set({ user: null, isAuthenticated: false, error: null });
  },

  setUser: (user) => {
    if (user) localStorage.setItem('auth_user', JSON.stringify(user));
    else localStorage.removeItem('auth_user');
    set({ user, isAuthenticated: !!user });
  },

  clearError: () => set({ error: null }),

  getDefaultRoute: () => {
    const { user } = get();
    if (!user) return '/login';
    const routes: Record<UserRole, string> = {
      admin: '/admin',
      coach: '/coach',
      teacher: '/dashboard',
    };
    return routes[user.role] || '/login';
  },
}));

export const DEMO_CREDENTIALS = [
  { role: 'Admin', email: 'admin@school.com', password: 'admin123' },
  { role: 'Coach', email: 'coach@school.com', password: 'coach123' },
  { role: 'Teacher', email: 'teacher@school.com', password: 'teacher123' },
];
