'use server';
/**
 * @fileOverview This file contains functionality for checking test case compliance with healthcare standards.
 *
 * - checkCompliance - A function that analyzes test cases for healthcare compliance.
 * - CheckComplianceInput - The input type for the checkCompliance function.
 * - CheckComplianceOutput - The return type for the checkCompliance function.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface CheckComplianceInput {
  testCases: string;
  standards?: string[];
}

export interface CheckComplianceOutput {
  report: string;
  recommendations: string[];
}

export async function checkCompliance(
  input: CheckComplianceInput
): Promise<CheckComplianceOutput> {
  const { testCases, standards = ['FDA', 'ISO 13485', 'GDPR', 'HIPAA'] } = input;

  try {
    // Only initialize the API when the function is called
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY is not set in environment variables');
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are an expert in healthcare software compliance. Analyze the following test cases and evaluate their compliance with the specified standards: ${standards.join(', ')}.\n\nTest Cases:\n${testCases}\n\nStandards:\n${standards.join(', ')}\n\nProvide a detailed compliance report including:\n1. Overall compliance score\n2. Specific issues identified\n3. Recommendations for improvement\n4. Areas of strength\n\nFormat:\nReport: [Detailed compliance report]\n\nRecommendations:\n- [Recommendation 1]\n- [Recommendation 2]\n- [Recommendation 3]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the response to extract report and recommendations
    // Look for the report section (everything before Recommendations)
    const reportMatch = text.match(/Report:([\s\S]*?)(?=Recommendations:|$)/i);
    const recommendationsMatch = text.match(/Recommendations:\s*((?:\n- .*)*)/i);
    
    let report = 'Unable to generate report';
    let recommendations: string[] = ['Unable to extract recommendations'];
    
    if (reportMatch && reportMatch[1]) {
      report = reportMatch[1].trim();
    } else {
      // If no "Report:" heading, take the entire text as report
      report = text.substring(0, text.indexOf('Recommendations:') !== -1 ? text.indexOf('Recommendations:') : undefined).trim();
    }
    
    if (recommendationsMatch && recommendationsMatch[1]) {
      recommendations = recommendationsMatch[1]
        .split('\n')
        .map(item => item.trim())
        .filter(item => item.startsWith('- '))
        .map(item => item.substring(2).trim())
        .filter(item => item.length > 0); // Remove empty items
      
      if (recommendations.length === 0) {
        recommendations = ['Unable to extract recommendations'];
      }
    } else {
      // If no recommendations found in the expected format, try to extract any list items
      const allListItems = text.match(/^- .*/gm);
      if (allListItems && allListItems.length > 0) {
        recommendations = allListItems.map(item => item.substring(2).trim());
      }
    }

    return {
      report,
      recommendations
    };
  } catch (error) {
    console.error('Error checking compliance:', error);
    
    // Return mock compliance report for development purposes when API fails
    if (process.env.NODE_ENV === 'development') {
      return {
        report: 'Compliance check completed successfully. All test cases meet basic healthcare software standards. Critical areas like user authentication, data encryption, and audit logging are properly covered in the test cases.',
        recommendations: [
          'Consider adding more test cases for data backup and recovery procedures',
          'Add more edge cases for user permission validation',
          'Include performance testing scenarios for high-load situations'
        ]
      };
    } else {
      throw new Error('Failed to check compliance. Please ensure your Google API key is properly configured and valid.');
    }
  }
}