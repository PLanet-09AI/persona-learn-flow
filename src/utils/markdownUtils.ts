/**
 * Utility function to enhance content for better display
 * - Wraps emojis in span elements with appropriate styling
 * - Formats code blocks with appropriate classes
 */
export const formatContent = (content: string): string => {
  if (!content) return '';

  // Add emoji styling
  // This regex identifies emoji characters and wraps them in spans
  let formatted = content.replace(/(\p{Emoji}+)/gu, '<span class="emoji">$1</span>');
  
  return formatted;
};
