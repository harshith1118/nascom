'use server';
/**
 * @fileOverview This file contains functionality for modifying test cases based on natural language instructions.
 *
 * - modifyTestCasesWithNaturalLanguage - A function that modifies test cases using natural language.
 * - ModifyTestCasesWithNaturalLanguageInput - The input type for the function.
 * - ModifyTestCasesWithNaturalLanguageOutput - The return type for the function.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ModifyTestCasesWithNaturalLanguageInput {
  testCases: string;
  modificationInstructions: string;
}

export interface ModifyTestCasesWithNaturalLanguageOutput {
  modifiedTestCases: string;
}

export async function modifyTestCasesWithNaturalLanguage(
  input: ModifyTestCasesWithNaturalLanguageInput
): Promise<ModifyTestCasesWithNaturalLanguageOutput> {
  const { testCases, modificationInstructions } = input;

  try {
    // Only initialize the API when the function is called
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY is not set in environment variables');
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are an expert QA engineer. Modify the following test cases based on the provided natural language instructions.

Current Test Cases:
${testCases}

Modification Instructions:
${modificationInstructions}

Modified Test Cases:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      modifiedTestCases: text
    };
  } catch (error) {
    console.error('Error modifying test cases:', error);
    
    // Return mock modified test cases for development purposes when API fails
    if (process.env.NODE_ENV === 'development') {
      return {
        modifiedTestCases: `### Case ID: TC-001
**Title:** Updated User Registration Form Validation
**Description:** Verify the registration form validates user inputs correctly with additional checks
**Test Steps:**
1. Navigate to the registration page
2. Enter invalid email format in the email field
3. Enter password with less than 8 characters
4. Click the register button
5. Check for additional validation messages
**Expected Results:** Appropriate validation errors are displayed for all invalid fields
**Priority:** High

---

### Case ID: TC-002
**Title:** Updated User Login Functionality
**Description:** Verify that authenticated users can successfully log in with enhanced security
**Test Steps:**
1. Navigate to the login page
2. Enter valid credentials
3. Click the login button
4. Verify successful login with security token
**Expected Results:** User is redirected to the dashboard with active session
**Priority:** High

---

### Case ID: TC-003
**Title:** Updated Password Reset Process
**Description:** Verify the enhanced password reset functionality works properly
**Test Steps:**
1. Click the 'Forgot Password' link
2. Enter registered email address
3. Click the reset password button
4. Check email for secure password reset link
**Expected Results:** Secure password reset email with time-limited token is sent to the user
**Priority:** Medium`
      };
    } else {
      throw new Error('Failed to modify test cases. Please ensure your Google API key is properly configured and valid.');
    }
  }
}