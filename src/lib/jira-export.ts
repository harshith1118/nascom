"use server";

import { TestCase } from "@/lib/types";

interface JiraConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
  projectKey: string;
  issueType: string;
}

export async function exportToJira(testCases: TestCase[], jiraConfig: JiraConfig) {
  const { baseUrl, email, apiToken, projectKey } = jiraConfig;
  
  // Basic authentication using email and API token
  const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');
  const authHeader = `Basic ${auth}`;
  
  const createdIssues = [];
  
  for (const testCase of testCases) {
    try {
      // Format the test case data for Jira
      // For Jira Service Desk, the API might require different handling based on issue type
      // Since the previous approach failed, we'll try the basic approach with more specific error handling
      let description = testCase.description;
      
      description += "\n\n*Test Steps:*";
      testCase.testSteps.forEach((step, i) => {
        description += `\n${i+1}. ${step}`;
      });
      
      description += `\n\n*Expected Results:*\n${testCase.expectedResults}`;
      
      // Add traceability information if available
      if (testCase.requirementsTrace && testCase.requirementsTrace !== 'N/A' && testCase.requirementsTrace !== '') {
        description += `\n\n*Requirements Trace:*\n${testCase.requirementsTrace}`;
      }
      
      // Add version and timestamp information
      description += `\n\n*Version: ${testCase.version}*`;
      description += `\n*Created: ${new Date(testCase.createdAt).toLocaleString()}*`;
      description += `\n*Updated: ${new Date(testCase.updatedAt).toLocaleString()}*`;
      
      const fields = {
        project: {
          key: projectKey
        },
        summary: testCase.title,
        description: description,
        priority: {
          name: testCase.priority === "High" ? "High" : testCase.priority === "Medium" ? "Medium" : "Low"
        }
      };

      // Try to use the specified issue type as-is, but handle Service Desk differently
      if (jiraConfig.issueType.toLowerCase().includes('request')) {
        // For Service Desk requests, try using the name directly
        fields.issuetype = { name: jiraConfig.issueType };
      } else {
        fields.issuetype = { name: jiraConfig.issueType };
      }

      const jiraIssue = {
        fields
      };

      // Create the Jira issue
      const response = await fetch(`${baseUrl}/rest/api/3/issue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify(jiraIssue),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Jira API error: ${response.status} - ${error}`);
      }

      const result = await response.json();
      createdIssues.push({
        id: result.id,
        key: result.key,
        testCaseId: testCase.caseId,
        title: testCase.title
      });
    } catch (error) {
      console.error(`Failed to create Jira issue for test case ${testCase.caseId}:`, error);
      throw new Error(`Failed to export test case "${testCase.title}" to Jira: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return {
    success: true,
    createdIssues,
    message: `Successfully exported ${createdIssues.length} test case(s) to Jira`
  };
}