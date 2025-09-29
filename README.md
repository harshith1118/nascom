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
   # Terminal 1: Start Genkit AI server
   npm run genkit:dev
   
   # Terminal 2: Start Next.js frontend
   npm run dev
   ```

4. Access the application at `http://localhost:9002`

## Deployment

### Netlify

This project can be deployed to Netlify. To enable full AI functionality, set the environment variable in your Netlify dashboard:

1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Add the environment variable: `GOOGLE_API_KEY=your_google_ai_api_key_here`

### Vercel

This project is configured for Vercel deployment. Add the `GOOGLE_API_KEY` environment variable during project setup.

When the API key is not available (e.g., in deployed environments without the key), the application gracefully falls back to mock data to ensure functionality.

## Features

- AI-powered test case generation from requirements
- Healthcare compliance checking (FDA, ISO 13485, GDPR)
- No-code interface for test case management
- Test case modification with natural language
- Import/export capabilities

## Documentation

For detailed information about the project, see:
- [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md) - Comprehensive project documentation
- [docs/blueprint.md](docs/blueprint.md) - Original project blueprint

## Development

To get started, take a look at src/app/page.tsx.
