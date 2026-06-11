import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getSession,
  appendMessage,
  closeSession,
} from "../../../store/sessionStore";
import type { ChatMessage, Session } from "../../../store/sessionStore";
import "./ChatRooms.css";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(isoOrDate: string | Date): string {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TOPIC_ICONS: Record<string, string> = {
  "Connecting lessons to the Bible": "📖",
  "Managing student behavior": "🧭",
  "Engaging students": "✨",
  "Checking if students understand": "🎯",
  "Helping students struggling to learn": "🤝",
  "Something else": "💬",
};

const SUGGESTIONS: Record<string, string[]> = {
  "Connecting lessons to the Bible": [
    "Give me a bridge for today's lesson",
    "Suggest a relevant passage",
    "Help me with a Psalm-based opener",
  ],
  "Managing student behavior": [
    "What do I do when a student is disruptive?",
    "Give me a de-escalation strategy",
    "Help me set clearer expectations",
  ],
  "Engaging students": [
    "How do I hook a distracted class?",
    "Give me an opening activity",
    "Suggest a group discussion technique",
  ],
  "Checking if students understand": [
    "What's a quick formative check?",
    "Help me write an exit ticket",
    "Give me better questions to ask",
  ],
  "Helping students struggling to learn": [
    "How do I differentiate for a struggling reader?",
    "Give me a scaffolding strategy",
    "Help me support a student with gaps",
  ],
  default: [
    "Where do I start?",
    "Give me a practical tip",
    "Help me reflect on a recent lesson",
  ],
};

const GREETINGS: Record<string, string> = {
  "Connecting lessons to the Bible":
    "Great focus! Weaving scripture naturally into lessons is one of the most powerful things a teacher in your context can do. Tell me about a lesson you're planning — what subject, age group, and topic are you working with?",
  "Managing student behavior":
    "A classroom where students feel safe and know the boundaries is where real learning happens. Let's work through this together. What's been the biggest challenge you've faced recently with behaviour?",
  "Engaging students":
    "Engagement is everything — a curious student is a learning student. Let's sharpen this skill. What does a typical lesson look like for you right now, and where do you tend to lose the room?",
  "Checking if students understand":
    "Knowing whether students actually got it — not just nodded along — is a real craft. Let's build that muscle. What subject and grade are you teaching, and what does your current checking look like?",
  "Helping students struggling to learn":
    "Every class has students who are quietly falling behind. Noticing them and acting is a mark of great teaching. Tell me about a student or situation you're thinking of — I'll help you find a path forward.",
  "Something else":
    "I'm here for whatever's on your mind as a teacher. No topic is too small or too specific. What's the challenge you want to bring to this session?",
};

// ─── Auth hook (replace with real auth) ──────────────────────────────────────

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

export default function ChatRoom() {
  const { topic, roomId } = useParams<{ topic: string; roomId: string }>();
  const userId = useCurrentUserId();

  const decoded = topic ? decodeURIComponent(topic) : "Your topic";
  const icon = TOPIC_ICONS[decoded] ?? "💬";
  const chips = SUGGESTIONS[decoded] ?? SUGGESTIONS.default;

  // ── Load or initialise session ──────────────────────────────────────────────
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [input, setInput] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!roomId) return;

    const loaded = getSession(userId, roomId);
    if (!loaded) return;

    setSession(loaded);

    // If session has no messages yet, inject the opening greeting
    if (loaded.messages.length === 0) {
      const greeting: ChatMessage = {
        id: uid(),
        role: "coach",
        text:
          GREETINGS[decoded] ??
          "Welcome! I'm your AI coaching partner. What would you like to work on today?",
        timestamp: new Date().toISOString(),
      };
      appendMessage(userId, roomId, greeting);
      setMessages([greeting]);
    } else {
      setMessages(loaded.messages);
      setShowSuggestions(false); // existing session — hide chips
    }
  }, [userId, roomId, decoded]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Input handling ──────────────────────────────────────────────────────────

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  // ── Send message ────────────────────────────────────────────────────────────

  async function sendMessage(text: string) {
    if (!text.trim() || !roomId) return;

    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    // Optimistic UI update + persist
    setMessages((prev) => [...prev, userMsg]);
    appendMessage(userId, roomId, userMsg);
    setInput("");
    setShowSuggestions(false);
    setIsTyping(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // ── Call Anthropic API ────────────────────────────────────────────────
    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role === "coach" ? "assistant" : "user",
        content: m.text,
      }));

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are a warm, experienced AI coach for teachers. The teacher is working on: "${decoded}".

