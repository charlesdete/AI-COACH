export interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  roleDistribution: {
    teachers: number;
    coaches: number;
    admins: number;
  };
  userGrowth: {
    date: string;
    count: number;
  }[];
}

export interface SessionMetrics {
  totalSessions: number;
  completedSessions: number;
  averageDuration: number;
  completionRate: number;
  topicsCount: number;
  sessionsPerDay: {
    date: string;
    count: number;
  }[];
  topTopics: {
    topic: string;
    count: number;
  }[];
}

export interface TeamPerformance {
  totalCoaches: number;
  totalTeachers: number;
  coachEffectiveness: {
    coachId: string;
    coachName: string;
    teacherCount: number;
    sessionCount: number;
    averageRating: number;
  }[];
  teacherProgress: {
    teacherId: string;
    teacherName: string;
    progress: number;
    sessionsCompleted: number;
    lastSessionDate: string;
  }[];
  messageVolume: {
    date: string;
    messageCount: number;
  }[];
  engagementScore: {
    userId: string;
    userName: string;
    score: number;
  }[];
}

export interface AnalyticsOverview {
  userMetrics: UserMetrics;
  sessionMetrics: SessionMetrics;
  teamPerformance: TeamPerformance;
  generatedAt: string;
}
