import apiClient from '../../../services/api';
import { MESSAGE_ENDPOINTS } from '../../../services/endpoints';
import { Message, Conversation, MessageThread } from '../../../shared/types/message';

export const messagingService = {
  /**
   * Send a message to a conversation
   */
  async sendMessage(
    conversationId: string,
    content: string,
    senderName: string
  ): Promise<Message> {
    const response = await apiClient.post(MESSAGE_ENDPOINTS.SEND_MESSAGE, {
      conversationId,
      content,
      senderName,
    });
    return response.data;
  },

  /**
   * Get all messages in a conversation
   */
  async getConversation(conversationId: string): Promise<MessageThread> {
    const response = await apiClient.get(
      MESSAGE_ENDPOINTS.GET_CONVERSATION(conversationId)
    );
    return response.data;
  },

  /**
   * Get all conversations for the current user
   */
  async getConversations(): Promise<Conversation[]> {
    const response = await apiClient.get(MESSAGE_ENDPOINTS.GET_CONVERSATIONS);
    return response.data;
  },

  /**
   * Start a new conversation with another user
   */
  async startConversation(
    participantIds: string[],
    participantNames: string[]
  ): Promise<Conversation> {
    const response = await apiClient.post(
      MESSAGE_ENDPOINTS.START_CONVERSATION,
      {
        participantIds,
        participantNames,
      }
    );
    return response.data;
  },

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string): Promise<void> {
    await apiClient.delete(MESSAGE_ENDPOINTS.DELETE_MESSAGE(messageId));
  },

  /**
   * Mark a message as read
   */
  async markMessageAsRead(messageId: string): Promise<Message> {
    const response = await apiClient.patch(
      MESSAGE_ENDPOINTS.GET_CONVERSATION('') + messageId + '/read'
    );
    return response.data;
  },
};
