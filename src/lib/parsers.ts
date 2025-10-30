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
    // Use a more flexible approach to extract all sections
    // First, let's match Case ID
    const caseIdMatch = block.match(/###\s*Case\s+ID:?\s*(.+)/i);
    
    // Find all sections with flexible spacing
    // Match **Title:** followed by any content until the next section or end
    const titleMatch = block.match(/\*\*Title:\*\*[ \t]*([^\0]*?)(?=\n\*\*(?:Description|Test Steps|Expected Results|Priority|Requirements Trace|Created|Updated|Version):\*\*|\n###|$)/i);
    // Match **Description:** followed by any content until next section
    const descriptionMatch = block.match(/\*\*Description:\*\*([^\0]*?)(?=\n\*\*(?:Test Steps|Expected Results|Priority|Requirements Trace|Created|Updated|Version):\*\*|\n###|$)/i);
    // Match **Test Steps:** section with flexible spacing
    const stepsMatch = block.match(/\*\*Test Steps:\*\*([^\0]*?)(?=\n\*\*(?:Expected Results|Priority|Requirements Trace|Created|Updated|Version):\*\*|\n###|$)/i);
    // Match **Expected Results:** section - capture multiple lines until next field
    const expectedResultsMatch = block.match(/\*\*Expected Results:\*\*([^\0]*?)(?=\n\*\*(?:Priority|Requirements Trace|Created|Updated|Version):\*\*|\n###|$)/i);
    // Match **Priority:** section
    const priorityMatch = block.match(/\*\*Priority:\*\*([^\0]*?)(?=\n\*\*(?:Requirements Trace|Created|Updated|Version):\*\*|\n###|$)/i);

    // If no Case ID, Title, or Test Steps found, this might not be a valid test case block
    if (!caseIdMatch && !titleMatch && !stepsMatch) {
      return; // Skip this block if it doesn't match the expected format
    }

    // Parse test steps more reliably
    let testSteps: string[] = [];
    if (stepsMatch && stepsMatch[1]) {
      // Split by newlines and extract steps that start with numbers
      const allLines = stepsMatch[1].split('\n');
      for (const line of allLines) {
        const trimmedLine = line.trim();
        // Check if the line starts with a number followed by a period
        if (/^\d+\.\s/.test(trimmedLine)) {
          const step = trimmedLine.replace(/^\d+\.\s*/, '').trim();
          if (step.length > 0 && 
              !step.includes('**Expected Results:**') && 
              !step.includes('**Priority:**') &&
              !step.includes('**Requirements Trace:**')) {
            testSteps.push(step);
          }
        }
      }
    }
    
    // Try to find requirements trace - updated to support multi-line if needed
    const requirementsTraceMatch = block.match(/\*\*Requirements Trace:\*\*([^\0]*?)(?=\n\*\*(?:Created|Updated|Version):\*\*|\n###|$)/i);
    let requirementsTrace = undefined;
    if (requirementsTraceMatch) {
      requirementsTrace = requirementsTraceMatch[1].trim();
      // Remove any remaining field markers that might have been captured in the content
      requirementsTrace = requirementsTrace.replace(/\*\*(?:Created|Updated|Version):\*\*.*$/i, '').trim();
    }

    // Only create a test case if we have content
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled Test Case';
    if (title.toLowerCase() === 'untitled test case' && testSteps.length === 0) {
      return; // Skip if it's an untitled case with no steps
    }

    // Clean up expected results by removing any potential field markers from within the content
    let expectedResults = '';
    if (expectedResultsMatch) {
      expectedResults = expectedResultsMatch[1].trim();
      // Remove any remaining field markers that might have been captured in the content
      expectedResults = expectedResults.replace(/\*\*(?:Priority|Requirements Trace|Created|Updated|Version):\*\*.*$/i, '').trim();
      
      // Additional cleanup: If expected results contain test case structure, extract just the content
      if (expectedResults.includes('### Case ID:') || expectedResults.includes('**Title:**') || expectedResults.includes('**Description:**')) {
        // This suggests the AI included multiple test cases in one, so we just take content before the next case ID
        const nextCaseIndex = expectedResults.indexOf('### Case ID:');
        if (nextCaseIndex !== -1) {
          expectedResults = expectedResults.substring(0, nextCaseIndex).trim();
        }
      }
    }
    
    // Clean up title if it contains test case structure
    let cleanedTitle = title;
    if (cleanedTitle.includes('### Case ID:') || cleanedTitle.includes('**Description:**')) {
      // If title contains other fields, take only the first part
      const descIndex = cleanedTitle.indexOf('**Description:**');
      if (descIndex !== -1) {
        cleanedTitle = cleanedTitle.substring(0, descIndex).trim();
      } else {
        const caseIdIndex = cleanedTitle.indexOf('### Case ID:');
        if (caseIdIndex !== -1) {
          cleanedTitle = cleanedTitle.substring(0, caseIdIndex).trim();
        }
      }
    }
    
    // Clean up description if it contains test case structure
    let description = descriptionMatch ? descriptionMatch[1].trim() : '';
    if (description.includes('### Case ID:') || description.includes('**Test Steps:**')) {
      // If description contains other fields, take only the first part
      const stepsIndex = description.indexOf('**Test Steps:**');
      if (stepsIndex !== -1) {
        description = description.substring(0, stepsIndex).trim();
      } else {
        const caseIdIndex = description.indexOf('### Case ID:');
        if (caseIdIndex !== -1) {
          description = description.substring(0, caseIdIndex).trim();
        }
      }
    }

    testCases.push({
      id: `tc-${Date.now()}-${index}`,
      caseId: caseIdMatch ? caseIdMatch[1].trim() : `TC-${String(index + 1).padStart(3, '0')}`,
      title: cleanedTitle,
      description: description,
      testSteps: testSteps,
      expectedResults: expectedResults,
      priority: priorityMatch ? priorityMatch[1].trim() : 'Medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      requirementsTrace,
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
**Requirements Trace:** ${testCase.requirementsTrace || 'N/A'}
**Created:** ${testCase.createdAt}
**Updated:** ${testCase.updatedAt}
**Version:** ${testCase.version}
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