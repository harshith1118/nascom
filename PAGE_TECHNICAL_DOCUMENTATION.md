# MediTestAI - Page Technical Documentation

## Overview
This document provides a detailed technical explanation of each page in the MediTestAI application, including how prompts are constructed, how functionality works, and how data flows between components.

## 1. Dashboard Page (/dashboard)

### Purpose
The dashboard serves as the main entry point for users, providing an overview of the application's capabilities and quick access to key features.

### Technical Implementation
- **File**: `src/app/(app)/dashboard/page.tsx`
- **Component Type**: Server Component (Next.js App Router)
- **Key Features**:
  - Welcome card with application overview
  - Feature cards linking to core functionality
  - Call-to-action buttons for primary workflows

### Data Flow
1. Static page rendering with no external data dependencies
2. Links to other pages using Next.js Link component
3. No state management required

### UI Components Used
- Card, CardHeader, CardContent, CardTitle, CardDescription
- Button with Link integration
- Responsive grid layout

## 2. Generate Test Cases Page (/generate)

### Purpose
This page allows users to input software requirements and generate test cases using AI.

### Technical Implementation
- **File**: `src/app/(app)/generate/page.tsx`
- **Component Type**: Client Component (useState, useForm hooks)
- **Key Libraries**: 
  - react-hook-form for form validation
  - zod for schema validation
  - TestCasesContext for state management

### Key Functionality

#### File Upload Handling
```javascript
const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      form.setValue('requirements', text, { shouldValidate: true });
    };
    reader.readAsText(file);
  }
};
```

#### Form Validation
- Uses Zod schema validation with minimum 50 character requirement
- Real-time validation feedback
- Loading states during AI processing

#### Server Action Integration
```javascript
const result = await generateTests({ productRequirementDocument: values.requirements });
```

### AI Prompt Construction
The generate page sends requirements to the server action, which calls the AI flow:
1. User inputs requirements via file upload or text paste
2. Form validates input meets minimum length requirements
3. On submit, calls `generateTests` server action
4. Server action calls `generateTestCasesFromRequirements` flow
5. AI flow uses the enhanced prompt to generate test cases

### Data Flow
1. User input → Form state (React Hook Form)
2. Form submission → Server Action (`generateTests`)
3. Server Action → AI Flow (`generateTestCasesFromRequirements`)
4. AI Flow → Genkit AI Model → Response
5. Response → Parser (`parseTestCasesMarkdown`)
6. Parsed data → TestCasesContext
7. Redirect to /manage page

### UI Components Used
- Card-based layout for organized presentation
- Form components with validation
- File upload with drag-and-drop UI
- Loading states with animated icons
- Toast notifications for user feedback

## 3. Manage Test Cases Page (/manage)

### Purpose
Displays generated test cases and provides management capabilities.

### Technical Implementation
- **File**: `src/app/(app)/manage/page.tsx`
- **Component Type**: Client Component
- **State Management**: TestCasesContext

### Key Functionality

#### Test Case Display
- Uses TestCaseCard component for each test case
- Responsive grid layout (1 column on mobile, 3 columns on desktop)
- Conditional rendering for empty state

#### Copy All Functionality
```javascript
const copyAllTestCases = async () => {
  const testCasesMarkdown = testCases.map(testCaseToMarkdown).join('\n---\n');
  await navigator.clipboard.writeText(testCasesMarkdown);
};
```

### Data Flow
1. TestCasesContext provides test cases and compliance report
2. Conditional rendering based on testCases.length
3. Map over test cases to render TestCaseCard components
4. Copy functionality converts all test cases to markdown

### UI Components Used
- Responsive grid layout
- Alert component for compliance report display
- Button components for actions
- Conditional rendering for empty state

## 4. Compliance Check Page (/compliance)

### Purpose
Analyzes test cases against healthcare standards and generates compliance reports.

### Technical Implementation
- **File**: `src/app/(app)/compliance/page.tsx`
- **Component Type**: Client Component
- **State Management**: TestCasesContext

### Key Functionality

#### Compliance Analysis
- Retrieves test cases from TestCasesContext
- Converts test cases to markdown format for AI analysis
- Calls compliance check server action

#### AI Prompt Construction for Compliance
The compliance page constructs prompts differently:
1. Retrieves existing test cases from context
2. Converts them to markdown format
3. Combines with healthcare standards
4. Calls compliance check AI flow

