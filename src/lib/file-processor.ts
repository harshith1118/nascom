/**
 * File processing utility to handle different document formats
 * Supports PDF, Word (docx), and XML formats
 */

import { toast } from "@/hooks/use-toast";

// Process file based on its extension
export async function processFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  try {
    switch (extension) {
      case 'pdf':
        return await processPDF(file);
      case 'docx':
        return await processDOCX(file);
      case 'xml':
        return await processXML(file);
      case 'txt':
      case 'md':
        // For text and markdown files, just read as text
        return await file.text();
      default:
        // For unsupported formats, try to read as text
        console.warn(`Unsupported file format: ${extension}, attempting to read as text`);
        return await file.text();
    }
  } catch (error) {
    console.error(`Error processing ${extension} file:`, error);
    throw new Error(`Failed to process ${extension} file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Process PDF files - client-side implementation
async function processPDF(file: File): Promise<string> {
  // For client-side PDF processing, we'll need to read the file and return its content
  // Note: This is a simplified approach - in a real implementation, you'd use pdfjs-dist
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async () => {
      try {
        // Dynamically import pdfjs-dist for client-side PDF processing
        const pdfjsLib = await import('pdfjs-dist');
        
        // Create a worker for processing the PDF
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
        
        const typedArray = new Uint8Array(reader.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          fullText += pageText + '\n';
        }
        
        resolve(fullText);
      } catch (error) {
        // Fallback: if pdfjs processing fails, return a placeholder message
        console.warn('PDF processing failed, using placeholder text');
        resolve(`[PDF Content: ${file.name}, ${file.size} bytes - Full content extraction requires server-side processing]`);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read PDF file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

// Process DOCX files
async function processDOCX(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async () => {
      try {
        // Dynamically import mammoth for client-side DOCX processing
        const mammoth = await import('mammoth');
        const arrayBuffer = reader.result as ArrayBuffer;
        
        const result = await mammoth.extractRawText({ arrayBuffer });
        resolve(result.value);
      } catch (error) {
        // Fallback for when mammoth processing fails
        console.warn('DOCX processing failed, using placeholder text');
        resolve(`[DOCX Content: ${file.name}, ${file.size} bytes - Full content extraction requires server-side processing]`);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read DOCX file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

// Process XML files
async function processXML(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      try {
        const content = reader.result as string;
        // For XML content, we'll extract text content while preserving structure
        // This is a basic implementation - a full solution would parse the XML properly
        resolve(content);
      } catch (error) {
        reject(new Error('Failed to parse XML file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read XML file'));
    };
    
    reader.readAsText(file);
  });
}