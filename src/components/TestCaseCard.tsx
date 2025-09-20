"use client"

import { useState } from "react"
import { useTestCases } from "@/contexts/TestCasesContext"
import { testCaseToMarkdown } from "@/lib/parsers"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Bot, Copy, Share2, FileDown, AlertCircle } from "lucide-react"
import { type TestCase } from "@/lib/types"

type TestCaseCardProps = {
  testCase: TestCase
  index: number
}

export function TestCaseCard({ testCase, index }: TestCaseCardProps) {
  const { toast } = useToast()
  const { updateTestCase } = useTestCases()

  const handleExport = (tool: string) => {
    toast({
      title: `Export to ${tool} - Temporarily Suspended`,
      description: `Export functionality to ${tool} is temporarily suspended for demo purposes. This feature will be available in the full version.`,
    })
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

  const handleModifyWithAI = () => {
    toast({
      title: "Modify with AI - Demo Limitation",
      description: "AI modification functionality is temporarily suspended for demo purposes. This feature will be available in the full version.",
    });
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
          <Button variant="outline" size="sm" onClick={handleModifyWithAI}>
            <Bot className="mr-2 h-4 w-4" />
            Modify with AI
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("Jira")}>
            <Share2 className="mr-2 h-4 w-4" />
            Export to Jira
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("Azure DevOps")}>
            <Share2 className="mr-2 h-4 w-4" />
            Export to Azure
          </Button>
           <Button variant="ghost" size="sm" onClick={() => handleExport("PDF")}>
            <FileDown className="mr-2 h-4 w-4" />
            Download
          </Button>
        </CardFooter>
      </Card>

      {/* Dialog removed for demo purposes */}
    </>
  )
}
