import React, { useEffect, useRef } from 'react';
import './MessageThread.css';
import { Message } from '../../../shared/types/message';
import { useAuthStore } from '../../../store/authStore';

interface MessageThreadProps {
  messages: Message[];
  isLoading?: boolean;
}

export const MessageThread: React.FC<MessageThreadProps> = ({ messages, isLoading = false }) => {
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';

    msgs.forEach((msg) => {
      const msgDate = formatDate(msg.createdAt);
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msgDate, messages: [] });
      }
      groups[groups.length - 1].messages.push(msg);
    });

    return groups;
  };

  if (isLoading) {
    return (
      <div className="message-thread loading">
        <div className="loading-spinner"></div>
        <p>Loading messages...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="message-thread empty">
        <p>No messages yet</p>
        <p className="empty-hint">Start the conversation by sending a message</p>
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="message-thread">
      {groupedMessages.map((group) => (
        <div key={group.date}>
          <div className="message-date-divider">
            <span>{group.date}</span>
          </div>

          {group.messages.map((msg) => {
            const isOwn = msg.senderId === user?.id;
            return (
              <div
                key={msg.id}
                className={`message-wrapper ${isOwn ? 'own' : 'other'}`}
              >
                <div className={`message ${isOwn ? 'own' : 'other'}`}>
                  <div className="message-sender">{msg.senderName}</div>
                  <div className="message-content">{msg.content}</div>
                  <div className="message-time">
                    {formatTime(msg.createdAt)}
                    {msg.readAt && <span className="read-indicator">✓ Read</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageThread;
