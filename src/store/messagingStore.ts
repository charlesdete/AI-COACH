import { create } from 'zustand';
import { Message, Conversation } from '../shared/types/message';

interface MessagingState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  
  setConversations: (conversations: Conversation[]) => void;
  setCurrentConversation: (conversation: Conversation | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
  getTotalUnread: () => number;
}

export const useMessagingStore = create<MessagingState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  error: null,

  setConversations: (conversations) => set({ conversations }),
  
  setCurrentConversation: (conversation) => set({ currentConversation: conversation }),
  
  setMessages: (messages) => set({ messages }),
  
  addMessage: (message) => {
    const state = get();
    set({ messages: [...state.messages, message] });
  },
  
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  clearMessages: () => set({ messages: [], currentConversation: null }),
  
  getTotalUnread: () => {
    const state = get();
    return state.conversations.reduce((total, conv) => total + conv.unreadCount, 0);
  },
}));
