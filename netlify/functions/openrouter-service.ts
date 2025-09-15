import { Handler } from '@netlify/functions';
import fetch from 'node-fetch';

// Available models configuration
const MODELS = {
  qwen: 'qwen/qwen3-235b-a22b:free',
  moonshot: 'moonshotai/kimi-k2:free'
};

const handler: Handler = async (event, context) => {
  // Add CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle OPTIONS request for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { model, messages } = body;

    if (!model || !messages) {
      console.error('Invalid request: missing model or messages');
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid request: missing model or messages' })
      };
    }

    // Map user's model choice to actual model ID
    const actualModel = model.includes('qwen') ? MODELS.qwen : MODELS.moonshot;
    
    // Select appropriate API key
    const apiKey = model.includes('qwen') 
      ? process.env.OPENROUTER_QWEN_API_KEY 
      : process.env.OPENROUTER_MOONSHOT_API_KEY;

    if (!apiKey) {
      console.error('API key not found for model', { model: actualModel });
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'API key not configured',
          details: `No API key available for model: ${actualModel}`
        })
      };
    }

    // Validate API key format
    if (!apiKey.startsWith('sk-')) {
      console.error('Invalid API key format for', { model: actualModel });
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Invalid API key format',
          details: 'API key must start with sk-'
        })
      };
    }

    // Log which model and key we're using (safely)
    console.log(`Using ${actualModel} with key: sk-...${apiKey.slice(-4)}`);

    // Prepare request exactly as per OpenRouter docs
    const openRouterRequest = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://ndusai.netlify.app',
        'X-Title': 'Ndu AI Learning System',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: actualModel,
        messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    };

    // Log request details (without sensitive info)
    console.log('Making OpenRouter request:', {
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: actualModel,
      messages: messages.length,
      headers: {
        ...openRouterRequest.headers,
        'Authorization': 'Bearer sk-...' + apiKey.slice(-4)
      }
    });

    // Make request to OpenRouter
    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      openRouterRequest
    );

    const data = await response.json();
    
    // Log response info
    if (!response.ok) {
      console.error('OpenRouter API error:', {
        status: response.status,
        statusText: response.statusText,
        error: data.error
      });
      return {
        statusCode: response.status,
        headers: corsHeaders,
        body: JSON.stringify({
          error: data.error?.message || 'Unknown error',
          details: data
        })
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('OpenRouter service error:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      })
    };
  }
};

export { handler };
