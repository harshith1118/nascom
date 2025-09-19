"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { type TestCase } from '@/lib/types';

interface TestCasesContextType {
  testCases: TestCase[];
  setTestCases: React.Dispatch<React.SetStateAction<TestCase[]>>;
  complianceReport: string;
  setComplianceReport: React.Dispatch<React.SetStateAction<string>>;
  updateTestCase: (index: number, newTestCase: TestCase) => void;
}

const TestCasesContext = createContext<TestCasesContextType | undefined>(undefined);

export const TestCasesProvider = ({ children }: { children: ReactNode }) => {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [complianceReport, setComplianceReport] = useState<string>('');

  const updateTestCase = (index: number, newTestCase: TestCase) => {
    setTestCases(currentTestCases => {
        const updatedTestCases = [...currentTestCases];
        updatedTestCases[index] = newTestCase;
        return updatedTestCases;
    });
  };

  return (
    <TestCasesContext.Provider value={{ testCases, setTestCases, complianceReport, setComplianceReport, updateTestCase }}>
      {children}
    </TestCasesContext.Provider>
  );
};

export const useTestCases = () => {
  const context = useContext(TestCasesContext);
  if (context === undefined) {
    throw new Error('useTestCases must be used within a TestCasesProvider');
  }
  return context;
};