```javascript
const testCaseMarkdown = testCases.map(testCaseToMarkdown).join('\n---\n');
const standards = "FDA regulations, ISO 13485, and GDPR requirements";
const result = await checkCompliance({ testCases: testCaseMarkdown, standards });
```

### Data Flow
1. TestCasesContext → test cases retrieval
2. Map and join test cases to markdown
3. Server action call with test cases and standards
4. AI flow processing
5. Compliance report → state update
6. Display compliance analysis

### UI Components Used
- Card-based layout for organized presentation
- Form components for any input
- Loading states during AI processing
- Toast notifications for user feedback
- Alert components for displaying results

## 5. Import Test Cases Page (/import)

### Purpose
Allows users to import existing test cases from various formats.

### Technical Implementation
- **File**: `src/app/(app)/import/page.tsx`
- **Component Type**: Client Component
- **State Management**: TestCasesContext

### Key Functionality
- File upload for existing test cases
- Parsing of various formats (currently demo-only)
- Integration with TestCasesContext

### Data Flow
1. File upload → parsing
2. Parse results → TestCasesContext
3. Redirect to manage page

## 6. AI Flow Components

### Generate Test Cases Flow
**File**: `src/ai/flows/generate-test-cases-from-requirements.ts`

#### Prompt Construction
```javascript
prompt: `You are an expert QA engineer specializing in healthcare software testing. 
Your task is to analyze the provided software requirements and generate exactly 3 
comprehensive test cases in the specified format.

For each test case, you MUST follow this EXACT format:
### Case ID: TC-001
**Title:** [Brief descriptive title]
**Description:** [Clear description of what is being tested]
**Test Steps:**
1. [First step]
2. [Second step]
3. [Additional steps as needed]
**Expected Results:** [Clear description of expected outcome]
**Priority:** [High/Medium/Low]

Separate each test case with:
---

After the test cases, provide a brief compliance note that starts with 
"Compliance Note:" and explains how these test cases address healthcare 
standards (FDA, ISO 13485, GDPR).

Software Requirements:
{{{productRequirementDocument}}}

Test Cases:
`
```

#### Flow Processing
1. Receives product requirements as input
2. Sends to Genkit AI model with structured prompt
3. Receives response from AI
4. Separates test cases from compliance note
5. Returns structured output

### Compliance Check Flow
**File**: `src/ai/flows/compliance-check-test-cases.ts`

#### Prompt Construction
```javascript
prompt: `You are an expert compliance officer specializing in healthcare software.

You will analyze the provided test cases against the specified healthcare 
standards and generate a compliance report.

Test Cases: {{{testCases}}}
Healthcare Standards: {{{standards}}}

Compliance Report:`
```

#### Flow Processing
1. Receives test cases and standards as input
2. Sends to Genkit AI model with structured prompt
3. Receives compliance report from AI
4. Returns structured output

### Modify Test Cases Flow
**File**: `src/ai/flows/modify-test-cases-with-natural-language.ts`

#### Prompt Construction
```javascript
prompt: `You are a test case modification expert specializing in healthcare 
software testing. Your task is to modify the provided test case according 
to the user's prompt.

Instructions:
1. Carefully read the test case and the modification prompt
2. Make the requested changes to the test case
3. Ensure the modified test case maintains proper formatting
4. Return ONLY the modified test case in the same format as the original

Original Test Case:
{{testCase}}

Modification Request:
{{prompt}}

Modified Test Case:
`
```

## 7. Server Actions

### Generate Tests Action
**File**: `src/app/(app)/generate/actions.ts`

#### Functionality
1. Receives requirements input
2. Calls generateTestCasesFromRequirements flow
3. Validates AI response
4. Returns structured output
5. Implements error handling and logging

### Compliance Check Action
**File**: `src/app/(app)/compliance/actions.ts`

#### Functionality
1. Receives test cases and standards input
2. Calls complianceCheckTestCases flow
3. Validates AI response
4. Returns structured output
5. Implements error handling and logging

## 8. Context Providers

### Test Cases Context
**File**: `src/contexts/TestCasesContext.tsx`

