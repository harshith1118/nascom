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
  prompt: `You are an expert QA engineer specializing in healthcare software testing. Your task is to analyze the provided software requirements and generate exactly 3 comprehensive test cases in the specified format.

For each test case, you MUST follow this EXACT format:
### Case ID: TC-001
**Title:** [Brief descriptive title]
**Description:** [Clear description of what is being tested]
**Test Steps:**
1. [First step]
2. [Second step]
3. [Additional steps as needed]
**Expected Results:** [Clear description of expected outcome]
**Priority:** [High/Medium/Low]

Separate each test case with:
---

After the test cases, provide a brief compliance note that starts with "Compliance Note:" and explains how these test cases address healthcare standards (FDA, ISO 13485, GDPR).

Software Requirements:
{{{productRequirementDocument}}}

Test Cases:
`,
});

const generateTestCasesFromRequirementsFlow = ai.defineFlow(
  {
    name: 'generateTestCasesFromRequirementsFlow',
    inputSchema: GenerateTestCasesFromRequirementsInputSchema,
    outputSchema: GenerateTestCasesFromRequirementsOutputSchema,
  },
  async input => {
    const {output} = await generateTestCasesPrompt(input);
    
    // Extract test cases and compliance report from the AI output
    let testCases = '';
    let complianceReport = '';
    
    if (output && typeof output === 'object' && 'testCases' in output) {
      // If the AI returned the structured output directly
      testCases = output.testCases as string;
      complianceReport = output.complianceReport as string;
    } else if (output) {
      // Convert output to string to handle different response formats
      const outputString = JSON.stringify(output);
      const complianceIndex = outputString.indexOf('Compliance Note:');
      
      if (complianceIndex !== -1) {
        testCases = outputString.substring(0, complianceIndex).trim();
        complianceReport = outputString.substring(complianceIndex).trim();
      } else {
        // Fallback: assume entire content is test cases
        testCases = outputString;
        complianceReport = 'Compliance verification not provided in AI response.';
      }
    } else {
      // Fallback for any other format
      testCases = 'Error: Could not parse AI response format.';
      complianceReport = 'Error: Could not extract compliance report.';
    }
    
    return {
      testCases,
      complianceReport
    };
  }
);
