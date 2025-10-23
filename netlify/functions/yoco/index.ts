import { Handler } from '@netlify/functions';
import fetch from 'node-fetch';

interface CheckoutRequest {
  amount: number;
  currency?: string;
  cancelUrl: string;
  successUrl: string;
  failureUrl?: string;
  metadata?: Record<string, string>;
}

export const handler: Handler = async (event, context) => {
  console.log('🔐 Yoco checkout function called');
  console.log('Method:', event.httpMethod);
  console.log('Body:', event.body);

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { amount, currency = 'ZAR', cancelUrl, successUrl, failureUrl, metadata } = JSON.parse(event.body || '{}') as CheckoutRequest;

    console.log('Parsed request:', { amount, currency, cancelUrl, successUrl });

    // Validate request
    if (!amount || !cancelUrl || !successUrl) {
      console.error('Missing required fields');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: amount, cancelUrl, successUrl' })
      };
    }

    // Get API key from environment
    const apiKey = process.env.YOCO_SECRET_KEY;
    
    if (!apiKey) {
      console.error('🚨 YOCO_SECRET_KEY not found in environment variables');
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Internal server error',
          message: 'Payment service not configured - YOCO_SECRET_KEY missing'
        })
      };
    }

    console.log('✅ API key found:', apiKey.substring(0, 10) + '...');

    // Call Yoco API
    console.log('Calling Yoco API...');
    const response = await fetch('https://payments.yoco.com/api/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: parseInt(amount.toString()),
        currency,
        cancelUrl,
        successUrl,
        failureUrl: failureUrl || cancelUrl,
        metadata: metadata || {}
      })
    });

    console.log('Yoco response status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('Yoco API Error:', error);
      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          error: 'Payment Service Error',
          details: error
        })
      };
    }

    const checkout = await response.json();
    
    console.log('✅ Checkout created successfully:', checkout.id);
    
    return {
      statusCode: 200,
      body: JSON.stringify(checkout)
    };
  } catch (error) {
    console.error('Payment Service Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: errorMessage
      })
    };
  }
};
