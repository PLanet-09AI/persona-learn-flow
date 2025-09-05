/**
 * Utility function to enhance content for better display
 * - Wraps emojis in span elements with appropriate styling
 * - Formats code blocks with appropriate classes
 * - Improves table rendering
 * - Enhances blockquotes and callouts
 * - Formats learning outcomes
 * - Adds visual hierarchy improvements
 */
export const formatContent = (content: string): string => {
  if (!content) return '';

  // Process content in steps for better maintenance
  let formatted = content;
  
  // Add emoji styling - more comprehensive emoji detection
  formatted = formatted.replace(/(\p{Emoji}+|\p{Emoji_Presentation}+|\p{Extended_Pictographic}+)/gu, '<span class="emoji">$1</span>');
  
  // Enhance headers with better styling (preserve existing markdown)
  formatted = formatted.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, title) => {
    const level = hashes.length;
    // Add visual indicators for different header levels
    const indicators = ['📚', '🎯', '💡', '⚡', '🔸', '🔹'];
    const indicator = indicators[level - 1] || '•';
    
    // Only add indicator if not already present
    const hasEmoji = /\p{Emoji}/u.test(title);
    const finalTitle = hasEmoji ? title : `${indicator} ${title}`;
    
    return `${hashes} ${finalTitle}`;
  });
  
  // Enhance table display with proper classes
  formatted = formatted.replace(/\n\|(.*)\|\n/g, (match) => {
    return match.replace(/\|/g, '| ').replace(/\s+\|/g, ' |');
  });

  // Wrap tables for horizontal scrolling on mobile
  formatted = formatted.replace(
    /(\n\s*\|.*\|.*\n\s*\|[-:|]*\|[-:|]*\n\s*\|.*\|.*(\n\s*\|.*\|.*)*)/g,
    '\n<div class="table-wrapper">$1\n</div>'
  );

  // Add callout styling for important notes with better formatting
  formatted = formatted.replace(
    />\s*\*\*(Note|Important|Warning|Tip|Info|Key Point):\*\*\s*(.*?)(?:\n\n|\n(?=[^>])|\n?$)/gs,
    (_, type, content) => {
      const icons = {
        'Note': '📝',
        'Important': '❗', 
        'Warning': '⚠️',
        'Tip': '💡',
        'Info': 'ℹ️',
        'Key Point': '🎯'
      };
      const icon = icons[type as keyof typeof icons] || '📌';
      return `<div class="callout callout-${type.toLowerCase()}">
<strong>${icon} ${type}:</strong> ${content}
</div>\n\n`;
    }
  );
  
  // Format GitHub-style callouts with icons
  formatted = formatted.replace(
    /> \[!(NOTE|IMPORTANT|WARNING|TIP|INFO)\]\s*\n((?:> .*\n)+)/gm,
    (_, type, body) => {
      const cleanBody = body.replace(/^> /gm, '');
      const icons = {
        'NOTE': '📝',
        'IMPORTANT': '❗',
        'WARNING': '⚠️', 
        'TIP': '💡',
        'INFO': 'ℹ️'
      };
      const icon = icons[type as keyof typeof icons] || '📌';
      return `<div class="callout callout-${type.toLowerCase()}">
<div class="callout-header">${icon} ${type}</div>

${cleanBody}
</div>\n`;
    }
  );

  // Enhanced formatting for learning outcomes with better visual hierarchy
  formatted = formatted.replace(
    /(#+\s*Learning\s+Outcomes\s*\n+)((?:\s*[\-\*]\s+.*\n?)+)/gi,
    (match, heading, list) => {
      const formattedList = list.replace(
        /[\-\*]\s+(.*)\n?/g, 
        '<li class="learning-outcome">🎯 $1</li>\n'
      );
      
      return `${heading}<div class="learning-outcomes">
<div class="learning-outcomes-header">📚 What You'll Learn:</div>
<ul class="learning-outcomes-list">
${formattedList}
</ul>
</div>\n`;
    }
  );

  // Enhance code blocks with better formatting
  formatted = formatted.replace(
    /```(\w+)?\n([\s\S]*?)```/g,
    (match, language, code) => {
      const lang = language || 'text';
      return `\`\`\`${lang}
${code.trim()}
\`\`\``;
    }
  );

  // Enhance inline code with better spacing
  formatted = formatted.replace(/`([^`]+)`/g, '` $1 `');

  // Add visual separation for major sections
  formatted = formatted.replace(/\n---\n/g, '\n\n---\n\n');

  // Enhance bullet points with better formatting
  formatted = formatted.replace(/^(\s*)[\-\*\+]\s+(.+)$/gm, (match, indent, content) => {
    // Don't modify if it's already in a learning outcomes section
    if (content.includes('class="learning-outcome"')) return match;
    return `${indent}- ${content}`;
  });

  // Enhance numbered lists
  formatted = formatted.replace(/^(\s*)(\d+)\.\s+(.+)$/gm, '$1$2. **$3**');

  return formatted;
};

/**
 * Extract learning outcomes from content
 */
export const extractLearningOutcomes = (content: string): string[] => {
  const outcomes: string[] = [];
  
  // Find learning outcomes section
  const match = content.match(/(#+\s*Learning\s+Outcomes\s*\n+)((?:\s*[\-\*]\s+.*\n?)+)/i);
  
  if (match) {
    const outcomesList = match[2];
    const outcomeMatches = outcomesList.matchAll(/[\-\*]\s+(.*)\n?/g);
    
    for (const outcomeMatch of outcomeMatches) {
      if (outcomeMatch[1]) {
        outcomes.push(outcomeMatch[1].trim());
      }
    }
  }
  
  return outcomes;
};

/**
 * Generate standard learning outcomes for a course topic
 */
export const generateLearningOutcomes = (topic: string): string[] => {
  const defaultOutcomes = [
    `Understand the fundamental principles and key concepts of ${topic}`,
    `Apply ${topic} strategies to real-world business scenarios`,
    `Analyze and evaluate the effectiveness of ${topic} campaigns`,
    `Create a comprehensive ${topic} plan for an organization`,
    `Critically assess emerging trends and technologies in ${topic}`
  ];
  
  // Digital Marketing specific outcomes
  if (topic.toLowerCase().includes('digital marketing')) {
    return [
      "Develop a comprehensive digital marketing strategy aligned with business goals",
      "Analyze and optimize marketing campaigns using data-driven insights and analytics",
      "Create engaging content across multiple digital channels tailored to target audiences",
      "Implement SEO and SEM tactics to improve online visibility and drive qualified traffic",
      "Measure ROI of digital marketing efforts using key performance indicators (KPIs)"
    ];
  }
  
  return defaultOutcomes;
};
