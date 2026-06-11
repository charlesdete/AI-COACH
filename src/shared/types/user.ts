export type UserRole = 'admin' | 'coach' | 'teacher';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Teacher extends User {
  role: 'teacher';
  coachId: string;
  assignedCoach?: Coach;
  progress?: number;
}

export interface Coach extends User {
  role: 'coach';
  assignedTeachers?: Teacher[];
  teacherCount?: number;
}

export interface Admin extends User {
  role: 'admin';
  permissions?: string[];
}
