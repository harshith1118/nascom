'use server';

/**
 * @fileOverview A test case compliance checker AI agent.
 *
 * - complianceCheckTestCases - A function that handles the test case compliance check process.
 * - ComplianceCheckTestCasesInput - The input type for the complianceCheckTestCases function.
 * - ComplianceCheckTestCasesOutput - The return type for the complianceCheckTestCases function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ComplianceCheckTestCasesInputSchema = z.object({
  testCases: z.string().describe('The test cases to check for compliance.'),
  standards: z
    .string()
    .describe(
      'The healthcare standards to check against, such as FDA, ISO 13485, and GDPR.'
    ),
});
export type ComplianceCheckTestCasesInput = z.infer<
  typeof ComplianceCheckTestCasesInputSchema
>;

const ComplianceCheckTestCasesOutputSchema = z.object({
  complianceReport: z
    .string()
    .describe('The compliance report, detailing any violations.'),
});
export type ComplianceCheckTestCasesOutput = z.infer<
  typeof ComplianceCheckTestCasesOutputSchema
>;

export async function complianceCheckTestCases(
  input: ComplianceCheckTestCasesInput
): Promise<ComplianceCheckTestCasesOutput> {
  return complianceCheckTestCasesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'complianceCheckTestCasesPrompt',
  input: {schema: ComplianceCheckTestCasesInputSchema},
  output: {schema: ComplianceCheckTestCasesOutputSchema},
  prompt: `You are an expert compliance officer specializing in healthcare software.

You will analyze the provided test cases against the specified healthcare standards and generate a compliance report.

Test Cases: {{{testCases}}}
Healthcare Standards: {{{standards}}}

Compliance Report:`,
});

const complianceCheckTestCasesFlow = ai.defineFlow(
  {
    name: 'complianceCheckTestCasesFlow',
    inputSchema: ComplianceCheckTestCasesInputSchema,
    outputSchema: ComplianceCheckTestCasesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
