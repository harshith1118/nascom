// Simple JavaScript version of the fixed parser for testing

function parseTestCasesMarkdown(markdown) {
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

  return testCaseBlocks.map((block, index) => {
    // Extract each section using more reliable regex patterns
    const caseIdMatch = block.match(/###\s*Case ID:\s*(.+)/i);
    const titleMatch = block.match(/\*\*Title:\*\*\s*(.+)/i);
    const descriptionMatch = block.match(/\*\*Description:\*\*\s*(.+)/i);
    
    // Extract test steps section
    const stepsMatch = block.match(/\*\*Test Steps:\*\*([\s\S]*?)(?=\n\*\*Expected Results:\*\*|\n\*\*Priority:\*\*|\n###|$)/i);
    const expectedResultsMatch = block.match(/\*\*Expected Results:\*\*\s*(.+)/i);
    const priorityMatch = block.match(/\*\*Priority:\*\*\s*(.+)/i);

    // Parse test steps more reliably
    let testSteps = [];
    if (stepsMatch && stepsMatch[1]) {
      testSteps = stepsMatch[1]
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(step => step.length > 0);
    }

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

// Test with a properly formatted test case
const properTestCase = `### Case ID: TC-001
**Title:** User Login Authentication
**Description:** Verify that users can log in with valid credentials
**Test Steps:**
1. Navigate to the login page
2. Enter valid username and password
3. Click the login button
**Expected Results:** User is successfully logged in and redirected to the dashboard
**Priority:** High`;

console.log('Testing fixed parser with properly formatted test case...');
const parsed = parseTestCasesMarkdown(properTestCase);
console.log('Parsed test cases:', JSON.stringify(parsed, null, 2));
console.log('Number of test cases parsed:', parsed.length);

if (parsed.length > 0) {
  console.log('\nFirst test case details:');
  console.log('Case ID:', parsed[0].caseId);
  console.log('Title:', parsed[0].title);
  console.log('Description:', parsed[0].description);
  console.log('Steps count:', parsed[0].testSteps.length);
  console.log('Steps:', parsed[0].testSteps);
  console.log('Expected Results:', parsed[0].expectedResults);
  console.log('Priority:', parsed[0].priority);
}

// Test with multiple test cases
const multipleTestCases = `### Case ID: TC-001
**Title:** User Login Authentication
**Description:** Verify that users can log in with valid credentials
**Test Steps:**
1. Navigate to the login page
2. Enter valid username and password
3. Click the login button
**Expected Results:** User is successfully logged in and redirected to the dashboard
**Priority:** High

---

### Case ID: TC-002
**Title:** Invalid Login Attempt
**Description:** Verify that users cannot log in with invalid credentials
**Test Steps:**
1. Navigate to the login page
2. Enter invalid username and password
3. Click the login button
**Expected Results:** User sees an error message and is not logged in
**Priority:** Medium`;

console.log('\n\nTesting with multiple test cases...');
const parsedMultiple = parseTestCasesMarkdown(multipleTestCases);
console.log('Number of test cases parsed:', parsedMultiple.length);

if (parsedMultiple.length > 0) {
  console.log('\nFirst test case title:', parsedMultiple[0].title);
  console.log('Second test case title:', parsedMultiple[1].title);
}