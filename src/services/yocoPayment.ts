// Yoco Payment Service
interface YocoCheckoutRequest {
  amount: number; // in cents
  currency: 'ZAR';
  successUrl?: string;
  cancelUrl?: string;
  failureUrl?: string;
  metadata?: Record<string, any>;
  totalDiscount?: number;
  totalTaxAmount?: number;
  subtotalAmount?: number;
  lineItems?: Array<{
    displayName: string;
    quantity: number;
    unitAmount: number;
    productId?: string;
    productType?: string;
  }>;
  externalId?: string;
}

interface YocoCheckoutResponse {
  id: string;
  status: 'created' | 'started' | 'processing' | 'completed';
  amount: number;
  currency: string;
  redirectUrl: string;
  paymentId: string | null;
  successUrl: string | null;
  cancelUrl: string | null;
  failureUrl: string | null;
  metadata: Record<string, any> | null;
  merchantId: string;
  totalDiscount: number | null;
  totalTaxAmount: number | null;
  subtotalAmount: number | null;
  lineItems: any[] | null;
  externalId: string | null;
  processingMode: 'live' | 'test';
}

interface YocoRefundRequest {
  amount?: number; // in cents, optional (full refund if not provided)
  metadata?: Record<string, any>;
}

interface YocoRefundResponse {
  id: string;
  refundId: string;
  message: string;
  status: 'succeeded' | 'pending';
}

class YocoPaymentService {
  private apiKey: string;
  private baseUrl = 'https://payments.yoco.com/api';
  private isTestMode: boolean;

  constructor() {
    this.apiKey = import.meta.env.VITE_YOCO_API_KEY || '';
    this.isTestMode = import.meta.env.VITE_YOCO_TEST_MODE === 'true';
    
    if (!this.apiKey) {
      console.warn('🚨 Yoco API key not found. Please set VITE_YOCO_API_KEY in your environment variables.');
    } else {
      console.log('✅ Yoco Payment Service initialized:', this.isTestMode ? 'TEST MODE' : 'LIVE MODE');
    }
  }

  /**
   * Create a checkout session
   */
  async createCheckout(request: YocoCheckoutRequest): Promise<YocoCheckoutResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/checkouts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Yoco API Error: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
      }

      const checkout: YocoCheckoutResponse = await response.json();
      console.log('✅ Checkout created:', checkout.id);
      return checkout;
    } catch (error) {
      console.error('❌ Error creating checkout:', error);
      throw error;
    }
  }

  /**
   * Create checkout for course subscription
   */
  async createCourseSubscription(userId: string, userEmail: string, subscriptionType: 'monthly' | 'yearly' = 'monthly'): Promise<YocoCheckoutResponse> {
    const prices = {
      monthly: 9900, // R99.00 in cents
      yearly: 99900  // R999.00 in cents (2 months free)
    };

    const currentUrl = window.location.origin;
    
    const checkoutRequest: YocoCheckoutRequest = {
      amount: prices[subscriptionType],
      currency: 'ZAR',
      successUrl: `${currentUrl}/payment/success`,
      cancelUrl: `${currentUrl}/payment/cancelled`,
      failureUrl: `${currentUrl}/payment/failed`,
      metadata: {
        userId,
        userEmail,
        subscriptionType,
        productType: 'course_subscription',
        createdAt: new Date().toISOString()
      },
      lineItems: [{
        displayName: `Persona Learn Flow - ${subscriptionType === 'monthly' ? 'Monthly' : 'Yearly'} Subscription`,
        quantity: 1,
        unitAmount: prices[subscriptionType],
        productId: `course_subscription_${subscriptionType}`,
        productType: 'subscription'
      }],
      externalId: `user_${userId}_${Date.now()}`
    };

    return this.createCheckout(checkoutRequest);
  }

  /**
   * Refund a payment
   */
  async refundPayment(checkoutId: string, refundRequest: YocoRefundRequest = {}): Promise<YocoRefundResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/checkouts/${checkoutId}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(refundRequest)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Yoco Refund Error: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
      }

      const refund: YocoRefundResponse = await response.json();
      console.log('✅ Refund processed:', refund.refundId);
      return refund;
    } catch (error) {
      console.error('❌ Error processing refund:', error);
      throw error;
    }
  }

  /**
   * Check if refund is still available (within 7 days)
   */
  isRefundAvailable(paymentDate: Date): boolean {
    const now = new Date();
    const daysDifference = Math.floor((now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDifference <= 7;
  }

  /**
   * Get remaining refund days
   */
  getRefundDaysRemaining(paymentDate: Date): number {
    const now = new Date();
    const daysDifference = Math.floor((now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, 7 - daysDifference);
  }
}

export const yocoPaymentService = new YocoPaymentService();
export type { YocoCheckoutRequest, YocoCheckoutResponse, YocoRefundRequest, YocoRefundResponse };
