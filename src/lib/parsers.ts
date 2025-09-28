import { type TestCase } from './types';

export function parseTestCasesMarkdown(markdown: string): TestCase[] {
  if (!markdown || typeof markdown !== 'string') {
    return [];
  }

  // Handle case where markdown might include the compliance note
  const complianceIndex = markdown.indexOf('Compliance Note:');
  const testCasesContent = complianceIndex !== -1 ? markdown.substring(0, complianceIndex) : markdown;

  // Split by --- separator but be more flexible with whitespace
  const testCaseBlocks = testCasesContent
    .split(/\n\s*---+\s*\n/)
    .filter(block => block.trim() !== '');

  const testCases: TestCase[] = [];

  testCaseBlocks.forEach((block, index) => {
    // Extract each section using more reliable regex patterns
    const caseIdMatch = block.match(/###\s*Case ID:\s*(.+)/i);
    const titleMatch = block.match(/\*\*Title:\*\*\s*(.+)/i);
    const descriptionMatch = block.match(/\*\*Description:\*\*\s*(.+)/i);
    
    // Extract test steps section with better boundary detection
    const stepsMatch = block.match(/\*\*Test Steps:\*\*([\s\S]*?)(?=\n\*\*Expected Results:\*\*|\n\*\*Priority:\*\*|\n###|$)/i);
    const expectedResultsMatch = block.match(/\*\*Expected Results:\*\*\s*(.+)/i);
    const priorityMatch = block.match(/\*\*Priority:\*\*\s*(.+)/i);

    // If no Case ID, Title, or Test Steps found, this might not be a valid test case block
    if (!caseIdMatch && !titleMatch && !stepsMatch) {
      return; // Skip this block if it doesn't match the expected format
    }

    // Parse test steps more reliably
    let testSteps: string[] = [];
    if (stepsMatch && stepsMatch[1]) {
      testSteps = stepsMatch[1]
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(step => step.length > 0);
    }

    // Only create a test case if we have a title or at least some content
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled Test Case';
    if (title.toLowerCase() === 'untitled test case' && testSteps.length === 0) {
      return; // Skip if it's an untitled case with no steps
    }

    testCases.push({
      id: `tc-${Date.now()}-${index}`,
      caseId: caseIdMatch ? caseIdMatch[1].trim() : `TC-${String(index + 1).padStart(3, '0')}`,
      title: title,
      description: descriptionMatch ? descriptionMatch[1].trim() : '',
      testSteps: testSteps,
      expectedResults: expectedResultsMatch ? expectedResultsMatch[1].trim() : '',
      priority: priorityMatch ? priorityMatch[1].trim() : 'Medium',
    });
  });

  return testCases;
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

// Enhanced function to parse requirements and convert them to test cases
export function parseRequirementsToTestCases(requirements: string): TestCase[] {
  if (!requirements || typeof requirements !== 'string') {
    return [];
  }
  
  // This would be a more complex implementation that converts requirements to test cases
  // For now, we'll just return an empty array as this would require AI processing
  return [];
}