import { Handler } from '@netlify/functions';
import fetch from 'node-fetch';

// Model configuration
const MODEL = "cognitivecomputations/dolphin-mistral-24b-venice-edition:free";

interface AIRequest {
  topic: string;
  field: string;
  learningStyle: string;
  userId?: string;
}

// Helper function to generate prompts based on learning style
function generatePromptForLearningStyle(topic: string, field: string, learningStyle: string): string {
  const basePrompt = `Create educational content about ${topic} in the field of ${field}.`;
  
  switch (learningStyle.toLowerCase()) {
    case 'visual':
      return `${basePrompt} Focus on visual descriptions, spatial relationships, and mental imagery. Include suggestions for diagrams, charts, and visual aids. Format the response in markdown. Start with a visual overview or mind map structure.`;
    
    case 'auditory':
      return `${basePrompt} Focus on verbal explanations, mnemonics, and sound-based learning. Include discussion points and verbal analogies. Format the response in markdown. Structure content as a dialogue or Q&A format.`;
    
    case 'reading':
      return `${basePrompt} Present information in a structured, text-based format with clear headings, definitions, and written explanations. Format the response in markdown. Use academic formatting with clear section hierarchy.`;
    
    case 'kinesthetic':
      return `${basePrompt} Emphasize hands-on learning activities, practical exercises, and real-world applications. Include step-by-step instructions and interactive elements. Format the response in markdown. Structure as a practical workshop or tutorial.`;
    
    default:
      return `${basePrompt} Present information in a balanced, comprehensive way. Format the response in markdown with clear sections and examples.`;
  }
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
    const { topic, field, learningStyle } = JSON.parse(event.body || '{}') as AIRequest;

    // Validate request
    if (!topic || !field || !learningStyle) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: topic, field, and learningStyle are required' })
      };
    }

    // Generate the prompt based on learning style
    const prompt = generatePromptForLearningStyle(topic, field, learningStyle);

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VITE_OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.VITE_SITE_URL || 'http://localhost:3000',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
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
