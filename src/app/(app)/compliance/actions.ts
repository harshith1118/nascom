"use server";

import { complianceCheckTestCases, ComplianceCheckTestCasesInput } from "@/ai/flows/compliance-check-test-cases";

export async function checkCompliance(input: ComplianceCheckTestCasesInput) {
    try {
        const output = await complianceCheckTestCases(input);
        return output;
    } catch (error) {
        console.error("Error in checkCompliance server action:", error);
        throw new Error("Failed to check compliance via AI flow.");
    }
}
