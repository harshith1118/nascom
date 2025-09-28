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
        if (error instanceof Error) {
            // Re-throw the error to maintain the server action behavior
            // This ensures that the UI can properly handle the error
            throw error;
        } else {
            throw new Error("Failed to modify test cases due to an unexpected error. Please try again.");
        }
    }
}
