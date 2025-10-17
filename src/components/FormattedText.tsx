import { createElement, ReactNode } from 'react';

interface FormattedTextProps {
  text: string;
  className?: string;
}

/**
 * Component to render text with basic markdown-like formatting
 * Handles simple formatting like bold, lists, and line breaks
 */
export function FormattedText({ text, className = '' }: FormattedTextProps) {
  if (!text) return null;

  // Split text into lines and process them
  const lines = text.split('\n');
  const elements: ReactNode[] = [];

  lines.forEach((line, index) => {
    // Check for list items
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      // Extract list item content
      const content = line.replace(/^\s*[*-]\s*/, '');
      elements.push(
        createElement(
          'li',
          { key: `li-${index}`, className: 'ml-4 list-disc' },
          <span key={`span-${index}`}>{content}</span>
        )
      );
    } else if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
      // Process lines with bold formatting
      const content = line.trim().slice(2, -2);
      elements.push(
        createElement(
          'p',
          { key: `p-${index}`, className: 'font-semibold my-1' },
          content
        )
      );
    } else if (line.trim() === '') {
      // Add spacing for empty lines
      elements.push(createElement('div', { key: `br-${index}`, className: 'h-2' }));
    } else {
      // Regular paragraph
      elements.push(
        createElement(
          'p',
          { key: `p-${index}`, className: 'my-1' },
          line
        )
      );
    }
  });

  return createElement('div', { className }, elements);
}