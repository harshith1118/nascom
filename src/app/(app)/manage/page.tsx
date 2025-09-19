"use client";

import Link from "next/link";
import { useTestCases } from "@/contexts/TestCasesContext";
import { TestCaseCard } from "@/components/TestCaseCard";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bot, FileWarning, Info } from "lucide-react";

export default function ManagePage() {
  const { testCases, complianceReport } = useTestCases();

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

  return (
    <div className="space-y-6">
      {complianceReport && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Compliance Summary</AlertTitle>
          <AlertDescription>
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
