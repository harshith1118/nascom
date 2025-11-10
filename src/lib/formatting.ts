/**
 * Utility functions for cleaning and formatting text
 */

/**
 * Removes markdown formatting from text
 * @param text - The text with potential markdown formatting
 * @returns Clean text without markdown syntax
 */
export function stripMarkdownFormatting(text: string): string {
  if (!text) return text;

  return text
    // Remove bold and italic formatting
    .replace(/\*\*(.*?)\*\*/g, '$1')  // **bold**
    .replace(/\*(.*?)\*/g, '$1')      // *italic*
    .replace(/__(.*?)__/g, '$1')      // __bold__
    .replace(/_(.*?)_/g, '$1')        // _italic_
    // Remove headers
    .replace(/^###\s+(.*)$/gm, '$1')  // ### Header
    .replace(/^##\s+(.*)$/gm, '$1')   // ## Header
    .replace(/^#\s+(.*)$/gm, '$1')    // # Header
    // Remove list markers
    .replace(/^\s*-\s+/gm, '• ')      // Unordered lists with -
    .replace(/^\s*\*\s+/gm, '• ')     // Unordered lists with *
    .replace(/^\s*\+\s+/gm, '• ')     // Unordered lists with +
    .replace(/^\s*\d+\.\s+/gm, '$&') // Ordered lists (keeping numbers for now)
    // Remove image and link formatting
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')  // Images: ![alt](url) -> alt
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')   // Links: [text](url) -> text
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove blockquotes
    .replace(/^\s*>\s+/gm, '')
    // Remove horizontal rules
    .replace(/^\s*[-*_]{3,}\s*$/gm, '')
    // Clean up extra whitespace
    .replace(/\n\s*\n/g, '\n\n')      // Multiple newlines to double newline
    .trim();
}

/**
 * Sanitizes content to prevent XSS by removing potentially dangerous HTML tags and attributes
 * @param text - The text to sanitize
 * @returns Sanitized text safe for display
 */
function sanitizeForXSS(text: string): string {
  if (!text) return text;

  // Remove potentially dangerous tags
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
 * Cleans markdown formatting specifically for display purposes
 * @param text - The text with potential markdown formatting
 * @returns Clean text formatted for display
 */
export function cleanForDisplay(text: string): string {
  if (!text) return text;

  // First sanitize to prevent XSS
  let sanitized = sanitizeForXSS(text);
  
  // Then remove markdown formatting
  let cleaned = stripMarkdownFormatting(sanitized);

  // Additional formatting for better readability
  cleaned = cleaned
    // Ensure proper spacing after periods
    .replace(/\.([A-Z])/g, '. $1')
    // Ensure proper spacing after line breaks
    .replace(/\n/g, '\n\n')
    // Remove extra spaces at the beginning of lines
    .replace(/^\s+/gm, '');

  return cleaned.trim();
}