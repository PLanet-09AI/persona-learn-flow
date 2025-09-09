import { Handler } from '@netlify/functions';
import fetch from 'node-fetch';

interface AIRequest {
  prompt: string;
  model?: string;
  style?: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
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
    const { prompt, model = 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free', style } = JSON.parse(event.body || '{}') as AIRequest;

    // Validate request
    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Prompt is required' })
      };
    }

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3000',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter API Error:', error);
      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          error: 'AI Service Error',
          details: error
        })
      };
    }

    const data = await response.json();
    
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('AI Service Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};
