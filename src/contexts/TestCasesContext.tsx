"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { type TestCase } from '@/lib/types';
import { useUser } from './UserContext'; // Import User context to get current user
import { saveTestCasesToFirebase, loadTestCasesFromFirebase } from '@/lib/firebase-testcases';

interface TestCasesContextType {
  testCases: TestCase[];
  setTestCases: React.Dispatch<React.SetStateAction<TestCase[]>>;
  complianceReport: string;
  setComplianceReport: React.Dispatch<React.SetStateAction<string>>;
  updateTestCase: (index: number, newTestCase: TestCase) => void;
  addFeedbackToTestCase: (testCaseId: string, feedback: string, category: 'accuracy' | 'compliance' | 'completeness' | 'relevance' | 'other') => void;
}

const TestCasesContext = createContext<TestCasesContextType | undefined>(undefined);

export const TestCasesProvider = ({ children }: { children: ReactNode }) => {
  const [isClient, setIsClient] = useState(false);
  const { currentUser } = useUser(); // Get current user from UserContext
  
  // Initialize from localStorage if available
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [complianceReport, setComplianceReport] = useState<string>('');
  
  // Load data from localStorage on client-side
  useEffect(() => {
    setIsClient(true);
    
    const savedTestCases = localStorage.getItem('testCases');
    const savedReport = localStorage.getItem('complianceReport');
    
    if (savedTestCases) {
      try {
        setTestCases(JSON.parse(savedTestCases));
      } catch (e) {
        console.error('Failed to parse saved test cases', e);
        setTestCases([]);
      }
    }
    
    if (savedReport) {
      setComplianceReport(savedReport);
    }
  }, []);
  
  // Load test cases from Firebase when user logs in
  useEffect(() => {
    const loadFromFirebase = async () => {
      if (isClient && currentUser?.id) {
        try {
          const result = await loadTestCasesFromFirebase(currentUser.id);
          if (result.success && result.testCases) {
            setTestCases(result.testCases);
            // Optionally update localStorage as well
            localStorage.setItem('testCases', JSON.stringify(result.testCases));
          }
        } catch (error) {
          console.error('Error loading from Firebase:', error);
        }
      }
    };
    
    loadFromFirebase();
  }, [currentUser?.id, isClient]);
  
  // Save to localStorage and Firebase whenever testCases or complianceReport change
  useEffect(() => {
    if (isClient && testCases.length > 0) {
      localStorage.setItem('testCases', JSON.stringify(testCases));
      
      // Also save to Firebase if user is logged in
      if (currentUser?.id) {
        saveTestCasesToFirebase(testCases, currentUser.id).then(result => {
          if (!result.success) {
            console.error('Failed to save test cases to Firebase:', result.message);
            // Don't show error to user for cloud saving failures, just log it
          }
        });
      }
    }
  }, [testCases, isClient, currentUser?.id]);
  
  useEffect(() => {
    if (isClient && complianceReport) {
      localStorage.setItem('complianceReport', complianceReport);
    }
  }, [complianceReport, isClient]);

  const updateTestCase = (index: number, newTestCase: TestCase) => {
    setTestCases(currentTestCases => {
        const updatedTestCases = [...currentTestCases];
        // Increment version and update timestamp when updating a test case
        const updatedTestCase = {
            ...newTestCase,
            version: (currentTestCases[index]?.version || 1) + 1,
            updatedAt: new Date().toISOString(),
        };
        updatedTestCases[index] = updatedTestCase;
        return updatedTestCases;
    });
  };

  const addFeedbackToTestCase = (testCaseId: string, feedback: string, category: 'accuracy' | 'compliance' | 'completeness' | 'relevance' | 'other') => {
    setTestCases(currentTestCases => {
      return currentTestCases.map(testCase => {
        if (testCase.id === testCaseId) {
          const feedbackEntry = {
            id: `feedback-${Date.now()}`,
            feedback,
            timestamp: new Date().toISOString(),
            category,
          };
          return {
            ...testCase,
            feedback: [...(testCase.feedback || []), feedbackEntry]
          };
        }
        return testCase;
      });
    });
  };

  return (
    <TestCasesContext.Provider value={{ testCases, setTestCases, complianceReport, setComplianceReport, updateTestCase, addFeedbackToTestCase }}>
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
