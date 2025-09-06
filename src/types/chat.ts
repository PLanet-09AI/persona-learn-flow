export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  topic: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}
