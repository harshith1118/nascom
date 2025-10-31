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
      // Format the test case data for Jira in Atlassian Document Format (ADF)
      const description = {
        version: 1,
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: testCase.description
              }
            ]
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [
              {
                type: "text",
                text: "Test Steps"
              }
            ]
          },
          {
            type: "orderedList",
            attrs: { order: 1 },
            content: testCase.testSteps.map((step) => ({
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: step
                    }
                  ]
                }
              ]
            }))
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [
              {
                type: "text",
                text: "Expected Results"
              }
            ]
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: testCase.expectedResults
              }
            ]
          },
          ...(testCase.requirementsTrace && testCase.requirementsTrace !== 'N/A' && testCase.requirementsTrace !== '' ? [
            {
              type: "heading",
              attrs: { level: 2 },
              content: [
                {
                  type: "text",
                  text: "Requirements Trace"
                }
              ]
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: testCase.requirementsTrace
                }
              ]
            }
          ] : []),
          {
            type: "heading",
            attrs: { level: 2 },
            content: [
              {
                type: "text",
                text: "Metadata"
              }
            ]
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: `Version: ${testCase.version}`
              }
            ]
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: `Created: ${new Date(testCase.createdAt).toLocaleString()}`
              }
            ]
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: `Updated: ${new Date(testCase.updatedAt).toLocaleString()}`
              }
            ]
          }
        ]
      };
      
      // Create the Jira issue with priority first
      const createIssueWithPriority = async () => {
        // Build fields object with priority
        const fields: any = {
          project: {
            key: projectKey
          },
          summary: testCase.title,
          description: description
        };

        // Add priority if it's a valid Jira priority field and not empty
        if (testCase.priority && testCase.priority.trim() !== '') {
          const priorityMap: Record<string, string> = {
            'High': 'High',
            'Medium': 'Medium', 
            'Normal': 'Medium', // Map Normal to Medium as commonly used
            'Low': 'Low',
            'Critical': 'Highest',
            'critical': 'Highest',
            'high': 'High',
            'medium': 'Medium',
            'low': 'Low'
          };
          
          const jiraPriority = priorityMap[testCase.priority] || priorityMap[testCase.priority.toLowerCase()];
          if (jiraPriority) {
            fields.priority = {
              name: jiraPriority
            };
          }
        }

        // Add issue type
        if (jiraConfig.issueType.toLowerCase().includes('request')) {
          // For Service Desk requests, try using the name directly
          fields.issuetype = { name: jiraConfig.issueType };
        } else {
          fields.issuetype = { name: jiraConfig.issueType };
        }

        const jiraIssue = {
          fields
        };

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
          const errorData = JSON.parse(error);
          
          // Check if the error is specifically about the priority field
          if (errorData.errors && errorData.errors.priority) {
            throw { isPriorityError: true, response, error };
          }
          
          throw new Error(`Jira API error: ${response.status} - ${error}`);
        }

        return await response.json();
      };

      // Create the Jira issue without priority as a fallback
      const createIssueWithoutPriority = async () => {
        // Build fields object without priority
        const fields: any = {
          project: {
            key: projectKey
          },
          summary: testCase.title,
          description: description
        };

        // Add issue type
        if (jiraConfig.issueType.toLowerCase().includes('request')) {
          // For Service Desk requests, try using the name directly
          fields.issuetype = { name: jiraConfig.issueType };
        } else {
          fields.issuetype = { name: jiraConfig.issueType };
        }

        const jiraIssue = {
          fields
        };

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
          throw new Error(`Jira API error without priority: ${response.status} - ${error}`);
        }

        return await response.json();
      };

      let result;
      try {
        // Try to create the issue with priority first
        result = await createIssueWithPriority();
      } catch (error: any) {
        if (error.isPriorityError) {
          // Priority field caused an error, try again without it
          console.warn(`Priority field not supported for this Jira project, creating issue without priority for test case: ${testCase.title}`);
          result = await createIssueWithoutPriority();
        } else {
          // Some other error occurred
          throw error;
        }
      }

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