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
  const [showTextArea, setShowTextArea] = useState(true);
  const [fileName, setFileName] = useState<string | null>(null);
  const router = useRouter();
  const { setTestCases, setComplianceReport } = useTestCases();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      testCases: '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);

      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        form.setValue('testCases', content, { shouldValidate: true });
      };
      reader.onerror = () => {
        toast({
          variant: 'destructive',
          title: 'File Read Error',
          description: 'Could not read the selected file.',
        });
        setFileName(null);
        form.setValue('testCases', '', { shouldValidate: true });
      };
      reader.readAsText(file);
    }
  };

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
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Import Existing Test Cases</CardTitle>
          <CardDescription>
            Paste your existing test cases below. The tool will attempt to parse them into a structured format.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Alert className="mb-4 sm:mb-6">
                <FileUp className="h-4 w-4" />
                <AlertTitle>Formatting Tip</AlertTitle>
                <AlertDescription className="text-sm">
                    For best results, ensure your test cases are in a clear Markdown format, with distinct sections for Case ID, Title, Steps, etc.
                </AlertDescription>
            </Alert>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-4">
                <Button
                  variant={showTextArea ? "default" : "outline"}
                  type="button"
                  onClick={() => setShowTextArea(true)}
                  disabled={isLoading}
                  className="flex-1 min-w-[140px]"
                >
                  <FileUp className="mr-2 h-4 w-4" />
                  Paste Content
                </Button>
                <Button
                  variant={showTextArea ? "outline" : "default"}
                  type="button"
                  onClick={() => setShowTextArea(false)}
                  disabled={isLoading}
                  className="flex-1 min-w-[140px]"
                >
                  <FileUp className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
              </div>

              <FormField
                control={form.control}
                name="testCases"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Cases to Import</FormLabel>
                    <FormControl>
                      {showTextArea ? (
                        <Textarea
                          placeholder={`Paste your test cases here...

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
                          className="min-h-[200px] sm:min-h-[300px] resize-y text-sm"
                          {...field}
                        />
                      ) : (
                        <div className="relative">
                          <input
                            id="file-upload"
                            type="file"
                            accept=".txt,.md,.csv,.json"
                            className="hidden"
                            onChange={handleFileChange}
                            disabled={isLoading}
                          />
                          <label
                            htmlFor="file-upload"
                            className="flex flex-col items-center justify-center w-full h-32 sm:h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
                          >
                            <div className="flex flex-col items-center justify-center pt-3 sm:pt-5 pb-3 sm:pb-6 px-2">
                              <FileUp className="w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-3 text-muted-foreground" />
                              {fileName ? (
                                <p className="font-semibold text-primary text-sm sm:text-base truncate max-w-full">{fileName}</p>
                              ) : (
                                <>
                                  <p className="mb-1 sm:mb-2 text-xs sm:text-sm text-muted-foreground text-center">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                  </p>
                                  <p className="text-xs text-muted-foreground">TXT, MD, CSV, or JSON files</p>
                                </>
                              )}
                            </div>
                          </label>
                        </div>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} size="lg" className="w-full sm:w-auto">
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