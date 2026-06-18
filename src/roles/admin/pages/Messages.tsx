import React, { useState } from 'react';
import './Messages.css';
import Header from '../../../shared/components/Header';
import Sidebar from '../../../shared/components/Sidebar';
import { useMessagingStore } from '../../../store/messagingStore';
import type { Conversation } from '../../../shared/types/message';

const adminNavItems = [
  { label: 'Dashboard', path: '/admin', icon: '📊' },
  { label: 'Analytics', path: '/admin/analytics', icon: '📈' },
  { label: 'Users', path: '/admin/users', icon: '👥' },
  { label: 'Assignments', path: '/admin/assignments', icon: '🔗' },
  { label: 'Loops', path: '/admin/loops', icon: '🎓' },
  { label: 'Messages', path: '/admin/messages', icon: '💬' },
];

function formatTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export const Messages: React.FC = () => {
  const { conversations, messages, setCurrentConversation, currentConversation, loadConversationMessages, markConversationRead } = useMessagingStore();
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);

  const handleSelectConv = (conv: Conversation) => {
    setSelectedConv(conv);
    setCurrentConversation(conv);
    loadConversationMessages(conv.id);
    markConversationRead(conv.id);
  };

  const convMessages = selectedConv ? messages.filter(m => m.conversationId === selectedConv.id) : [];
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="admin-layout">
      <Sidebar items={adminNavItems} title="AI-COACH" accentColor="#0066cc" />

      <div className="admin-content">
        <Header title="Messages" subtitle="Teacher–Coach conversations" />

        <main className="admin-main">
          <div className="messages-summary">
            <div className="msg-summary-card" style={{ borderTopColor: '#0066cc' }}>
              <p className="msg-sum-label">Total Conversations</p>
              <p className="msg-sum-val">{conversations.length}</p>
            </div>
            <div className="msg-summary-card" style={{ borderTopColor: '#ff3333' }}>
              <p className="msg-sum-label">Unread Messages</p>
              <p className="msg-sum-val" style={{ color: totalUnread > 0 ? '#ff3333' : '#08060d' }}>{totalUnread}</p>
            </div>
            <div className="msg-summary-card" style={{ borderTopColor: '#00aa44' }}>
              <p className="msg-sum-label">Active Participants</p>
              <p className="msg-sum-val">4</p>
            </div>
          </div>

          <div className="messages-panel">
            <div className="conv-list-panel">
              <div className="conv-list-header">
                <h3>All Conversations</h3>
                {totalUnread > 0 && <span className="unread-total-badge">{totalUnread} unread</span>}
              </div>
              <div className="conv-list">
                {conversations.map((conv) => {
                  const teacher = conv.participants.find(p => p.id.startsWith('teacher'));
                  const coach = conv.participants.find(p => p.id.startsWith('coach'));
                  const isSelected = selectedConv?.id === conv.id;
                  return (
                    <button
                      key={conv.id}
                      className={`conv-item ${isSelected ? 'selected' : ''} ${conv.unreadCount > 0 ? 'has-unread' : ''}`}
                      onClick={() => handleSelectConv(conv)}
                    >
                      <div className="conv-item-avatars">
                        <div className="conv-avatar" style={{ background: '#ff660022', color: '#ff6600' }}>
                          {teacher?.name?.charAt(0) ?? 'T'}
                        </div>
                        <div className="conv-avatar coach-av" style={{ background: '#00aa4422', color: '#00aa44' }}>
                          {coach?.name?.charAt(6) ?? 'C'}
                        </div>
                      </div>
                      <div className="conv-item-body">
                        <div className="conv-item-header">
                          <p className="conv-item-name">{teacher?.name} ↔ {coach?.name}</p>
                          {conv.lastMessage && <span className="conv-item-time">{formatTime(conv.lastMessage.createdAt)}</span>}
                        </div>
                        {conv.lastMessage && (
                          <p className="conv-item-preview">{conv.lastMessage.senderName}: {conv.lastMessage.content}</p>
                        )}
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="conv-unread-badge">{conv.unreadCount}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="conv-detail-panel">
              {!selectedConv ? (
                <div className="conv-empty-state">
                  <div className="conv-empty-icon">💬</div>
                  <h3>Select a conversation</h3>
                  <p>Click a conversation on the left to view the message thread.</p>
                </div>
              ) : (
                <>
                  <div className="conv-detail-header">
                    <div className="conv-detail-participants">
                      {selectedConv.participants.map((p) => (
                        <div key={p.id} className="conv-participant">
                          <div
                            className="conv-p-avatar"
                            style={{
                              background: p.id.startsWith('teacher') ? '#ff660022' : '#00aa4422',
                              color: p.id.startsWith('teacher') ? '#ff6600' : '#00aa44'
                            }}
                          >
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <p className="conv-p-name">{p.name}</p>
                            <p className="conv-p-role">{p.id.startsWith('teacher') ? 'Teacher' : 'Coach'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <span className="admin-view-badge">Admin View — Read Only</span>
                  </div>

                  <div className="conv-messages-thread">
                    {convMessages.length === 0 && (
                      <p className="no-messages-yet">No messages yet in this conversation.</p>
                    )}
                    {convMessages.map((msg) => {
                      const isTeacher = msg.senderId.startsWith('teacher');
                      return (
                        <div key={msg.id} className={`admin-msg ${isTeacher ? 'teacher-msg' : 'coach-msg'}`}>
                          <div
                            className="admin-msg-avatar"
                            style={{
                              background: isTeacher ? '#ff660022' : '#00aa4422',
                              color: isTeacher ? '#ff6600' : '#00aa44'
                            }}
                          >
                            {msg.senderName.charAt(0)}
                          </div>
                          <div className="admin-msg-body">
                            <div className="admin-msg-meta">
                              <span className="admin-msg-sender">{msg.senderName}</span>
                              <span className="admin-msg-time">{formatTime(msg.createdAt)}</span>
                              {msg.readAt && <span className="admin-msg-read">✓ Read</span>}
                            </div>
                            <div className="admin-msg-bubble">{msg.content}</div>
                          </div>
                        </div>
                      );
                    })}
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

export default Messages;
