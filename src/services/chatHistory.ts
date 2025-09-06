import { ChatMessage } from "@/types/chat";

export interface Conversation {
  id: string;
  title: string;
  topic: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

class ChatHistoryService {
  private readonly STORAGE_KEY = 'persona_chat_history';
  private readonly MAX_CONVERSATIONS = 50; // Limit stored conversations

  /**
   * Save a conversation to local storage
   */
  saveConversation(conversation: Conversation): void {
    try {
      const conversations = this.getAllConversations();
      
      // Check if conversation already exists
      const existingIndex = conversations.findIndex(c => c.id === conversation.id);
      
      if (existingIndex >= 0) {
        // Update existing conversation
        conversations[existingIndex] = {
          ...conversation,
          updatedAt: new Date()
        };
      } else {
        // Add new conversation
        conversations.unshift({
          ...conversation,
          createdAt: conversation.createdAt || new Date(),
          updatedAt: new Date()
        });
      }

      // Limit the number of stored conversations
      if (conversations.length > this.MAX_CONVERSATIONS) {
        conversations.splice(this.MAX_CONVERSATIONS);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  }

  /**
   * Get all conversations from local storage
   */
  getAllConversations(): Conversation[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const conversations = JSON.parse(stored);
      
      // Convert date strings back to Date objects
      return conversations.map((conv: any) => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt),
        messages: conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    } catch (error) {
      console.error('Error loading conversations:', error);
      return [];
    }
  }

  /**
   * Get conversations for a specific user
   */
  getUserConversations(userId: string): Conversation[] {
    return this.getAllConversations().filter(conv => conv.userId === userId);
  }

  /**
   * Get a specific conversation by ID
   */
  getConversation(id: string): Conversation | null {
    const conversations = this.getAllConversations();
    return conversations.find(conv => conv.id === id) || null;
  }

  /**
   * Delete a conversation
   */
  deleteConversation(id: string): void {
    try {
      const conversations = this.getAllConversations().filter(conv => conv.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }

  /**
   * Clear all conversations (optional)
   */
  clearAllConversations(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing conversations:', error);
    }
  }

  /**
   * Generate a conversation title from the first user message
   */
  generateConversationTitle(firstMessage: string): string {
    const title = firstMessage.length > 50 
      ? firstMessage.substring(0, 50) + '...' 
      : firstMessage;
    return title || 'New Conversation';
  }

  /**
   * Generate a unique conversation ID
   */
  generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const chatHistoryService = new ChatHistoryService();
