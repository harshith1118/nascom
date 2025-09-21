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
  const router = useRouter();
  const { setTestCases, setComplianceReport } = useTestCases();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      requirements: '',
    },
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        form.setValue('requirements', text, { shouldValidate: true });
      };
      reader.onerror = () => {
        toast({
          variant: 'destructive',
          title: 'File Read Error',
          description: 'Could not read the selected file.',
        });
        setFileName(null);
        form.setValue('requirements', '', { shouldValidate: true });
      };
      reader.readAsText(file);
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // Show immediate feedback
      toast({
        title: 'Generating Test Cases',
        description: 'AI is analyzing your requirements. This may take 10-30 seconds...',
      });
      
      const result = await generateTests({ productRequirementDocument: values.requirements });
      
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
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Test Cases from Requirements</CardTitle>
        <CardDescription>
          Upload your Product Requirement Document (PRD), specifications, or user stories below. 
          The AI will analyze the text and generate a comprehensive set of test cases.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Performance Note</AlertTitle>
          <AlertDescription>
            AI processing may take 10-30 seconds. Please be patient after clicking "Generate Test Cases".
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Button 
            variant={showTextArea ? "outline" : "default"} 
            onClick={() => setShowTextArea(false)}
            disabled={isLoading}
          >
            <UploadCloud className="mr-2 h-4 w-4" />
            Upload File
          </Button>
          <Button 
            variant={showTextArea ? "default" : "outline"} 
            onClick={handlePasteRequirements}
            disabled={isLoading}
          >
            <Clipboard className="mr-2 h-4 w-4" />
            Paste Requirements
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                          accept=".pdf,.md,.txt"
                          onChange={handleFileChange}
                          disabled={isLoading}
                        />
                        <label
                          htmlFor="file-upload"
                          className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                            {fileName ? (
                              <p className="font-semibold text-primary">{fileName}</p>
                            ) : (
                              <>
                                <p className="mb-2 text-sm text-muted-foreground">
                                  <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground">PDF, MD, or TXT files</p>
                              </>
                            )}
                          </div>
                        </label>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Textarea
                          id="requirements-textarea"
                          placeholder="Paste your requirements here..."
                          className="min-h-[300px] resize-y"
                          {...form.register('requirements')}
                          disabled={isLoading}
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={copyToClipboard}
                          disabled={!form.getValues('requirements')}
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
            <Button type="submit" disabled={isLoading || !form.formState.isValid} size="lg">
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
