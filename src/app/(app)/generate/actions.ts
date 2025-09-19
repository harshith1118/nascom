"use server";

import { generateTestCasesFromRequirements, GenerateTestCasesFromRequirementsInput } from "@/ai/flows/generate-test-cases-from-requirements";

export async function generateTests(input: GenerateTestCasesFromRequirementsInput) {
    try {
        const output = await generateTestCasesFromRequirements(input);
        return output;
    } catch (error) {
        console.error("Error in generateTests server action:", error);
        throw new Error("Failed to generate test cases via AI flow.");
    }
}
