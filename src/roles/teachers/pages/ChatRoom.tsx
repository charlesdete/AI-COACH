import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getSession,
  appendMessage,
} from "../../../store/sessionStore";
import type { ChatMessage, Attachment, Session } from "../../../store/sessionStore";
import { useAuthStore, getCoachName } from "../../../store/authStore";
import "./ChatRooms.css";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(isoOrDate: string | Date): string {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target!.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function docIcon(mimeType?: string): string {
  if (!mimeType) return "📄";
  if (mimeType.includes("pdf")) return "📕";
  if (mimeType.includes("word") || mimeType.includes("doc")) return "📘";
  if (mimeType.includes("sheet") || mimeType.includes("excel") || mimeType.includes("csv")) return "📗";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "📙";
  if (mimeType.includes("text")) return "📄";
  return "📎";
}

// ─── Emoji data ───────────────────────────────────────────────────────────────

const EMOJI_CATEGORIES = [
  {
    label: "😊 Smileys",
    emojis: ["😀","😂","😊","🥰","😍","😎","🤔","😭","😤","🥺","😅","🤩","😇","🙄","😴","🤗","😬","🥳","😁","😆","🫠","😵","🤯","🤪","😜"],
  },
  {
    label: "👋 Hands",
    emojis: ["👍","👎","👏","🙌","🤝","🙏","✌️","💪","👋","✊","🤞","🫶","👌","🤙","🫵","👆","👇","☝️","🤜","🤛"],
  },
  {
    label: "📚 School",
    emojis: ["📚","📖","✏️","📝","🎯","🏆","📊","💡","🔑","📌","📎","🗂️","🖊️","📏","🔬","🧪","🧮","📐","🗒️","📋"],
  },
  {
    label: "🌟 Nature",
    emojis: ["🌟","⭐","🌈","☀️","🌙","🌸","🌺","🍀","🌿","🌱","🦋","🌊","🔥","💧","🌍","🌻","🌴","🍃","❄️","⛅"],
  },
  {
    label: "❤️ Symbols",
    emojis: ["❤️","🧡","💛","💚","💙","💜","🤎","🖤","🤍","✅","❌","⚡","🎉","🎊","💯","🔔","💬","❓","‼️","🆕"],
  },
];

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
    "I'm here for whatever's on your mind as a teacher. No topic is too small or too specific. What's the challenge you want to bring to this loop?",
};

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3 MB

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatRoom() {
  const { topic, roomId } = useParams<{ topic: string; roomId: string }>();
  const { user, logout } = useAuthStore();
  const userId = user?.id ?? "anonymous";

  const decoded = topic ? decodeURIComponent(topic) : "Your topic";
  const icon = TOPIC_ICONS[decoded] ?? "💬";
  const chips = SUGGESTIONS[decoded] ?? SUGGESTIONS.default;

  // ── Session state ───────────────────────────────────────────────────────────
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [input, setInput] = useState("");

  // ── Attachment / emoji state ────────────────────────────────────────────────
  const [pendingAttachment, setPendingAttachment] = useState<Attachment | null>(null);
  const [attachError, setAttachError] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiTab, setActiveEmojiTab] = useState(0);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiBtnRef = useRef<HTMLButtonElement>(null);

  // ── Load session ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!roomId) return;
    const loaded = getSession(userId, roomId);
    if (!loaded) return;
    setSession(loaded);
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
      setShowSuggestions(false);
    }
  }, [userId, roomId, decoded]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Poll for coach closing the loop
  useEffect(() => {
    if (!roomId || session?.status === "done") return;
    const id = setInterval(() => {
      const latest = getSession(userId, roomId);
      if (latest?.status === "done") {
        setSession(latest);
        setMessages(latest.messages);
      }
    }, 5000);
    return () => clearInterval(id);
  }, [userId, roomId, session?.status]);

  // Close emoji picker on outside click
  useEffect(() => {
    if (!showEmojiPicker) return;
    function handleOutside(e: MouseEvent) {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target as Node) &&
        emojiBtnRef.current &&
        !emojiBtnRef.current.contains(e.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [showEmojiPicker]);

  // ── File selection ──────────────────────────────────────────────────────────
  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setAttachError("");

    if (file.size > MAX_FILE_SIZE) {
      setAttachError(`File too large — maximum size is 3 MB.`);
      return;
    }

    if (file.type.startsWith("image/")) {
      const dataUrl = await readFileAsDataUrl(file);
      setPendingAttachment({ type: "image", name: file.name, mimeType: file.type, size: file.size, dataUrl });
    } else {
      setPendingAttachment({ type: "document", name: file.name, mimeType: file.type, size: file.size });
    }
  }

  // ── Emoji insert ────────────────────────────────────────────────────────────
  function handleEmojiClick(emoji: string) {
    const el = textareaRef.current;
    if (el) {
      const start = el.selectionStart ?? input.length;
      const end = el.selectionEnd ?? input.length;
      const next = input.slice(0, start) + emoji + input.slice(end);
      setInput(next);
      // restore cursor after emoji
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + emoji.length;
        el.focus();
      });
    } else {
      setInput((prev) => prev + emoji);
    }
    setShowEmojiPicker(false);
  }

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
      handleSend();
    }
  }

  // ── Send ────────────────────────────────────────────────────────────────────
  function handleSend() {
    sendMessage(input);
  }

  async function sendMessage(text: string) {
    const hasText = text.trim().length > 0;
    const hasAttachment = !!pendingAttachment;
    if ((!hasText && !hasAttachment) || !roomId) return;

    const attachment = pendingAttachment ?? undefined;
    setPendingAttachment(null);
    setAttachError("");

    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      text: text.trim(),
      attachment,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    appendMessage(userId, roomId, userMsg);
    setInput("");
    setShowSuggestions(false);
    setIsTyping(true);

    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // Build context text for the AI (AI can't see images, reference by description)
    let aiText = text.trim();
    if (attachment) {
      const desc =
        attachment.type === "image"
          ? `[Teacher shared an image: ${attachment.name}]`
          : `[Teacher shared a document: ${attachment.name}]`;
      aiText = aiText ? `${aiText}\n${desc}` : desc;
    }

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role === "coach" ? "assistant" : "user",
        content: m.attachment && !m.text
          ? (m.attachment.type === "image"
              ? `[shared an image: ${m.attachment.name}]`
              : `[shared a document: ${m.attachment.name}]`)
          : m.text + (m.attachment
              ? `\n[attached: ${m.attachment.name}]`
              : ""),
      }));

      // Replace last user entry with augmented text
      if (history.length > 0 && history[history.length - 1].role === "user") {
        history[history.length - 1].content = aiText;
      }

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
- If the teacher shares an image or document, acknowledge it warmly and ask them to describe what it contains so you can give relevant feedback.

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

  // ── Render ──────────────────────────────────────────────────────────────────

  const sessionLabel = session?.title ?? "Loop";
  const isDone = session?.status === "done";
  const coachName = getCoachName(userId);
  const coachInitials = coachName.split(" ").map((w) => w[0]).join("");
  const canSend = (input.trim().length > 0 || !!pendingAttachment) && !isTyping;

  return (
    <div className="chatroom-root">
      {/* ── Nav bar ── */}
      <nav className="chatroom-navbar">
        <Link to={`/loop/${topic}`} className="chatroom-back-btn" aria-label="Back to loops">
          ←
        </Link>

        <div className="chatroom-avatar">{coachInitials}</div>

        <div className="chatroom-info">
          <p className="chatroom-info-title">{icon} {decoded}</p>
          <Link to="/teacher/coach-profile" className="chatroom-info-sub chatroom-coach-link">
            {coachName}
          </Link>
        </div>

        <div className="chatroom-navbar-right">
          <span className="chatroom-session-badge">{sessionLabel}</span>
          {isDone && <span className="chatroom-done-badge">Done</span>}
          <button
            className="chatroom-logout-btn"
            onClick={() => { logout(); window.location.href = "/login"; }}
            aria-label="Sign out"
          >
            Sign out
          </button>
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
              {msg.role === "coach" ? coachInitials : "You"}
            </div>
            <div className="chat-bubble-wrap">
              <div className="chat-bubble">
                {msg.text && <span className="bubble-text">{msg.text}</span>}
                {msg.attachment?.type === "image" && msg.attachment.dataUrl && (
                  <img
                    src={msg.attachment.dataUrl}
                    alt={msg.attachment.name}
                    className="chat-attachment-img"
                  />
                )}
                {msg.attachment?.type === "document" && (
                  <div className="chat-attachment-doc">
                    <span className="doc-icon">{docIcon(msg.attachment.mimeType)}</span>
                    <div className="doc-info">
                      <p className="doc-name">{msg.attachment.name}</p>
                      {msg.attachment.size && (
                        <p className="doc-size">{formatFileSize(msg.attachment.size)}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <span className="chat-time">{formatTime(msg.timestamp)}</span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="chat-typing">
            <div className="chat-msg-avatar coach">{coachInitials}</div>
            <div className="typing-bubble">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Suggested chips ── */}
      {showSuggestions && !isDone && (
        <div className="chat-suggestions">
          {chips.map((chip) => (
            <button key={chip} className="chat-suggestion-chip" onClick={() => sendMessage(chip)}>
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* ── Input area ── */}
      {isDone ? (
        <div className="chatroom-done-bar">
          Loop complete —{" "}
          <Link to={`/loop/${topic}`} className="chatroom-done-link">
            start a new one
          </Link>
        </div>
      ) : (
        <div className="chatroom-input-area">
          {/* Emoji picker */}
          {showEmojiPicker && (
            <div className="emoji-picker" ref={emojiPickerRef}>
              <div className="emoji-tabs">
                {EMOJI_CATEGORIES.map((cat, i) => (
                  <button
                    key={i}
                    className={`emoji-tab${activeEmojiTab === i ? " active" : ""}`}
                    onClick={() => setActiveEmojiTab(i)}
                    title={cat.label}
                  >
                    {cat.label.split(" ")[0]}
                  </button>
                ))}
              </div>
              <div className="emoji-grid">
                {EMOJI_CATEGORIES[activeEmojiTab].emojis.map((e) => (
                  <button key={e} className="emoji-btn" onClick={() => handleEmojiClick(e)}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pending attachment preview */}
          {pendingAttachment && (
            <div className="pending-attachment">
              {pendingAttachment.type === "image" && pendingAttachment.dataUrl ? (
                <img src={pendingAttachment.dataUrl} alt={pendingAttachment.name} className="pending-img-preview" />
              ) : (
                <div className="pending-doc-preview">
                  <span>{docIcon(pendingAttachment.mimeType)}</span>
                  <span className="pending-doc-name">{pendingAttachment.name}</span>
                  {pendingAttachment.size && (
                    <span className="pending-doc-size">{formatFileSize(pendingAttachment.size)}</span>
                  )}
                </div>
              )}
              <button
                className="pending-remove-btn"
                onClick={() => setPendingAttachment(null)}
                aria-label="Remove attachment"
              >
                ✕
              </button>
            </div>
          )}

          {/* Error message */}
          {attachError && <p className="attach-error">{attachError}</p>}

          {/* Input bar */}
          <div className="chatroom-inputbar">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.ppt,.pptx"
              style={{ display: "none" }}
              onChange={handleFileSelect}
            />

            {/* Emoji button */}
            <button
              ref={emojiBtnRef}
              className={`chatroom-action-btn${showEmojiPicker ? " active" : ""}`}
              onClick={() => setShowEmojiPicker((v) => !v)}
              title="Emoji"
              aria-label="Open emoji picker"
              type="button"
            >
              😊
            </button>

            {/* Attach button */}
            <button
              className="chatroom-action-btn"
              onClick={() => { setAttachError(""); fileInputRef.current?.click(); }}
              title="Attach file or image"
              aria-label="Attach file"
              type="button"
            >
              📎
            </button>

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
              onClick={handleSend}
              disabled={!canSend}
              aria-label="Send message"
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
