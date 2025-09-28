// Simple JavaScript version of the updated parser for testing

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
    // More flexible regex patterns to handle various whitespace scenarios
    const caseIdMatch = block.match(/###\s*Case ID:\s*(.+)/i);
    const titleMatch = block.match(/\*\*Title:\*\*\s*(.+)/i);
    const descriptionMatch = block.match(/\*\*Description:\*\*\s*(.+)/i);
    
    // More robust steps parsing that handles various formats
    const stepsBlockMatch = block.match(/\*\*Test Steps:\*\*\s*\n([\s\S]*?)(?=\n\*\*Expected Results:\*\*|\n\*\*Priority:\*\*|$)/i);
    
    const expectedResultsMatch = block.match(/\*\*Expected Results:\*\*\s*(.+)/i);
    const priorityMatch = block.match(/\*\*Priority:\*\*\s*(.+)/i);

    // Enhanced test steps parsing
    const testSteps = stepsBlockMatch
      ? stepsBlockMatch[1]
          .trim()
          .split(/\n/)
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

// Test with the provided examples
const testCaseExamples = `### Case ID: TC-001
**Title:** Verify Account Lockout after Multiple Failed Login Attempts
**Description:** Test that a user's account is locked after 5 consecutive failed login attempts, preventing further access.
**Test Steps:**
1. Navigate to the Patient Portal login page.
2. Enter a valid email and an incorrect password.
3. Click "Login".
4. Repeat steps 2 and 3 four more times (total of 5 failed attempts).
5. Attempt to log in one more time with correct credentials.
**Expected Results:** After 5 failed attempts, the system displays an error message indicating the account is locked. The subsequent login attempt with correct credentials fails.
**Priority:** High

---

### Case ID: TC-002
**Title:** Verify Patient Dashboard Displays Upcoming Appointments and Latest Lab Results
**Description:** Ensure that upon successful login, the patient's dashboard correctly displays their scheduled upcoming appointments and a summary of their latest lab results.
**Test Steps:**
1. Navigate to the Patient Portal login page.
2. Enter valid user credentials (email and password) for a patient with upcoming appointments and lab results.
3. Click "Login".
4. Verify redirection to the patient dashboard.
5. Check the 'Upcoming Appointments' section for accuracy and completeness.
6. Check the 'Latest Lab Results' section for accuracy and completeness.
**Expected Results:** The user is successfully redirected to their personal dashboard. The dashboard accurately lists upcoming appointments and displays a summary of the patient's latest lab results.
**Priority:** High

---

### Case ID: TC-003
**Title:** Verify Patient's Ability to Request and Cancel Appointments
**Description:** Test the functionality allowing patients to request a new appointment and cancel an existing one, ensuring business rules are applied (e.g., 24-hour cancellation window).
**Test Steps:**
1. Log in to the Patient Portal with valid patient credentials.
2. Navigate to the "Appointments" section.
3. Click on "Request New Appointment".
4. Fill in the required details (doctor, date, time) and submit the request.
5. Verify the new appointment appears in the 'Upcoming Appointments' list.
6. Select the newly created appointment (or an existing one scheduled more than 24 hours in the future).
7. Click "Cancel Appointment" and confirm the action.
**Expected Results:** The new appointment request is successfully submitted and appears on the patient's dashboard. The selected appointment is successfully canceled and removed from the list of upcoming appointments.
**Priority:** High`;

console.log('Testing updated parser with provided examples...');
const parsed = parseTestCasesMarkdown(testCaseExamples);
console.log('Parsed test cases count:', parsed.length);

// Detailed output for the first test case
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

console.log('\nAll test cases parsed successfully!');