// ─── sessionStore.ts ──────────────────────────────────────────────────────────
// Lightweight session tracking stored in localStorage.
// Replace the read/write calls here with your real API when your backend is ready.
// ─────────────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: "coach" | "user";
  text: string;
  timestamp: string; // ISO string — safe to serialise
}

export interface Session {
  id: string; // unique session id
  userId: string; // ties the session to a specific teacher
  topic: string; // decoded topic label
  title: string; // e.g. "Session 3"
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  status: "active" | "done";
  messages: ChatMessage[];
}

// ─── Storage key helpers ──────────────────────────────────────────────────────

function storageKey(userId: string): string {
  return `ai_coach_sessions_${userId}`;
}

// ─── Read / write ─────────────────────────────────────────────────────────────

export function getAllSessions(userId: string): Session[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? (JSON.parse(raw) as Session[]) : [];
  } catch {
    return [];
  }
}

function saveSessions(userId: string, sessions: Session[]): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(sessions));
}

// ─── Session CRUD ─────────────────────────────────────────────────────────────

/** Returns all sessions for a user filtered by topic. */
export function getSessionsByTopic(userId: string, topic: string): Session[] {
  return getAllSessions(userId)
    .filter((s) => s.topic === topic)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

/** Returns a single session by id, or null. */
export function getSession(userId: string, sessionId: string): Session | null {
  return getAllSessions(userId).find((s) => s.id === sessionId) ?? null;
}

/** Creates a brand-new session for the user on a given topic. Returns it. */
export function createSession(userId: string, topic: string): Session {
  const all = getAllSessions(userId);
  const topicSessions = all.filter((s) => s.topic === topic);
  const sessionNumber = topicSessions.length + 1;

  const now = new Date().toISOString();
  const newSession: Session = {
    id: `${userId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    userId,
    topic,
    title: `Session ${sessionNumber}`,
    createdAt: now,
    updatedAt: now,
    status: "active",
    messages: [],
  };

  saveSessions(userId, [...all, newSession]);
  return newSession;
}

/** Appends a message to a session and marks updatedAt. */
export function appendMessage(
  userId: string,
  sessionId: string,
  message: ChatMessage,
): void {
  const all = getAllSessions(userId);
  const updated = all.map((s) => {
    if (s.id !== sessionId) return s;
    return {
      ...s,
      messages: [...s.messages, message],
      updatedAt: new Date().toISOString(),
      status: "active" as const,
    };
  });
  saveSessions(userId, updated);
}

/** Marks a session as done. */
export function closeSession(userId: string, sessionId: string): void {
  const all = getAllSessions(userId);
  const updated = all.map((s) =>
    s.id === sessionId
      ? { ...s, status: "done" as const, updatedAt: new Date().toISOString() }
      : s,
  );
  saveSessions(userId, updated);
}

// ─── Date formatting helper ───────────────────────────────────────────────────

export function formatSessionDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Today, ${date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7)
    return date.toLocaleDateString("en-US", { weekday: "long" });
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
}
