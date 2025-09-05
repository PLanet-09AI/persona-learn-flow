import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  DocumentReference,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { User, LearningProfile, Field, ContentArtifact, Quiz, Attempt, AnalyticsEvent, ChatMessage, ChatSession } from '../types/models';

// Convert Firestore timestamps to Date objects and vice versa
const convertTimestamps = (data: any): any => {
  if (!data) return data;
  
  const result = { ...data };
  
  Object.keys(result).forEach(key => {
    // Convert Firestore Timestamp to Date
    if (result[key] instanceof Timestamp) {
      result[key] = result[key].toDate();
    }
    // Convert Date to Firestore Timestamp
    else if (result[key] instanceof Date) {
      result[key] = Timestamp.fromDate(result[key]);
    }
    // Recursively process nested objects
    else if (typeof result[key] === 'object' && result[key] !== null) {
      result[key] = convertTimestamps(result[key]);
    }
  });
  
  return result;
};

// User Services
export const userService = {
  async createUser(user: User): Promise<string> {
    try {
      // If the user already has an ID, use it to set the document ID
      if (user.id) {
        await setDoc(doc(db, 'users', user.id), convertTimestamps(user));
        return user.id;
      } else {
        // Otherwise let Firestore generate an ID
        const userRef = await addDoc(collection(db, 'users'), convertTimestamps(user));
        return userRef.id;
      }
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },
  
  async getUserById(id: string): Promise<User | null> {
    try {
      console.log("Getting user by ID:", id);
      const userDoc = await getDoc(doc(db, 'users', id));
      
      if (!userDoc.exists()) {
        console.log("User document does not exist");
        return null;
      }
      
      const userData = userDoc.data();
      console.log("User data retrieved:", userData);
      return { id: userDoc.id, ...convertTimestamps(userData) } as User;
    } catch (error) {
      console.error("Error getting user by ID:", error);
      return null;
    }
  },
  
  async updateUser(id: string, data: Partial<User>): Promise<void> {
    const userRef = doc(db, 'users', id);
    await updateDoc(userRef, convertTimestamps(data));
  },
  
  async getUserByEmail(email: string): Promise<User | null> {
    const q = query(collection(db, 'users'), where('email', '==', email), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...convertTimestamps(doc.data()) } as User;
  }
};

// Learning Profile Services
export const learningProfileService = {
  async createProfile(profile: Omit<LearningProfile, 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const data = {
      ...profile,
      createdAt: now,
      updatedAt: now
    };
    const profileRef = await addDoc(collection(db, 'learningProfiles'), convertTimestamps(data));
    return profileRef.id;
  },
  
  async getProfileByUserId(userId: string): Promise<LearningProfile | null> {
    const q = query(collection(db, 'learningProfiles'), where('userId', '==', userId), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return convertTimestamps(doc.data()) as LearningProfile;
  },
  
  async updateProfile(userId: string, data: Partial<LearningProfile>): Promise<void> {
    const q = query(collection(db, 'learningProfiles'), where('userId', '==', userId), limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const profileRef = doc(db, 'learningProfiles', snapshot.docs[0].id);
      await updateDoc(profileRef, {
        ...convertTimestamps(data),
        updatedAt: new Date()
      });
    }
  }
};

// Field Services
export const fieldService = {
  async getAllFields(): Promise<Field[]> {
    const snapshot = await getDocs(collection(db, 'fields'));
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...convertTimestamps(doc.data()) 
    })) as Field[];
  },
  
  async getFieldById(id: string): Promise<Field | null> {
    const fieldDoc = await getDoc(doc(db, 'fields', id));
    if (!fieldDoc.exists()) return null;
    return { id: fieldDoc.id, ...convertTimestamps(fieldDoc.data()) } as Field;
  }
};

