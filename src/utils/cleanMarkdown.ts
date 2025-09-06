/**
 * Utility functions for cleaning markdown content
 */

/**
 * Clean markdown content for text-to-speech
 * Removes all markdown syntax while preserving readable text
 */
export const cleanMarkdownForSpeech = (content: string): string => {
  return content
    // Remove headers (# ## ###, etc.) - keeps the text, removes the symbols
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold and italic markers (**text** *text*)
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    // Remove strikethrough
    .replace(/~~([^~]+)~~/g, '$1')
    // Remove code blocks and inline code (keeps content)
    .replace(/```[\w]*\n([\s\S]*?)```/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    // Remove blockquotes (keeps content)
    .replace(/^>\s*/gm, '')
    // Remove links [text](url) - keeps the text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove images ![alt](url)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    // Remove horizontal rules
    .replace(/^[-*_]{3,}$/gm, '')
    // Remove list markers (keeps content)
    .replace(/^[\s]*[-*+]\s+/gm, '')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Remove tables (keeps content but removes formatting)
    .replace(/\|/g, ' ')
    .replace(/^[-\s|:]+$/gm, '')
    // Remove emoji patterns that are just formatting
    .replace(/^\s*[-+*]\s*$/gm, '')
    // Clean up whitespace
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Multiple line breaks to double
    .replace(/\n\s*\n/g, '. ') // Double line breaks to periods
    .replace(/\s+/g, ' ') // Multiple spaces to single
    .trim();
};

/**
 * Clean markdown content for display (removes only syntax, not content)
 * Useful for showing clean text without markdown formatting
 */
export const cleanMarkdownForDisplay = (content: string): string => {
  return content
    // Keep headers but remove # symbols
    .replace(/^(#{1,6})\s+/gm, '')
    // Keep bold/italic content but remove markers
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    // Keep other content but remove syntax
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^>\s*/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();
};

/**
 * Extract plain text from markdown (most aggressive cleaning)
 * Removes all markdown syntax and formatting
 */
export const extractPlainText = (content: string): string => {
  return cleanMarkdownForSpeech(content)
    // Remove remaining special characters that might interfere with speech
    .replace(/[#*_`~\[\]()]/g, '')
    // Clean up any remaining artifacts
    .replace(/\s+/g, ' ')
    .trim();
};
