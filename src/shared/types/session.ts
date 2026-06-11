export interface Session {
  id: string;
  teacherId: string;
  coachId: string;
  topic: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  feedback?: string;
  recordingUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionStats {
  totalSessions: number;
  completedSessions: number;
  averageDuration: number;
  completionRate: number;
  topicsCount: number;
}
