import { LearningStyle } from "@/types/learning";

export const formatContent = (content: string, style: LearningStyle): string => {
  // Add reading time estimate if not present
  if (!content.includes("~")) {
    const words = content.split(/\s+/).length;
    const readingTime = Math.ceil(words / 200); // Average reading speed of 200 words per minute
    content = `~${readingTime} min read\n\n${content}`;
  }

  // Fix ASCII diagrams - wrap unformatted diagrams in code blocks
  content = content.replace(/(\+[-+]+\+[\s\S]*?\+[-+]+\+)/g, '\n```plaintext\n$1\n```\n');
  
  // Fix the specific pattern from your example
  content = content.replace(/(\+[-+]+\+\s*\|[^`]*?\|[^`]*?\+[-+]+\+)/g, '\n```plaintext\n$1\n```\n');
  
  // Fix malformed ASCII art with pipes (more specific pattern)
  const asciiPattern = /(\|[\s\|\-\+]+\|(?:\s*\n\s*\|[\s\|\-\+]*\|)*)/g;
  content = content.replace(asciiPattern, (match) => {
    // Only wrap if not already in a code block
    const beforeMatch = content.substring(0, content.indexOf(match));
    const afterCodeBlock = beforeMatch.split('```');
    
    // If we have an odd number of ``` before this match, we're inside a code block
    if (afterCodeBlock.length % 2 === 0) {
      return match; // Already in a code block
    }
    return `\n\`\`\`plaintext\n${match.trim()}\n\`\`\`\n`;
  });

  // Ensure proper spacing between sections
  content = content.replace(/\n#{2,}/g, '\n\n##');
  
  // Format code blocks properly
  content = content.replace(/```(\w+)\n/g, '\n```$1\n');
  content = content.replace(/```\n/g, '\n```\n');
  
  // Fix spacing around code blocks
  content = content.replace(/([^\n])```/g, '$1\n```');
  content = content.replace(/```([^\n])/g, '```\n$1');

  // Ensure headers have proper spacing and consistent formatting
  content = content.replace(/^(#{1,6})\s*(.+)$/gm, (match, hashes, title) => {
    // Ensure consistent spacing and preserve emojis
    return `${hashes} ${title.trim()}`;
  });

  // Add style-specific formatting
  switch (style) {
    case "visual":
      // 📊 VISUAL LEARNER FRAMEWORK
      // Enhance visual elements with rich formatting
      content = content.replace(/- \[ \]/g, '☐ ');
      content = content.replace(/- \[x\]/g, '☑ ');
      
      // Add visual separators between major sections
      content = content.replace(/(## .+)/g, '\n---\n\n$1');
      
      // Enhance key concepts with callout boxes
      content = content.replace(/\*\*(Key Point|Important|Note):\*\*/g, '\n> 🔥 **$1:**');
      
      // Add visual flow indicators
      content = content.replace(/(\d+\.)\s/g, '**$1** ➤ ');
      
      // Enhance examples with visual markers
      content = content.replace(/🌟 Example:/g, '\n> 💡 **Example:**');
      break;
      
    case "auditory":
      // 🎵 AUDITORY LEARNER FRAMEWORK
      // Add rhythm and verbal indicators
      content = content.replace(/🎵/g, '🎵 ♪');
      content = content.replace(/Speaking Prompt:/g, '🗣️ **Speaking Prompt:**');
      content = content.replace(/Discussion Point:/g, '💭 **Discussion Point:**');
      
      // Add call-and-response patterns
      content = content.replace(/(\d+\.)\s/g, '**$1** 🔊 ');
      
      // Enhance verbal memory techniques
      content = content.replace(/Remember:/g, '🧠 **Remember (Say it out loud):**');
      content = content.replace(/Repeat:/g, '🔄 **Repeat after me:**');
      
      // Add listening cues
      content = content.replace(/Listen:/g, '👂 **Listen carefully:**');
      break;
      
    case "reading":
      // 📚 READING/WRITING LEARNER FRAMEWORK
      // Enhance readability and academic structure
      content = content.replace(/\*\*Note:/g, '\n> 📝 **Note:**');
      content = content.replace(/\*\*Important:/g, '\n> ⚠️ **Important:**');
      content = content.replace(/\*\*Definition:/g, '\n> 📖 **Definition:**');
      
      // Add academic formatting
      content = content.replace(/(\d+\.)\s/g, '**$1** ');
      
      // Enhance references and citations
      content = content.replace(/Source:/g, '📚 **Source:**');
      content = content.replace(/Reference:/g, '📄 **Reference:**');
      
      // Add reading comprehension aids
      content = content.replace(/Summary:/g, '📋 **Summary:**');
      content = content.replace(/Key Terms:/g, '🔤 **Key Terms:**');
      break;
      
    case "kinesthetic":
      // 🤲 KINESTHETIC LEARNER FRAMEWORK
      // Enhance interactive elements
      content = content.replace(/Step (\d+):/g, '👉 **Step $1:**');
      content = content.replace(/Exercise (\d+):/g, '💪 **Exercise $1:**');
      content = content.replace(/Practice:/g, '🏋️ **Practice:**');
      
      // Add action-oriented formatting
      content = content.replace(/(\d+\.)\s/g, '**$1** 🎯 ');
      
      // Enhance hands-on activities
      content = content.replace(/Try this:/g, '🔨 **Try this now:**');
      content = content.replace(/Activity:/g, '⚡ **Activity:**');
      content = content.replace(/Project:/g, '🛠️ **Project:**');
      
      // Add progress indicators
      content = content.replace(/- \[ \]/g, '□ ');
      content = content.replace(/- \[x\]/g, '✅ ');
      
      // Add timing and completion cues
      content = content.replace(/Complete:/g, '✅ **Complete:**');
      content = content.replace(/Next step:/g, '➡️ **Next step:**');
      break;
  }

  return content;
};
