"use server";

import { generateTestCasesFromRequirements, GenerateTestCasesFromRequirementsInput } from "@/ai/flows/generate-test-cases-from-requirements";

export async function generateTests(input: GenerateTestCasesFromRequirementsInput) {
    try {
        console.log("Generating tests with input:", input);
        
        // Add basic validation before calling the flow
        if (!input || !input.productRequirementDocument || input.productRequirementDocument.trim().length < 10) {
            throw new Error("Product requirements must be provided and should be at least 10 characters long.");
        }
        
        const output = await generateTestCasesFromRequirements(input);
        console.log("AI output received:", output);
        
        // Validate output
        if (!output) {
            throw new Error("AI service returned empty response. Please try again.");
        }
        
        if (!output.testCases || output.testCases.trim() === "") {
            throw new Error("AI failed to generate test cases. The response was empty or invalid. Please try again with different requirements.");
        }
        
        // Check if the response contains error indicators
        if (output.testCases.includes("Error:") || output.testCases.includes("Could not parse")) {
            throw new Error("AI service encountered an error while generating test cases. Please try again or refine your requirements.");
        }
        
        return output;
    } catch (error) {
        console.error("Error in generateTests server action:", error);
        if (error instanceof Error) {
            // Re-throw the error to maintain the server action behavior
            // This ensures that the UI can properly handle the error
            throw error;
        } else {
            throw new Error("Failed to generate test cases due to an unexpected error. Please try again.");
        }
    }
}
