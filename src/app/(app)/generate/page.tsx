"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTestCases } from '@/contexts/TestCasesContext';
import { generateTests } from './actions';
import { parseTestCasesMarkdown } from '@/lib/parsers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Bot, Loader2 } from 'lucide-react';

const formSchema = z.object({
  requirements: z.string().min(50, {
    message: 'Product requirements must be at least 50 characters.',
  }),
});

export default function GeneratePage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setTestCases, setComplianceReport } = useTestCases();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      requirements: '',
    },
  });

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
          Paste your Product Requirement Document (PRD), specifications, or user stories below. 
          The AI will analyze the text and generate a comprehensive set of test cases.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Software Requirements</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., The system shall allow a clinician to log in using their username and password. Upon successful login, the system shall display the main dashboard..."
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
