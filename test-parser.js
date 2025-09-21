import { parseTestCasesMarkdown } from '../lib/parsers';

// Test the parser with a sample AI response
const sampleResponse = `### Case ID: TC-001
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
**Priority:** Medium

---

### Case ID: TC-003
**Title:** Password Reset Functionality
**Description:** Verify that users can reset their password using the reset link
**Test Steps:**
1. Navigate to the login page
2. Click on the "Forgot Password" link
3. Enter registered email address
4. Click "Send Reset Link"
5. Check email for reset link
6. Click reset link and enter new password
**Expected Results:** User's password is successfully reset and they can log in with the new password
**Priority:** Medium

Compliance Note: These test cases address FDA requirements for user authentication and access control, ISO 13485 requirements for software validation, and GDPR requirements for secure user data handling.`;

console.log('Testing parser with sample response...');
const parsed = parseTestCasesMarkdown(sampleResponse);
console.log('Parsed test cases:', parsed);
console.log('Number of test cases parsed:', parsed.length);