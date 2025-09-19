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
  prompt: `You are a test case modification expert. You will receive a test case and a prompt.
Modify the test case according to the prompt.

Test Case:
{{testCase}}

Prompt:
{{prompt}}`,
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
