# AI Tutor Platform - Replit Project

## Overview
This is a full-stack AI-powered tutoring platform that combines:
- **Backend**: Node.js/Express server with AI integration (Gemini API)
- **Frontend**: React-based web application 
- **WordPress Plugin**: AI-powered educational plugin for WordPress sites
- **Database**: PostgreSQL with Drizzle ORM

## Recent Changes
- **2025-06-29**: ✅ Successfully completed migration from Replit Agent to standard Replit environment
- **2025-06-29**: ✅ Database setup with PostgreSQL and proper migrations completed
- **2025-06-29**: ✅ Server running successfully on port 5000 with full functionality
- **2025-06-29**: ✅ Enhanced WordPress plugin error handling and AJAX debugging
- **2025-06-29**: ✅ Fixed WordPress plugin navigation system and removed missing method calls
- **2025-06-29**: ✅ All dependencies installed and configured properly
- **2025-06-29**: ✅ Resolved WordPress plugin JavaScript errors and AJAX 400 issues
- **2025-06-29**: ✅ WordPress plugin fully functional with proper error handling and data loading
- **2025-06-29**: ✅ Project fully migrated and ready for development and deployment

## Project Architecture

### Backend Services (`/server`)
- **Express Server**: Main application server running on port 5000
- **AI Services**: 
  - Gemini AI integration for content generation and tutoring
  - Real-time chat with contextual responses
  - Automatic question generation and answer evaluation
- **Database**: PostgreSQL with structured schema for users, subjects, lessons, progress tracking
- **Authentication**: JWT-based auth system with secure password handling

### WordPress Plugin (`/ai-tutor-wordpress-plugin`)
- **AI-Powered Features**: Real AI integration replacing static JavaScript
- **Content Generation**: Automatic lesson content creation using AI
- **Interactive Chat**: Real-time AI tutoring conversations
- **Question Generation**: Dynamic quiz and question creation
- **Shortcodes**: 
  - `[ai_tutor_ai_lesson lesson_id="123"]` - Full AI-powered lesson experience
  - `[ai_tutor_dashboard]` - Student dashboard
  - `[ai_tutor_subjects]` - Subject listing

### Frontend Application (`/client`)
- **React-based**: Modern web application for direct platform access
- **Real-time Features**: Live chat and progress tracking
- **Responsive Design**: Works across devices

## Key Features
1. **AI-Powered Tutoring**: Context-aware responses using Google Gemini
2. **Content Generation**: Automatic lesson creation with examples and quizzes
3. **Progress Tracking**: Detailed analytics and learning progression
4. **Multi-Platform**: Works as standalone app and WordPress plugin
5. **Real-time Chat**: Interactive conversations with AI tutor
6. **Question Generation**: Dynamic assessment creation

## Environment Setup
- **Database**: Automatically provisioned PostgreSQL database
- **Dependencies**: All packages installed and configured
- **AI Integration**: Requires GOOGLE_API_KEY for full functionality

## Security Features
- JWT authentication
- SQL injection protection via Drizzle ORM
- Input sanitization and validation
- Secure password hashing with bcrypt

## Deployment
- **Backend**: Express server configured for Replit deployment
- **Port Configuration**: Properly configured for 0.0.0.0:5000
- **Database**: Production-ready PostgreSQL setup

## User Preferences
- Focus on educational technology and AI integration
- Prefer comprehensive, production-ready solutions
- Emphasize security and scalability
- Value clear documentation and user instructions

## Technical Decisions
- **AI Provider**: Google Gemini for reliable content generation
- **Database**: PostgreSQL for robust data handling
- **Framework**: Express.js for backend, React for frontend
- **Authentication**: JWT for stateless auth
- **ORM**: Drizzle for type-safe database operations

## Next Steps
- Set up Google API key for full AI functionality
- Test WordPress plugin integration locally (no deployment needed)
- Add advanced AI features like personalized learning paths

## WordPress Plugin Deployment Options
- **Local Mode**: Uses Google API directly from WordPress (no deployment required)
- **Backend Mode**: Connects to deployed Replit backend for advanced features
- **Hybrid Mode**: Falls back gracefully between both approaches