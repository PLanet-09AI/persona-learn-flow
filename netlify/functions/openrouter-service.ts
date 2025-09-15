import { Handler } from '@netlify/functions';
import fetch from 'node-fetch';

const handler: Handler = async (event, context) => {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle OPTIONS request for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
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
        headers,
        body: JSON.stringify({ error: 'Invalid request: missing model or messages' })
      };
    }

    // Get appropriate API key based on model


    let apiKey;

    // Select API key based on model
    if (model.includes('qwen')) {
      apiKey = process.env.OPENROUTER_QWEN_API_KEY;
    } else if (model.includes('moonshot')) {
      apiKey = process.env.OPENROUTER_MOONSHOT_API_KEY;
    } else {
      // For all other models (mistral, llama, phi, gemma, zephyr, dolphin, etc)
      apiKey = process.env.OPENROUTER_API_KEY;
    }

    // Debug logging to help troubleshoot key selection
    console.log('Available keys:', {
      hasDefaultKey: !!process.env.OPENROUTER_API_KEY,
      hasMoonshotKey: !!process.env.OPENROUTER_MOONSHOT_API_KEY,
      hasQwenKey: !!process.env.OPENROUTER_QWEN_API_KEY
    });

    // Fallback chain: If specific key not found, try alternatives
    if (!apiKey) {
      apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_MOONSHOT_API_KEY || process.env.OPENROUTER_QWEN_API_KEY;
    }

    if (!apiKey) {
      console.error('OpenRouter API key not found in environment', {
        model,
        availableEnvVars: Object.keys(process.env).filter(key => key.includes('OPENROUTER'))
      });
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'API key not configured',
          details: `No API key available for model: ${model}`
        })
      };
    }
    
    // Validate API key format
    if (!apiKey.startsWith('sk-')) {
      console.error('Invalid API key format', {
        model,
        keyPrefix: apiKey.substring(0, 5)
      });
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid API key format',
          details: 'API key should start with sk-'
        })
      };
    }
    
    console.log(`Using API key for model ${model}: ${apiKey.substring(0, 10)}...`);
      
    console.log('Making OpenRouter request with:', {
      model,
      messagesCount: messages.length,
      firstMessage: messages[0],
      apiKeyPrefix: apiKey.substring(0, 10) + '...',
      headers: {
        'HTTP-Referer': 'https://ndusai.netlify.app',
        'X-Title': 'Ndu AI Learning System',
        'OpenAI-Organization': 'Ndu AI Learning System',
        'User-Agent': 'Ndu AI Learning System/1.0.0'
      }
    });
      
    // Make request to OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ndusai.netlify.app',
        'X-Title': 'Ndu AI Learning System',
        'OpenAI-Organization': 'Ndu AI Learning System',
        'User-Agent': 'Ndu AI Learning System/1.0.0'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 0.9,
        stream: false
      })
    });

    console.log('OpenRouter response status:', response.status);
      
    const data = await response.json();
    console.log('OpenRouter response data:', data);

    if (!response.ok) {
      console.error('OpenRouter API error:', {
        status: response.status,
        statusText: response.statusText,
        data
      });
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: data.error?.message || 'Unknown error',
          details: data
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('OpenRouter service error:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      })
    };
  }
};

export { handler };
