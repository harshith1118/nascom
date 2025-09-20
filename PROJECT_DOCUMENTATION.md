# MediTestAI - Healthcare Test Case Generation System

## Overview

MediTestAI is an AI-powered system that automates the generation of test cases for healthcare software applications. The system converts software requirements into compliant, structured test cases and integrates with enterprise toolchains.

## Key Features

1. **AI-Powered Test Case Generation**
   - Converts natural language and structured specifications into detailed test cases
   - Supports multiple input formats (PDF, Word, XML, Markdown)
   - Generates comprehensive test cases with all required elements

2. **Healthcare Compliance & Standards**
   - Ensures compliance with FDA, ISO 13485, and GDPR standards
   - Provides compliance reports for generated test cases
   - Maintains traceability between requirements and test cases

3. **No-Code Interface**
   - Intuitive UI for non-technical users
   - File upload and copy-paste input options
   - Visual test case management dashboard

4. **Test Case Management**
   - View, copy, and export generated test cases
   - Modify existing test cases using natural language prompts
   - Import and manage existing test suites

## Technology Stack

- **Frontend**: Next.js 15 with React Server Components
- **AI Engine**: Google Gemini through Genkit framework
- **UI Components**: Tailwind CSS, Radix UI, Shadcn UI
- **State Management**: React Context API
- **Backend**: Next.js API routes with Genkit server actions
- **Deployment**: Firebase hosting compatible

## Project Structure

```
src/
├── ai/                 # AI flows and configurations
│   ├── flows/          # Individual AI capabilities
│   ├── dev.ts          # Development server setup
│   └── genkit.ts       # Genkit configuration
├── app/                # Next.js app router structure
│   ├── (app)/          # Main application pages
│   │   ├── dashboard/   # Dashboard home page
│   │   ├── generate/    # Test case generation page
│   │   ├── manage/      # Test case management page
│   │   ├── import/      # Test case import page
│   │   └── compliance/  # Compliance checking page
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page redirect
├── components/         # Reusable UI components
│   ├── ui/             # Shadcn UI components
│   ├── TestCaseCard.tsx # Test case display component
│   └── providers.tsx   # Context providers
├── contexts/           # React context providers
├── lib/                # Utility functions and types
└── hooks/              # Custom React hooks
```

## Core Functionality

### 1. Test Case Generation
- **Input**: Product Requirement Documents (PRDs) in text format
- **Process**: AI analysis of requirements to create structured test cases
- **Output**: Test cases with Case ID, Title, Description, Steps, Expected Results, and Priority

### 2. Compliance Checking
- Analyzes test cases against healthcare standards
- Generates compliance reports
- Identifies potential compliance gaps

### 3. Test Case Modification
- Allows natural language modifications to existing test cases
- AI-powered refinement of test scenarios

### 4. Import/Export Capabilities
- Import existing test cases from various formats
- Export functionality (currently demo-only for Jira, Azure DevOps, PDF)

## AI Implementation

The system uses Google's Gemini AI through the Genkit framework:

1. **Model**: `googleai/gemini-2.5-flash`
2. **Flows**:
   - `generateTestCasesFromRequirementsFlow`
   - `complianceCheckTestCasesFlow`
   - `modifyTestCasesWithNaturalLanguageFlow`

## Performance Optimizations

1. **Next.js Optimizations**:
   - Removed Turbopack for stability
   - Enabled SWC minification
   - Optimized image loading
   - Force dynamic rendering

2. **AI Response Optimization**:
   - Simplified prompts for faster responses
   - Limited test case generation to 3 per request
   - Streamlined output formatting

## Demo Limitations

The following features are temporarily suspended in the demo version:
- Export to Jira
- Export to Azure DevOps
- PDF Download
- AI modification of test cases
- Full compliance checking

These features will be available in the full production version.

## Setup Instructions

1. **Environment Setup**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file with your Google AI API key:
   ```
   GOOGLE_API_KEY=your_google_ai_api_key_here
   ```

3. **Start Development Servers**:
   ```bash
   # Start Genkit AI server
   npm run genkit:dev
   
   # In a separate terminal, start Next.js frontend
   npm run dev
   ```

4. **Access Application**:
   Open `http://localhost:9002` in your browser

## Troubleshooting

### Common Issues

1. **Port Conflicts**:
   - Kill processes on port 9002 before starting servers
   - Use `netstat -ano | findstr :9002` to find processes

2. **AI Generation Slow**:
   - First requests may be slower due to model loading
   - Subsequent requests should be faster
   - Keep requirements documents concise

3. **Image Loading Issues**:
   - Ensure images are in the `public/` directory
   - Check image file extensions are supported

### Performance Tips

1. **For Faster AI Responses**:
   - Keep requirement documents under 2000 words
   - Use clear, specific language in requirements
   - Focus on key functionality in requirements

2. **For Better UI Performance**:
   - Limit test cases to fewer than 50 per view
   - Use copy functionality instead of export for immediate needs
   - Refresh page if UI becomes unresponsive

## Future Enhancements

1. **Integration Features**:
   - Full Jira integration
   - Azure DevOps synchronization
   - Polarion ALM connectivity

2. **Advanced AI Capabilities**:
   - Test data generation
   - Automated test script creation
   - Regression test identification

3. **Enhanced Compliance**:
   - Detailed compliance matrices
   - Automated compliance gap analysis
   - Regulatory update notifications

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact the development team or open an issue in the repository.