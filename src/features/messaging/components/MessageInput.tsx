import React, { useState } from 'react';
import './MessageInput.css';

interface MessageInputProps {
  onSend: (content: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  isLoading = false,
  placeholder = 'Type a message...',
}) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSend(content);
      setContent('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <form className="message-input-form" onSubmit={handleSubmit}>
      <textarea
        className="message-input"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={isLoading}
        rows={1}
      />
      <button
        type="submit"
        className="message-send-btn"
        disabled={!content.trim() || isLoading}
        aria-label="Send message"
      >
        {isLoading ? '...' : 'Send'}
      </button>
    </form>
  );
};

export default MessageInput;
