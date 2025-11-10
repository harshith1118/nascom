import { createElement, ReactNode } from 'react';

interface FormattedTextProps {
  text: string;
  className?: string;
}

/**
 * Sanitizes content to prevent XSS by removing potentially dangerous HTML tags and attributes
 * @param text - The text to sanitize
 * @returns Sanitized text safe for display
 */
function sanitizeForXSS(text: string): string {
  if (!text) return text;

  // Remove potentially dangerous content
  let sanitized = text
    // Remove script tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove event handlers (like onclick, onload, etc.)
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove javascript: and data: URLs
    .replace(/(javascript|data|vbscript):/gi, '')
    // Remove href/src values with javascript: and data: protocols
    .replace(/(href|src)\s*=\s*["']\s*(javascript|data|vbscript):/gi, '')
    // Remove nested angle brackets to prevent tag evasion
    .replace(/<[^>]*>/g, (match) => {
      // Temporarily allow safe tags, remove dangerous ones
      if (match.match(/<(script|iframe|object|embed|form|input|link|meta|base|frame|frameset)/i)) {
        return '';
      }
      return match;
    });

  // Additional sanitization for potential attribute evasion
  sanitized = sanitized
    .replace(/href\s*=\s*["']\s*javascript:/gi, '')
    .replace(/src\s*=\s*["']\s*javascript:/gi, '');

  return sanitized;
}

/**
 * Component to render text with basic markdown-like formatting
 * Handles simple formatting like bold, lists, and line breaks
 */
export function FormattedText({ text, className = '' }: FormattedTextProps) {
  if (!text) return null;

  // Sanitize the text first to prevent XSS
  const sanitizedText = sanitizeForXSS(text);

  // Split text into lines and process them
  const lines = sanitizedText.split('\n');
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