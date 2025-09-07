import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from parent directory
dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082', 'http://localhost:8083', 'http://localhost:8084'],
  credentials: true
}));
app.use(express.json());

// Yoco configuration
const YOCO_SECRET_KEY = process.env.VITE_YOCO_SECRET_KEY;
const YOCO_BASE_URL = 'https://online.yoco.com/v1';

if (!YOCO_SECRET_KEY) {
  console.warn('⚠️ VITE_YOCO_SECRET_KEY not found in environment variables');
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    yocoConfigured: !!YOCO_SECRET_KEY 
  });
});

// Create Yoco checkout endpoint
app.post('/api/yoco/checkout', async (req, res) => {
  try {
    if (!YOCO_SECRET_KEY) {
      return res.status(500).json({ 
        error: 'Yoco secret key not configured',
        message: 'Please add VITE_YOCO_SECRET_KEY to your .env file'
      });
    }

    const { amount, currency, cancelUrl, successUrl, failureUrl, metadata } = req.body;

    console.log('🔐 Creating Yoco checkout via backend API...', {
      amount: parseInt(amount),
      currency: currency || 'ZAR',
      metadata: metadata ? Object.keys(metadata) : []
    });

    // Call Yoco API from backend (no CORS issues here)
    const response = await fetch(`${YOCO_BASE_URL}/checkouts/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${YOCO_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: parseInt(amount),
        currency: currency || 'ZAR',
        cancelUrl,
        successUrl,
        failureUrl: failureUrl || cancelUrl,
        metadata: metadata || {}
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Yoco API Error:', response.status, errorData);
      
      return res.status(response.status).json({
        error: 'Yoco API Error',
        message: errorData,
        status: response.status
      });
    }

    const checkout = await response.json();
    console.log('✅ Checkout created successfully:', checkout.id);

    res.json(checkout);

  } catch (error) {
    console.error('❌ Backend checkout error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Process refund endpoint
app.post('/api/yoco/refund/:paymentId', async (req, res) => {
  try {
    if (!YOCO_SECRET_KEY) {
      return res.status(500).json({ 
        error: 'Yoco secret key not configured',
        message: 'Please add VITE_YOCO_SECRET_KEY to your .env file'
      });
    }

    const { paymentId } = req.params;
    const { amount, reason, metadata } = req.body;

    console.log(`🔄 Processing refund for payment ${paymentId}...`);

    const response = await fetch(`${YOCO_BASE_URL}/charges/${paymentId}/refunds/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${YOCO_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: parseInt(amount),
        reason: reason || 'Refund requested',
        metadata: metadata || {}
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Yoco Refund API Error:', response.status, errorText);
      
      return res.status(response.status).json({
        error: 'Yoco Refund API Error',
        message: errorText,
        status: response.status
      });
    }

    const refund = await response.json();
    console.log('✅ Refund processed successfully:', refund.id);

    res.json(refund);

  } catch (error) {
    console.error('❌ Backend refund error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get Yoco configuration info
app.get('/api/yoco/config', (req, res) => {
  const publicKey = process.env.VITE_YOCO_PUBLIC_KEY;
  const secretKey = process.env.VITE_YOCO_SECRET_KEY;
  const mode = process.env.VITE_YOCO_MODE || 'test';

  res.json({
    hasPublicKey: !!publicKey,
    hasSecretKey: !!secretKey,
    mode: mode,
    publicKeyPreview: publicKey ? `${publicKey.substring(0, 12)}...${publicKey.slice(-4)}` : null,
    secretKeyPreview: secretKey ? `${secretKey.substring(0, 12)}...${secretKey.slice(-4)}` : null
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Persona Learn Flow API Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Yoco config: http://localhost:${PORT}/api/yoco/config`);
});

export default app;
