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
}

export interface GenerateTestCasesFromRequirementsOutput {
  testCases: string;
  complianceReport: string;
}

export async function generateTestCasesFromRequirements(
  input: GenerateTestCasesFromRequirementsInput
): Promise<GenerateTestCasesFromRequirementsOutput> {
  const {productRequirementDocument} = input;

  // Validate input
  if (!productRequirementDocument || productRequirementDocument.trim().length < 50) {
    throw new Error('Product requirements must be at least 50 characters long.');
  }

  try {
    // Validate API key is available
    if (!process.env.GOOGLE_API_KEY) {
      console.warn('GOOGLE_API_KEY is not set in environment variables for generating test cases');
      
      // Return an error indicating the API key is missing
      throw new Error('API key is not configured. Please set GOOGLE_API_KEY in environment variables.');
    }
    
    // Initialize LangChain model
    const model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
      model: "gemini-2.5-flash",
    });

    const prompt = `You are an expert QA engineer specializing in healthcare software testing. Your task is to analyze the provided software requirements and generate exactly 3 comprehensive test cases in the specified format.

For each test case, you MUST follow this EXACT format:
### Case ID: TC-001
**Title:** [Brief descriptive title]
**Description:** [Clear description of what is being tested]
**Test Steps:**
1. [First step]
2. [Second step]
3. [Additional steps as needed]
**Expected Results:** [Clear, specific, and complete description of expected outcome for ALL test steps combined - this field must never be left incomplete]
**Priority:** [High/Medium/Low]

Important requirements:
- Every test case MUST have complete and specific expected results
- Each expected result should clearly state what should happen after all test steps are executed
- Do not leave the "Expected Results" field incomplete or end with a colon
- Each test case should be independently verifiable with clear pass/fail criteria
- Ensure all fields are properly populated and formatted

Separate each test case with:
---

After the test cases, provide a brief compliance note that starts with "Compliance Note:" and explains how these test cases address healthcare standards (FDA, ISO 13485, GDPR).

Software Requirements:
${productRequirementDocument}

Test Cases:`;

    // Create messages for the model
    const messages = [
      new SystemMessage("You are an expert QA engineer specializing in healthcare software testing. Generate test cases in the specified format with complete information."),
      new HumanMessage(prompt)
    ];

    const result = await model.invoke(messages);

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
    
    // Re-throw the error to be handled by the calling function
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Failed to generate test cases due to an unexpected error.');
    }
  }
}