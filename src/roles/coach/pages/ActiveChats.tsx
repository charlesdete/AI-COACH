import React, { useState } from 'react';
import './ActiveChats.css';
import Header from '../../../shared/components/Header';
import Sidebar from '../../../shared/components/Sidebar';
import { useMessagingStore } from '../../../store/messagingStore';
import { useAuthStore } from '../../../store/authStore';
import type { Conversation, Message } from '../../../shared/types/message';

const coachNavItems = [
  { label: 'Dashboard', path: '/coach', icon: '🏠' },
  { label: 'My Teachers', path: '/coach/chats', icon: '💬' },
];

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

export const ActiveChats: React.FC = () => {
  const { user } = useAuthStore();
  const { conversations, messages, setCurrentConversation, loadConversationMessages, sendMessage, markConversationRead } = useMessagingStore();
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [inputText, setInputText] = useState('');

  const myConversations = conversations.filter(c => c.participantIds.includes(user?.id ?? ''));
  const convMessages = selectedConv ? messages.filter(m => m.conversationId === selectedConv.id) : [];

  const handleSelectConv = (conv: Conversation) => {
    setSelectedConv(conv);
    setCurrentConversation(conv);
    loadConversationMessages(conv.id);
    markConversationRead(conv.id);
  };

  const handleSend = () => {
    if (!inputText.trim() || !selectedConv || !user) return;
    sendMessage(selectedConv.id, user.id, user.name, inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="coach-layout">
      <Sidebar items={coachNavItems} title="AI-COACH" accentColor="#00aa44" />

      <div className="coach-content">
        <Header title="My Teachers" subtitle="Message threads with your assigned teachers" />

        <main className="coach-main">
          <div className="chats-panel">
            <div className="chats-list-panel">
              <div className="chats-list-header">
                <h3>Conversations</h3>
                <span className="chats-count">{myConversations.length}</span>
              </div>
              <div className="chats-list">
                {myConversations.length === 0 && (
                  <div className="chats-empty">
                    <p>No conversations yet.</p>
                  </div>
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
                          <p className="cli-preview">{conv.lastMessage.content}</p>
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

            <div className="chat-detail-panel">
              {!selectedConv ? (
                <div className="chat-no-selection">
                  <div className="cns-icon">💬</div>
                  <h3>Select a teacher to chat</h3>
                  <p>Choose a conversation from the list to start messaging.</p>
                </div>
              ) : (
                <>
                  <div className="chat-detail-header">
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
                              {msg.content}
                            </div>
                            <span className="msg-time">{formatTime(msg.createdAt)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="chat-input-bar">
                    <textarea
                      className="chat-textarea"
                      placeholder="Type a message…"
                      rows={1}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <button
                      className="chat-send-btn"
                      onClick={handleSend}
                      disabled={!inputText.trim()}
                    >
                      ↑
                    </button>
                  </div>
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
