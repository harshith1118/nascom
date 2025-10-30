# MediTestAI - Healthcare Test Case Generation System

This is a Next.js application that automates test case generation for healthcare software using AI.

## Overview

MediTestAI is an AI-powered system that automatically converts healthcare software requirements into compliant, traceable test cases integrated with enterprise toolchains.

## Recent Improvements

We've recently made significant improvements to the test case generation reliability:

- Enhanced AI prompts for more consistent output
- Improved error handling and user feedback
- Better parsing of AI responses
- More robust validation of generated test cases
- **NEW**: Improved text formatting with markdown cleaning utilities
- **NEW**: Enhanced test case parsing with better format handling
- **NEW**: AI-powered test case modification with natural language
- **NEW**: Export functionality to Jira and Azure DevOps
- **NEW**: Multiple format download capabilities (PDF, Excel, Word, JSON, Text, Markdown)

## Quick Start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file with your Google AI API key:

   ```
   GOOGLE_API_KEY=your_google_ai_api_key_here
   ```

3. Start the development servers:

   ```bash

   # Terminal : Start Next.js frontend
   npm run dev
   ```

4. Access the application at `http://localhost:9002`

## Deployment

### Netlify

This project can be deployed to Netlify. To enable full AI functionality, set the environment variable in your Netlify dashboard:

1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Add the environment variable: `GOOGLE_API_KEY=your_google_ai_api_key_here`

## Features

- AI-powered test case generation from requirements
- Healthcare compliance checking (FDA, ISO 13485, GDPR)
- No-code interface for test case management
- Test case modification with natural language
- Import/export capabilities
- **NEW**: Export to Jira with configurable issue types
- **NEW**: Export to Azure DevOps with configurable work item types  
- **NEW**: Multiple format download (PDF, Excel, Word, JSON, Text, Markdown)
- **NEW**: Enhanced text formatting and parsing

## Integration Guides

### Jira Integration
To export test cases to Jira:
1. Enter your Jira Base URL (e.g., `https://yourcompany.atlassian.net`)
2. Provide your email and API token
3. Specify the project key
4. Set the issue type (e.g., Task, Story, or for Service Desk projects, the specific request type)

For Service Desk projects, you may need to specify the exact request type name as it appears in your Jira instance.

### Azure DevOps Integration
To export test cases to Azure DevOps:
1. Enter your organization name
2. Provide your project name
3. Use a Personal Access Token (PAT) with proper permissions
4. Specify the work item type (e.g., Task, User Story, Bug)

### Download Functionality
The download feature supports multiple formats:
- PDF: For document sharing and printing
- Excel: For spreadsheet-based management
- Word: For document editing
- JSON: For data interchange
- Text/Markdown: For plain text formats

## Architecture Changes

### Text Formatting
- Added markdown cleaning utility to remove formatting artifacts
- Improved display of compliance reports and test cases
- Better handling of inconsistent spacing in inputs

### Parsing Improvements
- Enhanced regex patterns for more reliable test case extraction
- Better handling of various input formats
- Improved validation for missing or malformed sections

## Documentation

For detailed information about the project, see:

- [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md) - Comprehensive project documentation
- [docs/blueprint.md](docs/blueprint.md) - Original project blueprint

## Development

To get started, take a look at src/app/page.tsx.

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request