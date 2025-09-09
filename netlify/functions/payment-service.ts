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
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { amount, currency = 'ZAR', cancelUrl, successUrl, failureUrl, metadata } = JSON.parse(event.body || '{}') as CheckoutRequest;

    // Validate request
    if (!amount || !cancelUrl || !successUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Call Yoco API
    const response = await fetch('https://payments.yoco.com/api/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.YOCO_SECRET_KEY}`,
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
    
    return {
      statusCode: 200,
      body: JSON.stringify(checkout)
    };
  } catch (error) {
    console.error('Payment Service Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};
