import { ContentType, LearningStyle } from "@/types/learning";
import { responseTracker } from "./responseTracker";
import { openRouterService } from "./openrouter";
import { requestQueue } from "./requestQueue";
// import { formatContent } from "@/utils/contentFormatter";

// Use the primary model for content generation
const MODEL = "cognitivecomputations/dolphin-mistral-24b-venice-edition:free";

interface GenerateContentParams {
  topic: string;
  field: string;
  learningStyle: LearningStyle;
  userId?: string; // Add userId for tracking
}

export const generateAIContent = async ({ topic, field, learningStyle, userId }: GenerateContentParams): Promise<string> => {
  const startTime = Date.now();
  
  try {
    const prompt = generatePromptForLearningStyle(topic, field, learningStyle);
    
    // Show queue status to user
    const queueStats = requestQueue.getStats();
    if (queueStats.queueLength > 0) {
      const waitTime = requestQueue.getEstimatedWaitTime();
      console.log(`📋 Request queued. ${queueStats.queueLength} requests ahead. Estimated wait: ${waitTime}s`);
    }
    
    // Use OpenRouter service with rate limiting, queuing, and caching
    const content = await openRouterService.askAboutContent(
      prompt,
      "", // No additional context needed for initial content generation
      MODEL,
      "You are an expert educational content creator, specializing in creating engaging, personalized learning materials."
    );

    console.log('AI Service - Received content:', content ? content.substring(0, 100) + '...' : 'No content');

    if (!content || content.trim().length === 0) {
      throw new Error('No content received from AI service');
    }

    if (content.includes("Sorry, I couldn't process")) {
      throw new Error(`AI service error: ${content}`);
    }

    if (content.includes("API key not configured")) {
      throw new Error('API key not configured. Please contact the administrator.');
    }
    
    const processingTime = Date.now() - startTime;
    
    // Save the response to the tracker if userId is provided
    if (userId) {
      try {
        await responseTracker.saveContentGeneration(
          userId,
          MODEL,
          prompt,
          content,
          topic,
          field,
          {
            processingTime,
            learningStyle,
            tokenCount: content.length, // Approximate token count
          }
        );
      } catch (trackingError) {
        console.warn('Failed to save response to tracker:', trackingError);
        // Don't throw - we still want to return the content even if tracking fails
      }
    }
    
    return content;
  } catch (error) {
    console.error('Error generating content:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    throw error;
  }
};

// Export a test function for debugging
export const testOpenRouterConnection = async (): Promise<void> => {
  try {
    console.log('🧪 Testing OpenRouter connection...');
    const result = await openRouterService.testConnection();
    console.log('✅ Test result:', result);
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Make test function available globally for browser console
if (typeof window !== 'undefined') {
  (window as any).testOpenRouterConnection = testOpenRouterConnection;
  (window as any).clearCache = () => {
    const { cacheService } = require('./cache');
    cacheService.clear();
    console.log('🧹 Cache cleared from browser console');
  };
}

const generatePromptForLearningStyle = (topic: string, field: string, style: LearningStyle): string => {
  const basePrompt = `Create comprehensive, engaging educational content about **${topic}** in **${field}**. 

# 📝 CRITICAL FORMATTING REQUIREMENTS (MUST FOLLOW ALL):

## ✅ Diagram Formatting
- ALWAYS wrap diagrams, flowcharts, code examples in triple backticks (\`\`\`)
- Use proper language tags: \`\`\`plaintext\`\`, \`\`\`javascript\`\`, etc.
- Never leave diagrams as plain text

## 📋 Proper Markdown Lists  
- Use - or * for bullet points (NOT plain text with dashes)
- Use 1. 2. 3. for numbered sequences
- Proper indentation for nested items

## 🎯 Content Structure
- Use # for main title, ## for sections, ### for subsections
- Place emojis directly in markdown (not HTML tags)
- Use **bold** for key terms, \`code\` for technical terms
- Use > blockquotes for important notes and callouts

## 📖 Section Completeness
- NEVER leave a heading without content
- Complete every section fully - no partial responses
- Include practical examples and real-world applications

## 🎨 Visual Appeal
- Include relevant emojis in headings and key points
- Use horizontal rules (---) to separate major sections
- Make content scannable with proper hierarchy

**Your response must be beautifully formatted, professional educational content that renders perfectly in any markdown viewer.**`;
  
  switch (style) {
    case "visual":
      return `${basePrompt}

## 🎨 Visual Learning Focus:
1. **Diagrams & Flowcharts**: Create ASCII diagrams in \`\`\`plaintext\`\` blocks
2. **Visual Metaphors**: Use emoji icons and analogies throughout
3. **Mind Maps**: Show hierarchical structures using markdown lists
4. **Visual Cues**: Use blockquotes (>) for key insights and callouts
5. **Structured Tables**: Compare concepts using markdown tables

### Required Sections:
- ## 📊 Visual Overview (with ASCII diagram)
- ## 🔍 Key Concepts (with icons and visual metaphors) 
- ## 🗺️ Process Flow (step-by-step with diagrams)
- ## 📈 Examples & Case Studies
- ## 🎯 Practice Activities

Use abundant emojis, diagrams, and visual elements throughout.`;
    
    case "auditory":
      return `${basePrompt}

## 🎵 Auditory Learning Focus:
1. **Musical Structure**: Use verses and choruses in \`\`\`plaintext\`\` blocks
2. **Speaking Prompts**: Include discussion points and verbal exercises  
3. **Memory Techniques**: Create mnemonic devices and rhythmic patterns
4. **Interactive Elements**: Call-and-response patterns throughout

### Required Sections:
- ## 🎶 Rhythmic Overview (with catchy intro verse)
- ## 📢 Key Concepts (as memorable verses/songs)
- ## 🗣️ Speaking Exercises & Practice
- ## 💬 Discussion Points & Questions

Use \`\`\`plaintext\`\` blocks for all verses, songs, and spoken content.`;
    
    case "reading":
      return `${basePrompt}

## 📚 Reading/Writing Learning Focus:
1. **Academic Structure**: Clear, comprehensive text organization
2. **Detailed Explanations**: In-depth analysis with proper citations
3. **Hierarchical Content**: Logical flow with proper heading levels
4. **Reference Materials**: Include sources and further reading

### Required Sections:
- ## 📄 Executive Summary
- ## 🔍 Detailed Analysis & Explanations  
- ## 📖 Key Terms & Definitions
- ## 📚 Further Reading & References

Use proper markdown emphasis, citations, and academic formatting.`;
    
    case "kinesthetic":
      return `${basePrompt}

## 🤲 Kinesthetic Learning Focus:
1. **Interactive Exercises**: Hands-on activities with clear instructions
2. **Step-by-Step Tutorials**: Detailed procedures with checkpoints  
3. **Practice Projects**: Real assignments and practical applications
4. **Case Studies**: Concrete examples and real-world scenarios

### Required Sections:
- ## ⚡ Quick Start Exercise (immediate hands-on activity)
- ## 🛠️ Hands-on Tutorial (step-by-step with checkboxes)
- ## 🎯 Practice Projects & Assignments
- ## 🌍 Real-world Applications & Case Studies

Use checklists with - [ ] syntax, numbered steps, and clear action items.`;
    
    default:
      return basePrompt;
  }
};
