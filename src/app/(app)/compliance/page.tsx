"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { checkCompliance } from './actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, Loader2, FileText } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  testCases: z.string().min(20, {
    message: 'Test cases must be at least 20 characters.',
  }),
  standards: z.string().min(3, {
    message: 'Please specify at least one compliance standard.',
  }),
});

export default function CompliancePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      testCases: '',
      standards: 'FDA, ISO 13485, GDPR',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setReport(null);
    try {
      const result = await checkCompliance({
        testCases: values.testCases,
        standards: values.standards.split(',').map(s => s.trim()),
      });

      if (!result || !result.report) {
        throw new Error("The AI failed to generate a compliance report. Please try again.");
      }

      setReport(result.report);
      toast({
        title: 'Compliance Check Complete',
        description: 'The compliance report has been generated below.',
      });
    } catch (error) {
      console.error('Failed to check compliance:', error);
      let errorMessage = 'An unknown error occurred.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        variant: 'destructive',
        title: 'Check Failed',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Compliance Check</CardTitle>
          <CardDescription>
            Paste your test cases and specify the standards to check against. The AI will generate a compliance report.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="testCases"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Cases</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={`Paste your test cases here in Markdown or plain text...

Example format:
### Case ID: TC-001
**Title:** User Login Functionality
**Description:** Verify users can log in with valid credentials
**Test Steps:**
1. Navigate to login page
2. Enter valid username and password
3. Click login button
**Expected Results:** User is successfully logged in
**Priority:** High`}
                        className="min-h-[250px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="standards"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Healthcare Standards</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., FDA, ISO 13485, GDPR" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} size="lg">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 h-5 w-5" />
                    Check Compliance
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {isLoading && (
         <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Generating Report</AlertTitle>
            <AlertDescription>
                The AI is analyzing your test cases. This may take a moment.
            </AlertDescription>
        </Alert>
      )}

      {report && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Compliance Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line rounded-md border bg-muted/50 p-4">
                {report}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
