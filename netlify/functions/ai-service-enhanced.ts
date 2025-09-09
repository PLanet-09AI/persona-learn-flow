import { Handler } from '@netlify/functions';
import { openRouterService } from './openrouter';
import { requestQueue } from './requestQueue';
import { formatContent } from '@/utils/contentFormatter';

// Use environment variables for configuration
const MODEL = process.env.VITE_DEFAULT_MODEL || "cognitivecomputations/dolphin-mistral-24b-venice-edition:free";

// Queue configuration
const QUEUE_DELAY = 1000; // 1 second between requests
const MAX_RETRIES = 3;

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { topic, field, learningStyle, userId } = JSON.parse(event.body || '{}');
    
    // Validate input
    if (!topic || !field || !learningStyle) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    const prompt = generatePromptForLearningStyle(topic, field, learningStyle);

    // Add request to queue
    const queueStats = requestQueue.getStats();
    if (queueStats.queueLength > 0) {
      console.log(`📋 Request queued. ${queueStats.queueLength} requests ahead.`);
    }

    // Make API request with retries
    let attempt = 0;
    let lastError = null;

    while (attempt < MAX_RETRIES) {
      try {
        const response = await openRouterService.chat({
          model: MODEL,
          messages: [{ role: 'user', content: prompt }]
        });

        const content = formatContent(response);

        // Track response if userId provided
        if (userId) {
          await responseTracker.trackResponse(userId, { topic, field, learningStyle });
        }

        return {
          statusCode: 200,
          body: JSON.stringify({ content })
        };
      } catch (error) {
        lastError = error;
        attempt++;
        if (attempt < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, QUEUE_DELAY));
        }
      }
    }

    throw lastError;
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

// Helper function to generate prompts based on learning style
function generatePromptForLearningStyle(topic: string, field: string, learningStyle: string): string {
  const basePrompt = `Create educational content about ${topic} in the field of ${field}.`;
  
  switch (learningStyle.toLowerCase()) {
    case 'visual':
      return `${basePrompt} Focus on visual descriptions, spatial relationships, and mental imagery. Include suggestions for diagrams, charts, and visual aids.`;
    
    case 'auditory':
      return `${basePrompt} Focus on verbal explanations, mnemonics, and sound-based learning. Include discussion points and verbal analogies.`;
    
    case 'reading':
      return `${basePrompt} Present information in a structured, text-based format with clear headings, definitions, and written explanations.`;
    
    case 'kinesthetic':
      return `${basePrompt} Emphasize hands-on learning activities, practical exercises, and real-world applications.`;
    
    default:
      return `${basePrompt} Present information in a balanced, comprehensive way.`;
  }
}
