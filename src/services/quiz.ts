import { Question, LearningStyle } from "@/types/learning";
import { openRouterService } from "./openrouter";

const getLearningStyleGuidelines = (style: LearningStyle): string => {
  switch (style) {
    case "visual":
      return `- Include questions about visual relationships and patterns
- Reference diagrams, charts, and visual elements from the content
- Ask about spatial relationships and visual organization
- Include questions about color, layout, and visual hierarchy
- Test understanding of visual metaphors and analogies`;
    
    case "auditory":
      return `- Focus on concepts explained through verbal patterns
- Include questions about spoken explanations and discussions
- Test understanding of rhythm and sound-based learning
- Reference audio cues and verbal instructions
- Include questions about verbal communication and explanation`;
    
    case "reading":
      return `- Focus on written comprehension and analysis
- Test understanding of detailed text passages
- Include questions about written definitions and explanations
- Ask about text structure and organization
- Test ability to extract key information from text`;
    
    case "kinesthetic":
      return `- Focus on practical application scenarios
- Include questions about hands-on exercises
- Test understanding through real-world examples
- Ask about physical processes and procedures
- Include questions about practical implementation`;
  }
};
const MODEL = "cognitivecomputations/dolphin-mistral-24b-venice-edition:free";

export const generateQuiz = async (content: string, learningStyle: string, field: string): Promise<Question[]> => {
  try {
    console.log('🎯 Generating quiz with learning style:', learningStyle, 'for field:', field);
    
    // Create the prompt for quiz generation
    const prompt = generateQuizPrompt(content, learningStyle as LearningStyle, field);
    
    // Check if API key is available
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('🚨 OpenRouter API key not configured. Please set VITE_OPENROUTER_API_KEY in environment variables.');
    }
    
    console.log('✅ API Key found:', apiKey.substring(0, 10) + '...');
    
    // Use the OpenRouter service to generate the quiz
    const messageContent = await openRouterService.askAboutContent(
      prompt,
      content,
      MODEL,
      "You are an expert at creating educational assessments. Generate quiz questions that test understanding while matching the user's learning style. Return ONLY valid JSON without markdown code fences."
    );
    
    console.group('%c📝 AI Quiz Generation', 'color: #3b82f6; font-size: 14px; font-weight: bold;');
    console.log('%c📜 Raw Content:', 'font-weight: bold; color: #6366f1;', messageContent);
    
    try {
      // Clean the message content by removing code fence markers if present
      let cleanedContent = messageContent;
      
      // Remove markdown code fence markers if they exist
      if (messageContent.trim().startsWith('```')) {
        // Extract content between code fences
        const match = messageContent.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (match && match[1]) {
          cleanedContent = match[1].trim();
        }
      }
      
      console.log('%c🧩 Cleaned Content:', 'font-weight: bold; color: #8b5cf6;', cleanedContent);
      const questionsData = JSON.parse(cleanedContent);
      console.log('%c🧩 Parsed Questions:', 'font-weight: bold; color: #f59e0b;', questionsData);
      
      // Validate and format questions
      const questions = questionsData.map((q: any) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      }));
      
      console.log('%c✅ Final Questions:', 'font-weight: bold; color: #059669;', questions);
      console.groupEnd();
      
      return questions;
    } catch (error) {
      console.error('%c❌ JSON Parse Error:', 'font-weight: bold; color: #ef4444;', error);
      console.log('%c📄 Content that failed to parse:', 'color: #ef4444;', messageContent);
      console.groupEnd();
      throw new Error('Failed to parse AI response into valid quiz questions');
    }
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
  }
};

const generateQuizPrompt = (content: string, learningStyle: LearningStyle, field: string): string => {
  const prompt = [
    '=== QUIZ GENERATION TASK ===\n',
    'Your task: Create 5 multiple-choice questions based on the provided content and parameters.\n',
    
    '=== CONTENT TO ASSESS ===',
    `${content}\n`,
    
    '=== LEARNING STYLE ADAPTATION ===',
    `Learning Style: ${learningStyle}`,
    `Guidelines:\n${getLearningStyleGuidelines(learningStyle)}\n`,
    
    '=== FIELD CONTEXT ===',
    `Field/Subject: ${field}`,
    '- Use field-specific terminology and concepts',
    '- Include practical applications relevant to the field',
    '- Ensure explanations reference field principles',
    '- Challenge students at an appropriate level for this field\n',
    
    '=== REQUIRED RESPONSE FORMAT ===',
    'Return ONLY a valid JSON array with NO additional text, markdown code fences, or explanations.\n',
    
    'Structure: Each question object MUST have exactly these properties:',
    '{',
    '  "id": "1",           // Question number as string (1-5)',
    '  "question": "string", // The question text',
    '  "options": ["string", "string", "string", "string"], // 4 options exactly',
    '  "correctAnswer": 0,   // Index of correct option (0-3)',
    '  "explanation": "string" // Why this answer is correct and learning value',
    '}\n',
    
    '=== CRITICAL INSTRUCTIONS ===',
    '1. Return a JSON array containing exactly 5 question objects',
    '2. No markdown code fences (no ```json or ``` tags)',
    '3. No explanatory text before or after the JSON',
    '4. Ensure JSON is properly formatted and valid',
    '5. Match questions to the specified learning style',
    '6. Make questions appropriate for the specified field',
    '7. Ensure variety in difficulty and question types',
    '8. Include clear, detailed explanations for each correct answer\n',
    
    '=== EXAMPLE OUTPUT ===',
    '[',
    '  {',
    '    "id": "1",',
    '    "question": "What is the primary concept?",',
    '    "options": ["Option A", "Option B", "Option C", "Option D"],',
    '    "correctAnswer": 1,',
    '    "explanation": "Option B is correct because..."',
    '  }',
    ']',
    '\n=== START GENERATING QUIZ NOW ==='
  ].join('\n');

  return prompt;
};