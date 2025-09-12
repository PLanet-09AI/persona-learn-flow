// Enhanced Yoco service that handles both client-side and server-side operations
// This service demonstrates how to implement checkout creation and refunds with secret key

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

interface YocoCheckoutRequest {
  amount: number; // in cents
  currency: 'ZAR';
  cancelUrl: string;
  successUrl: string;
  failureUrl: string;
  metadata?: Record<string, string>;
}

interface YocoCheckoutResponse {
  id: string;
  status: string;
  amount: number;
  currency: string;
  redirectUrl: string;
  metadata?: Record<string, string>;
}

interface YocoRefundRequest {
  amount: number; // in cents (partial refund amount or full amount)
  reason?: string;
  metadata?: Record<string, string>;
}

interface YocoRefundResponse {
  id: string;
  status: string;
  amount: number;
  currency: string;
  createdDate: string;
  metadata?: Record<string, string>;
}

interface SubscriptionPlan {
  id: 'monthly' | 'yearly';
  name: string;
  price: number; // in cents
  description: string;
  features: string[];
}

class EnhancedYocoService {
  private publicKey: string;
  private secretKey: string;
  private testMode: boolean;
  private baseUrl: string;

  constructor() {
    this.publicKey = import.meta.env.VITE_YOCO_PUBLIC_KEY || '';
    this.secretKey = import.meta.env.VITE_YOCO_SECRET_KEY || '';
    this.testMode = import.meta.env.VITE_YOCO_MODE === 'test';
    this.baseUrl = 'https://online.yoco.com/v1';
    
    if (!this.publicKey) {
      console.warn('⚠️ Yoco public key not configured');
    }
    if (!this.secretKey) {
      console.warn('⚠️ Yoco secret key not configured (required for server operations)');
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
   * CLIENT-SIDE: Initialize payment using Yoco SDK popup
   * This method works directly from the browser without CORS issues
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
        
        // Store payment result locally for demo purposes
        await this.processSuccessfulPayment(result, plan, userId, userEmail);
      }

      return result;
    } catch (error) {
      console.error('❌ Payment error:', error);
      throw error;
    }
  }

  /**
   * SERVER-SIDE: Create a checkout session using backend API
   * This avoids CORS issues by proxying through our backend
   */
  async createCheckout(request: YocoCheckoutRequest): Promise<YocoCheckoutResponse> {
    try {
      console.log('🔐 Creating Yoco checkout via backend API...', request);
      
      // Call our backend API instead of Yoco directly
      const apiBase = import.meta.env.PROD ? '/.netlify/functions' : 'http://localhost:3002/api';
      const response = await fetch(`${apiBase}/yoco/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: request.amount,
          currency: request.currency,
          cancelUrl: request.cancelUrl,
          successUrl: request.successUrl,
          failureUrl: request.failureUrl,
          metadata: request.metadata || {}
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('❌ Backend API Error:', response.status, errorData);
        throw new Error(`Backend API Error: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      const checkout: YocoCheckoutResponse = await response.json();
      console.log('✅ Checkout created successfully:', checkout);
      
      return checkout;
    } catch (error: any) {
      console.error('❌ Error creating checkout:', error);
      throw new Error(`Failed to create checkout: ${error.message}`);
    }
  }

  /**
   * SERVER-SIDE: Process a refund using backend API
   * This avoids CORS issues by proxying through our backend
   */
  async processRefund(
    paymentId: string,
    refundRequest: YocoRefundRequest
  ): Promise<YocoRefundResponse> {
    try {
      console.log(`🔄 Processing refund for payment ${paymentId} via backend API...`);
      
      // Call our backend API instead of Yoco directly
      const response = await fetch(`http://localhost:3002/api/yoco/refund/${paymentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: refundRequest.amount,
          reason: refundRequest.reason || 'Refund requested',
          metadata: refundRequest.metadata || {}
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('❌ Backend refund API Error:', response.status, errorData);
        throw new Error(`Backend refund API Error: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      const refund: YocoRefundResponse = await response.json();
      console.log('✅ Refund processed successfully:', refund);
      
      return refund;
    } catch (error: any) {
      console.error('❌ Error processing refund:', error);
      throw new Error(`Failed to process refund: ${error.message}`);
    }
  }

  /**
   * SERVER-SIDE: Create checkout for subscription
   * This demonstrates how to create a server-side checkout
   */
  async createSubscriptionCheckout(
    userId: string,
    userEmail: string,
    planType: 'monthly' | 'yearly'
  ): Promise<YocoCheckoutResponse> {
    const plan = this.subscriptionPlans[planType];
    if (!plan) {
      throw new Error('Invalid subscription plan');
    }

    const checkoutRequest: YocoCheckoutRequest = {
      amount: plan.price,
      currency: 'ZAR',
      cancelUrl: `${window.location.origin}/payment-cancelled`,
      successUrl: `${window.location.origin}/payment-success`,
      failureUrl: `${window.location.origin}/payment-failure`,
      metadata: {
        userId,
        userEmail,
        planId: plan.id,
        planName: plan.name,
        subscriptionType: 'course_subscription',
        testMode: this.testMode.toString()
      }
    };

    return await this.createCheckout(checkoutRequest);
  }

  /**
   * SERVER-SIDE: Process subscription refund
   */
  async processSubscriptionRefund(
    paymentId: string,
    refundAmount: number,
    reason: string = 'Customer request'
  ): Promise<YocoRefundResponse> {
    const refundRequest: YocoRefundRequest = {
      amount: refundAmount,
      reason,
      metadata: {
        refundType: 'subscription_refund',
        processedAt: new Date().toISOString()
      }
    };

    return await this.processRefund(paymentId, refundRequest);
  }

  /**
   * Process successful payment (demo implementation)
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

      // Mock payment record
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

      // Store in localStorage for demo
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
   * Check if user has active subscription
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

  /**
   * Get configuration info for debugging
   */
  getConfigInfo() {
    return {
      hasPublicKey: !!this.publicKey,
      hasSecretKey: !!this.secretKey,
      testMode: this.testMode,
      baseUrl: this.baseUrl,
      publicKeyPreview: this.publicKey ? `${this.publicKey.substring(0, 12)}...` : 'Not set',
      secretKeyPreview: this.secretKey ? `${this.secretKey.substring(0, 12)}...` : 'Not set'
    };
  }
}

export const enhancedYocoService = new EnhancedYocoService();
