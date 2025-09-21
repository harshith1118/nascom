import { type TestCase } from '@/lib/types';

export function parseTestCasesMarkdown(markdown: string): TestCase[] {
  if (!markdown || typeof markdown !== 'string') {
    return [];
  }

  // Handle case where markdown might include the compliance note
  const complianceIndex = markdown.indexOf('Compliance Note:');
  const testCasesContent = complianceIndex !== -1 ? markdown.substring(0, complianceIndex) : markdown;

  const testCaseBlocks = testCasesContent.split(/\n---\n/).filter(block => block.trim() !== '');

  return testCaseBlocks.map((block, index) => {
    const caseIdMatch = block.match(/### Case ID:\s*(.*)/);
    const titleMatch = block.match(/\*\*Title:\*\*\s*(.*)/);
    const descriptionMatch = block.match(/\*\*Description:\*\*\s*(.*)/);
    const stepsBlockMatch = block.match(/\*\*Test Steps:\*\*\n([\s\S]*?)(?=\n\*\*Expected Results:\*\*|$)/);
    const expectedResultsMatch = block.match(/\*\*Expected Results:\*\*\s*(.*)/);
    const priorityMatch = block.match(/\*\*Priority:\*\*\s*(.*)/);

    const testSteps = stepsBlockMatch
      ? stepsBlockMatch[1]
          .trim()
          .split('\n')
          .map(step => step.replace(/^\d+\.\s*/, '').trim())
          .filter(step => step)
      : [];

    return {
      id: `tc-${Date.now()}-${index}`,
      caseId: caseIdMatch ? caseIdMatch[1].trim() : `TC-${String(index + 1).padStart(3, '0')}`,
      title: titleMatch ? titleMatch[1].trim() : 'Untitled Test Case',
      description: descriptionMatch ? descriptionMatch[1].trim() : '',
      testSteps: testSteps,
      expectedResults: expectedResultsMatch ? expectedResultsMatch[1].trim() : '',
      priority: priorityMatch ? priorityMatch[1].trim() : 'Medium',
    };
  });
}

export function testCaseToMarkdown(testCase: TestCase): string {
    return `### Case ID: ${testCase.caseId}
**Title:** ${testCase.title}
**Description:** ${testCase.description}
**Test Steps:**
${testCase.testSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}
**Expected Results:** ${testCase.expectedResults}
**Priority:** ${testCase.priority}
`;
}
