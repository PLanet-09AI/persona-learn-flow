import { ContentType, LearningStyle } from "@/types/learning";
import { responseTracker } from "./responseTracker";
import { openRouterService } from "./openrouter";
import { requestQueue } from "./requestQueue";
import { formatContent } from "@/utils/contentFormatter";

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
    
    // Format the content before returning
    const formattedContent = formatContent(content, learningStyle);
    return formattedContent;
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
  (window as any).testContentFormatting = (content: string, style: string = 'visual') => {
    const formattedContent = formatContent(content, style as LearningStyle);
    console.log('📝 Original:', content);
    console.log('✨ Formatted:', formattedContent);
    return formattedContent;
  };
  (window as any).testTextToSpeech = (content: string) => {
    const { cleanMarkdownForSpeech } = require('../utils/cleanMarkdown');
    const cleanText = cleanMarkdownForSpeech(content);
    console.log('🔊 Original markdown:', content);
    console.log('🗣️ Clean for speech:', cleanText);
    return cleanText;
  };
  (window as any).showLearningStyleFramework = () => {
    console.log(`
🎨 VISUAL LEARNER FRAMEWORK:
- Rich ASCII diagrams and flowcharts
- Color-coded organization with emoji anchors
- Spatial layouts and visual metaphors
- Infographic-style presentation

🎵 AUDITORY LEARNER FRAMEWORK:  
- Rhythmic structure and verbal flow
- Mnemonics, acronyms, and memorable phrases
- Discussion prompts and call-and-response
- Storytelling and narrative elements

📚 READING/WRITING LEARNER FRAMEWORK:
- Academic structure and formal organization
- Comprehensive coverage with detailed analysis
- Reference integration and citation examples
- Note-taking templates and written exercises

🤲 KINESTHETIC LEARNER FRAMEWORK:
- Immediate hands-on activities
- Step-by-step tutorials with checkboxes
- Interactive checkpoints and progress markers
- Real-world applications and project-based learning
    `);
  };
  (window as any).testMarkdownRendering = (content: string = "# Test Header\n## Sub Header\n**Bold text**\n- List item 1\n- List item 2") => {
    console.log('🧪 Testing markdown content:');
    console.log('Raw:', content);
    console.log('Should render headers without # symbols when processed by ReactMarkdown');
    return content;
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

## 🎨 Visual Learning Framework:
Create content specifically designed for VISUAL LEARNERS who think in pictures and spatial relationships.

### 🔧 Visual Design Requirements:
1. **Rich ASCII Diagrams**: Create detailed flowcharts, mind maps, and concept trees in \`\`\`plaintext\`\` blocks
2. **Color-Coded Organization**: Use emojis as visual anchors (🔴 for critical, 🟡 for caution, 🟢 for success)
3. **Spatial Layouts**: Use tables and columns to show relationships and comparisons
4. **Visual Metaphors**: Connect abstract concepts to concrete visual analogies
5. **Infographic Style**: Present information in scannable, visual chunks

### 📋 Required Visual Structure:
- ## 📊 **Visual Overview** (comprehensive diagram showing the entire topic landscape)
- ## 🎯 **Core Concepts** (each concept with its own visual element/icon)
- ## 🗺️ **Process Flow** (step-by-step flowchart with decision points)
- ## � **Deep Dive Analysis** (detailed visual breakdowns with examples)
- ## 📈 **Comparative Analysis** (tables, charts, before/after scenarios)
- ## 🎪 **Visual Practice** (exercises involving drawing, mapping, diagramming)

### 🎨 Visual Enhancement Techniques:
- Use **hierarchical indentation** to show relationships
- Create **visual patterns** with consistent emoji usage
- Include **spatial diagrams** showing how concepts connect
- Use **> blockquotes** for key insights with visual markers
- Design **comparison tables** with clear visual distinctions

**Make every concept visualizable and spatially organized!**`;
    
    case "auditory":
      return `${basePrompt}

## 🎵 Auditory Learning Framework:
Create content specifically designed for AUDITORY LEARNERS who process information through sound and verbal communication.

### 🔧 Auditory Design Requirements:
1. **Rhythmic Structure**: Organize content with musical patterns and verbal flow
2. **Mnemonics & Acronyms**: Create memorable verbal devices for key concepts
3. **Discussion Prompts**: Include questions that encourage verbal processing
4. **Call-and-Response**: Use interactive verbal patterns throughout
5. **Storytelling Elements**: Present information through narrative and dialogue

### 📋 Required Auditory Structure:
- ## 🎶 **Opening Verse** (catchy introduction that sets the rhythm)
- ## 📢 **Core Concepts Chorus** (main ideas presented as memorable phrases)
- ## 🗣️ **Verbal Exploration** (detailed explanations with speaking prompts)
- ## 💭 **Discussion Bridge** (questions and conversation starters)
- ## 🎤 **Practice Sessions** (verbal exercises and repetition activities)
- ## 🎵 **Closing Refrain** (summary in memorable, repeatable format)

### 🎵 Auditory Enhancement Techniques:
- Include **verbal mnemonics** for complex concepts
- Create **rhythmic patterns** in explanations
- Add **"Say it out loud"** prompts throughout
- Use **alliteration and rhyme** where appropriate
- Include **listening exercises** and **discussion questions**
- Format **key phrases for repetition** in \`\`\`plaintext\`\` blocks

**Make every concept speakable, memorable, and discussion-worthy!**`;
    
    case "reading":
      return `${basePrompt}

## 📚 Reading/Writing Learning Framework:
Create content specifically designed for READING/WRITING LEARNERS who excel through detailed text analysis and written expression.

### 🔧 Reading/Writing Design Requirements:
1. **Academic Structure**: Use formal, scholarly organization with clear hierarchies
2. **Comprehensive Coverage**: Provide in-depth explanations with supporting details
3. **Reference Integration**: Include citations, sources, and further reading suggestions
4. **Written Exercises**: Create note-taking templates and writing assignments
5. **Analytical Framework**: Present logical arguments with evidence and reasoning

### 📋 Required Reading/Writing Structure:
- ## 📄 **Executive Summary** (comprehensive overview with key points)
- ## 🔍 **Literature Review** (background information and context)
- ## 📖 **Detailed Analysis** (thorough examination of core concepts)
- ## � **Key Terms & Definitions** (glossary with precise explanations)
- ## � **Written Exercises** (note-taking guides, essay prompts, summaries)
- ## �📚 **Bibliography & Further Reading** (curated resource list)

### 📚 Reading/Writing Enhancement Techniques:
- Use **formal academic language** with precise terminology
- Include **numbered outlines** and **bullet point summaries**
- Provide **definition boxes** using blockquotes
- Create **note-taking templates** and **study guides**
- Add **reflection questions** for written responses
- Include **citation examples** and **reference formats**

**Make every concept thoroughly documented and academically rigorous!**`;
    
    case "kinesthetic":
      return `${basePrompt}

## 🤲 Kinesthetic Learning Framework:
Create content specifically designed for KINESTHETIC LEARNERS who understand through hands-on experience and physical engagement.

### 🔧 Kinesthetic Design Requirements:
1. **Immediate Action**: Start with a hands-on activity to engage learners right away
2. **Step-by-Step Tutorials**: Break down concepts into actionable, sequential tasks
3. **Interactive Checkpoints**: Include progress markers and completion confirmations
4. **Real-World Applications**: Connect every concept to practical, implementable actions
5. **Project-Based Learning**: Provide concrete assignments and building exercises

### 📋 Required Kinesthetic Structure:
- ## ⚡ **Quick Start Challenge** (immediate hands-on activity to build engagement)
- ## 🛠️ **Building Blocks** (fundamental concepts presented as constructible elements)
- ## 👷 **Step-by-Step Workshop** (detailed tutorial with checkboxes and milestones)
- ## 🎯 **Practice Projects** (real assignments with deliverable outcomes)
- ## 🌍 **Real-World Applications** (case studies showing practical implementation)
- ## 🏆 **Mastery Challenges** (advanced projects to demonstrate competency)

### 🤲 Kinesthetic Enhancement Techniques:
- Use **checkbox lists** (- [ ]) for all actionable items
- Include **timing estimates** for each activity
- Provide **materials lists** and **preparation steps**
- Create **progress milestones** with celebration points
- Add **troubleshooting guides** for common implementation issues
- Include **peer collaboration** and **group project** options

**Make every concept actionable, buildable, and immediately applicable!**`;
    
    default:
      return basePrompt;
  }
};
