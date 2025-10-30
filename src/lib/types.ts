export type TestCase = {
  id: string;
  caseId: string;
  title: string;
  description: string;
  testSteps: string[];
  expectedResults: string;
  priority: 'High' | 'Medium' | 'Low' | string;
  createdAt: string;
  updatedAt: string;
  requirementsTrace?: string; // Traceability to original requirements
  version: number;
  feedback?: TestCaseFeedback[]; // Human feedback for improving AI
};

export interface TestCaseFeedback {
  id: string;
  feedback: string;
  timestamp: string;
  userId?: string; // Optional user identifier for enterprise use
  approved?: boolean; // Whether the feedback was approved by an expert
  category: 'accuracy' | 'compliance' | 'completeness' | 'relevance' | 'other'; // Type of feedback
}