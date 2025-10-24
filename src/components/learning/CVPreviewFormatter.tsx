import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';

interface CVPreviewFormatterProps {
  content: string;
  format: 'markdown' | 'html' | 'latex';
}

/**
 * Component to properly format and display generated CV content
 * Handles Markdown, HTML, and LaTeX formats with appropriate styling
 */
const CVPreviewFormatter: React.FC<CVPreviewFormatterProps> = ({ content, format }) => {
  // Simple markdown to HTML converter for display
  const markdownToHTML = (md: string): string => {
    let html = md;

    // Headers
    html = html.replace(/^### (.*?)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3 border-b-2 border-blue-500 pb-2">$1</h2>');
    html = html.replace(/^# (.*?)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-gray-100">$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em class="italic text-gray-600 dark:text-gray-400">$1</em>');

    // Bullet lists
    const bulletListRegex = /^- (.*?)$/gm;
    html = html.replace(/((?:^- .*$\n?)+)/gm, (match) => {
      const items = match.match(/^- (.*?)$/gm) || [];
      const listItems = items
        .map((item) => `<li class="text-sm ml-2">${item.replace(/^- /, '')}</li>`)
        .join('');
      return `<ul class="list-disc list-inside space-y-1 mb-3">${listItems}</ul>`;
    });

    // Line breaks and paragraphs
    html = html.replace(/\n\n/g, '</p><p class="text-sm leading-relaxed mb-2">');
    html = html.replace(/^(?!<)/gm, '<p class="text-sm leading-relaxed mb-2">');
    html = html.replace(/$/gm, '</p>');

    return html;
  };

  const renderedContent = useMemo(() => {
    switch (format) {
      case 'markdown':
        return (
          <div
            className="space-y-2"
            dangerouslySetInnerHTML={{
              __html: markdownToHTML(content),
            }}
          />
        );

      case 'html':
        // Sanitize and render HTML with controlled styling
        return (
          <div
            className="space-y-4 text-sm"
            dangerouslySetInnerHTML={{
              __html: sanitizeHTML(content),
            }}
          />
        );

      case 'latex':
        // LaTeX preview - show as code with syntax highlighting
        return (
          <div className="space-y-4">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
              <pre className="text-xs font-mono whitespace-pre-wrap break-words text-gray-800 dark:text-gray-200">
                {content}
              </pre>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 italic">
              💡 Tip: Copy this LaTeX code and compile it with a LaTeX editor (Overleaf, MiKTeX, etc.) for a beautifully formatted PDF.
            </div>
          </div>
        );

      default:
        return <pre className="whitespace-pre-wrap text-sm">{content}</pre>;
    }
  }, [content, format]);

  return (
    <Card className="border rounded-lg p-4 bg-muted/50">
      <div className="max-h-96 overflow-y-auto">
        {renderedContent}
      </div>
    </Card>
  );
};

/**
 * Basic HTML sanitization to prevent XSS while allowing safe formatting
 */
function sanitizeHTML(html: string): string {
  const allowedTags = ['b', 'i', 'u', 'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'strong', 'em'];
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Remove any script tags and event handlers
  const scripts = tempDiv.querySelectorAll('script');
  scripts.forEach(script => script.remove());

  // Remove event handler attributes
  tempDiv.querySelectorAll('*').forEach(element => {
    Array.from(element.attributes).forEach(attr => {
      if (attr.name.startsWith('on')) {
        element.removeAttribute(attr.name);
      }
    });

    // Remove disallowed tags
    if (!allowedTags.includes(element.tagName.toLowerCase())) {
      const parent = element.parentNode;
      while (element.firstChild) {
        parent?.insertBefore(element.firstChild, element);
      }
      parent?.removeChild(element);
    }
  });

  return tempDiv.innerHTML;
}

export default CVPreviewFormatter;
