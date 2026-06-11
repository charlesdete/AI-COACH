import { create } from 'zustand';
import type { Message, Conversation } from '../shared/types/message';

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();
const minsAgo = (m: number) => new Date(now.getTime() - m * 60000).toISOString();

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    participantIds: ['teacher-1', 'coach-1'],
    participants: [
      { id: 'teacher-1', name: 'Mr. Johnson' },
      { id: 'coach-1', name: 'Coach Sarah' },
    ],
    lastMessage: {
      id: 'msg-1-3',
      conversationId: 'conv-1',
      senderId: 'coach-1',
      senderName: 'Coach Sarah',
      content: 'Great progress this week! Keep it up.',
      createdAt: minsAgo(25),
      readAt: undefined,
    },
    unreadCount: 1,
    updatedAt: minsAgo(25),
  },
  {
    id: 'conv-2',
    participantIds: ['teacher-2', 'coach-1'],
    participants: [
      { id: 'teacher-2', name: 'Ms. Williams' },
      { id: 'coach-1', name: 'Coach Sarah' },
    ],
    lastMessage: {
      id: 'msg-2-2',
      conversationId: 'conv-2',
      senderId: 'teacher-2',
      senderName: 'Ms. Williams',
      content: 'I tried the strategy you suggested. Students were much more engaged!',
      createdAt: hoursAgo(2),
      readAt: hoursAgo(1),
    },
    unreadCount: 0,
    updatedAt: hoursAgo(2),
  },
  {
    id: 'conv-3',
    participantIds: ['teacher-3', 'coach-1'],
    participants: [
      { id: 'teacher-3', name: 'Mr. Davis' },
      { id: 'coach-1', name: 'Coach Sarah' },
    ],
    lastMessage: {
      id: 'msg-3-1',
      conversationId: 'conv-3',
      senderId: 'teacher-3',
      senderName: 'Mr. Davis',
      content: 'Could we schedule a session about behavior management?',
      createdAt: hoursAgo(5),
      readAt: undefined,
    },
    unreadCount: 2,
    updatedAt: hoursAgo(5),
  },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  'conv-1': [
    { id: 'msg-1-1', conversationId: 'conv-1', senderId: 'teacher-1', senderName: 'Mr. Johnson', content: 'Hi Coach Sarah, I had a tough class today with student engagement.', createdAt: hoursAgo(3) },
    { id: 'msg-1-2', conversationId: 'conv-1', senderId: 'coach-1', senderName: 'Coach Sarah', content: 'Tell me more about what happened. What did you try first?', createdAt: hoursAgo(2), readAt: hoursAgo(2) },
    { id: 'msg-1-3', conversationId: 'conv-1', senderId: 'teacher-1', senderName: 'Mr. Johnson', content: 'I used think-pair-share but only half the class participated.', createdAt: minsAgo(45) },
    { id: 'msg-1-4', conversationId: 'conv-1', senderId: 'coach-1', senderName: 'Coach Sarah', content: 'Great progress this week! Keep it up.', createdAt: minsAgo(25) },
  ],
  'conv-2': [
    { id: 'msg-2-1', conversationId: 'conv-2', senderId: 'coach-1', senderName: 'Coach Sarah', content: 'Try incorporating movement breaks between lessons. Here\'s a quick strategy...', createdAt: hoursAgo(24) },
    { id: 'msg-2-2', conversationId: 'conv-2', senderId: 'teacher-2', senderName: 'Ms. Williams', content: 'I tried the strategy you suggested. Students were much more engaged!', createdAt: hoursAgo(2), readAt: hoursAgo(1) },
  ],
  'conv-3': [
    { id: 'msg-3-1', conversationId: 'conv-3', senderId: 'teacher-3', senderName: 'Mr. Davis', content: 'Could we schedule a session about behavior management?', createdAt: hoursAgo(5) },
  ],
};

interface MessagingState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;

  setConversations: (conversations: Conversation[]) => void;
  setCurrentConversation: (conversation: Conversation | null) => void;
  loadConversationMessages: (conversationId: string) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  sendMessage: (conversationId: string, senderId: string, senderName: string, content: string) => void;
  markConversationRead: (conversationId: string) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
  getTotalUnread: () => number;
  getConversationsForUser: (userId: string) => Conversation[];
}

export const useMessagingStore = create<MessagingState>((set, get) => ({
  conversations: MOCK_CONVERSATIONS,
  currentConversation: null,
  messages: [],
  isLoading: false,
  error: null,

  setConversations: (conversations) => set({ conversations }),

  setCurrentConversation: (conversation) => {
    set({ currentConversation: conversation });
    if (conversation) get().loadConversationMessages(conversation.id);
  },

  loadConversationMessages: (conversationId) => {
    const msgs = MOCK_MESSAGES[conversationId] || [];
    set({ messages: msgs });
  },

  setMessages: (messages) => set({ messages }),

  addMessage: (message) => {
    const state = get();
    set({ messages: [...state.messages, message] });
    MOCK_MESSAGES[message.conversationId] = [...(MOCK_MESSAGES[message.conversationId] || []), message];
  },

  sendMessage: (conversationId, senderId, senderName, content) => {
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId,
      senderName,
      content,
      createdAt: new Date().toISOString(),
    };
    const state = get();
    const updatedConversations = state.conversations.map((c) =>
      c.id === conversationId
        ? { ...c, lastMessage: newMsg, updatedAt: newMsg.createdAt }
        : c
    );
    MOCK_MESSAGES[conversationId] = [...(MOCK_MESSAGES[conversationId] || []), newMsg];
    set({ messages: [...state.messages, newMsg], conversations: updatedConversations });
  },

  markConversationRead: (conversationId) => {
    const state = get();
    const updatedConversations = state.conversations.map((c) =>
      c.id === conversationId ? { ...c, unreadCount: 0 } : c
    );
    set({ conversations: updatedConversations });
  },

  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearMessages: () => set({ messages: [], currentConversation: null }),

  getTotalUnread: () => {
    return get().conversations.reduce((total, conv) => total + conv.unreadCount, 0);
  },

  getConversationsForUser: (userId) => {
    return get().conversations.filter((c) => c.participantIds.includes(userId));
  },
}));
