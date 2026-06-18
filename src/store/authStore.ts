import { create } from 'zustand';
import type { User, UserRole } from '../shared/types/user';

// ─── Static demo users ────────────────────────────────────────────────────────

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
  'coach2@school.com': {
    id: 'coach-2',
    email: 'coach2@school.com',
    name: 'Coach Michael',
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
  'teacher4@school.com': {
    id: 'teacher-4',
    email: 'teacher4@school.com',
    name: 'Ms. Brown',
    role: 'teacher',
    password: 'teacher123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'teacher5@school.com': {
    id: 'teacher-5',
    email: 'teacher5@school.com',
    name: 'Mr. Wilson',
    role: 'teacher',
    password: 'teacher123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

// ─── Dynamic user storage ─────────────────────────────────────────────────────

const DYNAMIC_USERS_KEY = 'ai_coach_dynamic_users';

type StoredUser = User & { password: string };

function getDynamicUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(DYNAMIC_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDynamicUsers(users: StoredUser[]): void {
  localStorage.setItem(DYNAMIC_USERS_KEY, JSON.stringify(users));
}

export function getDynamicCoaches(): User[] {
  return getDynamicUsers().map(({ password: _p, ...u }) => u);
}

export function addCoach(
  name: string,
  email: string,
  password: string,
  isAlsoAdmin: boolean,
): { success: boolean; error?: string } {
  return addUser(name, email, password, 'coach', isAlsoAdmin);
}

export function addUser(
  name: string,
  email: string,
  password: string,
  role: UserRole,
  isAlsoAdmin = false,
): { success: boolean; error?: string } {
  const emailLower = email.toLowerCase().trim();
  if (DEMO_USERS[emailLower])
    return { success: false, error: 'A user with this email already exists.' };
  if (getDynamicUsers().find((u) => u.email === emailLower))
    return { success: false, error: 'A user with this email already exists.' };

  const now = new Date().toISOString();
  const isDual = isAlsoAdmin && role === 'coach';
  const newUser: StoredUser = {
    id: `${role}-dyn-${Date.now()}`,
    email: emailLower,
    name: name.trim(),
    role: isDual ? 'admin' : role,
    roles: isDual ? ['admin', 'coach'] : [role],
    password,
    createdAt: now,
    updatedAt: now,
  };
  saveDynamicUsers([...getDynamicUsers(), newUser]);
  return { success: true };
}

export function editDynamicUser(
  id: string,
  updates: { name?: string; email?: string; role?: UserRole; isAlsoAdmin?: boolean; password?: string },
): { success: boolean; error?: string } {
  const users = getDynamicUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return { success: false, error: 'User not found.' };

  const existing = users[idx];
  const emailLower = updates.email ? updates.email.toLowerCase().trim() : existing.email;

  if (updates.email && emailLower !== existing.email) {
    if (DEMO_USERS[emailLower]) return { success: false, error: 'Email already in use.' };
    if (users.find((u, i) => i !== idx && u.email === emailLower))
      return { success: false, error: 'Email already in use.' };
  }

  const role = updates.role ?? (existing.roles?.includes('coach') ? 'coach' : existing.role);
  const isDual = updates.isAlsoAdmin ?? (existing.roles?.includes('admin') && existing.roles?.includes('coach'));

  const updated: StoredUser = {
    ...existing,
    name: updates.name?.trim() ?? existing.name,
    email: emailLower,
    role: isDual && role === 'coach' ? 'admin' : role,
    roles: isDual && role === 'coach' ? ['admin', 'coach'] : [role],
    password: updates.password ?? existing.password,
    updatedAt: new Date().toISOString(),
  };

  const next = [...users];
  next[idx] = updated;
  saveDynamicUsers(next);
  return { success: true };
}

export function deleteDynamicUser(id: string): void {
  saveDynamicUsers(getDynamicUsers().filter((u) => u.id !== id));
}

// ─── Dynamic assignment storage ───────────────────────────────────────────────

const ASSIGNMENTS_KEY = 'ai_coach_assignments';

// Seed map that also serves as the always-available fallback
export const TEACHER_COACH_MAP: Record<string, string> = {
  'teacher-1': 'coach-1',
  'teacher-2': 'coach-1',
  'teacher-3': 'coach-2',
  'teacher-4': 'coach-2',
  'teacher-5': 'coach-1',
};

function loadAssignments(): Record<string, string> {
  try {
    const raw = localStorage.getItem(ASSIGNMENTS_KEY);
    return raw ? JSON.parse(raw) : { ...TEACHER_COACH_MAP };
  } catch {
    return { ...TEACHER_COACH_MAP };
  }
}

function persistAssignments(map: Record<string, string>): void {
  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(map));
}

export function getEffectiveAssignments(): Record<string, string> {
  return loadAssignments();
}

// ─── Auth store ───────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  assignments: Record<string, string>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User | null) => void;
  clearError: () => void;
  getDefaultRoute: () => string;
  setAssignment: (teacherId: string, coachId: string) => void;
  removeAssignment: (teacherId: string) => void;
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
    const emailLower = email.toLowerCase().trim();
    const match = DEMO_USERS[emailLower];
    if (match && match.password === password) {
      const { password: _p, ...user } = match;
      localStorage.setItem('auth_user', JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
      return true;
    }
    const dynMatch = getDynamicUsers().find((u) => u.email === emailLower && u.password === password);
    if (dynMatch) {
      const { password: _p, ...user } = dynMatch;
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

  assignments: loadAssignments(),

  setAssignment: (teacherId, coachId) => {
    const updated = { ...loadAssignments(), [teacherId]: coachId };
    persistAssignments(updated);
    set({ assignments: updated });
  },

  removeAssignment: (teacherId) => {
    const updated = { ...loadAssignments() };
    delete updated[teacherId];
    persistAssignments(updated);
    set({ assignments: updated });
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
  { role: 'Coach Sarah', email: 'coach@school.com', password: 'coach123' },
  { role: 'Coach Michael', email: 'coach2@school.com', password: 'coach123' },
  { role: 'Teacher', email: 'teacher@school.com', password: 'teacher123' },
];

// ─── Teacher profiles ─────────────────────────────────────────────────────────

export interface TeacherProfile {
  id: string;
  name: string;
  topic: string;
  progress: number;
}

export const TEACHER_PROFILES: Record<string, TeacherProfile> = {
  'teacher-1': { id: 'teacher-1', name: 'Mr. Johnson',  topic: 'Engaging students',                    progress: 75 },
  'teacher-2': { id: 'teacher-2', name: 'Ms. Williams', topic: 'Managing student behavior',            progress: 82 },
  'teacher-3': { id: 'teacher-3', name: 'Mr. Davis',    topic: 'Connecting lessons to the Bible',      progress: 60 },
  'teacher-4': { id: 'teacher-4', name: 'Ms. Brown',    topic: 'Checking if students understand',      progress: 68 },
  'teacher-5': { id: 'teacher-5', name: 'Mr. Wilson',   topic: 'Helping students struggling to learn', progress: 45 },
};

// ─── Coach name lookup ────────────────────────────────────────────────────────

export const COACH_NAMES: Record<string, string> = {
  'coach-1': 'Coach Sarah',
  'coach-2': 'Coach Michael',
};

function resolveCoachDisplayName(coachId: string): string {
  if (COACH_NAMES[coachId]) return COACH_NAMES[coachId];
  const dyn = getDynamicUsers().find((u) => u.id === coachId);
  return dyn?.name ?? 'Unknown Coach';
}

export function getCoachName(teacherId: string): string {
  const coachId = loadAssignments()[teacherId];
  return coachId ? resolveCoachDisplayName(coachId) : 'Your Coach';
}

export function getCoachIdForTeacher(teacherId: string): string | null {
  return loadAssignments()[teacherId] ?? null;
}

export function getTeachersForCoach(coachId: string): TeacherProfile[] {
  return Object.entries(loadAssignments())
    .filter(([, cId]) => cId === coachId)
    .map(([tId]) => TEACHER_PROFILES[tId])
    .filter((p): p is TeacherProfile => Boolean(p));
}

// ─── Coach list helper ────────────────────────────────────────────────────────

export interface CoachInfo {
  id: string;
  name: string;
  email: string;
}

export function getAllCoaches(): CoachInfo[] {
  const demo = Object.values(DEMO_USERS)
    .filter((u) => u.role === 'coach' || (u as User).roles?.includes('coach'))
    .map((u) => ({ id: u.id, name: u.name, email: u.email }));
  const dyn = getDynamicUsers()
    .filter((u) => u.role === 'coach' || u.roles?.includes('coach'))
    .map((u) => ({ id: u.id, name: u.name, email: u.email }));
  return [...demo, ...dyn];
}

// ─── Coach profile content ────────────────────────────────────────────────────

export interface CoachProfileData {
  id: string;
  bio: string;
  specialties: string[];
  joinedYear: number;
}

export const COACH_PROFILES_DATA: Record<string, CoachProfileData> = {
  'coach-1': {
    id: 'coach-1',
    bio: 'Passionate educator and coach with 8 years of experience supporting teachers across primary and secondary schools. I believe every teacher has the potential to transform lives — sometimes they just need a thinking partner.',
    specialties: ['Student Engagement', 'Behaviour Management', 'Faith-integrated Teaching'],
    joinedYear: 2020,
  },
  'coach-2': {
    id: 'coach-2',
    bio: 'Dedicated to helping teachers connect Scripture with daily classroom practice and develop their unique teaching identity. My coaching is built on trust, reflection, and practical growth.',
    specialties: ['Biblical Integration', 'Student Assessment', 'Differentiated Instruction'],
    joinedYear: 2021,
  },
};
