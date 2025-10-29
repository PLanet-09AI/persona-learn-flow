import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc,
  addDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { PaymentRecord, UserSubscription, RefundRequest, UserProfile } from '@/types/payment';
import { cvGenerationTracker } from './cvGenerationTracker';

class PaymentFirebaseService {
  private paymentsCollection = 'payments';
  private subscriptionsCollection = 'subscriptions';
  private refundRequestsCollection = 'refundRequests';
  private userProfilesCollection = 'userProfiles';

  /**
   * Save payment record to Firebase
   */
  async savePaymentRecord(payment: Omit<PaymentRecord, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.paymentsCollection), {
        ...payment,
        createdAt: Timestamp.fromDate(payment.createdAt),
        paidAt: payment.paidAt ? Timestamp.fromDate(payment.paidAt) : null,
        expiresAt: payment.expiresAt ? Timestamp.fromDate(payment.expiresAt) : null,
        refundedAt: payment.refundedAt ? Timestamp.fromDate(payment.refundedAt) : null,
      });
      
      console.log('✅ Payment record saved:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error saving payment record:', error);
      throw error;
    }
  }

  /**
   * Update payment record
   */
  async updatePaymentRecord(paymentId: string, updates: Partial<PaymentRecord>): Promise<void> {
    try {
      const paymentRef = doc(db, this.paymentsCollection, paymentId);
      const updateData: any = { ...updates };
      
      // Convert Date objects to Timestamps
      if (updates.paidAt) updateData.paidAt = Timestamp.fromDate(updates.paidAt);
      if (updates.expiresAt) updateData.expiresAt = Timestamp.fromDate(updates.expiresAt);
      if (updates.refundedAt) updateData.refundedAt = Timestamp.fromDate(updates.refundedAt);
      
      await updateDoc(paymentRef, updateData);
      console.log('✅ Payment record updated:', paymentId);
    } catch (error) {
      console.error('❌ Error updating payment record:', error);
      throw error;
    }
  }

  /**
   * Get payment record by checkout ID
   */
  async getPaymentByCheckoutId(checkoutId: string): Promise<PaymentRecord | null> {
    try {
      const q = query(
        collection(db, this.paymentsCollection),
        where('checkoutId', '==', checkoutId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        paidAt: data.paidAt ? data.paidAt.toDate() : undefined,
        expiresAt: data.expiresAt ? data.expiresAt.toDate() : undefined,
        refundedAt: data.refundedAt ? data.refundedAt.toDate() : undefined,
      } as PaymentRecord;
    } catch (error) {
      console.error('❌ Error getting payment by checkout ID:', error);
      throw error;
    }
  }

  /**
   * Get user payments
   */
  async getUserPayments(userId: string): Promise<PaymentRecord[]> {
    try {
      const q = query(
        collection(db, this.paymentsCollection),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          paidAt: data.paidAt ? data.paidAt.toDate() : undefined,
          expiresAt: data.expiresAt ? data.expiresAt.toDate() : undefined,
          refundedAt: data.refundedAt ? data.refundedAt.toDate() : undefined,
        } as PaymentRecord;
      });
    } catch (error) {
      console.error('❌ Error getting user payments:', error);
      throw error;
    }
  }

  /**
   * Get all payments (admin)
   */
  async getAllPayments(): Promise<PaymentRecord[]> {
    try {
      const q = query(
        collection(db, this.paymentsCollection),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          paidAt: data.paidAt ? data.paidAt.toDate() : undefined,
          expiresAt: data.expiresAt ? data.expiresAt.toDate() : undefined,
          refundedAt: data.refundedAt ? data.refundedAt.toDate() : undefined,
        } as PaymentRecord;
      });
    } catch (error) {
      console.error('❌ Error getting all payments:', error);
      throw error;
    }
  }

  /**
   * Create user subscription
   */
  async createSubscription(subscription: Omit<UserSubscription, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.subscriptionsCollection), {
        ...subscription,
        startDate: Timestamp.fromDate(subscription.startDate),
        endDate: Timestamp.fromDate(subscription.endDate),
        createdAt: Timestamp.fromDate(subscription.createdAt),
        updatedAt: Timestamp.fromDate(subscription.updatedAt),
      });
      
      console.log('✅ Subscription created:', docRef.id);
      
      // Activate CV generations for this user
      try {
        await cvGenerationTracker.activatePaidSubscription(subscription.userId);
        console.log('✅ CV generation subscription activated for user:', subscription.userId);
      } catch (cvError) {
        console.error('⚠️ Error activating CV generation subscription:', cvError);
        // Don't fail the subscription creation if CV activation fails
      }
      
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Get user's active subscription
   */
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const q = query(
        collection(db, this.subscriptionsCollection),
        where('userId', '==', userId),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        ...data,
        startDate: data.startDate.toDate(),
        endDate: data.endDate.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as UserSubscription;
    } catch (error) {
      console.error('❌ Error getting user subscription:', error);
      throw error;
    }
  }

  /**
   * Create refund request
   */
  async createRefundRequest(refundRequest: Omit<RefundRequest, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.refundRequestsCollection), {
        ...refundRequest,
        requestedAt: Timestamp.fromDate(refundRequest.requestedAt),
        processedAt: refundRequest.processedAt ? Timestamp.fromDate(refundRequest.processedAt) : null,
      });
      
      console.log('✅ Refund request created:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating refund request:', error);
      throw error;
    }
  }

  /**
   * Get all refund requests (admin)
   */
  async getAllRefundRequests(): Promise<RefundRequest[]> {
    try {
      const q = query(
        collection(db, this.refundRequestsCollection),
        orderBy('requestedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          requestedAt: data.requestedAt.toDate(),
          processedAt: data.processedAt ? data.processedAt.toDate() : undefined,
        } as RefundRequest;
      });
    } catch (error) {
      console.error('❌ Error getting refund requests:', error);
      throw error;
    }
  }

  /**
   * Update refund request
   */
  async updateRefundRequest(refundRequestId: string, updates: Partial<RefundRequest>): Promise<void> {
    try {
      const refundRef = doc(db, this.refundRequestsCollection, refundRequestId);
      const updateData: any = { ...updates };
      
      if (updates.processedAt) {
        updateData.processedAt = Timestamp.fromDate(updates.processedAt);
      }
      
      await updateDoc(refundRef, updateData);
      console.log('✅ Refund request updated:', refundRequestId);
    } catch (error) {
      console.error('❌ Error updating refund request:', error);
      throw error;
    }
  }

  /**
   * Save or update user profile
   */
  async saveUserProfile(profile: Omit<UserProfile, 'id'>): Promise<string> {
    try {
      const docRef = doc(db, this.userProfilesCollection, profile.userId);
      
      // Filter out undefined values to prevent Firebase errors
      const cleanProfile = this.removeUndefinedValues(profile);
      
      const profileData = {
        ...cleanProfile,
        dateOfBirth: cleanProfile.dateOfBirth ? Timestamp.fromDate(cleanProfile.dateOfBirth) : null,
        createdAt: Timestamp.fromDate(cleanProfile.createdAt),
        updatedAt: Timestamp.fromDate(cleanProfile.updatedAt),
      };
      
      await setDoc(docRef, profileData, { merge: true });
      console.log('✅ User profile saved:', profile.userId);
      return profile.userId;
    } catch (error) {
      console.error('❌ Error saving user profile:', error);
      throw error;
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, this.userProfilesCollection, userId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      const data = docSnap.data();
      
      return {
        id: docSnap.id,
        ...data,
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.toDate() : undefined,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as UserProfile;
    } catch (error) {
      console.error('❌ Error getting user profile:', error);
      throw error;
    }
  }

  /**
   * Get subscription status for a user
   */
  async getSubscriptionStatus(userId: string): Promise<{ status: 'active' | 'cancelled' | 'expired' | 'none'; subscriptionType?: 'monthly' | 'yearly'; startDate?: Date; endDate?: Date; autoRenew?: boolean; }> {
    try {
      const q = query(
        collection(db, this.subscriptionsCollection),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return { status: 'none' };
      }

      // Get the most recent subscription
      const latestSub = querySnapshot.docs[0];
      const data = latestSub.data();
      
      const subscription = {
        status: data.status,
        subscriptionType: data.subscriptionType,
        startDate: data.startDate?.toDate(),
        endDate: data.endDate?.toDate(),
        autoRenew: data.autoRenew,
      };

      // Check if subscription is expired
      if (subscription.endDate && subscription.endDate < new Date()) {
        return { ...subscription, status: 'expired' as const };
      }

      return subscription;
    } catch (error) {
      console.error('❌ Error getting subscription status:', error);
      return { status: 'none' };
    }
  }

  /**
   * Remove undefined values from an object to prevent Firebase errors
   */
  private removeUndefinedValues(obj: any): any {
    const cleaned: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          cleaned[key] = value;
        } else if (value !== null && typeof value === 'object' && value instanceof Date) {
          cleaned[key] = value;
        } else if (value !== null && typeof value === 'object') {
          cleaned[key] = this.removeUndefinedValues(value);
        } else {
          cleaned[key] = value;
        }
      }
    }
    
    return cleaned;
  }
}

export const paymentFirebaseService = new PaymentFirebaseService();
