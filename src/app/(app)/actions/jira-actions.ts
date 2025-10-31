"use server";

import { TestCase } from "@/lib/types";
import { exportToJira as jiraExportLib } from "@/lib/jira-export";

export interface JiraConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
  projectKey: string;
  issueType: string;
}

export async function exportTestCaseToJira(testCase: TestCase, config: JiraConfig) {
  try {
    // Call the actual export function
    const result = await jiraExportLib([testCase], config);
    return result;
  } catch (error) {
    console.error("Error in exportTestCaseToJira server action:", error);
    
    if (error instanceof Error) {
      // Return a more informative error that can be handled on the client side
      throw new Error(`Failed to export to Jira: ${error.message}`);
    }
    
    throw new Error("Failed to export to Jira due to an unexpected error");
  }
}

export async function exportTestCasesToJira(testCases: TestCase[], config: JiraConfig) {
  try {
    // Call the actual export function with multiple test cases
    const result = await jiraExportLib(testCases, config);
    return result;
  } catch (error) {
    console.error("Error in exportTestCasesToJira server action:", error);
    
    if (error instanceof Error) {
      // Return a more informative error that can be handled on the client side
      throw new Error(`Failed to export to Jira: ${error.message}`);
    }
    
    throw new Error("Failed to export to Jira due to an unexpected error");
  }
}