export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  readAt?: string;
  attachments?: string[];
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participants: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface MessageThread {
  conversationId: string;
  messages: Message[];
  participants: {
    id: string;
    name: string;
    avatar?: string;
  }[];
}
