import { LearningStyle } from "@/types/learning";

export const formatContent = (content: string, style: LearningStyle): string => {
  // Add reading time estimate if not present
  if (!content.includes("~")) {
    const words = content.split(/\s+/).length;
    const readingTime = Math.ceil(words / 200); // Average reading speed of 200 words per minute
    content = `~${readingTime} min read\n\n${content}`;
  }

  // Ensure proper spacing between sections
  content = content.replace(/\n#{2,}/g, '\n\n##');
  
  // Format code blocks properly
  content = content.replace(/```(\w+)\n/g, '\n```$1\n');
  content = content.replace(/```\n/g, '\n```\n');

  // Add style-specific formatting
  switch (style) {
    case "visual":
      // Enhance visual elements
      content = content.replace(/- \[ \]/g, '☐ ');
      content = content.replace(/- \[x\]/g, '☑ ');
      break;
      
    case "auditory":
      // Add rhythm indicators
      content = content.replace(/🎵/g, '🎵 ♪');
      content = content.replace(/Speaking Prompt:/g, '🗣️ Speaking Prompt:');
      content = content.replace(/Discussion Point:/g, '💭 Discussion Point:');
      break;
      
    case "reading":
      // Enhance readability
      content = content.replace(/\*\*Note:/g, '\n> **Note:**');
      content = content.replace(/\*\*Important:/g, '\n> **Important:**');
      break;
      
    case "kinesthetic":
      // Enhance interactive elements
      content = content.replace(/Step (\d+):/g, '👉 Step $1:');
      content = content.replace(/Exercise (\d+):/g, '💪 Exercise $1:');
      break;
  }

  return content;
};
