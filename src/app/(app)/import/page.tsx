"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTestCases } from '@/contexts/TestCasesContext';
import { parseTestCasesMarkdown } from '@/lib/parsers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { FileUp, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  testCases: z.string().min(20, {
    message: 'Test cases must be at least 20 characters.',
  }),
});

export default function ImportPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setTestCases, setComplianceReport } = useTestCases();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      testCases: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    // Simulate a small delay for parsing
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      const parsedTestCases = parseTestCasesMarkdown(values.testCases);
      if (parsedTestCases.length === 0) {
        throw new Error("Could not find any valid test cases to import. Please check the format.");
      }
      
      setTestCases(parsedTestCases);
      setComplianceReport('Compliance status of imported tests is unknown. Run a compliance check for a full report.');

      toast({
        title: 'Import Successful',
        description: `${parsedTestCases.length} test cases have been imported.`,
      });

      router.push('/manage');
    } catch (error) {
      console.error('Failed to import test cases:', error);
      toast({
        variant: 'destructive',
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Import Existing Test Cases</CardTitle>
          <CardDescription>
            Paste your existing test cases below. The tool will attempt to parse them into a structured format.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Alert className="mb-6">
                <FileUp className="h-4 w-4" />
                <AlertTitle>Formatting Tip</AlertTitle>
                <AlertDescription>
                    For best results, ensure your test cases are in a clear Markdown format, with distinct sections for Case ID, Title, Steps, etc.
                </AlertDescription>
            </Alert>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="testCases"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Cases to Import</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste your test cases here..."
                        className="min-h-[300px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} size="lg">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <FileUp className="mr-2 h-5 w-5" />
                    Parse and Import
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
