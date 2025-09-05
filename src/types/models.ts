// Core data types for our application

// User profile data
export interface User {
  id: string;
  role: 'student' | 'teacher' | 'admin';
  name: string;
  email?: string;
  preferences: {
    theme?: 'light' | 'dark' | 'system';
    notifications?: boolean;
    language?: string;
    accessibility?: {
      fontSize?: string;
      highContrast?: boolean;
      screenReader?: boolean;
    };
  };
  learningStyles: ('visual' | 'auditory' | 'reading' | 'kinesthetic')[];
  createdAt: Date;
  lastActive: Date;
}

// Field or subject area
export interface Field {
  id: string;
  name: string;
  description?: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

// User's learning profile
export interface LearningProfile {
  userId: string;
  preferredStyle: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  pace: 'slow' | 'medium' | 'fast';
  priorKnowledge: 'none' | 'basic' | 'intermediate' | 'advanced';
  interests?: string[];
  goals?: string[];
  fieldsOfInterest?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Content generated for learning
export interface ContentArtifact {
  id: string;
  fieldId: string;
  title: string;
  style: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  prompt: string;
  generatedText: string;
  modelMetadata: {
    model: string;
    temperature: number;
    maxTokens?: number;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  createdAt: Date;
  createdBy: string;
}

// Question type for quizzes
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

// Quiz related to content
export interface Quiz {
  id: string;
  contentArtifactId: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  timeLimit?: number; // in seconds
  passingScore?: number;
  createdAt: Date;
  createdBy: string;
}

// A student's attempt at a quiz
export interface Attempt {
  id: string;
  userId: string;
  quizId: string;
  answers: number[]; // Indices of selected answers
  score: number;
  timeTaken?: number; // in seconds
  completed: boolean;
  timestamp: Date;
}

// Analytics event tracking
export interface AnalyticsEvent {
  id: string;
  userId: string;
  eventType: 
    | 'content_view'
    | 'content_generate'
    | 'quiz_start'
    | 'quiz_complete'
    | 'question_answer'
    | 'chat_question'
    | 'chat_response'
    | 'login'
    | 'logout'
    | 'signup'
    | 'profile_update';
  meta: Record<string, any>; // Additional metadata about the event
  timestamp: Date;
}

// Chat messages between user and AI
export interface ChatMessage {
  id: string;
  userId: string;
  contentArtifactId?: string;
  quizId?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

// Session to group chat messages
export interface ChatSession {
  id: string;
  userId: string;
  contentArtifactId?: string;
  quizId?: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}
