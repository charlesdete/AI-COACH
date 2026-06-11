import React, { useState } from 'react';
import './TeacherMessages.css';
import { Link } from 'react-router-dom';
import { useMessagingStore } from '../../../store/messagingStore';
import { useAuthStore } from '../../../store/authStore';
import type { Message } from '../../../shared/types/message';

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

export default function TeacherMessages() {
  const { user } = useAuthStore();
  const { conversations, messages, setCurrentConversation, loadConversationMessages, sendMessage, markConversationRead } = useMessagingStore();
  const [inputText, setInputText] = useState('');

  const myConversation = conversations.find(c => c.participantIds.includes(user?.id ?? ''));
  const convMessages = myConversation ? messages.filter(m => m.conversationId === myConversation.id) : [];
  const coach = myConversation?.participants.find(p => p.id !== user?.id);

  React.useEffect(() => {
    if (myConversation) {
      setCurrentConversation(myConversation);
      loadConversationMessages(myConversation.id);
      markConversationRead(myConversation.id);
    }
  }, [myConversation?.id]);

  const handleSend = () => {
    if (!inputText.trim() || !myConversation || !user) return;
    sendMessage(myConversation.id, user.id, user.name, inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="tm-root">
      <nav className="tm-nav">
        <Link to="/dashboard" className="tm-back">← Dashboard</Link>
        <h1 className="tm-nav-title">Message My Coach</h1>
      </nav>

      {!myConversation ? (
        <div className="tm-no-coach">
          <div className="tm-nc-icon">🤝</div>
          <h2>No coach assigned yet</h2>
          <p>You'll be able to message your coach once one is assigned to you.</p>
        </div>
      ) : (
        <div className="tm-chat-wrap">
          <div className="tm-chat-header">
            <div className="tm-coach-avatar" style={{ background: '#00aa4420', color: '#00aa44' }}>
              {coach?.name?.charAt(0) ?? 'C'}
            </div>
            <div>
              <p className="tm-coach-name">{coach?.name ?? 'Your Coach'}</p>
              <p className="tm-coach-role">🟢 Coach · available</p>
            </div>
          </div>

          <div className="tm-messages-area">
            {convMessages.length === 0 && (
              <div className="tm-start-hint">
                <p>👋 Say hello to your coach! Ask a question or share what you're working on.</p>
              </div>
            )}
            {convMessages.map((msg: Message) => {
              const isOwn = msg.senderId === user?.id;
              return (
                <div key={msg.id} className={`tm-msg-row ${isOwn ? 'own' : 'other'}`}>
                  {!isOwn && (
                    <div className="tm-msg-avatar" style={{ background: '#00aa4420', color: '#00aa44' }}>
                      {msg.senderName.charAt(0)}
                    </div>
                  )}
                  <div className="tm-msg-group">
                    {!isOwn && <p className="tm-msg-name">{msg.senderName}</p>}
                    <div className={`tm-bubble ${isOwn ? 'tm-own' : 'tm-other'}`}>
                      {msg.content}
                    </div>
                    <span className="tm-time">{formatTime(msg.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="tm-input-row">
            <textarea
              className="tm-textarea"
              placeholder="Message your coach…"
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className="tm-send-btn"
              onClick={handleSend}
              disabled={!inputText.trim()}
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
