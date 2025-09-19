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
  prompt: `You are an expert QA engineer specializing in generating test cases for healthcare software.

You will receive a product requirement document (PRD) and generate detailed test cases.
The test cases should include Case ID, title, description, test steps, expected results, and priority.
Also, generate a compliance report indicating the compliance of the generated test cases with healthcare standards such as FDA, ISO 13485, and GDPR.

Product Requirement Document:
{{{productRequirementDocument}}}`,
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
