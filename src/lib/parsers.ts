import { type TestCase } from './types';

export function parseTestCasesMarkdown(markdown: string): TestCase[] {
  if (!markdown || typeof markdown !== 'string') {
    return [];
  }

  // Handle case where markdown might include the compliance note
  const complianceIndex = markdown.indexOf('Compliance Note:');
  const testCasesContent = complianceIndex !== -1 ? markdown.substring(0, complianceIndex) : markdown;

  // Split by --- separator but be more flexible with whitespace
  // Also try other common separators
  let testCaseBlocks: string[] = [];
  
  // Try different separators to split test cases
  testCaseBlocks = testCasesContent
    .split(/\n\s*---+\s*\n/)  // Standard separator
    .filter(block => block.trim() !== '');
  
  // If we still don't have any blocks, try alternative separators
  if (testCaseBlocks.length <= 1) {
    testCaseBlocks = testCasesContent
      .split(/\n\s*---\s*\n|\n\s*\*\*\*\*\*\s*\n|\n\s*=======\s*\n/)  // More separators
      .filter(block => block.trim() !== '');
  }
  
  // If we still don't have any blocks, try splitting by different patterns
  if (testCaseBlocks.length <= 1) {
    const sections = testCasesContent
      .split(/(?:\n\s*\n)+/)  // Split by double newlines
      .filter(s => s.trim() !== '');
    
    // Group sections that seem to be part of the same test case
    testCaseBlocks = [];
    let currentBlock = '';
    for (const section of sections) {
      if (section.includes('#') || section.includes('Title') || section.includes('Test') || section.includes('Step')) {
        if (currentBlock) {
          testCaseBlocks.push(currentBlock);
        }
        currentBlock = section;
      } else {
        currentBlock += '\n' + section;
      }
    }
    if (currentBlock) {
      testCaseBlocks.push(currentBlock);
    }
  }

  const testCases: TestCase[] = [];

  testCaseBlocks.forEach((block, index) => {
    // Use a more flexible approach to extract all sections
    
    // Try different formats for Case ID
    let caseIdMatch = block.match(/###\s*Case\s+ID:?\s*(.+)/i);
    if (!caseIdMatch) caseIdMatch = block.match(/Case\s+ID:?\s*(.+)/i);
    if (!caseIdMatch) caseIdMatch = block.match(/ID:?\s*(.+)/i);
    
    // Try different formats for title
    let titleMatch = block.match(/\*\*Title:\*\*[ \t]*([^\0]*?)(?=\n\*\*(?:Description|Test Steps|Expected Results|Priority|Requirements Trace|Created|Updated|Version):\*\*|\n###|$)/i);
    if (!titleMatch) titleMatch = block.match(/(?:^|\n)Title:?\s*(.*?)(?=\n(?:Description|Steps|Test Steps|Expected|Priority)|$)/i);
    if (!titleMatch) titleMatch = block.match(/(?:^|\n).*?(\w.*?)(?=\n(?:Description|Steps|Test Steps|Expected|Priority)|$)/i);
    
    // Try different formats for description
    let descriptionMatch = block.match(/\*\*Description:\*\*([^\0]*?)(?=\n\*\*(?:Test Steps|Expected Results|Priority|Requirements Trace|Created|Updated|Version):\*\*|\n###|$)/i);
    if (!descriptionMatch) descriptionMatch = block.match(/(?:^|\n)Description:?\s*(.*?)(?=\n(?:Test Steps|Steps|Expected|Priority)|$)/i);
    if (!descriptionMatch) descriptionMatch = block.match(/(?:^|\n)Desc:?\s*(.*?)(?=\n(?:Test Steps|Steps|Expected|Priority)|$)/i);
    
    // Try different formats for test steps
    let stepsMatch = block.match(/\*\*Test Steps:\*\*([^\0]*?)(?=\n\*\*(?:Expected Results|Priority|Requirements Trace|Created|Updated|Version):\*\*|\n###|$)/i);
    if (!stepsMatch) stepsMatch = block.match(/(?:^|\n)Test Steps:?\s*([^\0]*?)(?=\n(?:Expected Results|Expected|Priority)|$)/i);
    if (!stepsMatch) stepsMatch = block.match(/(?:^|\n)Steps:?\s*([^\0]*?)(?=\n(?:Expected Results|Expected|Priority)|$)/i);
    if (!stepsMatch) stepsMatch = block.match(/(?:^|\n)(?:\d+\.|\*|\-) .*?(?=\n(?:Expected|Priority|Title|Case ID)|\n\s*\n|$)/s);

    // Try different formats for expected results
    let expectedResultsMatch = block.match(/\*\*Expected Results:\*\*([^\0]*?)(?=\n\*\*(?:Priority|Requirements Trace|Created|Updated|Version):\*\*|\n###|$)/i);
    if (!expectedResultsMatch) expectedResultsMatch = block.match(/(?:^|\n)Expected Results:?\s*(.*?)(?=\n(?:Priority|Requirements Trace|Created|Updated|Version|Title|Case ID)|$)/i);
    if (!expectedResultsMatch) expectedResultsMatch = block.match(/(?:^|\n)Expected:?\s*(.*?)(?=\n(?:Priority|Requirements Trace|Created|Updated|Version|Title|Case ID)|$)/i);
    
    // Try different formats for priority
    let priorityMatch = block.match(/\*\*Priority:\*\*([^\0]*?)(?=\n\*\*(?:Requirements Trace|Created|Updated|Version):\*\*|\n###|$)/i);
    if (!priorityMatch) priorityMatch = block.match(/(?:^|\n)Priority:?\s*(.*?)(?=\n(?:Requirements Trace|Created|Updated|Version|Title|Case ID)|$)/i);

    // Parse test steps more flexibly
    let testSteps: string[] = [];
    if (stepsMatch && stepsMatch[1]) {
      // Split by newlines and extract steps that start with numbers, bullets, or hyphens
      const allLines = stepsMatch[1].split('\n');
      for (const line of allLines) {
        const trimmedLine = line.trim();
        // Check if the line starts with a number followed by a period, bullet, or hyphen
        if (/^(?:\d+\.\s*|\*\s*|-\s*)/.test(trimmedLine)) {
          // Extract the actual step content by removing the prefix
          let step = trimmedLine.replace(/^(?:\d+\.\s*|\*\s*|-\s*)/, '').trim();
          if (step.length > 0 && 
              !step.includes('Expected Results') && 
              !step.includes('Priority') &&
              !step.includes('Requirements') &&
              !step.toLowerCase().includes('title') &&
              !step.toLowerCase().includes('description')) {
            testSteps.push(step);
          }
        }
      }
    }
    
    // If we still don't have steps from the structured format, try to find them as numbered/bulleted lines
    if (testSteps.length === 0) {
      const allLines = block.split('\n');
      let inStepsSection = false;
      for (const line of allLines) {
        const trimmedLine = line.trim();
        // Check if we're starting a steps section
        if (trimmedLine.toLowerCase().includes('test steps') || trimmedLine.toLowerCase().includes('steps')) {
          inStepsSection = true;
          continue;
        }
        // Check if we're moving to another section
        if (trimmedLine.toLowerCase().includes('expected') || 
            trimmedLine.toLowerCase().includes('priority') ||
            trimmedLine.toLowerCase().includes('requirements')) {
          inStepsSection = false;
          continue;
        }
        
        // If we're in the steps section or found numbered/bulleted lines, capture them
        if (inStepsSection || /^(?:\d+\.\s*|\*\s*|-\s*)/.test(trimmedLine)) {
          let step = trimmedLine.replace(/^(?:\d+\.\s*|\*\s*|-\s*)/, '').trim();
          if (step.length > 0 && 
              !step.toLowerCase().includes('test steps') && 
              !step.toLowerCase().includes('expected') &&
              !step.toLowerCase().includes('priority') &&
              !step.toLowerCase().includes('requirements')) {
            testSteps.push(step);
          }
        }
      }
    }
    
    // Try to find requirements trace - updated to support multi-line if needed
    let requirementsTraceMatch = block.match(/\*\*Requirements Trace:\*\*([^\0]*?)(?=\n\*\*(?:Created|Updated|Version):\*\*|\n###|$)/i);
    if (!requirementsTraceMatch) requirementsTraceMatch = block.match(/(?:^|\n)Requirements Trace:?\s*(.*?)(?=\n(?:Created|Updated|Version|Title|Case ID)|$)/i);
    if (!requirementsTraceMatch) requirementsTraceMatch = block.match(/(?:^|\n)Requirements:?\s*(.*?)(?=\n(?:Created|Updated|Version|Title|Case ID)|$)/i);
    
    let requirementsTrace = undefined;
    if (requirementsTraceMatch) {
      requirementsTrace = requirementsTraceMatch[1].trim();
      // Remove any remaining field markers that might have been captured in the content
      requirementsTrace = requirementsTrace.replace(/(?:Created|Updated|Version):\s*.*$/i, '').trim();
    }

    // If we still don't have any fields with the strict format, try to extract content from the block more generally
    if (!caseIdMatch && !titleMatch && testSteps.length === 0 && !expectedResultsMatch) {
      // This might be a simple format, extract the first few sentences as the title/description
      const lines = block.split('\n').filter(line => line.trim() !== '');
      
      // Find the first line that looks like a title
      for (const line of lines) {
        if (line.trim().length > 0 && 
            !line.trim().startsWith('**') && 
            !line.trim().startsWith('#') &&
            !/^(?:\d+\.\s*|\*\s*|-\s*)/.test(line.trim())) {
          // Use the first substantial line as a title if none found
          if (!titleMatch) {
            titleMatch = [line, line];
          }
          break;
        }
      }
    }

    // Only create a test case if we have some content
    const title = titleMatch ? titleMatch[1].trim() : `Test Case ${index + 1}`;
    if (title.toLowerCase() === 'untitled test case' && testSteps.length === 0) {
      return; // Skip if it's an untitled case with no steps
    }

    // Clean up expected results by removing any potential field markers from within the content
    let expectedResults = '';
    if (expectedResultsMatch) {
      expectedResults = expectedResultsMatch[1].trim();
      // Remove any remaining field markers that might have been captured in the content
      expectedResults = expectedResults.replace(/(?:Priority|Requirements Trace|Created|Updated|Version):\s*.*$/i, '').trim();
      
      // Remove any bullet points or list formatting that might have been included
      expectedResults = expectedResults.replace(/^\*\s*/gm, '').trim();
      expectedResults = expectedResults.replace(/^\*\s*/m, '').trim(); // Sometimes bullet points appear at start only
      
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
    
    // If we still don't have a description, try to use any remaining content
    if (!description && cleanedTitle !== title) {
      description = cleanedTitle;
      cleanedTitle = `Test Case ${index + 1}`; // Provide default title
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