// Content Artifact Services
export const contentService = {
  async createContent(content: Omit<ContentArtifact, 'id' | 'createdAt'>): Promise<string> {
    const contentData = {
      ...content,
      createdAt: new Date()
    };
    const contentRef = await addDoc(collection(db, 'contentArtifacts'), convertTimestamps(contentData));
    return contentRef.id;
  },
  
  async getContentById(id: string): Promise<ContentArtifact | null> {
    const contentDoc = await getDoc(doc(db, 'contentArtifacts', id));
    if (!contentDoc.exists()) return null;
    return { id: contentDoc.id, ...convertTimestamps(contentDoc.data()) } as ContentArtifact;
  },
  
  async getContentByField(fieldId: string): Promise<ContentArtifact[]> {
    const q = query(
      collection(db, 'contentArtifacts'),
      where('fieldId', '==', fieldId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...convertTimestamps(doc.data()) 
    })) as ContentArtifact[];
  },
  
  async getUserContentHistory(userId: string): Promise<ContentArtifact[]> {
    const q = query(
      collection(db, 'contentArtifacts'),
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...convertTimestamps(doc.data()) 
    })) as ContentArtifact[];
  }
};

// Quiz Services
export const quizService = {
  async createQuiz(quiz: Omit<Quiz, 'id' | 'createdAt'>): Promise<string> {
    const quizData = {
      ...quiz,
      createdAt: new Date()
    };
    const quizRef = await addDoc(collection(db, 'quizzes'), convertTimestamps(quizData));
    return quizRef.id;
  },
  
  async getQuizById(id: string): Promise<Quiz | null> {
    const quizDoc = await getDoc(doc(db, 'quizzes', id));
    if (!quizDoc.exists()) return null;
    return { id: quizDoc.id, ...convertTimestamps(quizDoc.data()) } as Quiz;
  },
  
  async getQuizByContentId(contentId: string): Promise<Quiz | null> {
    const q = query(
      collection(db, 'quizzes'),
      where('contentArtifactId', '==', contentId),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...convertTimestamps(doc.data()) } as Quiz;
  }
};

// Attempt Services
export const attemptService = {
  async saveAttempt(attempt: Omit<Attempt, 'id'>): Promise<string> {
    const attemptRef = await addDoc(collection(db, 'attempts'), convertTimestamps(attempt));
    return attemptRef.id;
  },
  
  async getUserAttempts(userId: string): Promise<Attempt[]> {
    const q = query(
      collection(db, 'attempts'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...convertTimestamps(doc.data()) 
    })) as Attempt[];
  }
};

// Analytics Service
export const analyticsService = {
  async trackEvent(event: Omit<AnalyticsEvent, 'id'>): Promise<string> {
    const eventRef = await addDoc(collection(db, 'analyticsEvents'), convertTimestamps(event));
    return eventRef.id;
  },
  
  async getUserEvents(userId: string): Promise<AnalyticsEvent[]> {
    const q = query(
      collection(db, 'analyticsEvents'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(100) // Limit to most recent 100 events
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...convertTimestamps(doc.data()) 
    })) as AnalyticsEvent[];
  }
};

// Chat Services
export const chatService = {
  async createSession(session: Omit<ChatSession, 'id' | 'messages' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const sessionData = {
      ...session,
      messages: [],
      createdAt: now,
      updatedAt: now
    };
    const sessionRef = await addDoc(collection(db, 'chatSessions'), convertTimestamps(sessionData));
    return sessionRef.id;
  },
  
  async getSessionById(id: string): Promise<ChatSession | null> {
    const sessionDoc = await getDoc(doc(db, 'chatSessions', id));
    if (!sessionDoc.exists()) return null;
    return { id: sessionDoc.id, ...convertTimestamps(sessionDoc.data()) } as ChatSession;
  },
  
  async getUserSessions(userId: string): Promise<ChatSession[]> {
    const q = query(
      collection(db, 'chatSessions'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...convertTimestamps(doc.data()) 
    })) as ChatSession[];
  },
  
  async addMessage(sessionId: string, message: Omit<ChatMessage, 'id'>): Promise<void> {
    const sessionRef = doc(db, 'chatSessions', sessionId);
    const sessionDoc = await getDoc(sessionRef);
    
    if (sessionDoc.exists()) {
      const session = sessionDoc.data() as ChatSession;
      const messages = session.messages || [];
      
      await updateDoc(sessionRef, {
        messages: [...messages, convertTimestamps(message)],
        updatedAt: new Date()
      });
    }
  }
};