#### State Management
- `testCases`: Array of TestCase objects
- `complianceReport`: String containing compliance analysis
- `setTestCases`: Function to update test cases
- `setComplianceReport`: Function to update compliance report
- `updateTestCase`: Function to modify individual test cases

#### Provider Hierarchy
- Root layout wraps entire app with TestCasesProvider
- All pages can access test cases and compliance data
- State persists across navigation

## 9. Utility Functions

### Test Case Parsers
**File**: `src/lib/parsers.ts`

#### parseTestCasesMarkdown
```javascript
export function parseTestCasesMarkdown(markdown: string): TestCase[] {
  // Handle case where markdown might include the compliance note
  const complianceIndex = markdown.indexOf('Compliance Note:');
  const testCasesContent = complianceIndex !== -1 ? 
    markdown.substring(0, complianceIndex) : markdown;

  // Split by separator
  const testCaseBlocks = testCasesContent.split(/\n---\n/);

  // Parse each block into TestCase object
  return testCaseBlocks.map((block, index) => {
    // Regex matching for each field
    // Return structured TestCase object
  });
}
```

#### testCaseToMarkdown
```javascript
export function testCaseToMarkdown(testCase: TestCase): string {
  // Convert TestCase object back to markdown format
  return `### Case ID: ${testCase.caseId}
**Title:** ${testCase.title}
**Description:** ${testCase.description}
**Test Steps:**
${testCase.testSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}
**Expected Results:** ${testCase.expectedResults}
**Priority:** ${testCase.priority}
`;
}
```

## 10. UI Components

### TestCaseCard Component
**File**: `src/components/TestCaseCard.tsx`

#### Functionality
- Displays individual test case in structured format
- Provides copy functionality for individual test cases
- Shows priority with colored badges
- Responsive design for all screen sizes

#### Data Flow
1. Receives TestCase object as prop
2. Renders structured display of all fields
3. Implements copy functionality
4. Handles export actions (demo limitations)

### Sidebar Components
**File**: `src/components/ui/sidebar.tsx`

#### Functionality
- Navigation menu with active state tracking
- Collapsible design for mobile responsiveness
- User profile section with dropdown menu
- Consistent styling across all pages

#### Data Flow
1. Uses usePathname hook for active state
2. Maps navigation items to routes
3. Implements collapsible behavior
4. Handles user authentication state (demo)

## 11. Data Models

### TestCase Interface
**File**: `src/lib/types.ts`

```typescript
export type TestCase = {
  id: string;
  caseId: string;
  title: string;
  description: string;
  testSteps: string[];
  expectedResults: string;
  priority: 'High' | 'Medium' | 'Low' | string;
};
```

### Input/Output Schemas
Defined using Zod for type safety and validation:
- GenerateTestCasesFromRequirementsInputSchema
- GenerateTestCasesFromRequirementsOutputSchema
- ComplianceCheckTestCasesInputSchema
- ComplianceCheckTestCasesOutputSchema

## 12. Integration Points

### Genkit AI Framework
- **Configuration**: `src/ai/genkit.ts`
- **Model**: Google Gemini 2.5 Flash
- **Integration**: Server actions call AI flows which use Genkit

### Next.js App Router
- File-based routing system
- Server Components for static content
- Client Components for interactive features
- React Context for state management

### UI Component Library
- Shadcn UI components built on Radix UI
- Tailwind CSS for styling
- Responsive design principles
- Accessibility considerations

## 13. Performance Optimizations

### Code Splitting
- Next.js automatic code splitting
- Dynamic imports for heavy components
- Server Components for static content

### Caching
- React Context for client-side state
- No external caching implemented (could be added)

### Lazy Loading
- Component lazy loading where appropriate
- Image optimization with Next.js Image component

## 14. Security Considerations

### Input Validation
- Zod schema validation for all user inputs
- File type restrictions for uploads
- Length requirements for text inputs

### Data Handling
- Client-side state management only
- No persistent storage of sensitive data
- Secure clipboard operations

### Error Handling
- Comprehensive error handling in server actions
- User-friendly error messages
- Logging for debugging purposes

## 15. Future Enhancements

### Planned Features
- Full Jira and Azure DevOps integration
- PDF export functionality
- Advanced AI modification features
- Detailed compliance matrices

### Technical Improvements
- Enhanced caching mechanisms
- Improved error recovery
- Better performance monitoring
- Extended test case formats