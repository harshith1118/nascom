"use client";

import { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTestCases } from '@/contexts/TestCasesContext';
import { generateTests } from './actions';
import { parseTestCasesMarkdown } from '@/lib/parsers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Bot, Loader2, UploadCloud, Clipboard, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Performance optimizations
export const dynamic = 'force-dynamic';
// export const revalidate = 0; // Removed due to error

const formSchema = z.object({
  requirements: z.string().min(50, {
    message: 'Product requirements must be at least 50 characters long.',
  }),
});

export default function GeneratePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [showTextArea, setShowTextArea] = useState(false);
  const [includeCodeContext, setIncludeCodeContext] = useState(false);
  const [codeContext, setCodeContext] = useState('');
  const [codeFileName, setCodeFileName] = useState<string | null>(null);
  const router = useRouter();
  const { setTestCases, setComplianceReport } = useTestCases();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      requirements: '',
    },
  });

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);

      try {
        // Process the file based on its type
        const content = await import('@/lib/file-processor').then(
          ({ processFile }) => processFile(file)
        );

        form.setValue('requirements', content, { shouldValidate: true });
      } catch (error) {
        console.error('File processing error:', error);
        toast({
          variant: 'destructive',
          title: 'File Processing Error',
          description: error instanceof Error ? error.message : 'Could not process the selected file.',
        });
        setFileName(null);
        form.setValue('requirements', '', { shouldValidate: true });
      }
    }
  };

  const handlePasteRequirements = () => {
    setShowTextArea(true);
    // Focus the textarea after it renders
    setTimeout(() => {
      const textarea = document.getElementById('requirements-textarea');
      if (textarea) {
        textarea.focus();
      }
    }, 100);
  };

  const copyToClipboard = async () => {
    const requirements = form.getValues('requirements');
    if (requirements) {
      try {
        await navigator.clipboard.writeText(requirements);
        toast({
          title: 'Copied to clipboard',
          description: 'Requirements have been copied to your clipboard.',
        });
      } catch (err) {
        toast({
          variant: 'destructive',
          title: 'Copy failed',
          description: 'Failed to copy requirements to clipboard.',
        });
      }
    }
  };

  const handleCodeFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCodeFileName(file.name);

      try {
        // Process the code file
        const content = await import('@/lib/file-processor').then(
          ({ processFile }) => processFile(file)
        );

        setCodeContext(content);
        toast({
          title: 'Code file loaded',
          description: `Loaded: ${file.name}`,
        });
      } catch (error) {
        console.error('Code file processing error:', error);
        toast({
          variant: 'destructive',
          title: 'Code File Processing Error',
          description: error instanceof Error ? error.message : 'Could not process the selected code file.',
        });
        setCodeFileName(null);
        setCodeContext('');
      }
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // Show immediate feedback
      toast({
        title: 'Generating Test Cases',
        description: 'AI is analyzing your requirements. This may take 10-30 seconds...',
      });

      // Validate that the requirements are meaningful before sending to AI
      // This is an additional validation layer on the client side for better UX
      // The server side validation is the primary protection
      if (!values.requirements || values.requirements.trim().length < 50) {
        throw new Error('Requirements must be at least 50 characters long and contain meaningful content.');
      }

      const generateInput = {
        productRequirementDocument: values.requirements,
        sourceCodeContext: includeCodeContext ? codeContext : undefined,
        requirementsTrace: (() => {
          // Analyze requirements for compliance and business context
          const reqText = values.requirements.toLowerCase();

          // Identify relevant compliance and business elements
          const elements = [];

          // Look for compliance standards
          if (reqText.includes('hipaa')) elements.push('HIPAA');
          if (reqText.includes('gdpr')) elements.push('GDPR');
          if (reqText.includes('fda')) elements.push('FDA');
          if (reqText.includes('nist')) elements.push('NIST');
          if (reqText.includes('iso')) elements.push('ISO');

          // Look for business considerations
          if (reqText.includes('roi') || reqText.includes('cost') || reqText.includes('financial')) elements.push('ROI/Business');
          if (reqText.includes('privacy') || reqText.includes('security') || reqText.includes('data protection')) elements.push('Privacy');
          if (reqText.includes('ehr') || reqText.includes('electronic health')) elements.push('EHR');
          if (reqText.includes('accuracy')) elements.push('Accuracy');

          // If we found compliance elements, return those
          if (elements.length > 0) {
            return elements.join(', ');
          } else {
            // Fallback to extracting a meaningful short description from the first line
            const lines = values.requirements.split('\n').filter(line => line.trim() !== '');
            if (lines.length > 0) {
              // Get the first non-empty, meaningful line as the trace (up to 100 chars)
              const firstLine = lines[0].trim();
              return firstLine.substring(0, 100) + (firstLine.length > 100 ? '...' : '');
            }
            return 'General Requirements';
          }
        })() // Create a requirements trace with relevant compliance/business elements
      };

      const result = await generateTests(generateInput);

      if (!result) {
        throw new Error("The AI service returned an empty response. Please try again.");
      }

      if (!result.testCases || result.testCases.trim() === "") {
        throw new Error("The AI failed to generate test cases. Please try again or refine your requirements to be more specific.");
      }

      // Check for error messages in the response
      if (result.testCases.includes("Error:") || result.testCases.includes("Could not parse")) {
        throw new Error("The AI encountered an error while generating test cases. Please try again with different requirements.");
      }

      const parsedTestCases = parseTestCasesMarkdown(result.testCases);

      // Validate that we got test cases
      if (parsedTestCases.length === 0) {
        throw new Error("The AI response could not be parsed into test cases. Please try again or check your requirements format.");
      }

      setTestCases(parsedTestCases);
      setComplianceReport(result.complianceReport || "No compliance information provided.");

      toast({
        title: 'Generation Complete',
        description: `${parsedTestCases.length} test cases have been generated.`,
      });

      router.push('/manage');
    } catch (error) {
      console.error('Failed to generate test cases:', error);

      // Handle timeout errors specifically
      if (error instanceof Error && error.message.includes('timed out')) {
        toast({
          variant: 'destructive',
          title: 'Request Timeout',
          description: 'The AI request took too long to process. This may happen with complex requirements. Please try again with simpler requirements or try again later.',
        });
      } else if (error instanceof Error && error.message.includes('GOOGLE_API_KEY')) {
        toast({
          variant: 'destructive',
          title: 'API Configuration Error',
          description: 'Missing or invalid Google API key. Please set GOOGLE_API_KEY in your environment variables for proper test case generation.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Generation Failed',
          description: error instanceof Error ? error.message : 'An unknown error occurred. Please try again.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Generate Test Cases from Requirements</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Upload your Product Requirement Document (PRD), specifications, or user stories below.
          The AI will analyze the text and generate a comprehensive set of test cases.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4 sm:mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Performance Note</AlertTitle>
          <AlertDescription className="text-sm">
            AI processing may take 10-30 seconds. Please be patient after clicking "Generate Test Cases".
          </AlertDescription>
        </Alert>

        <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-4">
          <Button
            variant={showTextArea ? "outline" : "default"}
            onClick={() => setShowTextArea(false)}
            disabled={isLoading}
            className="flex-1 min-w-[140px]"
          >
            <UploadCloud className="mr-2 h-4 w-4" />
            Upload File
          </Button>
          <Button
            variant={showTextArea ? "default" : "outline"}
            onClick={handlePasteRequirements}
            disabled={isLoading}
            className="flex-1 min-w-[140px]"
          >
            <Clipboard className="mr-2 h-4 w-4" />
            Paste Requirements
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
            <FormField
              control={form.control}
              name="requirements"
              render={() => (
                <FormItem>
                  <FormLabel>Software Requirements Document</FormLabel>
                  <FormControl>
                    {!showTextArea ? (
                      <div className="relative">
                        <Input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          accept=".pdf,.md,.txt,.doc,.docx,.xml"
                          onChange={handleFileChange}
                          disabled={isLoading}
                        />
                        <label
                          htmlFor="file-upload"
                          className="flex flex-col items-center justify-center w-full h-32 sm:h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
                        >
                          <div className="flex flex-col items-center justify-center pt-3 sm:pt-5 pb-3 sm:pb-6 px-2">
                            <UploadCloud className="w-8 h-8 sm:w-10 h-10 mb-2 sm:mb-3 text-muted-foreground" />
                            {fileName ? (
                              <p className="font-semibold text-primary text-sm sm:text-base truncate max-w-full">{fileName}</p>
                            ) : (
                              <>
                                <p className="mb-1 sm:mb-2 text-xs sm:text-sm text-muted-foreground">
                                  <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground">PDF, DOC, DOCX, MD, TXT, or XML files</p>
                              </>
                            )}
                          </div>
                        </label>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Textarea
                          id="requirements-textarea"
                          placeholder={`Paste your requirements here...

Example requirements:
As a healthcare professional, I want to log in securely to access patient information.

The system should validate user credentials against a secure database.

The login session should expire after 30 minutes of inactivity.

All login attempts should be logged for security auditing.`}
                          className="min-h-[200px] sm:min-h-[300px] resize-y text-sm"
                          {...form.register('requirements')}
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={copyToClipboard}
                          disabled={!form.getValues('requirements')}
                          className="w-full sm:w-auto"
                        >
                          <Clipboard className="mr-2 h-4 w-4" />
                          Copy to Clipboard
                        </Button>
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Code Context Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="include-code-context"
                  checked={includeCodeContext}
                  onChange={(e) => setIncludeCodeContext(e.target.checked)}
                  disabled={isLoading}
                />
                <label htmlFor="include-code-context" className="text-sm font-medium">
                  Include Source Code Context
                </label>
              </div>

              {includeCodeContext && (
                <div className="border rounded-lg p-3 sm:p-4 bg-muted/20">
                  <h4 className="font-medium mb-2 text-sm sm:text-base">Upload Source Code Files</h4>
                  <div className="relative">
                    <Input
                      id="code-upload"
                      type="file"
                      className="hidden"
                      accept=".ts,.tsx,.js,.jsx,.py,.java,.cpp,.c,.h,.cs,.go,.rs,.rb,.php,.sql,.html,.css,.json,.xml"
                      onChange={handleCodeFileChange}
                      disabled={isLoading}
                    />
                    <label
                      htmlFor="code-upload"
                      className="flex flex-col items-center justify-center w-full h-24 sm:h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
                    >
                      <div className="flex flex-col items-center justify-center pt-3 sm:pt-5 pb-3 sm:pb-6 px-2">
                        <UploadCloud className="w-6 h-6 sm:w-8 h-8 mb-1 sm:mb-2 text-muted-foreground" />
                        {codeFileName ? (
                          <p className="font-semibold text-primary text-xs sm:text-sm truncate max-w-full">{codeFileName}</p>
                        ) : (
                          <>
                            <p className="mb-1 text-xs sm:text-sm text-muted-foreground">
                              <span className="font-semibold">Click to upload</span> source code
                            </p>
                            <p className="text-xs text-muted-foreground">Supported: TS, JS, PY, Java, C++, C#, Go, Ruby, PHP, SQL, HTML, CSS</p>
                          </>
                        )}
                      </div>
                    </label>
                    {codeContext && (
                      <div className="mt-2 p-2 bg-muted rounded text-xs max-h-20 sm:max-h-32 overflow-y-auto">
                        {codeContext.substring(0, 200)}...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" disabled={isLoading || !form.formState.isValid} size="lg" className="w-full sm:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating... (May take 10-30 seconds)
                </>
              ) : (
                <>
                  <Bot className="mr-2 h-5 w-5" />
                  Generate Test Cases
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}