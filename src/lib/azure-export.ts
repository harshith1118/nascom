"use server";

import { TestCase } from "@/lib/types";

interface AzureDevOpsConfig {
  organization: string;
  project: string;
  personalAccessToken: string;
  workItemType: string;
}

export async function exportToAzureDevOps(testCases: TestCase[], azureConfig: AzureDevOpsConfig) {
  const { organization, project, personalAccessToken } = azureConfig;
  
  // Encode the personal access token for Basic Authentication
  const auth = Buffer.from(`:${personalAccessToken}`).toString('base64');
  const authHeader = `Basic ${auth}`;
  
  const createdWorkItems = [];
  
  for (const testCase of testCases) {
    try {
      // Format the test case data for Azure DevOps work item
      const workItem = [
        {
          op: "add",
          path: "/fields/System.Title",
          value: testCase.title
        },
        {
          op: "add",
          path: "/fields/System.Description",
          value: `<p>${testCase.description}</p>
                  <h3>Test Steps</h3>
                  <ol>${testCase.testSteps.map(step => `<li>${step}</li>`).join('')}</ol>
                  <h3>Expected Results</h3>
                  <p>${testCase.expectedResults}</p>`
        },
        {
          op: "add",
          path: "/fields/Microsoft.VSTS.Common.Priority",
          value: testCase.priority.toLowerCase() === "high" ? "1" : 
                 testCase.priority.toLowerCase() === "medium" ? "2" : "3"
        },
        {
          op: "add",
          path: "/fields/System.WorkItemType",
          value: azureConfig.workItemType
        },
        {
          op: "add",
          path: "/fields/System.State",
          value: "New"
        }
      ];

      // Create the Azure DevOps work item
      const encodedWorkItemType = encodeURIComponent(azureConfig.workItemType);
      const response = await fetch(
        `https://dev.azure.com/${organization}/${project}/_apis/wit/workitems/${encodedWorkItemType}?api-version=6.0`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json-patch+json',
            'Authorization': authHeader,
          },
          body: JSON.stringify(workItem),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Azure DevOps API error: ${response.status} - ${response.statusText}. ${error}`);
      }

      const result = await response.json();
      createdWorkItems.push({
        id: result.id,
        url: result.url,
        testCaseId: testCase.caseId,
        title: testCase.title
      });
    } catch (error) {
      console.error(`Failed to create Azure DevOps work item for test case ${testCase.caseId}:`, error);
      throw new Error(`Failed to export test case "${testCase.title}" to Azure DevOps: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return {
    success: true,
    createdWorkItems,
    message: `Successfully exported ${createdWorkItems.length} test case(s) to Azure DevOps`
  };
}