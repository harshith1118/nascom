"use server";

import { modifyTestCasesWithNaturalLanguage, ModifyTestCasesWithNaturalLanguageInput } from "@/ai/flows/modify-test-cases-with-natural-language";

export async function modifyTestCase(input: ModifyTestCasesWithNaturalLanguageInput) {
    try {
        const output = await modifyTestCasesWithNaturalLanguage(input);
        return output;
    } catch (error) {
        console.error("Error in modifyTestCase server action:", error);
        throw new Error("Failed to modify the test case via AI flow.");
    }
}
