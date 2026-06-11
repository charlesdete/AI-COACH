import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  getSessionsByTopic,
  createSession,
  formatSessionDate,
} from "../../../store/sessionStore";
import type { Session } from "../../../store/sessionStore";
import "./LoopRooms.css";

// ─── Constants ────────────────────────────────────────────────────────────────

const TOPIC_ICONS: Record<string, string> = {
  "Connecting lessons to the Bible": "📖",
  "Managing student behavior": "🧭",
  "Engaging students": "✨",
  "Checking if students understand": "🎯",
  "Helping students struggling to learn": "🤝",
  "Something else": "💬",
};

// ─── Hook: current user ───────────────────────────────────────────────────────
// Replace this with your real auth hook (e.g. useAuth()) when ready.
// For now it returns a stable mock user id from localStorage.

function useCurrentUserId(): string {
  const key = "ai_coach_dev_user_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = `user_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LoopRooms() {
  const { topic } = useParams<{ topic: string }>();
  const navigate = useNavigate();
  const userId = useCurrentUserId();

  const decoded = topic ? decodeURIComponent(topic) : "Your topic";
  const icon = TOPIC_ICONS[decoded] ?? "💬";

  const [sessions, setSessions] = useState<Session[]>([]);

  // Load sessions for this user + topic on mount
  useEffect(() => {
    setSessions(getSessionsByTopic(userId, decoded));
  }, [userId, decoded]);

  function handleStartSession() {
    const session = createSession(userId, decoded);
    navigate(`/loop/${topic}/chat/${session.id}`);
  }

  const nextNumber = sessions.length + 1;

  return (
    <main className="looprooms-root">
      <Link to="/" className="looprooms-back">
        ← Back to dashboard
      </Link>

      <div className="looprooms-header">
        <span className="looprooms-topic-icon">{icon}</span>
        <h1 className="looprooms-title">{decoded}</h1>
        <p className="looprooms-subtitle">
          {sessions.length === 0
            ? "No sessions yet — start your first one below."
            : `${sessions.length} session${sessions.length !== 1 ? "s" : ""} · pick up where you left off or start fresh.`}
        </p>
      </div>

      <button className="looprooms-new-btn" onClick={handleStartSession}>
        + Start session {nextNumber}
      </button>

      {sessions.length > 0 && (
        <>
          <p className="looprooms-section-label">Previous sessions</p>

          <div className="looprooms-list">
            {sessions.map((session) => (
              <Link
                key={session.id}
                to={`/loop/${topic}/chat/${session.id}`}
                className="room-card"
              >
                <div className="room-card-icon">{icon}</div>

                <div className="room-card-body">
                  <p className="room-card-title">{session.title}</p>
                  <p className="room-card-meta">
                    {formatSessionDate(session.updatedAt)} ·{" "}
                    {session.messages.length} message
                    {session.messages.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <span className={`room-card-status ${session.status}`}>
                  {session.status === "active" ? "In progress" : "Done"}
                </span>

                <span className="room-card-chevron">›</span>
              </Link>
            ))}
          </div>
        </>
      )}

      {sessions.length === 0 && (
        <div className="looprooms-empty">
          Your sessions will appear here after you start one.
        </div>
      )}
    </main>
  );
}
