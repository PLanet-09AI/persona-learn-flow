// Yoco client-side payment service using the Yoco SDK
// This approach avoids CORS issues by using Yoco's official client-side integration

declare global {
  interface Window {
    YocoSDK: {
      popup: (options: YocoPopupOptions) => Promise<YocoPopupResult>;
    };
  }
}

interface YocoPopupOptions {
  amountInCents: number;
  currency: 'ZAR';
  name?: string;
  description?: string;
  image?: string;
  locale?: 'en' | 'af';
  publicKey: string;
  metadata?: Record<string, string>;
}

interface YocoPopupResult {
  id: string;
  status: 'successful' | 'cancelled' | 'failed';
  metadata?: Record<string, string>;
}

interface SubscriptionPlan {
  id: 'monthly' | 'yearly';
  name: string;
  price: number; // in cents
  description: string;
  features: string[];
}

class YocoClientService {
  private publicKey: string;
  private testMode: boolean;

  constructor() {
    this.publicKey = import.meta.env.VITE_YOCO_PUBLIC_KEY || '';
    this.testMode = import.meta.env.VITE_YOCO_MODE === 'test';
    
    if (!this.publicKey) {
      console.warn('⚠️ Yoco public key not configured');
    }
  }

  /**
   * Available subscription plans
   */
  readonly subscriptionPlans: Record<string, SubscriptionPlan> = {
    monthly: {
      id: 'monthly',
      name: 'Monthly Subscription',
      price: 9900, // R99.00 in cents
      description: 'Full access to all learning features',
      features: [
        'Unlimited AI-powered learning sessions',
        'Personalized content recommendations',
        'Progress tracking and analytics',
        'Professional CV and cover letter generation',
        'Priority support',
        'Cancel anytime'
      ]
    },
    yearly: {
      id: 'yearly',
      name: 'Yearly Subscription',
      price: 99900, // R999.00 in cents
      description: 'Best value - Save over 15% with annual billing',
      features: [
        'Everything in Monthly plan',
        'Save R188 per year',
        'Priority feature access',
        'Dedicated account manager',
        'Advanced analytics dashboard',
        'Custom learning paths'
      ]
    }
  };

  /**
   * Initialize payment for a subscription
   */
  async initiateSubscriptionPayment(
    planId: 'monthly' | 'yearly',
    userEmail: string,
    userId: string
  ): Promise<YocoPopupResult> {
    try {
      // Check if Yoco SDK is loaded
      if (!window.YocoSDK) {
        throw new Error('Yoco SDK not loaded. Please refresh the page and try again.');
      }

      const plan = this.subscriptionPlans[planId];
      if (!plan) {
        throw new Error('Invalid subscription plan selected');
      }

      console.log(`🚀 Initiating ${plan.name} payment for user: ${userEmail}`);

      const paymentOptions: YocoPopupOptions = {
        amountInCents: plan.price,
        currency: 'ZAR',
        name: 'Ndu AI Learning System',
        description: `${plan.name} - ${plan.description}`,
        publicKey: this.publicKey,
        metadata: {
          userId,
          userEmail,
          planId: plan.id,
          planName: plan.name,
          subscriptionType: 'course_subscription',
          testMode: this.testMode.toString()
        }
      };

      // Open Yoco payment popup
      const result = await window.YocoSDK.popup(paymentOptions);

      console.log('✅ Payment popup result:', result);

      if (result.status === 'successful') {
        console.log('🎉 Payment successful!', result.id);
        
        // Here you would typically send the payment result to your backend
        // to create the subscription record in your database
        await this.processSuccessfulPayment(result, plan, userId, userEmail);
      }

      return result;
    } catch (error) {
      console.error('❌ Payment error:', error);
      throw error;
    }
  }

