export type LearningStyle = "visual" | "auditory" | "reading" | "kinesthetic";

export type ContentType = {
  title: string;
  content: string;
  topic: string;
  field: string;
  learningStyle: LearningStyle;
  generatedAt: Date;
};

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}
