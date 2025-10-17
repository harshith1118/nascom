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
 * Cleans markdown formatting specifically for display purposes
 * @param text - The text with potential markdown formatting
 * @returns Clean text formatted for display
 */
export function cleanForDisplay(text: string): string {
  if (!text) return text;
  
  let cleaned = stripMarkdownFormatting(text);
  
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