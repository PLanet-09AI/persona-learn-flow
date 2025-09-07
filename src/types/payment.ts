export interface PaymentRecord {
  id: string;
  userId: string;
  userEmail: string;
  checkoutId: string;
  paymentId?: string;
  amount: number; // in cents
  currency: 'ZAR';
  status: 'created' | 'started' | 'processing' | 'completed' | 'failed' | 'cancelled';
  subscriptionType: 'monthly' | 'yearly';
  productType: 'course_subscription';
  createdAt: Date;
  paidAt?: Date;
  expiresAt?: Date;
  refundedAt?: Date;
  refundAmount?: number;
  refundId?: string;
  refundReason?: string;
  metadata?: Record<string, any>;
}

export interface UserSubscription {
  id: string;
  userId: string;
  paymentId: string;
  subscriptionType: 'monthly' | 'yearly';
  status: 'active' | 'cancelled' | 'expired' | 'refunded';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RefundRequest {
  id: string;
  userId: string;
  userEmail: string;
  paymentId: string;
  checkoutId: string;
  amount: number; // original payment amount
  refundAmount: number; // requested refund amount
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  requestedAt: Date;
  processedAt?: Date;
  processedBy?: string; // admin user ID
  adminNotes?: string;
  yocoRefundId?: string;
}

export interface SubscriptionStatus {
  status: 'active' | 'cancelled' | 'expired' | 'none';
  subscriptionType?: 'monthly' | 'yearly';
  startDate?: Date;
  endDate?: Date;
  autoRenew?: boolean;
}

export interface UserProfile {
  // Basic Info
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  
  // Location
  country: string;
  city: string;
  address?: string;
  postalCode?: string;
  
  // Professional Info
  currentJobTitle?: string;
  currentCompany?: string;
  industry: string;
  experienceLevel: 'entry' | 'junior' | 'mid' | 'senior' | 'executive';
  yearsOfExperience?: number;
  
  // Education
  highestEducation: 'high_school' | 'diploma' | 'bachelor' | 'master' | 'phd' | 'other';
  fieldOfStudy?: string;
  university?: string;
  graduationYear?: number;
  
  // Skills & Interests
  skills: string[]; // Array of skill names
  interests: string[]; // Array of interests
  languages: Array<{
    language: string;
    proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
  }>;
  
  // Career Goals
  careerGoals: string;
  targetJobTitle?: string;
  targetIndustry?: string;
  relocatingWillingness?: boolean;
  remoteWorkPreference?: 'office' | 'remote' | 'hybrid' | 'no_preference';
  
  // Learning Preferences (from existing system)
  field: string;
  learningStyle: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  level: 'beginner' | 'intermediate' | 'advanced';
  
  // CV Generation Settings
  cvTemplate?: 'modern' | 'classic' | 'creative' | 'minimal';
  includePhoto?: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
