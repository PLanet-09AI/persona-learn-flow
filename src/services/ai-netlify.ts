import { LearningStyle } from "@/types/learning";

interface GenerateContentParams {
  topic: string;
  field: string;
  learningStyle: LearningStyle;
  userId?: string;
}

export const generateAIContent = async ({ topic, field, learningStyle, userId }: GenerateContentParams): Promise<string> => {
  try {
    const response = await fetch('/.netlify/functions/ai-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic,
        field,
        learningStyle,
        userId
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI Service Error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('❌ Error generating content:', error);
    throw error;
  }
};
