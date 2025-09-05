import { ContentType, LearningStyle } from "@/types/learning";
// import { formatContent } from "@/utils/contentFormatter";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "cognitivecomputations/dolphin-mistral-24b-venice-edition:free";

interface GenerateContentParams {
  topic: string;
  field: string;
  learningStyle: LearningStyle;
}

export const generateAIContent = async ({ topic, field, learningStyle }: GenerateContentParams): Promise<string> => {
  try {
    const prompt = generatePromptForLearningStyle(topic, field, learningStyle);
    
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        "HTTP-Referer": import.meta.env.VITE_SITE_URL,
        "X-Title": import.meta.env.VITE_SITE_NAME,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: "You are an expert educational content creator, specializing in creating engaging, personalized learning materials."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate content');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
};

const generatePromptForLearningStyle = (topic: string, field: string, style: LearningStyle): string => {
  const basePrompt = `Create engaging, well-structured educational content about ${topic} in ${field}. Format the response in clean GitHub Flavored Markdown with proper headings, sections, and formatting.`;
  
  switch (style) {
    case "visual":
      return `${basePrompt}

Focus on visual learning by incorporating:
1. Diagrams or flowcharts represented using \`\`\`plaintext\`\` blocks (with ASCII art)
2. Visual metaphors and analogies with emoji icons
3. Mind maps and hierarchical structures
4. Visual cues and callouts using markdown blockquotes and lists
5. Use of markdown tables for structured information

Required sections:
- Visual Overview (with diagram)
- Key Concepts (with icons/emojis)
- Visual Examples
- Practice Visualization

Format rules:
- Use heading levels correctly (# for title, ## for sections, ### for subsections)
- Use bold and italic for emphasis
- Use > for important callouts
- Use emoji to highlight key points
- Use proper markdown lists with spacing
- Use code blocks with language specifiers for code examples
- Add horizontal dividers (---) between major sections`;
    
    case "auditory":
      return `${basePrompt}

Focus on auditory learning by incorporating:
1. Musical/rhythmic content structure using verses and choruses
2. Speaking prompts and discussion points
3. Mnemonic devices and rhythm-based memory techniques
4. Call-and-response patterns

Required sections:
- Rhythmic Overview (with a catchy intro verse)
- Key Concepts (as verses/songs)
- Speaking Exercises
- Discussion Points
Use \`\`\`plaintext\`\` blocks for verses and songs.`;
    
    case "reading":
      return `${basePrompt}

Focus on comprehensive reading by incorporating:
1. Academic-style content structure
2. Clear definitions and explanations
3. Hierarchical organization with proper headings
4. Citations and references where relevant

Required sections:
- Executive Summary
- Detailed Analysis
- Key Terms and Definitions
- Further Reading
Use proper Markdown heading levels (h1-h6) and emphasis markers.`;
    
    case "kinesthetic":
      return `${basePrompt}

Focus on hands-on learning by incorporating:
1. Interactive exercises and activities
2. Step-by-step tutorials with checkpoints
3. Practice projects and assignments
4. Real-world case studies and applications

Required sections:
- Quick Start Exercise
- Hands-on Tutorial
- Practice Projects
- Real-world Applications
Include checklists using - [ ] markdown syntax and clear step numbering.`;
    
    default:
      return basePrompt;
  }
};