  /**
   * Process successful payment (mock implementation)
   * In a real application, this would communicate with your backend
   */
  private async processSuccessfulPayment(
    paymentResult: YocoPopupResult,
    plan: SubscriptionPlan,
    userId: string,
    userEmail: string
  ): Promise<void> {
    try {
      console.log('📝 Processing successful payment...');

      // Calculate subscription dates
      const startDate = new Date();
      const endDate = new Date();
      
      if (plan.id === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      // Mock payment record (in real app, this would be sent to backend)
      const paymentRecord = {
        id: paymentResult.id,
        userId,
        userEmail,
        checkoutId: paymentResult.id,
        paymentId: paymentResult.id,
        amount: plan.price,
        currency: 'ZAR' as const,
        status: 'completed' as const,
        subscriptionType: plan.id,
        productType: 'course_subscription' as const,
        createdAt: new Date(),
        paidAt: new Date(),
        expiresAt: endDate,
        metadata: paymentResult.metadata || {}
      };

      // Mock subscription record
      const subscription = {
        userId,
        paymentId: paymentResult.id,
        subscriptionType: plan.id,
        status: 'active' as const,
        startDate,
        endDate,
        autoRenew: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('💾 Payment record created:', paymentRecord);
      console.log('📅 Subscription created:', subscription);

      // In a real application, you would:
      // 1. Send payment data to your backend API
      // 2. Backend verifies payment with Yoco
      // 3. Backend creates subscription in database
      // 4. Backend sends confirmation email

      // For now, we'll store in localStorage as a demo
      const existingPayments = JSON.parse(localStorage.getItem('demo_payments') || '[]');
      existingPayments.push(paymentRecord);
      localStorage.setItem('demo_payments', JSON.stringify(existingPayments));

      const existingSubscriptions = JSON.parse(localStorage.getItem('demo_subscriptions') || '[]');
      existingSubscriptions.push(subscription);
      localStorage.setItem('demo_subscriptions', JSON.stringify(existingSubscriptions));

      console.log('✅ Payment processing completed successfully');
    } catch (error) {
      console.error('❌ Error processing payment:', error);
      throw error;
    }
  }

  /**
   * Check if user has active subscription (demo implementation)
   */
  async checkSubscriptionStatus(userId: string): Promise<{
    hasActiveSubscription: boolean;
    subscription?: any;
    expiresAt?: Date;
  }> {
    try {
      const subscriptions = JSON.parse(localStorage.getItem('demo_subscriptions') || '[]');
      const userSubscription = subscriptions
        .filter((sub: any) => sub.userId === userId && sub.status === 'active')
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

      if (userSubscription) {
        const expiresAt = new Date(userSubscription.endDate);
        const isActive = expiresAt > new Date();
        
        return {
          hasActiveSubscription: isActive,
          subscription: userSubscription,
          expiresAt
        };
      }

      return { hasActiveSubscription: false };
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return { hasActiveSubscription: false };
    }
  }

  /**
   * Get pricing display information
   */
  getPricingInfo(planId: 'monthly' | 'yearly'): {
    price: string;
    period: string;
    savings?: string;
  } {
    const plan = this.subscriptionPlans[planId];
    const price = (plan.price / 100).toFixed(2);

    if (planId === 'monthly') {
      return {
        price: `R${price}`,
        period: 'per month'
      };
    } else {
      const monthlyTotal = this.subscriptionPlans.monthly.price * 12;
      const savings = ((monthlyTotal - plan.price) / 100).toFixed(2);
      
      return {
        price: `R${price}`,
        period: 'per year',
        savings: `Save R${savings}`
      };
    }
  }

  /**
   * Check if Yoco SDK is ready
   */
  isSDKReady(): boolean {
    return typeof window !== 'undefined' && !!window.YocoSDK;
  }

  /**
   * Wait for SDK to load
   */
  async waitForSDK(maxWait: number = 5000): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.isSDKReady()) {
        resolve(true);
        return;
      }

      const checkInterval = 100;
      let waited = 0;

      const interval = setInterval(() => {
        if (this.isSDKReady()) {
          clearInterval(interval);
          resolve(true);
        } else if (waited >= maxWait) {
          clearInterval(interval);
          resolve(false);
        }
        waited += checkInterval;
      }, checkInterval);
    });
  }
}

export const yocoClientService = new YocoClientService();