Your role:
- Ask thoughtful questions that help the teacher reflect and grow
- Offer specific, practical strategies grounded in pedagogy
- Keep responses concise — 2–4 short paragraphs at most
- Be encouraging without being hollow; validate effort and name what's working
- Ground advice in evidence-based teaching practice
- Speak like a trusted colleague, not a textbook

Always end with one clear question or action to move the conversation forward.`,
          messages: history,
        }),
      });

      const data = await response.json();
      const replyText =
        data?.content?.[0]?.text ?? "I didn't catch that — could you say more?";

      const coachMsg: ChatMessage = {
        id: uid(),
        role: "coach",
        text: replyText,
        timestamp: new Date().toISOString(),
      };

      // Update UI + persist coach reply
      setMessages((prev) => [...prev, coachMsg]);
      appendMessage(userId, roomId, coachMsg);
    } catch {
      const errMsg: ChatMessage = {
        id: uid(),
        role: "coach",
        text: "I'm having trouble connecting right now. Please check your internet and try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  }

  // ── End session ─────────────────────────────────────────────────────────────

  function handleEndSession() {
    if (!roomId) return;
    closeSession(userId, roomId);
    setSession((prev) => (prev ? { ...prev, status: "done" } : prev));
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const sessionLabel = session?.title ?? "Session";
  const isDone = session?.status === "done";

  return (
    <div className="chatroom-root">
      {/* ── Nav bar ── */}
      <nav className="chatroom-navbar">
        <Link
          to={`/loop/${topic}`}
          className="chatroom-back-btn"
          aria-label="Back to sessions"
        >
          ←
        </Link>

        <div className="chatroom-avatar">AI</div>

        <div className="chatroom-info">
          <p className="chatroom-info-title">
            {icon} {decoded}
          </p>
          <p className="chatroom-info-sub">Coach · always here</p>
        </div>

        <div className="chatroom-navbar-right">
          <span className="chatroom-session-badge">{sessionLabel}</span>
          {!isDone && (
            <button
              className="chatroom-end-btn"
              onClick={handleEndSession}
              title="Mark session as done"
            >
              End
            </button>
          )}
          {isDone && <span className="chatroom-done-badge">Done</span>}
        </div>
      </nav>

      {/* ── Messages ── */}
      <div className="chatroom-messages">
        <div className="chat-day-divider">
          {session
            ? new Date(session.createdAt).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })
            : "Today"}
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message ${msg.role}`}>
            <div className={`chat-msg-avatar ${msg.role}`}>
              {msg.role === "coach" ? "AI" : "You"}
            </div>
            <div className="chat-bubble-wrap">
              <div className="chat-bubble">{msg.text}</div>
              <span className="chat-time">{formatTime(msg.timestamp)}</span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="chat-typing">
            <div className="chat-msg-avatar coach">AI</div>
            <div className="typing-bubble">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Suggested chips (new session only) ── */}
      {showSuggestions && !isDone && (
        <div className="chat-suggestions">
          {chips.map((chip) => (
            <button
              key={chip}
              className="chat-suggestion-chip"
              onClick={() => sendMessage(chip)}
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* ── Input bar ── */}
      {isDone ? (
        <div className="chatroom-done-bar">
          Session complete —{" "}
          <Link to={`/loop/${topic}`} className="chatroom-done-link">
            start a new one
          </Link>
        </div>
      ) : (
        <div className="chatroom-inputbar">
          <textarea
            ref={textareaRef}
            className="chatroom-textarea"
            placeholder="Share what's on your mind…"
            rows={1}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
          />
          <button
            className="chatroom-send-btn"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            aria-label="Send message"
          >
            ↑
          </button>
        </div>
      )}
    </div>
  );
}
