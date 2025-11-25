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
  
  // Load data from localStorage on client-side only if no user is authenticated
  useEffect(() => {
    setIsClient(true);

    // Only load from localStorage if no user is logged in
    // This prevents loading test cases from another user's session
    if (!currentUser?.id) {
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
    }
  }, [currentUser?.id]); // Only run when currentUser changes

  // Load test cases from Firebase when user logs in
  useEffect(() => {
    const loadFromFirebase = async () => {
      if (isClient && currentUser?.id) {
        try {
          const result = await loadTestCasesFromFirebase(currentUser.id);
          if (result.success) {
            // If user has test cases in Firebase, use them
            if (result.testCases && result.testCases.length > 0) {
              // Remove duplicates from the loaded test cases
              const seen = new Set();
              const uniqueTestCases = result.testCases.filter((tc) => {
                const identifier = `${tc.id}-${tc.caseId}`;
                if (seen.has(identifier)) {
                  return false;
                }
                seen.add(identifier);
                return true;
              });

              setTestCases(uniqueTestCases);
              // Update localStorage with user's own test cases
              localStorage.setItem('testCases', JSON.stringify(uniqueTestCases));
            } else {
              // If user has no test cases in Firebase, clear any existing ones from localStorage
              // and ensure the state is empty for this user
              setTestCases([]);
              localStorage.removeItem('testCases');
            }
          } else {
            // If Firebase load fails, clear any potentially stale data
            setTestCases([]);
            localStorage.removeItem('testCases');
          }
        } catch (error) {
          console.error('Error loading from Firebase:', error);
          // Clear any potentially stale data if there's an error
          setTestCases([]);
          localStorage.removeItem('testCases');
        }
      }
    };

    loadFromFirebase();
  }, [currentUser?.id, isClient]);
  
  // Save to localStorage and Firebase whenever testCases or complianceReport change
  useEffect(() => {
    if (isClient) {
      // Remove duplicates before saving to ensure clean data
      let uniqueTestCases = testCases;
      if (testCases && testCases.length > 0) {
        const seen = new Set();
        uniqueTestCases = testCases.filter((tc) => {
          const identifier = `${tc.id}-${tc.caseId}`;
          if (seen.has(identifier)) {
            return false;
          }
          seen.add(identifier);
          return true;
        });

        // If we filtered out duplicates, update the state
        if (uniqueTestCases.length !== testCases.length) {
          setTestCases(uniqueTestCases);
          return; // Return early to avoid multiple updates in this effect
        }
      }

      // Always update localStorage with unique testCases
      if (uniqueTestCases.length > 0) {
        localStorage.setItem('testCases', JSON.stringify(uniqueTestCases));
      } else {
        localStorage.removeItem('testCases');
      }

      // Also save to Firebase if user is logged in and there are test cases to save
      if (currentUser?.id && uniqueTestCases.length > 0) {
        saveTestCasesToFirebase(uniqueTestCases, currentUser.id).then(result => {
          if (!result.success) {
            console.error('Failed to save test cases to Firebase:', result.message);
            // Don't show error to user for cloud saving failures, just log it
          }
        });
      } else if (currentUser?.id && uniqueTestCases.length === 0) {
        // If user is logged in but has no test cases, ensure they're cleared from Firebase too
        // (this handles the case where a user deletes all their test cases)
        // We could implement a function to clear all test cases for a user from Firebase
        // For now, we'll just ensure localStorage is cleared for this user
        localStorage.removeItem('testCases');
      }
    }
  }, [testCases, isClient, currentUser?.id]);
  
  useEffect(() => {
    if (isClient) {
      // Only save compliance report to localStorage if there's a current user
      // This ensures different users don't share compliance reports
      if (complianceReport && currentUser?.id) {
        localStorage.setItem('complianceReport', complianceReport);
      } else if (!currentUser?.id) {
        // If no user is logged in, remove compliance report from localStorage
        localStorage.removeItem('complianceReport');
      }
    }
  }, [complianceReport, isClient, currentUser?.id]);

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

        // Remove duplicates after update
        const seen = new Set();
        const uniqueTestCases = updatedTestCases.filter((tc) => {
          const identifier = `${tc.id}-${tc.caseId}`;
          if (seen.has(identifier)) {
            return false;
          }
          seen.add(identifier);
          return true;
        });

        return uniqueTestCases;
    });
  };

  const addFeedbackToTestCase = (testCaseId: string, feedback: string, category: 'accuracy' | 'compliance' | 'completeness' | 'relevance' | 'other') => {
    setTestCases(currentTestCases => {
      const updatedTestCases = currentTestCases.map(testCase => {
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

      // Remove duplicates after update
      const seen = new Set();
      const uniqueTestCases = updatedTestCases.filter((tc) => {
        const identifier = `${tc.id}-${tc.caseId}`;
        if (seen.has(identifier)) {
          return false;
        }
        seen.add(identifier);
        return true;
      });

      return uniqueTestCases;
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
