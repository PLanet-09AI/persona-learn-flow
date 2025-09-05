import { Question, LearningStyle } from "@/types/learning";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

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
            content: "You are an expert at creating educational assessments. Generate quiz questions that test understanding while matching the user's learning style."
          },
          {
            role: "user",
            content: generateQuizPrompt(content, learningStyle as LearningStyle, field)
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate quiz');
    }

    const data = await response.json();
    
    // Enhanced console logging with styling
    console.group('%c📝 AI Quiz Generation', 'color: #3b82f6; font-size: 14px; font-weight: bold;');
    console.log('%c📊 API Response:', 'font-weight: bold; color: #10b981;', data);
    
    const messageContent = data.choices[0].message.content;
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
    'Create 5 multiple-choice questions based on the following content and parameters:\n',
    `CONTENT:\n${content}\n`,
    `LEARNING STYLE: ${learningStyle}\n${getLearningStyleGuidelines(learningStyle)}\n`,
    `FIELD: ${field}\n`,
    `- Use ${field}-specific terminology and concepts`,
    '- Include practical applications and examples',
    `- Ensure explanations reference ${field} principles\n`,
    'FORMAT:',
    'Return a valid JSON array of 5 question objects. Each object must have:\n',
    '{',
    '  "id": "number (1-5)",',
    '  "question": "string",',
    '  "options": ["string", "string", "string", "string"],',
    '  "correctAnswer": "number (0-3)",',
    '  "explanation": "string"',
    '}\n',
    'IMPORTANT INSTRUCTIONS:',
    '1. Return ONLY valid JSON without any markdown code fences (no ```json or ``` tags)',
    '2. Do not include any explanatory text before or after the JSON',
    '3. The JSON must be properly formatted and valid',
    '4. The array must contain exactly 5 questions'
  ].join('\n');

  return prompt;

}