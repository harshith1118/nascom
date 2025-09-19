export type TestCase = {
  id: string;
  caseId: string;
  title: string;
  description: string;
  testSteps: string[];
  expectedResults: string;
  priority: 'High' | 'Medium' | 'Low' | string;
};
