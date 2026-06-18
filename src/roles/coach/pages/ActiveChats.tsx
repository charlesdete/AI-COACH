import React, { useState, useRef, useEffect } from 'react';
import './ActiveChats.css';
import Header from '../../../shared/components/Header';
import Sidebar from '../../../shared/components/Sidebar';
import { useMessagingStore } from '../../../store/messagingStore';
import { useAuthStore } from '../../../store/authStore';
import { getAllSessions, formatSessionDate } from '../../../store/sessionStore';
import type { Session } from '../../../store/sessionStore';
import type { Conversation, Message, MessageAttachment } from '../../../shared/types/message';

const coachNavItems = [
  { label: 'Dashboard', path: '/coach', icon: '🏠' },
  { label: 'My Teachers', path: '/coach/chats', icon: '💬' },
];

// ─── Emoji data ───────────────────────────────────────────────────────────────

const EMOJI_CATEGORIES = [
  {
    label: '😊',
    emojis: ['😀','😂','😊','🥰','😍','😎','🤔','😭','😤','🥺','😅','🤩','😇','🙄','😴','🤗','😬','🥳','😁','😆'],
  },
  {
    label: '👋',
    emojis: ['👍','👎','👏','🙌','🤝','🙏','✌️','💪','👋','✊','🤞','🫶','👌','🤙','🫵','👆','☝️','🤜','🤛'],
  },
  {
    label: '📚',
    emojis: ['📚','📖','✏️','📝','🎯','🏆','📊','💡','🔑','📌','📎','🗂️','🖊️','📏','🔬','🧪','🧮','📐','🗒️','📋'],
  },
  {
    label: '🌟',
    emojis: ['🌟','⭐','🌈','☀️','🌙','🌸','🌺','🍀','🌿','🌱','🦋','🌊','🔥','💧','🌍','🌻','🌴','🍃','❄️','⛅'],
  },
  {
    label: '❤️',
    emojis: ['❤️','🧡','💛','💚','💙','💜','🤎','🖤','🤍','✅','❌','⚡','🎉','🎊','💯','🔔','💬','❓','‼️','🆕'],
  },
];

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3 MB

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function docIcon(mimeType?: string): string {
  if (!mimeType) return '📄';
  if (mimeType.includes('pdf')) return '📕';
  if (mimeType.includes('word') || mimeType.includes('doc')) return '📘';
  if (mimeType.includes('sheet') || mimeType.includes('excel') || mimeType.includes('csv')) return '📗';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📙';
  if (mimeType.includes('text')) return '📄';
  return '📎';
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target!.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ActiveChats: React.FC = () => {
  const { user } = useAuthStore();
  const { conversations, messages, setCurrentConversation, loadConversationMessages, sendMessage, markConversationRead } = useMessagingStore();

  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<'messages' | 'history'>('messages');
  const [expandedLoop, setExpandedLoop] = useState<Session | null>(null);

  // Attachment / emoji state
  const [pendingAttachment, setPendingAttachment] = useState<MessageAttachment | null>(null);
  const [attachError, setAttachError] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiTab, setActiveEmojiTab] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiBtnRef = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const myConversations = conversations.filter(c => c.participantIds.includes(user?.id ?? ''));
  const convMessages = selectedConv ? messages.filter(m => m.conversationId === selectedConv.id) : [];

  const selectedTeacherId = selectedConv?.participants.find(p => p.id !== user?.id)?.id ?? '';
  const teacherLoops = activeTab === 'history' && selectedTeacherId
    ? getAllSessions(selectedTeacherId).sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    : [];

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [convMessages]);

  // Close emoji picker on outside click
  useEffect(() => {
    if (!showEmojiPicker) return;
    function handleOutside(e: MouseEvent) {
      if (
        emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node) &&
        emojiBtnRef.current && !emojiBtnRef.current.contains(e.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showEmojiPicker]);

  const handleSelectConv = (conv: Conversation) => {
    setSelectedConv(conv);
    setCurrentConversation(conv);
    loadConversationMessages(conv.id);
    markConversationRead(conv.id);
    setActiveTab('messages');
    setExpandedLoop(null);
    setPendingAttachment(null);
    setAttachError('');
    setShowEmojiPicker(false);
  };

  // ── File selection ────────────────────────────────────────────────────────
  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setAttachError('');

    if (file.size > MAX_FILE_SIZE) {
      setAttachError('File too large — maximum size is 3 MB.');
      return;
    }

    if (file.type.startsWith('image/')) {
      const dataUrl = await readFileAsDataUrl(file);
      setPendingAttachment({ type: 'image', name: file.name, mimeType: file.type, size: file.size, dataUrl });
    } else {
      setPendingAttachment({ type: 'document', name: file.name, mimeType: file.type, size: file.size });
    }
  }

  // ── Emoji insert ─────────────────────────────────────────────────────────
  function handleEmojiClick(emoji: string) {
    const el = textareaRef.current;
    if (el) {
      const start = el.selectionStart ?? inputText.length;
      const end = el.selectionEnd ?? inputText.length;
      const next = inputText.slice(0, start) + emoji + inputText.slice(end);
      setInputText(next);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + emoji.length;
        el.focus();
      });
    } else {
      setInputText(prev => prev + emoji);
    }
    setShowEmojiPicker(false);
  }

  // ── Send ──────────────────────────────────────────────────────────────────
  const handleSend = () => {
    const hasText = inputText.trim().length > 0;
    const hasAttachment = !!pendingAttachment;
    if ((!hasText && !hasAttachment) || !selectedConv || !user) return;

    sendMessage(selectedConv.id, user.id, user.name, inputText.trim(), pendingAttachment ?? undefined);
    setInputText('');
    setPendingAttachment(null);
    setAttachError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const canSend = (inputText.trim().length > 0 || !!pendingAttachment) && !!selectedConv;

  return (
    <div className="coach-layout">
      <Sidebar items={coachNavItems} title="AI-COACH" accentColor="#00aa44" />

      <div className="coach-content">
        <Header title="My Teachers" subtitle="Message threads with your assigned teachers" />

        <main className="coach-main chats-main">
          <div className={`chats-panel${selectedConv ? ' chats-panel--chat-open' : ''}`}>

            {/* ── Teacher list ── */}
            <div className="chats-list-panel">
              <div className="chats-list-header">
                <h3>Conversations</h3>
                <span className="chats-count">{myConversations.length}</span>
              </div>
              <div className="chats-list">
                {myConversations.length === 0 && (
                  <div className="chats-empty"><p>No conversations yet.</p></div>
                )}
                {myConversations.map((conv) => {
                  const teacher = conv.participants.find(p => p.id !== user?.id);
                  const isSelected = selectedConv?.id === conv.id;
                  return (
                    <button
                      key={conv.id}
                      className={`chat-list-item ${isSelected ? 'selected' : ''} ${conv.unreadCount > 0 ? 'has-unread' : ''}`}
                      onClick={() => handleSelectConv(conv)}
                    >
                      <div className="cli-avatar" style={{ background: '#ff660018', color: '#ff6600' }}>
                        {teacher?.name?.charAt(0) ?? 'T'}
                      </div>
                      <div className="cli-body">
                        <div className="cli-header">
                          <p className="cli-name">{teacher?.name ?? 'Teacher'}</p>
                          {conv.lastMessage && <span className="cli-time">{formatTime(conv.lastMessage.createdAt)}</span>}
                        </div>
                        {conv.lastMessage && (
                          <p className="cli-preview">
                            {conv.lastMessage.attachment
                              ? (conv.lastMessage.attachment.type === 'image' ? '📷 Image' : `📎 ${conv.lastMessage.attachment.name}`)
                              : conv.lastMessage.content}
                          </p>
                        )}
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="cli-badge">{conv.unreadCount}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Chat detail ── */}
            <div className="chat-detail-panel">
              {!selectedConv ? (
                <div className="chat-no-selection">
                  <div className="cns-icon">💬</div>
                  <h3>Select a teacher to chat</h3>
                  <p>Choose a conversation from the list to start messaging.</p>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="chat-detail-header">
                    <button className="chat-dh-back" onClick={() => setSelectedConv(null)} aria-label="Back to list">←</button>
                    {(() => {
                      const teacher = selectedConv.participants.find(p => p.id !== user?.id);
                      return (
                        <div className="chat-dh-user">
                          <div className="chat-dh-avatar" style={{ background: '#ff660018', color: '#ff6600' }}>
                            {teacher?.name?.charAt(0) ?? 'T'}
                          </div>
                          <div>
                            <p className="chat-dh-name">{teacher?.name}</p>
                            <p className="chat-dh-status">🟢 Teacher</p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Tabs */}
                  <div className="detail-tabs">
                    <button
                      className={`detail-tab${activeTab === 'messages' ? ' active' : ''}`}
                      onClick={() => { setActiveTab('messages'); setExpandedLoop(null); }}
                    >
                      Messages
                    </button>
                    <button
                      className={`detail-tab${activeTab === 'history' ? ' active' : ''}`}
                      onClick={() => setActiveTab('history')}
                    >
                      Loop History
                    </button>
                  </div>

                  {/* ── Messages tab ── */}
                  {activeTab === 'messages' && (
                    <>
                      <div className="chat-messages-area">
                        {convMessages.length === 0 && (
                          <p className="no-msgs-yet">No messages yet. Start the conversation!</p>
                        )}
                        {convMessages.map((msg: Message) => {
                          const isOwn = msg.senderId === user?.id;
                          return (
                            <div key={msg.id} className={`msg-row ${isOwn ? 'own' : 'other'}`}>
                              {!isOwn && (
                                <div className="msg-avatar" style={{ background: '#ff660018', color: '#ff6600' }}>
                                  {msg.senderName.charAt(0)}
                                </div>
                              )}
                              <div className="msg-bubble-wrap">
                                {!isOwn && <p className="msg-sender-name">{msg.senderName}</p>}
                                <div className={`msg-bubble ${isOwn ? 'own-bubble' : 'other-bubble'}`}>
                                  {msg.content && <span className="msg-bubble-text">{msg.content}</span>}
                                  {msg.attachment?.type === 'image' && msg.attachment.dataUrl && (
                                    <img
                                      src={msg.attachment.dataUrl}
                                      alt={msg.attachment.name}
                                      className="msg-attachment-img"
                                    />
                                  )}
                                  {msg.attachment?.type === 'document' && (
                                    <div className={`msg-attachment-doc${isOwn ? ' msg-attachment-doc--own' : ''}`}>
                                      <span className="msg-doc-icon">{docIcon(msg.attachment.mimeType)}</span>
                                      <div className="msg-doc-info">
                                        <p className="msg-doc-name">{msg.attachment.name}</p>
                                        {msg.attachment.size && (
                                          <p className="msg-doc-size">{formatFileSize(msg.attachment.size)}</p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <span className="msg-time">{formatTime(msg.createdAt)}</span>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Input area */}
                      <div className="chat-input-area">
                        {/* Emoji picker */}
                        {showEmojiPicker && (
                          <div className="chat-emoji-picker" ref={emojiPickerRef}>
                            <div className="chat-emoji-tabs">
                              {EMOJI_CATEGORIES.map((cat, i) => (
                                <button
                                  key={i}
                                  className={`chat-emoji-tab${activeEmojiTab === i ? ' active' : ''}`}
                                  onClick={() => setActiveEmojiTab(i)}
                                  title={cat.label}
                                >
                                  {cat.label}
                                </button>
                              ))}
                            </div>
                            <div className="chat-emoji-grid">
                              {EMOJI_CATEGORIES[activeEmojiTab].emojis.map((e) => (
                                <button key={e} className="chat-emoji-btn" onClick={() => handleEmojiClick(e)}>
                                  {e}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Pending attachment preview */}
                        {pendingAttachment && (
                          <div className="chat-pending-attachment">
                            {pendingAttachment.type === 'image' && pendingAttachment.dataUrl ? (
                              <img src={pendingAttachment.dataUrl} alt={pendingAttachment.name} className="chat-pending-img" />
                            ) : (
                              <div className="chat-pending-doc">
                                <span>{docIcon(pendingAttachment.mimeType)}</span>
                                <span className="chat-pending-doc-name">{pendingAttachment.name}</span>
                                {pendingAttachment.size && (
                                  <span className="chat-pending-doc-size">{formatFileSize(pendingAttachment.size)}</span>
                                )}
                              </div>
                            )}
                            <button
                              className="chat-pending-remove"
                              onClick={() => setPendingAttachment(null)}
                              aria-label="Remove attachment"
                            >
                              ✕
                            </button>
                          </div>
                        )}

                        {attachError && <p className="chat-attach-error">{attachError}</p>}

                        {/* Hidden file input */}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.ppt,.pptx"
                          style={{ display: 'none' }}
                          onChange={handleFileSelect}
                        />

                        <div className="chat-input-bar">
                          <button
                            ref={emojiBtnRef}
                            className={`chat-action-btn${showEmojiPicker ? ' active' : ''}`}
                            onClick={() => setShowEmojiPicker(v => !v)}
                            title="Emoji"
                            type="button"
                          >
                            😊
                          </button>
                          <button
                            className="chat-action-btn"
                            onClick={() => { setAttachError(''); fileInputRef.current?.click(); }}
                            title="Attach file or image"
                            type="button"
                          >
                            📎
                          </button>
                          <textarea
                            ref={textareaRef}
                            className="chat-textarea"
                            placeholder="Type a message…"
                            rows={1}
                            value={inputText}
                            onChange={handleTextareaChange}
                            onKeyDown={handleKeyDown}
                          />
                          <button
                            className="chat-send-btn"
                            onClick={handleSend}
                            disabled={!canSend}
                          >
                            ↑
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* ── Loop History tab ── */}
                  {activeTab === 'history' && (
                    <div className="loop-history">
                      {teacherLoops.length === 0 ? (
                        <div className="loop-history-empty">
                          <p>This teacher has no loops yet.</p>
                        </div>
                      ) : (
                        teacherLoops.map((loop) => {
                          const isOpen = expandedLoop?.id === loop.id;
                          return (
                            <div key={loop.id} className={`lh-card${isOpen ? ' open' : ''}`}>
                              <button
                                className="lh-card-header"
                                onClick={() => setExpandedLoop(isOpen ? null : loop)}
                              >
                                <div className="lh-card-left">
                                  <span className={`lh-status ${loop.status}`}>
                                    {loop.status === 'active' ? 'In progress' : 'Done'}
                                  </span>
                                  <p className="lh-title">{loop.title}</p>
                                  <p className="lh-topic">{loop.topic}</p>
                                </div>
                                <div className="lh-card-right">
                                  <span className="lh-meta">{loop.messages.length} msg{loop.messages.length !== 1 ? 's' : ''}</span>
                                  <span className="lh-meta">{formatSessionDate(loop.updatedAt)}</span>
                                  <span className="lh-chevron">{isOpen ? '▲' : '▼'}</span>
                                </div>
                              </button>
                              {isOpen && (
                                <div className="lh-messages">
                                  {loop.messages.length === 0 ? (
                                    <p className="lh-no-msgs">No messages in this loop.</p>
                                  ) : (
                                    loop.messages.map((msg) => (
                                      <div key={msg.id} className={`lh-msg lh-msg--${msg.role}`}>
                                        <span className="lh-msg-role">
                                          {msg.role === 'coach' ? 'AI Coach' : 'Teacher'}
                                        </span>
                                        <p className="lh-msg-text">{msg.text}</p>
                                        <span className="lh-msg-time">{formatTime(msg.timestamp)}</span>
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ActiveChats;
