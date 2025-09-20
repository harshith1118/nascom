# MediTestAI - Healthcare Test Case Generation System

This is a Next.js application that automates test case generation for healthcare software using AI.

## Overview

MediTestAI is an AI-powered system that automatically converts healthcare software requirements into compliant, traceable test cases integrated with enterprise toolchains.

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
