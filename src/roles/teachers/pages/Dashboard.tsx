import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { useAuthStore } from "../../../store/authStore";
import { useMessagingStore } from "../../../store/messagingStore";
import { getAllSessions } from "../../../store/sessionStore";

const options = [
  {
    label: "Connecting lessons to the Bible",
    icon: "📖",
    description: "Bridge scripture to real classroom moments",
    badge: null,
  },
  {
    label: "Managing student behavior",
    icon: "🧭",
    description: "Strategies for a calm, focused room",
    badge: null,
  },
  {
    label: "Engaging students",
    icon: "✨",
    description: "Keep every learner active and curious",
    badge: "Popular",
  },
  {
    label: "Checking if students understand",
    icon: "🎯",
    description: "Formative checks that actually reveal gaps",
    badge: null,
  },
  {
    label: "Helping students struggling to learn",
    icon: "🤝",
    description: "Meet every learner where they are",
    badge: null,
  },
  {
    label: "Something else",
    icon: "💬",
    description: "Bring your own challenge to the coach",
    badge: null,
  },
];

const stats = [
  { value: "12", label: "Loops" },
  { value: "4", label: "Topics" },
  { value: "3", label: "This week" },
];

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const { conversations, getTotalUnread } = useMessagingStore();
  const totalUnread = getTotalUnread();
  const navigate = useNavigate();
  const userId = user?.id ?? "anonymous";

  useEffect(() => {
    const active = getAllSessions(userId).find((s) => s.status === "active");
    if (active) {
      navigate(
        `/loop/${encodeURIComponent(active.topic)}/chat/${active.id}`,
        { replace: true }
      );
    }
  }, [userId, navigate]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <main className="dashboard-root">
      <div className="dashboard-topbar">
        <div className="dashboard-topbar-left">
          <span className="dashboard-brand">🎓 AI-COACH</span>
          {user && <span className="dashboard-user-name">Hi, {user.name.split(' ')[0]}</span>}
        </div>
        <div className="dashboard-topbar-right">
          <Link to="/teacher/messages" className="dashboard-msg-btn">
            💬 My Coach
            {totalUnread > 0 && <span className="dashboard-msg-badge">{totalUnread}</span>}
          </Link>
          <button className="dashboard-logout-btn" onClick={handleLogout}>Sign out</button>
        </div>
      </div>

      <header className="dashboard-header">
        <p className="dashboard-eyebrow">{today}</p>
        <h1 className="dashboard-title">
          What do you want to improve this week?
        </h1>
        <p className="dashboard-subtitle">
          Pick a focus area and your AI coach will guide you through a
          personalised growth loop.
        </p>
      </header>

      <div className="dashboard-stats">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="options-grid">
        {options.map((option, i) => {
          const isLast = i === options.length - 1;
          const isOddTotal = options.length % 2 !== 0;
          const spanFull = isLast && isOddTotal;

          return (
            <Link
              key={option.label}
              to={`/loop/${encodeURIComponent(option.label)}`}
              className={`option-card${spanFull ? " span-full" : ""}`}
            >
              {option.badge && (
                <span className="option-badge">{option.badge}</span>
              )}
              <span className="option-icon">{option.icon}</span>
              <span className="option-label">{option.label}</span>
              <span className="option-description">{option.description}</span>
            </Link>
          );
        })}
      </div>

      <div className="session-strip">
        <span className="session-dot" />
        <span>AI coach ready · loops are saved to your profile</span>
      </div>
    </main>
  );
}
