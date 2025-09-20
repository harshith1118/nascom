'use server';
/**
 * @fileOverview This file contains a Genkit flow that generates test cases from product requirement documents (PRDs).
 *
 * - generateTestCasesFromRequirements - A function that generates test cases from requirements.
 * - GenerateTestCasesFromRequirementsInput - The input type for the generateTestCasesFromRequirements function.
 * - GenerateTestCasesFromRequirementsOutput - The return type for the generateTestCasesFromRequirements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTestCasesFromRequirementsInputSchema = z.object({
  productRequirementDocument: z
    .string()
    .describe(
      'The product requirement document (PRD) in text format.'
    ),
});
export type GenerateTestCasesFromRequirementsInput = z.infer<
  typeof GenerateTestCasesFromRequirementsInputSchema
>;

const GenerateTestCasesFromRequirementsOutputSchema = z.object({
  testCases: z
    .string()
    .describe(
      'The generated test cases in a structured format (e.g., JSON or Markdown).'
    ),
  complianceReport: z
    .string()
    .describe(
      'A report indicating the compliance of the generated test cases with healthcare standards (e.g., FDA, ISO 13485, GDPR).'
    ),
});
export type GenerateTestCasesFromRequirementsOutput = z.infer<
  typeof GenerateTestCasesFromRequirementsOutputSchema
>;

export async function generateTestCasesFromRequirements(
  input: GenerateTestCasesFromRequirementsInput
): Promise<GenerateTestCasesFromRequirementsOutput> {
  return generateTestCasesFromRequirementsFlow(input);
}

const generateTestCasesPrompt = ai.definePrompt({
  name: 'generateTestCasesPrompt',
  input: {schema: GenerateTestCasesFromRequirementsInputSchema},
  output: {schema: GenerateTestCasesFromRequirementsOutputSchema},
  prompt: `Create 3 healthcare software test cases from this requirement:

Format:
### Case ID: TC-001
**Title:** [Brief title]
**Description:** [What's tested]
**Test Steps:**
1. [Step 1]
2. [Step 2]
**Expected Results:** [Outcome]
**Priority:** [High/Medium/Low]

---

Requirements:
{{{productRequirementDocument}}}

Compliance: Brief healthcare standards note.`,
});

const generateTestCasesFromRequirementsFlow = ai.defineFlow(
  {
    name: 'generateTestCasesFromRequirementsFlow',
    inputSchema: GenerateTestCasesFromRequirementsInputSchema,
    outputSchema: GenerateTestCasesFromRequirementsOutputSchema,
  },
  async input => {
    const {output} = await generateTestCasesPrompt(input);
    return output!;
  }
);
