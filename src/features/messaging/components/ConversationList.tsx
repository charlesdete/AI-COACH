import React from 'react';
import './ConversationList.css';
import type { Conversation } from '../../../shared/types/message';
import { useMessagingStore } from '../../../store/messagingStore';

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: string;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  onSelectConversation,
  selectedConversationId,
}) => {
  const { conversations } = useMessagingStore();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="conversation-list">
      <div className="conversation-list-header">
        <h3>Messages</h3>
        <span className="conversation-count">{conversations.length}</span>
      </div>

      {conversations.length === 0 ? (
        <div className="no-conversations">
          <p>No conversations yet</p>
          <p className="no-conversations-hint">Start a new conversation to send a message</p>
        </div>
      ) : (
        <ul className="conversation-items">
          {conversations.map((conv) => (
            <li key={conv.id}>
              <button
                className={`conversation-item ${
                  selectedConversationId === conv.id ? 'active' : ''
                }`}
                onClick={() => onSelectConversation(conv)}
              >
                <div className="conversation-header">
                  <div className="conversation-participants">
                    {conv.participants.map((p) => (
                      <span key={p.id} className="participant-name">
                        {p.name}
                      </span>
                    ))}
                  </div>
                  <span className="conversation-time">
                    {conv.lastMessage && formatDate(conv.lastMessage.createdAt)}
                  </span>
                </div>

                <div className="conversation-preview">
                  {conv.lastMessage ? (
                    <p className="message-preview">{conv.lastMessage.content}</p>
                  ) : (
                    <p className="message-preview no-message">No messages yet</p>
                  )}
                </div>

                {conv.unreadCount > 0 && (
                  <span className="unread-badge">{conv.unreadCount}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ConversationList;
