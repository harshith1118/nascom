# MediTestAI - Healthcare Test Case Generation System

This is a Next.js application that automates test case generation for healthcare software using AI.

## Overview

MediTestAI is an AI-powered system that automatically converts healthcare software requirements into compliant, traceable test cases integrated with enterprise toolchains. The system supports full authentication, cloud storage, and enterprise-grade security.

## Recent Improvements

We've recently made significant improvements to make this a complete production-ready system:

### ✅ **Complete Authentication System**
- **Login/Signup Pages** - Full Firebase Authentication with email/password
- **User Management** - Real user profiles with name, email, role
- **Session Management** - Persistent login across sessions
- **Forgot Password** - Password reset functionality
- **Logout** - Secure sign-out with redirect

### ✅ **Cloud Storage Integration**
- **Firebase Authentication** - Secure user management
- **Firestore Database** - All data stored in cloud database
- **Real-time Sync** - Data synced across devices
- **User Isolation** - Each user sees only their own data

### ✅ **Enhanced Test Case Generation**
- **AI-powered test case generation** from requirements
- **Healthcare compliance checking** (FDA, ISO 13485, GDPR, HIPAA, IEC 62304)
- **No-code interface** for test case management
- **Test case modification** with natural language
- **Import/export capabilities**

### ✅ **Enterprise Integrations**
- **Export to Jira** with configurable issue types
- **Export to Azure DevOps** with configurable work item types  
- **Multiple format download** (PDF, Excel, Word, JSON, Text, Markdown)

### ✅ **Advanced Features**
- **Traceability Matrix** - Link test cases to original requirements
- **Versioning & Timestamps** - Track changes over time
- **Human-in-the-Loop** - Feedback mechanism for continuous improvement
- **Compliance Reports** - Detailed healthcare standards analysis

## Quick Start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file with your Google AI API key and Firebase credentials:

   ```
   GOOGLE_API_KEY=your_google_ai_api_key_here
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   ```

3. Start the development servers:

   ```bash
   # Terminal : Start Next.js frontend
   npm run dev
   ```

4. Access the application at `http://localhost:9002`

## Deployment

### Netlify

This project can be deployed to Netlify. To enable full functionality, set the environment variables in your Netlify dashboard:

1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Add all the required environment variables:
   ```
   GOOGLE_API_KEY=your_google_ai_api_key_here
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   ```

## User Flow

1. **Visitor opens app** → Redirected to `/signup`
2. **New user signs up** → Creates account in Firebase Auth + Firestore
3. **User logs in** → Authenticates with Firebase, loads data from Firestore
4. **User generates test cases** → AI processes requirements, saves to Firestore
5. **User exports data** → Exports to Jira, Azure DevOps, or downloads files
6. **User logs out** → Signs out of Firebase, redirected to login

## Features

### 🔐 **Authentication & User Management**
- Secure user registration and login
- Password reset functionality
- User profile management
- Role-based access control
- Session persistence

### 🧠 **AI-Powered Test Case Generation**
- Generate comprehensive test cases from software requirements
- Support for various input formats (PDF, Word, XML, text)
- Natural language test case modification
- Healthcare compliance verification
- Source code context analysis

### 📊 **Test Case Management**
- Create, read, update, delete test cases
- Version control with timestamps
- Priority management (High, Medium, Low)
- Requirements traceability
- Test case feedback system

### 🔄 **Enterprise Integrations**
- **Jira Integration**: Export test cases with configurable issue types
- **Azure DevOps Integration**: Export to work items with custom types
- **Multiple Format Downloads**: PDF, Excel, Word, JSON, Text, Markdown

### 📈 **Advanced Analytics**
- **Traceability Matrix**: Map test cases to requirements
- **Compliance Reports**: Detailed healthcare standards analysis
- **Dashboard**: Overview of test case metrics and progress
- **Activity Tracking**: Recent actions and modifications

### 🛠 **Developer Features**
- **Human-in-the-Loop**: Feedback mechanism for AI improvement
- **API Routes**: RESTful endpoints for external integrations
- **Cloud Storage**: Firebase Firestore for data persistence
- **Responsive Design**: Works on desktop and mobile devices

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

## Architecture

### Frontend
- **Next.js 15** with App Router
- **React Server Components** for performance
- **Tailwind CSS** for styling
- **Shadcn UI** components
- **Context API** for state management

### Backend
- **Firebase Authentication** for user management
- **Firestore Database** for data storage
- **LangChain + Google Gemini** for AI processing
- **RESTful API Routes** for server-side logic

### Data Flow
1. **User Authentication** → Firebase Auth
2. **Data Storage** → Firestore Database
3. **AI Processing** → Google Gemini via LangChain
4. **Export Operations** → External APIs (Jira, Azure DevOps)
5. **File Generation** → Client-side libraries (jsPDF, XLSX, etc.)

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

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.