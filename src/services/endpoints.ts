// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  ME: '/auth/me',
};

// Messaging endpoints
export const MESSAGE_ENDPOINTS = {
  SEND_MESSAGE: '/messages',
  GET_CONVERSATION: (conversationId: string) => `/messages/${conversationId}`,
  GET_CONVERSATIONS: '/conversations',
  DELETE_MESSAGE: (messageId: string) => `/messages/${messageId}`,
  START_CONVERSATION: '/conversations/start',
};

// Admin endpoints
export const ADMIN_ENDPOINTS = {
  ANALYTICS_OVERVIEW: '/admin/analytics/overview',
  USER_METRICS: '/admin/analytics/users',
  SESSION_METRICS: '/admin/analytics/sessions',
  TEAM_PERFORMANCE: '/admin/analytics/team-performance',
  GET_USERS: '/admin/users',
  CREATE_USER: '/admin/users',
  UPDATE_USER: (userId: string) => `/admin/users/${userId}`,
  DELETE_USER: (userId: string) => `/admin/users/${userId}`,
};

// Coach endpoints
export const COACH_ENDPOINTS = {
  GET_TEACHERS: '/coach/teachers',
  GET_TEACHER: (teacherId: string) => `/coach/teachers/${teacherId}`,
  UPDATE_TEACHER: (teacherId: string) => `/coach/teachers/${teacherId}`,
  GET_ANALYTICS: '/coach/analytics',
  GET_SESSIONS: '/coach/sessions',
};

// Teacher endpoints
export const TEACHER_ENDPOINTS = {
  GET_COACH: '/teacher/coach',
  GET_SESSIONS: '/teacher/sessions',
  GET_PROGRESS: '/teacher/progress',
  UPDATE_PROGRESS: '/teacher/progress',
};

// User endpoints
export const USER_ENDPOINTS = {
  GET_PROFILE: '/user/profile',
  UPDATE_PROFILE: '/user/profile',
  GET_SETTINGS: '/user/settings',
  UPDATE_SETTINGS: '/user/settings',
};
