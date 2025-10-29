import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/config/firebase';

interface CVGenerationRecord {
  userId: string;
  freeGenerationsUsed: number;
  paidGenerationsUsed: number;
  totalGenerations: number;
  lastGeneratedAt: Date;
  createdAt: Date;
  hasPaidSubscription: boolean;
}

const FREE_GENERATION_LIMIT = 3;
const PAID_GENERATION_LIMIT = 20;

class CVGenerationTrackerService {
  private collectionName = 'cvGenerations';

  /**
   * Get user's CV generation record
   */
  async getGenerationRecord(userId: string): Promise<CVGenerationRecord | null> {
    try {
      console.log('📊 Fetching CV generation record for user:', userId);
      
      const docRef = doc(db, this.collectionName, userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('✅ Generation record found:', data);
        
        return {
          userId,
          freeGenerationsUsed: data.freeGenerationsUsed || 0,
          paidGenerationsUsed: data.paidGenerationsUsed || 0,
          totalGenerations: data.totalGenerations || 0,
          lastGeneratedAt: data.lastGeneratedAt?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          hasPaidSubscription: data.hasPaidSubscription || false
        };
      }

      console.log('📝 No generation record found, returning default');
      return null;
    } catch (error) {
      console.error('❌ Error fetching generation record:', error);
      throw error;
    }
  }

  /**
   * Initialize generation record for new user
   */
  async initializeRecord(userId: string): Promise<void> {
    try {
      console.log('🆕 Initializing CV generation record for user:', userId);
      
      const docRef = doc(db, this.collectionName, userId);
      await setDoc(docRef, {
        userId,
        freeGenerationsUsed: 0,
        paidGenerationsUsed: 0,
        totalGenerations: 0,
        hasPaidSubscription: false,
        createdAt: serverTimestamp(),
        lastGeneratedAt: null
      });

      console.log('✅ Generation record initialized');
    } catch (error) {
      console.error('❌ Error initializing generation record:', error);
      throw error;
    }
  }

  /**
   * Check if user can generate CV
   */
  async canGenerateCV(userId: string): Promise<{
    canGenerate: boolean;
    reason?: string;
    remainingFree: number;
    remainingPaid: number;
    totalRemaining: number;
  }> {
    try {
      console.log('🔍 Checking if user can generate CV:', userId);
      
      let record = await this.getGenerationRecord(userId);

      // Initialize if no record exists
      if (!record) {
        await this.initializeRecord(userId);
        record = await this.getGenerationRecord(userId);
      }

      if (!record) {
        return {
          canGenerate: true,
          remainingFree: FREE_GENERATION_LIMIT,
          remainingPaid: 0,
          totalRemaining: FREE_GENERATION_LIMIT
        };
      }

      const remainingFree = Math.max(0, FREE_GENERATION_LIMIT - record.freeGenerationsUsed);
      const remainingPaid = record.hasPaidSubscription 
        ? Math.max(0, PAID_GENERATION_LIMIT - record.paidGenerationsUsed)
        : 0;
      const totalRemaining = remainingFree + remainingPaid;

      console.log('📊 Generation limits:', {
        freeUsed: record.freeGenerationsUsed,
        remainingFree,
        paidUsed: record.paidGenerationsUsed,
        remainingPaid,
        totalRemaining,
        hasPaid: record.hasPaidSubscription
      });

      if (totalRemaining <= 0) {
        return {
          canGenerate: false,
          reason: record.hasPaidSubscription 
            ? 'You have reached your generation limit. Please contact support for more generations.'
            : 'You have used all 3 free CV generations. Subscribe to unlock 20 more generations!',
          remainingFree,
          remainingPaid,
          totalRemaining: 0
        };
      }

      return {
        canGenerate: true,
        remainingFree,
        remainingPaid,
        totalRemaining
      };
    } catch (error) {
      console.error('❌ Error checking generation eligibility:', error);
      throw error;
    }
  }

  /**
   * Record a CV generation
   */
  async recordGeneration(userId: string): Promise<void> {
    try {
      console.log('📝 Recording CV generation for user:', userId);
      
      const record = await this.getGenerationRecord(userId);
      const docRef = doc(db, this.collectionName, userId);

      if (!record) {
        // Initialize and record first generation
        await setDoc(docRef, {
          userId,
          freeGenerationsUsed: 1,
          paidGenerationsUsed: 0,
          totalGenerations: 1,
          hasPaidSubscription: false,
          createdAt: serverTimestamp(),
          lastGeneratedAt: serverTimestamp()
        });
        console.log('✅ First generation recorded');
        return;
      }

      // Determine which counter to increment
      const remainingFree = FREE_GENERATION_LIMIT - record.freeGenerationsUsed;
      
      if (remainingFree > 0) {
        // Use free generation
        await updateDoc(docRef, {
          freeGenerationsUsed: increment(1),
          totalGenerations: increment(1),
          lastGeneratedAt: serverTimestamp()
        });
        console.log('✅ Free generation recorded');
      } else if (record.hasPaidSubscription) {
        // Use paid generation
        await updateDoc(docRef, {
          paidGenerationsUsed: increment(1),
          totalGenerations: increment(1),
          lastGeneratedAt: serverTimestamp()
        });
        console.log('✅ Paid generation recorded');
      } else {
        throw new Error('No generations remaining');
      }
    } catch (error) {
      console.error('❌ Error recording generation:', error);
      throw error;
    }
  }

  /**
   * Activate paid subscription (unlocks 20 more generations)
   */
  async activatePaidSubscription(userId: string): Promise<void> {
    try {
      console.log('💳 Activating paid subscription for user:', userId);
      
      const docRef = doc(db, this.collectionName, userId);
      const record = await this.getGenerationRecord(userId);

      if (!record) {
        await this.initializeRecord(userId);
      }

      await updateDoc(docRef, {
        hasPaidSubscription: true,
        paidGenerationsUsed: 0 // Reset paid generations counter
      });

      console.log('✅ Paid subscription activated - 20 generations unlocked');
    } catch (error) {
      console.error('❌ Error activating paid subscription:', error);
      throw error;
    }
  }

  /**
   * Get generation statistics
   */
  async getStatistics(userId: string): Promise<{
    freeUsed: number;
    freeRemaining: number;
    paidUsed: number;
    paidRemaining: number;
    totalUsed: number;
    totalRemaining: number;
    hasPaid: boolean;
  }> {
    const record = await this.getGenerationRecord(userId);

    if (!record) {
      return {
        freeUsed: 0,
        freeRemaining: FREE_GENERATION_LIMIT,
        paidUsed: 0,
        paidRemaining: 0,
        totalUsed: 0,
        totalRemaining: FREE_GENERATION_LIMIT,
        hasPaid: false
      };
    }

    const freeRemaining = Math.max(0, FREE_GENERATION_LIMIT - record.freeGenerationsUsed);
    const paidRemaining = record.hasPaidSubscription 
      ? Math.max(0, PAID_GENERATION_LIMIT - record.paidGenerationsUsed)
      : 0;

    return {
      freeUsed: record.freeGenerationsUsed,
      freeRemaining,
      paidUsed: record.paidGenerationsUsed,
      paidRemaining,
      totalUsed: record.totalGenerations,
      totalRemaining: freeRemaining + paidRemaining,
      hasPaid: record.hasPaidSubscription
    };
  }
}

export const cvGenerationTracker = new CVGenerationTrackerService();
