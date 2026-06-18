import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  getSessionsByTopic,
  getAllSessions,
  createSession,
  formatSessionDate,
} from "../../../store/sessionStore";
import type { Session } from "../../../store/sessionStore";
import { useAuthStore } from "../../../store/authStore";
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

// ─── Component ────────────────────────────────────────────────────────────────

export default function LoopRooms() {
  const { topic } = useParams<{ topic: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const userId = user?.id ?? "anonymous";

  const decoded = topic ? decodeURIComponent(topic) : "Your topic";
  const icon = TOPIC_ICONS[decoded] ?? "💬";

  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeElsewhere, setActiveElsewhere] = useState<Session | null>(null);

  // Load sessions for this user + topic on mount; redirect if any active loop exists
  useEffect(() => {
    const topicSessions = getSessionsByTopic(userId, decoded);
    setSessions(topicSessions);

    const activeHereNow = topicSessions.find((s) => s.status === "active");
    if (activeHereNow) {
      navigate(`/loop/${topic}/chat/${activeHereNow.id}`, { replace: true });
      return;
    }

    const activeOther = getAllSessions(userId).find(
      (s) => s.status === "active" && s.topic !== decoded
    );
    if (activeOther) {
      navigate(
        `/loop/${encodeURIComponent(activeOther.topic)}/chat/${activeOther.id}`,
        { replace: true }
      );
      return;
    }

    setActiveElsewhere(null);
  }, [userId, decoded, topic, navigate]);

  const activeHere = sessions.find((s) => s.status === "active") ?? null;
  const canStartNew = !activeHere && !activeElsewhere;

  function handleStartSession() {
    if (!canStartNew) return;
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
            ? "No loops yet — start your first one below."
            : `${sessions.length} loop${sessions.length !== 1 ? "s" : ""} · pick up where you left off or start fresh.`}
        </p>
      </div>

      {activeHere && (
        <Link
          to={`/loop/${topic}/chat/${activeHere.id}`}
          className="looprooms-new-btn"
        >
          Continue active loop →
        </Link>
      )}

      {activeElsewhere && !activeHere && (
        <div className="looprooms-active-notice">
          You have an active loop on <strong>{activeElsewhere.topic}</strong>.
          Your coach must close it before you can start a new one.{" "}
          <Link
            to={`/loop/${encodeURIComponent(activeElsewhere.topic)}/chat/${activeElsewhere.id}`}
            className="looprooms-active-link"
          >
            Go to that loop →
          </Link>
        </div>
      )}

      {canStartNew && (
        <button className="looprooms-new-btn" onClick={handleStartSession}>
          + Start loop {nextNumber}
        </button>
      )}

      {sessions.length > 0 && (
        <>
          <p className="looprooms-section-label">Previous loops</p>

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
          Your loops will appear here after you start one.
        </div>
      )}
    </main>
  );
}
