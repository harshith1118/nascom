'use server';
/**
 * @fileOverview This file contains functionality for modifying test cases based on natural language instructions.
 *
 * - modifyTestCasesWithNaturalLanguage - A function that modifies test cases using natural language.
 * - ModifyTestCasesWithNaturalLanguageInput - The input type for the function.
 * - ModifyTestCasesWithNaturalLanguageOutput - The return type for the function.
 */

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { cleanForDisplay } from "@/lib/formatting";

export interface ModifyTestCasesWithNaturalLanguageInput {
  testCases: string;
  modificationInstructions: string;
}

export interface ModifyTestCasesWithNaturalLanguageOutput {
  modifiedTestCases: string;
}

export async function modifyTestCasesWithNaturalLanguage(
  input: ModifyTestCasesWithNaturalLanguageInput
): Promise<ModifyTestCasesWithNaturalLanguageOutput> {
  const { testCases, modificationInstructions } = input;

  try {
    // Validate API key is available
    if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY.trim() === '') {
      console.error('GOOGLE_API_KEY is not set in environment variables for modifying test cases');
      throw new Error('GOOGLE_API_KEY is not set in environment variables for modifying test cases. Please set GOOGLE_API_KEY in your environment variables.');
    }
    
    // Initialize LangChain model with performance optimizations
    const model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
      model: "gemini-2.5-flash",
      maxRetries: 3,       // Allow multiple retries for network issues
      timeout: 60000,      // 60 second timeout for complex modifications
      maxTokens: 1500,     // Allow for comprehensive modifications
      temperature: 0.3,    // Lower temperature for more consistent output
    });

    const prompt = `You are an expert QA engineer. Modify the following test cases based on the provided natural language instructions.

Current Test Cases:
${testCases}

Modification Instructions:
${modificationInstructions}

Modified Test Cases:

IMPORTANT FORMAT REQUIREMENTS:
- Follow the exact test case format with sections: "### Case ID:", "**Title:**", "**Description:**", "**Test Steps:**", "**Expected Results:**", "**Priority:**", "**Requirements Trace:**"
- DO NOT repeat the test case structure inside field values (e.g., don't include "Title:", "Description:", "Expected Results:" inside the content of these fields)
- Each field should only contain its specific content, not the entire test case format
- Ensure "Expected Results:" section is complete and specific
- Keep the same Case ID unless specifically instructed to change it
- Maintain the "---" separator between test cases`;


    // Create messages for the model
    const messages = [
      new SystemMessage("You are an expert QA engineer specializing in test case modification."),
      new HumanMessage(prompt)
    ];

    const result = await model.invoke(messages);

    const text = result?.content?.toString() || '';

    if (!text || text.trim().length === 0) {
      console.warn('Empty response received from AI model during test case modification');
      throw new Error('AI service returned an empty response. Please try again with different modification instructions.');
    }

    // Clean up formatting for better display
    const cleanedModifiedTestCases = cleanForDisplay(text);
    
    return {
      modifiedTestCases: cleanedModifiedTestCases
    };
  } catch (error) {
    console.error('Error modifying test cases:', error);
    
    if (error instanceof Error && 
        (error.message.includes('GOOGLE_API_KEY') || 
         error.message.includes('API') || 
         error.message.includes('auth') || 
         error.message.includes('400') || 
         error.message.includes('401') || 
         error.message.includes('403'))) {
      throw error; // Re-throw API errors so they can be handled properly by the UI
    }
    
    throw error; // Re-throw all other errors as well for proper handling
  }
}