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
    
    // For production builds, only expose generic error messages to avoid leaking sensitive info
    if (process.env.NODE_ENV === 'production') {
      // Check if the error is a network error or related to Jira configuration
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error("Network error: Unable to connect to Jira. Please check your network connection and Jira URL.");
      }
      
      // For other errors, provide a general error message
      throw new Error("Failed to export to Jira: Connection or configuration error. Please verify your Jira settings and try again.");
    } else {
      // In development, provide more detailed error information
      if (error instanceof Error) {
        throw new Error(`Failed to export to Jira: ${error.message}`);
      }
      throw new Error("Failed to export to Jira due to an unexpected error");
    }
  }
}

export async function exportTestCasesToJira(testCases: TestCase[], config: JiraConfig) {
  try {
    // Call the actual export function with multiple test cases
    const result = await jiraExportLib(testCases, config);
    return result;
  } catch (error) {
    console.error("Error in exportTestCasesToJira server action:", error);
    
    // For production builds, only expose generic error messages to avoid leaking sensitive info
    if (process.env.NODE_ENV === 'production') {
      // Check if the error is a network error or related to Jira configuration
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error("Network error: Unable to connect to Jira. Please check your network connection and Jira URL.");
      }
      
      // For other errors, provide a general error message
      throw new Error("Failed to export to Jira: Connection or configuration error. Please verify your Jira settings and try again.");
    } else {
      // In development, provide more detailed error information
      if (error instanceof Error) {
        throw new Error(`Failed to export to Jira: ${error.message}`);
      }
      throw new Error("Failed to export to Jira due to an unexpected error");
    }
  }
}