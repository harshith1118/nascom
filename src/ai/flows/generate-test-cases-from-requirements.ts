'use server';
/**
 * @fileOverview This file contains functionality that generates test cases from product requirement documents (PRDs).
 *
 * - generateTestCasesFromRequirements - A function that generates test cases from requirements.
 * - GenerateTestCasesFromRequirementsInput - The input type for the generateTestCasesFromRequirements function.
 * - GenerateTestCasesFromRequirementsOutput - The return type for the generateTestCasesFromRequirements function.
 */

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { cleanForDisplay } from "@/lib/formatting";

export interface GenerateTestCasesFromRequirementsInput {
  productRequirementDocument: string;
  sourceCodeContext?: string; // Optional source code context for generating test cases from code changes
  requirementsTrace?: string; // Traceability to original requirements
}

export interface GenerateTestCasesFromRequirementsOutput {
  testCases: string;
  complianceReport: string;
}

export async function generateTestCasesFromRequirements(
  input: GenerateTestCasesFromRequirementsInput
): Promise<GenerateTestCasesFromRequirementsOutput> {
  const {productRequirementDocument, sourceCodeContext, requirementsTrace} = input;
  
  // Add detailed logging for debugging
  console.log('Starting generateTestCasesFromRequirements with input:', {
    hasProductRequirementDocument: !!productRequirementDocument,
    productRequirementDocumentLength: productRequirementDocument?.length,
    hasSourceCodeContext: !!sourceCodeContext,
    sourceCodeContextLength: sourceCodeContext?.length,
    hasRequirementsTrace: !!requirementsTrace
  });

  try {
    // Input validation
    if ((!productRequirementDocument || productRequirementDocument.trim().length < 10) && 
        (!sourceCodeContext || sourceCodeContext.trim().length < 10)) {
      throw new Error('Either product requirements or source code context must be provided and should be at least 10 characters long.');
    }
    
    // Validate API key is available
    if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY.trim() === '') {
      console.error('GOOGLE_API_KEY is not set in environment variables');
      throw new Error('GOOGLE_API_KEY is not set in environment variables for generating test cases. Please set GOOGLE_API_KEY in your environment variables.');
    }
    
    console.log('Initializing LangChain model with configuration');
    
    // Initialize LangChain model with performance optimizations for faster response
    const model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
      model: "gemini-2.5-flash", // Using gemini-2.5-flash which is optimized for speed
      maxRetries: 1,  // Reduce retries to prevent extended timeouts
      temperature: 0.5, // Higher temperature for faster, more varied output
      timeout: 25000, // Standard timeout to balance speed and completion
      maxTokens: 1200, // Limit output tokens to prevent long generation times
    });
    
    console.log('LangChain model initialized successfully');

    let prompt = `You are an expert QA engineer. Generate exactly 3 test cases for the provided requirements in the format below.

Requirements:
${productRequirementDocument || sourceCodeContext}

Format:
### Case ID: TC-001
**Title:** [Brief title with key details]
**Description:** [Brief description]
**Test Steps:**
1. [Actionable step]
2. [Actionable step]
3. [Actionable step]
**Expected Results:** [Specific measurable outcome]
**Priority:** [High/Medium/Low]
**Requirements Trace:** [${requirementsTrace ? requirementsTrace.substring(0, 50) + (requirementsTrace.length > 50 ? '...' : '') : 'N/A'}]

Include technical details, performance metrics, and regulatory compliance where relevant.

Separate each test case with:
---

Compliance assessment:
[Concise compliance assessment focusing on healthcare standards like FDA, ISO 13485, GDPR, HIPAA under 100 words]

Test Cases:`;

    // Create messages for the model
    const messages = [
      new SystemMessage("You are an expert QA engineer. Generate concise, technical test cases with specific implementation details, performance metrics, and regulatory compliance information when relevant."),
      new HumanMessage(prompt)
    ];

    console.log('Making API call to Google Generative AI with prompt length:', messages[1].content.toString().length);
    
    // Add a try-catch specifically for the API call to provide more specific error handling
    let result;
    try {
      // Use Promise.race to implement a timeout for the API call to prevent 504s
      result = await Promise.race([
        model.invoke(messages),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('API call timed out after 25 seconds')), 25000)
        )
      ]);
      console.log('API call completed successfully');
    } catch (apiError) {
      console.error('Error during API call to Google Generative AI:', apiError);
      
      // Check if it's a timeout error
      if (apiError instanceof Error && apiError.message.includes('timed out')) {
        console.error('API call timed out after 25 seconds');
        throw new Error('API request timed out. The request took too long to process. Please try again with simpler requirements.');
      }
      
      // Check if it's an authentication error
      if (apiError instanceof Error && 
          (apiError.message.includes('API key') || 
           apiError.message.includes('400') || 
           apiError.message.includes('401') || 
           apiError.message.includes('403'))) {
        console.error('Authentication error during API call:', apiError.message);
        throw new Error('Invalid or missing API key. Please verify your Google API key is correct and has proper permissions.');
      }
      
      // Check if it's a quota/usage error
      if (apiError instanceof Error && 
          (apiError.message.includes('quota') || 
           apiError.message.includes('billing') || 
           apiError.message.includes('429'))) {
        console.error('Quota or billing error during API call:', apiError.message);
        throw new Error('API quota exceeded or billing issue. Please check your Google Cloud billing settings.');
      }
      
      // Re-throw to be caught by outer catch
      throw apiError;
    }

    const text = result?.content?.toString() || '';

    if (!text || text.trim().length === 0) {
      console.warn('Empty response received from AI model');
      throw new Error('AI service returned an empty response. Please try again.');
    }
    
    console.log('Processing AI response with length:', text.length);

    // Extract test cases and compliance report from the AI output
    let testCases = '';
    let complianceReport = '';
    
    // Look for various compliance section markers
    let complianceIndex = text.indexOf('Compliance assessment:');
    if (complianceIndex === -1) {
      complianceIndex = text.indexOf('Compliance Note:');
    }
    if (complianceIndex === -1) {
      complianceIndex = text.indexOf('Compliance Summary:');
    }
    
    if (complianceIndex !== -1) {
      testCases = text.substring(0, complianceIndex).trim();
      complianceReport = text.substring(complianceIndex).trim();
      
      // Remove the heading itself from the compliance report
      if (complianceReport.startsWith('Compliance assessment:')) {
        complianceReport = complianceReport.substring('Compliance assessment:'.length).trim();
      } else if (complianceReport.startsWith('Compliance Note:')) {
        complianceReport = complianceReport.substring('Compliance Note:'.length).trim();
      } else if (complianceReport.startsWith('Compliance Summary:')) {
        complianceReport = complianceReport.substring('Compliance Summary:'.length).trim();
      }
    } else {
      // Fallback: check for other patterns that might indicate compliance content
      // If the text ends with compliance-related content, treat it separately
      const lines = text.split('\n');
      let complianceStart = -1;
      
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();
        if (line.includes('HIPAA') || line.includes('GDPR') || line.includes('FDA') || 
            line.includes('ISO 13485') || line.includes('compliance') || 
            line.toLowerCase().includes('security') || line.toLowerCase().includes('audit')) {
          complianceStart = i;
        }
      }
      
      if (complianceStart > 0) {
        testCases = lines.slice(0, complianceStart).join('\n').trim();
        complianceReport = lines.slice(complianceStart).join('\n').trim();
      } else {
        // Fallback: assume entire content is test cases
        testCases = text;
        complianceReport = 'Compliance verification not provided in AI response.';
      }
    }
    
    // Clean up formatting for better display
    complianceReport = cleanForDisplay(complianceReport);
    
    console.log('Successfully processed AI response, test cases length:', testCases.length);
    
    return {
      testCases,
      complianceReport
    };
  } catch (error) {
    console.error('Error generating test cases:', {
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : 'No stack trace',
      errorType: typeof error
    });
    
    // Check if this is a timeout error to return a specific message
    if (error instanceof Error) {
      if (error.message.includes('timed out') || error.message.includes('timeout')) {
        console.warn('Timeout error occurred, returning for UI handling:', error.message);
        throw new Error('Request timeout: The AI service took too long to respond. This may happen with complex requirements. Please try again with simpler requirements or try again later.');
      }
      
      // Check for API-related errors
      if (error.message.includes('API') || error.message.includes('auth') || 
          error.message.includes('400') || error.message.includes('401') || 
          error.message.includes('403') || error.message.includes('429')) {
        console.warn('API error occurred, returning for UI handling:', error.message);
        throw error;
      }
      
      // For other errors, log and re-throw
      console.error('Non-API error in generateTestCasesFromRequirements:', error.message);
      throw error;
    } else {
      console.error('Unknown error type in generateTestCasesFromRequirements:', error);
      throw new Error('An unexpected error occurred during test case generation.');
    }
  }
}