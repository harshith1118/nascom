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

  try {
    // Input validation
    if ((!productRequirementDocument || productRequirementDocument.trim().length < 10) && 
        (!sourceCodeContext || sourceCodeContext.trim().length < 10)) {
      throw new Error('Either product requirements or source code context must be provided and should be at least 10 characters long.');
    }
    
    // Validate API key is available
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY is not set in environment variables for generating test cases');
    }
    
    // Initialize LangChain model with more robust configuration
    const model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
      model: "gemini-2.5-flash",
      maxRetries: 2,  // Add retry capability
      temperature: 0.2, // Lower temperature for more consistent outputs
    });

    let prompt = `You are an expert QA engineer specializing in healthcare software testing. Your task is to analyze the provided software requirements and/or source code changes and generate exactly 3 comprehensive test cases in the specified format that comply with healthcare regulations.`;

    if (productRequirementDocument && productRequirementDocument.trim().length > 0) {
      prompt += `
      
Software Requirements:
${productRequirementDocument}
`;
    }

    if (sourceCodeContext && sourceCodeContext.trim().length > 0) {
      prompt += `

Source Code Context:
${sourceCodeContext}

Analyze the code changes and generate test cases that verify the functionality implemented in the code.
`;
    }

    prompt += `
For each test case, you MUST follow this EXACT format:
### Case ID: TC-001
**Title:** [Brief descriptive title that clearly indicates what is being tested - DO NOT repeat the test case structure here]
**Description:** [Clear description of what functionality or requirement is being tested - DO NOT include other test case fields like "Expected Results:" or "Test Steps:" here]
**Test Steps:**
1. [First step - specific and actionable]
2. [Second step - specific and actionable] 
3. [Additional steps as needed - specific and actionable]
**Expected Results:** [Clear, specific, and complete description of the expected outcome for ALL test steps combined - THIS IS THE MOST CRITICAL FIELD. It must NOT be left empty, not end with just a colon, and must describe exactly what the system should do in response to the test steps. For example: "User is successfully logged in and redirected to the dashboard" or "Account is locked and appropriate error message is displayed" or "Appointment is successfully canceled and status is updated in the system". DO NOT repeat the test case structure or include fields like "Title:" or "Description:" here]
**Priority:** [High/Medium/Low]
**Requirements Trace:** [${requirementsTrace || 'N/A'}]

IMPORTANT REQUIREMENTS:
- Every test case MUST have complete and specific expected results that clearly state the outcome
- Each expected result should describe exactly what should happen after all test steps are executed
- Do NOT leave the "Expected Results" field empty or end with a colon
- Each test case should be independently verifiable with clear pass/fail criteria
- Ensure all fields are properly populated and formatted
- Include validation for patient data protection where applicable
- Include verification of medical device functionality where applicable
- Include audit trail validation where applicable
- If analyzing code changes, focus on testing the specific functionality implemented
- Link test cases back to original requirements where possible
- CRITICAL: Do NOT repeat the test case format, "Title:", "Description:", "Test Steps:", "Expected Results:", or "Priority:" inside any of the field values. Each field should only contain its specific content, not the entire test case structure.

CRITICAL: The "Expected Results" field is absolutely essential. If the requirement specifies that something should happen, the expected results must state "X should happen" or "Y should be displayed". If the requirement involves validation, the expected results must state "Validation should pass/fail with Z message". DO NOT leave this field blank or incomplete.

Separate each test case with:
---

After the test cases, provide a brief compliance note that starts with "Compliance Note:" and explains how these test cases address healthcare standards (FDA, ISO 13485, GDPR, HIPAA, IEC 62304, 21 CFR Part 820, DPDP).

Test Cases:`;

    // Create messages for the model
    const messages = [
      new SystemMessage("You are an expert QA engineer specializing in healthcare software testing. Generate test cases in the specified format with complete information."),
      new HumanMessage(prompt)
    ];

    // Add a try-catch specifically for the API call to provide more specific error handling
    let result;
    try {
      result = await model.invoke(messages);
    } catch (apiError) {
      console.error('Error during API call to Google Generative AI:', apiError);
      
      // Check if it's an authentication error
      if (apiError instanceof Error && 
          (apiError.message.includes('API key') || 
           apiError.message.includes('400') || 
           apiError.message.includes('401') || 
           apiError.message.includes('403'))) {
        throw new Error('Invalid or missing API key. Please verify your Google API key is correct and has proper permissions.');
      }
      
      // Check if it's a quota/usage error
      if (apiError instanceof Error && 
          (apiError.message.includes('quota') || 
           apiError.message.includes('billing') || 
           apiError.message.includes('429'))) {
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

    // Extract test cases and compliance report from the AI output
    let testCases = '';
    let complianceReport = '';
    
    const complianceIndex = text.indexOf('Compliance Note:');
    
    if (complianceIndex !== -1) {
      testCases = text.substring(0, complianceIndex).trim();
      complianceReport = text.substring(complianceIndex).trim();
    } else {
      // Fallback: assume entire content is test cases
      testCases = text;
      complianceReport = 'Compliance verification not provided in AI response.';
    }
    
    // Clean up formatting for better display
    complianceReport = cleanForDisplay(complianceReport);
    
    return {
      testCases,
      complianceReport
    };
  } catch (error) {
    console.error('Error generating test cases:', error);
    
    // Propagate the error to be handled by the calling function
    if (error instanceof Error) {
      throw error; // Re-throw the error to be handled by the caller
    } else {
      throw new Error('An unexpected error occurred during test case generation.');
    }
  }
}