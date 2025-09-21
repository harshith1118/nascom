// The AI flow to modify generated test cases using natural language prompts.

'use server';

/**
 * @fileOverview This file defines a Genkit flow for modifying test cases using natural language prompts.
 *
 * - modifyTestCasesWithNaturalLanguage - A function that takes a test case and a natural language prompt and returns a modified test case.
 * - ModifyTestCasesWithNaturalLanguageInput - The input type for the modifyTestCasesWithNaturalLanguage function.
 * - ModifyTestCasesWithNaturalLanguageOutput - The return type for the modifyTestCasesWithNaturalLanguage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModifyTestCasesWithNaturalLanguageInputSchema = z.object({
  testCase: z.string().describe('The test case to modify.'),
  prompt: z.string().describe('The natural language prompt to use for modifying the test case.'),
});
export type ModifyTestCasesWithNaturalLanguageInput = z.infer<typeof ModifyTestCasesWithNaturalLanguageInputSchema>;

const ModifyTestCasesWithNaturalLanguageOutputSchema = z.string().describe('The modified test case.');
export type ModifyTestCasesWithNaturalLanguageOutput = z.infer<typeof ModifyTestCasesWithNaturalLanguageOutputSchema>;

export async function modifyTestCasesWithNaturalLanguage(
  input: ModifyTestCasesWithNaturalLanguageInput
): Promise<ModifyTestCasesWithNaturalLanguageOutput> {
  return modifyTestCasesWithNaturalLanguageFlow(input);
}

const modifyTestCasesWithNaturalLanguagePrompt = ai.definePrompt({
  name: 'modifyTestCasesWithNaturalLanguagePrompt',
  input: {schema: ModifyTestCasesWithNaturalLanguageInputSchema},
  output: {schema: ModifyTestCasesWithNaturalLanguageOutputSchema},
  prompt: `You are a test case modification expert specializing in healthcare software testing. Your task is to modify the provided test case according to the user's prompt.

Instructions:
1. Carefully read the test case and the modification prompt
2. Make the requested changes to the test case
3. Ensure the modified test case maintains proper formatting
4. Return ONLY the modified test case in the same format as the original

Original Test Case:
{{testCase}}

Modification Request:
{{prompt}}

Modified Test Case:
`,
});

const modifyTestCasesWithNaturalLanguageFlow = ai.defineFlow(
  {
    name: 'modifyTestCasesWithNaturalLanguageFlow',
    inputSchema: ModifyTestCasesWithNaturalLanguageInputSchema,
    outputSchema: ModifyTestCasesWithNaturalLanguageOutputSchema,
  },
  async input => {
    const {output} = await modifyTestCasesWithNaturalLanguagePrompt(input);
    return output!;
  }
);
