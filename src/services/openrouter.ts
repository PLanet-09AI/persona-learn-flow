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
  private apiKey: string;
  private siteUrl: string;
  private siteName: string;
  private baseUrl: string = '/.netlify/functions/openrouter-service';
  private model: string = 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free';
  private fallbackModels: string[] = [
    'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
    'qwen/qwen3-14b:free',
    'meta-llama/llama-3.1-8b-instruct:free',
    'microsoft/phi-3-medium-128k-instruct:free',
    'google/gemma-7b-it:free',
    'mistralai/mistral-7b-instruct:free'
  ];

  constructor() {
    // Using primary OpenRouter API key
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
    this.siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
    this.siteName = import.meta.env.VITE_SITE_NAME || 'Ndu AI Learning System';
    
    // Check if API key is available
    if (!this.apiKey) {
      console.warn('🚨 OpenRouter API key not found. Please set VITE_OPENROUTER_API_KEY in your environment variables.');
    } else {
      console.log('✅ OpenRouter API key found:', this.apiKey.substring(0, 10) + '...');
    }
    
    // Log initialization
    console.log(`🚀 Initialized OpenRouter Service with model: ${this.model}`);
  }

  /**
   * Make API request with error handling
   */
  private async makeRequest(model: string, messages: Message[]): Promise<string> {
    console.log('Making request with model:', model);
    console.log('First message:', messages[0]);

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenRouter API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      
      // Handle specific error types
      if (response.status === 429) {
        throw new Error(`429: Rate limit exceeded. ${errorData.error?.message || 'Please wait before making another request.'}`);
      }
      
      throw new Error(`API error: ${response.status} - ${errorData.error || errorData.details || 'Unknown error'}`);
    }

    const data: ChatCompletionResponse = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from AI service');
    }
    
    const content = data.choices[0].message.content || '';
    
    // Don't return empty content - throw error instead
    if (!content || content.trim().length === 0) {
      throw new Error('Empty response from AI model');
    }
    
    console.log('✅ Received content:', content.substring(0, 100) + '...');
    return content;
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
   * Simple test method to check if the service is working
   */
  async testConnection(): Promise<string> {
    try {
      console.log('🧪 Testing OpenRouter connection...');
      return await this.askAboutContent('What is 2+2?', '', this.model, 'You are a helpful assistant. Answer briefly.');
    } catch (error) {
      console.error('❌ OpenRouter test failed:', error);
      return `Test failed: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  /**
   * Get comprehensive markdown formatting system prompt
   */
  private getMarkdownSystemPrompt(): string {
    return `You are an expert educational content creator and technical writer specializing in creating perfectly formatted Markdown content.

**CRITICAL FORMATTING REQUIREMENTS - MUST FOLLOW ALL:**

## ✅ Diagram Formatting
- ALWAYS wrap ASCII diagrams, flowcharts, or code examples in triple backticks (\`\`\`)
- Use language tags like \`\`\`plaintext\`\`, \`\`\`javascript\`\`, etc.
- Never leave code or diagrams as plain text

## 📝 Markdown Structure
- Use # for main title, ## for major sections, ### for subsections, #### for details
- NEVER use HTML tags like <span>, <div>, or custom classes
- Use **bold** and *italic* markdown syntax, not HTML

## 📋 List Formatting
- Use - or * for bullet points (NEVER plain text with dashes)
- Use numbered lists (1. 2. 3.) for sequences and processes
- Proper indentation for nested lists

## 🎯 Content Enhancement
- Place emojis directly in markdown text (✅ ❌ 🚀 📊 💡)
- Use > blockquotes for important notes, callouts, or quotes
- Use \`inline code\` for technical terms and keywords
- Create tables using | markdown syntax when comparing concepts

## 📖 Section Completeness
- NEVER leave a heading without content
- Every ## or ### heading must have explanatory content
- Complete all sections fully - no partial responses

## 🎨 Visual Appeal
- Use horizontal rules (---) to separate major sections when appropriate
- Include relevant emojis in headings for visual appeal
- Make content scannable with proper spacing and hierarchy

**Remember: Your goal is to create beautifully formatted, professional-looking educational content that renders perfectly in any markdown viewer.**`;
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
    if (!this.apiKey) {
      return "API key not configured. Please contact the administrator.";
    }

    // Create cache key based on inputs
    const contextHash = contextContent ? cacheService.hashString(contextContent) : undefined;
    const fullPrompt = `${customSystemPrompt || 'Default prompt'}|${question}`;
    
    // Check cache first
    const cachedResponse = cacheService.get(fullPrompt, model, contextHash);
    if (cachedResponse) {
      console.log('🎯 Using cached response');
      return cachedResponse;
    }

    // For debugging - bypass queue temporarily
    console.log('🔄 Making direct request (bypassing queue)...');
    try {
      // Trim context if it's too long
      const trimmedContext = contextContent.length > 12000 
        ? contextContent.substring(0, 6000) + "\n...\n" + contextContent.substring(contextContent.length - 6000) 
        : contextContent;

        const systemMessage = customSystemPrompt || `${this.getMarkdownSystemPrompt()}

You are an AI learning assistant for the Ndu AI Learning System. 
Your goal is to help students understand their learning materials better.
When answering questions, be educational, informative, and encouraging.
Base your answers on the provided learning content context.
If you don't know the answer or it's not in the provided context, say so honestly.

ALWAYS format your responses using perfect Markdown following the formatting requirements above.`;

        const messages: Message[] = [
          { role: 'system', content: systemMessage },
          { 
            role: 'user', 
            content: `Here is the learning content:\n\n${trimmedContext}\n\nUser question: ${question}`
          }
        ];

        const response = await this.tryWithFallbacks(messages, model);
        
        // Only cache non-empty, valid responses
        if (response && response.trim().length > 0 && !response.includes("Sorry, I couldn't process")) {
          cacheService.set(fullPrompt, model, response, contextHash);
          console.log('✅ Response cached successfully');
        } else {
          console.log('⚠️ Response not cached - empty or error response');
        }
        
        return response;
        
      } catch (error) {
        console.error('Error generating content:', error);
        return `Sorry, I couldn't process your question: ${error instanceof Error ? error.message : String(error)}`;
      }
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
