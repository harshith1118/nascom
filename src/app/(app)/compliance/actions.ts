"use server";

import { checkCompliance as checkComplianceFlow, CheckComplianceInput } from "@/ai/flows/compliance-check-test-cases";

export async function checkCompliance(input: CheckComplianceInput) {
    try {
        const output = await checkComplianceFlow(input);
        return output;
    } catch (error) {
        console.error("Error in checkCompliance server action:", error);
        throw new Error("Failed to check compliance via AI flow.");
    }
}
