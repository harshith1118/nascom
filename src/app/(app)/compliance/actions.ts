"use server";

import { checkCompliance as checkComplianceFlow, CheckComplianceInput } from "@/ai/flows/compliance-check-test-cases";

export async function checkCompliance(input: CheckComplianceInput) {
    try {
        // Add basic validation before calling the flow
        if (!input || !input.testCases || input.testCases.trim().length < 10) {
            throw new Error("Test cases must be provided and should be at least 10 characters long.");
        }
        
        const output = await checkComplianceFlow(input);
        
        if (!output) {
            throw new Error("AI service returned empty response for compliance check. Please try again.");
        }
        
        if (!output.report || output.report.trim() === "") {
            throw new Error("AI failed to generate a compliance report. The response was empty or invalid. Please try again with different test cases.");
        }
        
        return output;
    } catch (error) {
        console.error("Error in checkCompliance server action:", error);
        if (error instanceof Error) {
            // Re-throw the error to maintain the server action behavior
            // This ensures that the UI can properly handle the error
            throw error;
        } else {
            throw new Error("Failed to check compliance due to an unexpected error. Please try again.");
        }
    }
}
