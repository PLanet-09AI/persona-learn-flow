import fetch from 'node-fetch';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface OpenRouterRequest {
  model: string;
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
}

export const openRouterRequest = async (request: OpenRouterRequest) => {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VITE_OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.VITE_SITE_URL || 'http://localhost:3000',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API Error: ${error}`);
  }

  return response.json();
};
