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
import { Bot, Loader2, UploadCloud } from 'lucide-react';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  requirements: z.string().min(50, {
    message: 'Product requirements must be at least 50 characters long.',
  }),
});

export default function GeneratePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const result = await generateTests({ productRequirementDocument: values.requirements });
      
      if (!result.testCases) {
          throw new Error("The AI failed to generate test cases. Please try again or refine your requirements.");
      }
      
      const parsedTestCases = parseTestCasesMarkdown(result.testCases);
      setTestCases(parsedTestCases);
      setComplianceReport(result.complianceReport);

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
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="requirements"
              render={() => (
                <FormItem>
                  <FormLabel>Software Requirements Document</FormLabel>
                  <FormControl>
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
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading || !form.formState.isValid} size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Bot className="mr-2 h-5 w-5" />
                  Generate with AI
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
