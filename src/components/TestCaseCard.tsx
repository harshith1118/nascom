"use client"

import { useState } from "react"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { type TestCase } from "@/lib/types"
import { testCaseToMarkdown, parseTestCasesMarkdown } from "@/lib/parsers"
import { useTestCases } from "@/contexts/TestCasesContext"
import { modifyTestCase as modifyTestCaseAction } from "@/app/(app)/manage/actions"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Bot, Loader2, Send, Share2, FileDown } from "lucide-react"

const modifyFormSchema = z.object({
  prompt: z.string().min(5, {
    message: "Prompt must be at least 5 characters.",
  }),
})

type TestCaseCardProps = {
  testCase: TestCase
  index: number
}

export function TestCaseCard({ testCase, index }: TestCaseCardProps) {
  const { toast } = useToast()
  const { updateTestCase } = useTestCases()
  const [isModifyDialogOpen, setModifyDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof modifyFormSchema>>({
    resolver: zodResolver(modifyFormSchema),
    defaultValues: { prompt: "" },
  })

  const handleExport = (tool: string) => {
    toast({
      title: `Exporting to ${tool}`,
      description: `Your test case "${testCase.title}" is being prepared for export. (This is a demo feature)`,
    })
  }

  async function onModifySubmit(values: z.infer<typeof modifyFormSchema>) {
    setIsSubmitting(true)
    try {
        const originalMarkdown = testCaseToMarkdown(testCase);
        const result = await modifyTestCaseAction({ testCase: originalMarkdown, prompt: values.prompt });
        
        const parsedResult = parseTestCasesMarkdown(result);
        if (parsedResult.length > 0) {
            updateTestCase(index, parsedResult[0]);
            toast({
                title: "Test Case Updated",
                description: "The AI has successfully modified the test case.",
            });
            setModifyDialogOpen(false);
            form.reset();
        } else {
            throw new Error("AI returned an invalid format.");
        }
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Modification Failed",
            description: error instanceof Error ? error.message : "Could not update the test case.",
        });
    } finally {
        setIsSubmitting(false);
    }
  }

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
          <Button variant="outline" size="sm" onClick={() => setModifyDialogOpen(true)}>
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

      <Dialog open={isModifyDialogOpen} onOpenChange={setModifyDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modify Test Case with AI</DialogTitle>
            <DialogDescription>
              Use natural language to ask the AI to modify this test case. For example, "add a step to verify the error message".
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onModifySubmit)} className="space-y-4 pt-4">
                <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Modification Prompt</FormLabel>
                    <FormControl>
                        <Input placeholder="Your instructions for the AI..." {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                        </>
                    ) : (
                        <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit
                        </>
                    )}
                    </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
