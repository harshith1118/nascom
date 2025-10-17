"use client"

import { useState } from "react"
import { useTestCases } from "@/contexts/TestCasesContext"
import { testCaseToMarkdown } from "@/lib/parsers"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Bot, Copy, Share2, FileDown, AlertCircle, X, Check, Loader2 } from "lucide-react"
import { type TestCase } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { modifyTestCasesWithNaturalLanguage } from "@/ai/flows/modify-test-cases-with-natural-language"
import { exportToJira } from "@/lib/jira-export"
import { exportToAzureDevOps } from "@/lib/azure-export"
import { downloadTestCase } from "@/lib/download-utils"

type TestCaseCardProps = {
  testCase: TestCase
  index: number
}

export function TestCaseCard({ testCase, index }: TestCaseCardProps) {
  const { toast } = useToast()
  const { updateTestCase } = useTestCases()
  const [isModifyDialogOpen, setIsModifyDialogOpen] = useState(false)
  const [modificationInstructions, setModificationInstructions] = useState("")
  const [isModifying, setIsModifying] = useState(false)
  const [isJiraDialogOpen, setIsJiraDialogOpen] = useState(false)
  const [jiraConfig, setJiraConfig] = useState({
    baseUrl: "",
    email: "",
    apiToken: "",
    projectKey: "",
    issueType: "Task" // Default issue type
  })
  const [isExportingToJira, setIsExportingToJira] = useState(false)
  const [isAzureDialogOpen, setIsAzureDialogOpen] = useState(false)
  const [azureConfig, setAzureConfig] = useState({
    organization: "",
    project: "",
    personalAccessToken: "",
    workItemType: "Task"
  })
  const [isExportingToAzure, setIsExportingToAzure] = useState(false)
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleExport = (tool: string) => {
    if (tool === "Jira") {
      setIsJiraDialogOpen(true);
    } else if (tool === "Azure DevOps") {
      setIsAzureDialogOpen(true);
    } else if (tool === "PDF") {
      setIsDownloadDialogOpen(true);
    } else {
      toast({
        title: `Export to ${tool} - Temporarily Suspended`,
        description: `Export functionality to ${tool} is temporarily suspended for demo purposes. This feature will be available in the full version.`,
      })
    }
  }

  const copyTestCase = async () => {
    try {
      const testCaseMarkdown = testCaseToMarkdown(testCase);
      await navigator.clipboard.writeText(testCaseMarkdown);
      toast({
        title: "Copied to clipboard",
        description: `Test case "${testCase.title}" has been copied to your clipboard.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Copy failed",
        description: "Failed to copy test case to clipboard.",
      });
    }
  };

  const handleModifyWithAI = async () => {
    if (!modificationInstructions.trim()) {
      toast({
        variant: "destructive",
        title: "No instructions provided",
        description: "Please enter modification instructions before proceeding.",
      });
      return;
    }

    setIsModifying(true);
    try {
      // Prepare the current test case in markdown format for AI processing
      const currentTestCaseMarkdown = testCaseToMarkdown(testCase);
      
      // Call the AI modification flow
      const result = await modifyTestCasesWithNaturalLanguage({
        testCases: currentTestCaseMarkdown,
        modificationInstructions: modificationInstructions
      });
      
      if (!result || !result.modifiedTestCases) {
        throw new Error("AI service returned an empty response");
      }
      
      // Parse the modified test cases
      const parsedTestCases = await import("@/lib/parsers").then(
        ({ parseTestCasesMarkdown }) => parseTestCasesMarkdown(result.modifiedTestCases)
      );
      
      if (parsedTestCases.length === 0) {
        throw new Error("AI response could not be parsed into valid test cases");
      }
      
      // Update only the current test case with the first parsed result
      const modifiedTestCase = parsedTestCases[0];
      const updatedTestCase = {
        ...testCase, // Keep the original testCase as base
        ...modifiedTestCase // Override with modified values
      };
      
      // Update the test case in the context
      updateTestCase(index, updatedTestCase);
      
      toast({
        title: "Test case modified successfully",
        description: `Test case "${testCase.title}" has been updated with AI.`,
      });
      
      // Close the dialog and reset state
      setIsModifyDialogOpen(false);
      setModificationInstructions("");
    } catch (error) {
      console.error('Failed to modify test case:', error);
      toast({
        variant: "destructive",
        title: "Modification failed",
        description: error instanceof Error ? error.message : "Failed to modify test case with AI. Please try again.",
      });
    } finally {
      setIsModifying(false);
    }
  };

  const handleExportToJira = async () => {
    if (!jiraConfig.baseUrl || !jiraConfig.email || !jiraConfig.apiToken || !jiraConfig.projectKey) {
      toast({
        variant: "destructive",
        title: "Missing configuration",
        description: "Please fill in all Jira configuration fields.",
      });
      return;
    }

    setIsExportingToJira(true);
    try {
      const result = await exportToJira([testCase], jiraConfig);
      
      toast({
        title: "Export successful",
        description: result.message,
      });
      
      setIsJiraDialogOpen(false);
      // Reset config to clear sensitive data
      setJiraConfig({
        baseUrl: "",
        email: "",
        apiToken: "",
        projectKey: ""
      });
    } catch (error) {
      console.error('Failed to export to Jira:', error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to export test case to Jira. Please check your configuration.",
      });
    } finally {
      setIsExportingToJira(false);
    }
  };

  const handleExportToAzure = async () => {
    if (!azureConfig.organization || !azureConfig.project || !azureConfig.personalAccessToken) {
      toast({
        variant: "destructive",
        title: "Missing configuration",
        description: "Please fill in all Azure DevOps configuration fields.",
      });
      return;
    }

    setIsExportingToAzure(true);
    try {
      const result = await exportToAzureDevOps([testCase], azureConfig);
      
      toast({
        title: "Export successful",
        description: result.message,
      });
      
      setIsAzureDialogOpen(false);
      // Reset config to clear sensitive data
      setAzureConfig({
        organization: "",
        project: "",
        personalAccessToken: ""
      });
    } catch (error) {
      console.error('Failed to export to Azure DevOps:', error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to export test case to Azure DevOps. Please check your configuration.",
      });
    } finally {
      setIsExportingToAzure(false);
    }
  };

  const handleDownload = async (format: 'pdf' | 'excel' | 'word' | 'json' | 'text' | 'markdown') => {
    setIsDownloading(true);
    try {
      await downloadTestCase(testCase, format);
      
      toast({
        title: "Download successful",
        description: `Test case downloaded as ${format.toUpperCase()} file.`,
      });
      
      setIsDownloadDialogOpen(false);
    } catch (error) {
      console.error(`Failed to download test case as ${format}:`, error);
      toast({
        variant: "destructive",
        title: "Download failed",
        description: error instanceof Error ? error.message : `Failed to download test case as ${format.toUpperCase()}.`,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const priorityVariant = (priority: string): "default" | "secondary" | "destructive" => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <div>
              <CardDescription>{testCase.caseId}</CardDescription>
              <CardTitle className="text-xl">{testCase.title}</CardTitle>
            </div>
            <Badge variant={priorityVariant(testCase.priority)} className="capitalize shrink-0">
              {testCase.priority} Priority
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">Description</h4>
            <p className="text-muted-foreground text-sm">{testCase.description}</p>
          </div>
          <Separator />
          <div>
            <h4 className="font-semibold text-sm mb-2">Test Steps</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              {testCase.testSteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
          <Separator />
          <div>
            <h4 className="font-semibold text-sm mb-2">Expected Results</h4>
            <p className="text-muted-foreground text-sm">{testCase.expectedResults}</p>
          </div>
        </CardContent>
        <CardFooter className="flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={copyTestCase}>
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
          <Dialog open={isModifyDialogOpen} onOpenChange={setIsModifyDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Bot className="mr-2 h-4 w-4" />
                Modify with AI
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Modify Test Case with AI</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="modification-instructions" className="text-sm font-medium">
                    Modification Instructions
                  </label>
                  <Textarea
                    id="modification-instructions"
                    placeholder="Enter instructions for modifying this test case (e.g., 'Change all references to patient to user', 'Make the test steps more detailed', etc.)"
                    value={modificationInstructions}
                    onChange={(e) => setModificationInstructions(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsModifyDialogOpen(false)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleModifyWithAI}
                    disabled={isModifying || !modificationInstructions.trim()}
                  >
                    {isModifying ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                        Modifying...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Apply Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isJiraDialogOpen} onOpenChange={setIsJiraDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Export to Jira
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Export to Jira</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="jira-base-url" className="text-sm font-medium">
                    Jira Base URL
                  </label>
                  <Input
                    id="jira-base-url"
                    placeholder="https://yourcompany.atlassian.net"
                    value={jiraConfig.baseUrl}
                    onChange={(e) => setJiraConfig({...jiraConfig, baseUrl: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="jira-email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="jira-email"
                    placeholder="your-email@company.com"
                    value={jiraConfig.email}
                    onChange={(e) => setJiraConfig({...jiraConfig, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="jira-api-token" className="text-sm font-medium">
                    API Token
                  </label>
                  <Input
                    id="jira-api-token"
                    type="password"
                    placeholder="Your Jira API token"
                    value={jiraConfig.apiToken}
                    onChange={(e) => setJiraConfig({...jiraConfig, apiToken: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="jira-project-key" className="text-sm font-medium">
                    Project Key
                  </label>
                  <Input
                    id="jira-project-key"
                    placeholder="e.g., PROJ"
                    value={jiraConfig.projectKey}
                    onChange={(e) => setJiraConfig({...jiraConfig, projectKey: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="jira-issue-type" className="text-sm font-medium">
                    Issue Type
                  </label>
                  <Input
                    id="jira-issue-type"
                    placeholder="e.g., Task, Story, Bug, or Service Desk request type"
                    value={jiraConfig.issueType}
                    onChange={(e) => setJiraConfig({...jiraConfig, issueType: e.target.value})}
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsJiraDialogOpen(false)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleExportToJira}
                    disabled={isExportingToJira}
                  >
                    {isExportingToJira ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Share2 className="mr-2 h-4 w-4" />
                        Export to Jira
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isAzureDialogOpen} onOpenChange={setIsAzureDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Export to Azure
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Export to Azure DevOps</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="azure-organization" className="text-sm font-medium">
                    Organization
                  </label>
                  <Input
                    id="azure-organization"
                    placeholder="your-organization"
                    value={azureConfig.organization}
                    onChange={(e) => setAzureConfig({...azureConfig, organization: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="azure-project" className="text-sm font-medium">
                    Project
                  </label>
                  <Input
                    id="azure-project"
                    placeholder="your-project-name"
                    value={azureConfig.project}
                    onChange={(e) => setAzureConfig({...azureConfig, project: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="azure-pat" className="text-sm font-medium">
                    Personal Access Token
                  </label>
                  <Input
                    id="azure-pat"
                    type="password"
                    placeholder="Your Azure DevOps PAT"
                    value={azureConfig.personalAccessToken}
                    onChange={(e) => setAzureConfig({...azureConfig, personalAccessToken: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="azure-work-item-type" className="text-sm font-medium">
                    Work Item Type
                  </label>
                  <Input
                    id="azure-work-item-type"
                    placeholder="e.g., Task, User Story, Bug"
                    value={azureConfig.workItemType}
                    onChange={(e) => setAzureConfig({...azureConfig, workItemType: e.target.value})}
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAzureDialogOpen(false)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleExportToAzure}
                    disabled={isExportingToAzure}
                  >
                    {isExportingToAzure ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Share2 className="mr-2 h-4 w-4" />
                        Export to Azure
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isDownloadDialogOpen} onOpenChange={setIsDownloadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <FileDown className="mr-2 h-4 w-4" />
                Download
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Download Test Case</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-sm text-muted-foreground">
                  Select the format in which you want to download this test case:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload('pdf')}
                    disabled={isDownloading}
                    className="justify-start"
                  >
                    PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload('excel')}
                    disabled={isDownloading}
                    className="justify-start"
                  >
                    Excel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload('word')}
                    disabled={isDownloading}
                    className="justify-start"
                  >
                    Word
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload('json')}
                    disabled={isDownloading}
                    className="justify-start"
                  >
                    JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload('text')}
                    disabled={isDownloading}
                    className="justify-start"
                  >
                    Text
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload('markdown')}
                    disabled={isDownloading}
                    className="justify-start"
                  >
                    Markdown
                  </Button>
                </div>
                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDownloadDialogOpen(false)}
                    disabled={isDownloading}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </>
  )
}