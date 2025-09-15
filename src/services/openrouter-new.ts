// OpenRouter API service with caching and queuing
import { responseTracker } from "./responseTracker";
import { cacheService } from "./cache";
import { requestQueue } from "./requestQueue";

// Define types for the API
interface Message {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  top_p?: number;
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: Message;
    finish_reason: string;
    delta?: { content?: string; }; // For streaming responses
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterService {
  private baseUrl: string = '/.netlify/functions/openrouter-service';
  private model: string = 'qwen/qwen3-14b:free';
  private fallbackModels: string[] = [
    'qwen/qwen3-14b:free',
    'meta-llama/llama-3.1-8b-instruct:free',
    'microsoft/phi-3-medium-128k-instruct:free',
    'google/gemma-7b-it:free',
    'mistralai/mistral-7b-instruct:free',
    'huggingfaceh4/zephyr-7b-beta:free'
  ];

  constructor() {
    console.log(`✅ Using OpenRouter service via Netlify function for model ${this.model}`);
  }

  /**
   * Make API request with error handling
   */
  private async makeRequest(model: string, messages: Message[]): Promise<string> {
    const requestBody: ChatCompletionRequest = {
      model: model,
      messages: messages,
      temperature: model.includes('gpt-4') ? 0.7 : 0.9,
      max_tokens: 1000,
      top_p: 0.9
    };

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenRouter API Error:', errorData);
      
      // Handle specific error types
      if (response.status === 429) {
        throw new Error(`429: Rate limit exceeded. ${errorData.error?.message || 'Please wait before making another request.'}`);
      }
      
      throw new Error(`API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data: ChatCompletionResponse = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from AI service');
    }
    
    return data.choices[0].message.content || '';
  }

  /**
   * Try multiple models if rate limited
   */
  private async tryWithFallbacks(
    messages: Message[],
    requestedModel: string = this.model
  ): Promise<string> {
    const modelsToTry = [requestedModel, ...this.fallbackModels];
    let lastError: Error;

    for (const model of modelsToTry) {
      try {
        console.log(`🤖 Attempting request with model: ${model}`);
        return await this.makeRequest(model, messages);
      } catch (error) {
        lastError = error as Error;
        
        // If it's a rate limit error, try the next model
        if (error instanceof Error && error.message.includes('429')) {
          console.log(`⚠️ Model ${model} rate limited, trying next fallback...`);
          continue;
        }
        
        // If it's not a rate limit error, don't try fallbacks
        throw error;
      }
    }
    
    // If all models failed, throw the last error
    throw new Error(`All models failed. Last error: ${lastError!.message}`);
  }

  /**
   * Ask a question about learning content using the Qwen3 model
   */
  async askAboutContent(
    question: string, 
    contextContent: string, 
    model: string = this.model, 
    customSystemPrompt?: string
  ): Promise<string> {
    // No need to check API key since we're using the Netlify function

    // Create cache key based on inputs
    const contextHash = contextContent ? cacheService.hashString(contextContent) : undefined;
    const fullPrompt = `${customSystemPrompt || 'Default prompt'}|${question}`;
    
    // Check cache first
    const cachedResponse = cacheService.get(fullPrompt, model, contextHash);
    if (cachedResponse) {
      console.log('🎯 Using cached response');
      return cachedResponse;
    }

    // Queue the request to avoid rate limits
    return await requestQueue.enqueue(async () => {
      try {
        // Trim context if it's too long
        const trimmedContext = contextContent.length > 12000 
          ? contextContent.substring(0, 6000) + "\n...\n" + contextContent.substring(contextContent.length - 6000) 
          : contextContent;

        const systemMessage = customSystemPrompt || `You are an AI learning assistant for the Ndu AI Learning System. 
        Your goal is to help students understand their learning materials better.
        When answering questions, be educational, informative, and encouraging.
        Base your answers on the provided learning content context.
        If you don't know the answer or it's not in the provided context, say so honestly.`;

        const messages: Message[] = [
          { role: 'system', content: systemMessage },
          { 
            role: 'user', 
            content: `Here is the learning content:\n\n${trimmedContext}\n\nUser question: ${question}`
          }
        ];

        const response = await this.tryWithFallbacks(messages, model);
        
        // Cache the response
        cacheService.set(fullPrompt, model, response, contextHash);
        
        return response;
        
      } catch (error) {
        console.error('Error generating content:', error);
        return `Sorry, I couldn't process your question: ${error instanceof Error ? error.message : String(error)}`;
      }
    }, 3, `ask_${Date.now()}`);
  }

  /**
   * Stream a response from the AI model (simplified - returns full response for now)
   */
  async streamResponse(
    question: string, 
    contextContent: string, 
    model: string = this.model,
    customSystemPrompt?: string,
    onChunk?: (chunk: string) => void,
    signal?: AbortSignal,
    userId?: string
  ): Promise<string> {
    // For now, just use the regular askAboutContent method
    // In the future, we can implement proper streaming
    const response = await this.askAboutContent(question, contextContent, model, customSystemPrompt);
    
    // Simulate streaming if callback provided
    if (onChunk && response) {
      const words = response.split(' ');
      for (let i = 0; i < words.length; i += 3) {
        const chunk = words.slice(i, i + 3).join(' ') + ' ';
        onChunk(chunk);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    return response;
  }
}

export const openRouterService = new OpenRouterService();
