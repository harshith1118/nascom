// Simple JavaScript version of the parser for testing
function parseTestCasesMarkdown(markdown) {
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

console.log('Testing parser with provided examples...');
const parsed = parseTestCasesMarkdown(testCaseExamples);
console.log('Parsed test cases:', JSON.stringify(parsed, null, 2));
console.log('Number of test cases parsed:', parsed.length);

// Test with requirements format
const requirementsExample = `Software Requirements for Patient Portal v1.2
   
## 1. User Authentication
- 1.1. Users must be able to log in using their email and password.
- 1.2. The system shall lock the account after 5 failed login attempts.
- 1.3. There must be a "Forgot Password" feature that allows users to reset their password via email.

## 2. Patient Dashboard
- 2.1. After logging in, the user shall be redirected to their personal dashboard.
- 2.2. The dashboard must display the patient's upcoming appointments.
- 2.3. The dashboard shall show a summary of the patient's latest lab results.

## 3. Appointments
- 3.1. Patients must be able to request a new appointment with a doctor.
- 3.2. Patients must be able to cancel an existing appointment up to 24 hours before the scheduled time.`;

console.log('\nTesting parser with requirements format...');
const parsedRequirements = parseTestCasesMarkdown(requirementsExample);
console.log('Parsed requirements:', JSON.stringify(parsedRequirements, null, 2));
console.log('Number of test cases parsed from requirements:', parsedRequirements.length);