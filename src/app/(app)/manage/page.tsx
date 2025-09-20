"use client";

import Link from "next/link";
import { useTestCases } from "@/contexts/TestCasesContext";
import { TestCaseCard } from "@/components/TestCaseCard";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bot, FileWarning, Info, Copy, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { testCaseToMarkdown } from "@/lib/parsers";
import { useState } from "react";

// Performance optimizations
export const dynamic = 'force-dynamic';
// export const revalidate = 0; // Removed due to error

export default function ManagePage() {
  const { testCases, complianceReport } = useTestCases();
  const { toast } = useToast();
  const [isCopying, setIsCopying] = useState(false);

  if (testCases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-4 border-2 border-dashed rounded-lg">
        <FileWarning className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No Test Cases Found</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          You haven't generated or imported any test cases yet. Get started by letting our AI create them from your requirements.
        </p>
        <Button asChild>
          <Link href="/generate">
            <Bot className="mr-2 h-4 w-4" />
            Generate Test Cases
          </Link>
        </Button>
      </div>
    );
  }

  const copyAllTestCases = async () => {
    setIsCopying(true);
    try {
      const testCasesMarkdown = testCases.map(testCaseToMarkdown).join('\n---\n');
      await navigator.clipboard.writeText(testCasesMarkdown);
      toast({
        title: "Copied to clipboard",
        description: `All ${testCases.length} test cases have been copied to your clipboard.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Copy failed",
        description: "Failed to copy test cases to clipboard.",
      });
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-3xl font-bold">Generated Test Cases</h1>
        <Button onClick={copyAllTestCases} variant="outline" disabled={isCopying}>
          {isCopying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Copying...
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copy All Test Cases
            </>
          )}
        </Button>
      </div>

      {complianceReport && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Compliance Summary</AlertTitle>
          <AlertDescription className="line-clamp-3">
            {complianceReport}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {testCases.map((tc, index) => (
          <TestCaseCard key={tc.id} testCase={tc} index={index} />
        ))}
      </div>
    </div>
  );
}
