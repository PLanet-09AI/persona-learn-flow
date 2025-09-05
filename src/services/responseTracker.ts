import { collection, addDoc, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface ModelResponse {
  id?: string;
  userId: string;
  model: string;
  prompt: string;
  response: string;
  timestamp: Date;
  contentContext?: string; // The learning content being discussed
  topic?: string;
  field?: string;
  responseType: 'content_generation' | 'chat' | 'quiz' | 'explanation';
  metadata?: {
    processingTime?: number;
    tokenCount?: number;
    temperature?: number;
    [key: string]: any;
  };
}

class ResponseTrackerService {
  private collectionName = 'model_responses';

  /**
   * Save a model response to Firestore
   */
  async saveResponse(responseData: Omit<ModelResponse, 'id' | 'timestamp'>): Promise<string> {
    try {
      const docData = {
        ...responseData,
        timestamp: Timestamp.fromDate(new Date()),
        createdAt: Timestamp.fromDate(new Date())
      };

      const docRef = await addDoc(collection(db, this.collectionName), docData);
      console.log('Response saved with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error saving response:', error);
      throw error;
    }
  }

  /**
   * Get recent responses for a user
   */
  async getUserResponses(userId: string, limitCount: number = 50): Promise<ModelResponse[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const responses: ModelResponse[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        responses.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date()
        } as ModelResponse);
      });

      return responses.filter(response => response.userId === userId);
    } catch (error) {
      console.error('Error fetching user responses:', error);
      throw error;
    }
  }

  /**
   * Get responses by type
   */
  async getResponsesByType(userId: string, responseType: ModelResponse['responseType'], limitCount: number = 20): Promise<ModelResponse[]> {
    try {
      const responses = await this.getUserResponses(userId, limitCount);
      return responses.filter(response => response.responseType === responseType);
    } catch (error) {
      console.error('Error fetching responses by type:', error);
      throw error;
    }
  }

  /**
   * Get responses for a specific topic/field
   */
  async getResponsesByTopic(userId: string, topic: string, field?: string): Promise<ModelResponse[]> {
    try {
      const responses = await this.getUserResponses(userId, 100);
      return responses.filter(response => {
        const topicMatch = response.topic?.toLowerCase().includes(topic.toLowerCase());
        const fieldMatch = !field || response.field?.toLowerCase().includes(field.toLowerCase());
        return topicMatch && fieldMatch;
      });
    } catch (error) {
      console.error('Error fetching responses by topic:', error);
      throw error;
    }
  }

  /**
   * Get conversation history for chat responses
   */
  async getChatHistory(userId: string, contentContext?: string): Promise<ModelResponse[]> {
    try {
      const responses = await this.getResponsesByType(userId, 'chat', 100);
      
      if (contentContext) {
        return responses.filter(response => 
          response.contentContext === contentContext
        );
      }
      
      return responses;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  }

  /**
   * Save content generation response
   */
  async saveContentGeneration(
    userId: string,
    model: string,
    prompt: string,
    response: string,
    topic: string,
    field: string,
    metadata?: ModelResponse['metadata']
  ): Promise<string> {
    return this.saveResponse({
      userId,
      model,
      prompt,
      response,
      topic,
      field,
      responseType: 'content_generation',
      metadata
    });
  }

  /**
   * Save chat response
   */
  async saveChatResponse(
    userId: string,
    model: string,
    prompt: string,
    response: string,
    contentContext?: string,
    topic?: string,
    metadata?: ModelResponse['metadata']
  ): Promise<string> {
    return this.saveResponse({
      userId,
      model,
      prompt,
      response,
      contentContext,
      topic,
      responseType: 'chat',
      metadata
    });
  }

  /**
   * Save quiz generation response
   */
  async saveQuizResponse(
    userId: string,
    model: string,
    prompt: string,
    response: string,
    topic: string,
    field: string,
    metadata?: ModelResponse['metadata']
  ): Promise<string> {
    return this.saveResponse({
      userId,
      model,
      prompt,
      response,
      topic,
      field,
      responseType: 'quiz',
      metadata
    });
  }
}

export const responseTracker = new ResponseTrackerService();
