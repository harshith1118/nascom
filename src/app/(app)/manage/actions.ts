"use server";

import { modifyTestCasesWithNaturalLanguage, ModifyTestCasesWithNaturalLanguageInput } from "@/ai/flows/modify-test-cases-with-natural-language";

export async function modifyTestCase(input: ModifyTestCasesWithNaturalLanguageInput) {
    try {
        // Add basic validation before calling the flow
        if (!input || !input.testCases || !input.modificationInstructions) {
            throw new Error("Both test cases and modification instructions must be provided.");
        }
        
        if (input.testCases.trim().length < 10 || input.modificationInstructions.trim().length < 5) {
            throw new Error("Test cases and modification instructions must be provided with sufficient content.");
        }
        
        const output = await modifyTestCasesWithNaturalLanguage(input);
        
        if (!output) {
            throw new Error("AI service returned empty response for test case modification. Please try again.");
        }
        
        if (!output.modifiedTestCases || output.modifiedTestCases.trim() === "") {
            throw new Error("AI failed to modify the test cases. The response was empty or invalid. Please try again with different instructions.");
        }
        
        return output;
    } catch (error) {
        console.error("Error in modifyTestCase server action:", error);
        
        // Check if this is a Google API key issue
        if (error instanceof Error && 
            (error.message.includes('GOOGLE_API_KEY') || 
             error.message.includes('API') || 
             error.message.includes('auth') || 
             error.message.includes('400') || 
             error.message.includes('401') || 
             error.message.includes('403') ||
             error.message.includes('environment variables'))) {
            
            throw error; // Re-throw so the UI can handle it appropriately
        }
        
        if (error instanceof Error) {
            // For other errors, include more specific handling
            throw new Error(`Test case modification failed: ${error.message}`);
        } else {
            throw new Error("Failed to modify test cases due to an unexpected error. Please try again.");
        }
    }
}
