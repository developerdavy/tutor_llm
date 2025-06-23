# AI Tutor - Interactive Learning Platform

## Overview

This is a full-stack interactive AI tutoring application built with React, Express, and PostgreSQL. The application provides personalized learning experiences with AI-generated lesson content, interactive avatars with voice synthesis, and real-time chat functionality for educational assistance.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side navigation
- **UI Components**: Radix UI primitives with custom styling
- **Voice Synthesis**: Web Speech API for AI tutor voice responses

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API endpoints
- **Development**: Hot reload with tsx for development server
- **Build**: esbuild for production bundling

### Data Storage Solutions
- **Database**: PostgreSQL 16
- **ORM**: Drizzle ORM with Drizzle Kit for migrations
- **Connection**: Neon Database serverless driver
- **Schema**: Shared TypeScript schema definitions

## Key Components

### Database Schema
Located in `shared/schema.ts`, defines five main entities:
- **Users**: Authentication and user management
- **Subjects**: Learning topics (Math, Chemistry, Physics, Literature)
- **Lessons**: Individual learning units within subjects
- **UserProgress**: Tracking completion and progress
- **ChatMessages**: AI tutor conversation history

### Core Features
1. **Subject Selection**: Interactive cards showing learning subjects with progress indicators
2. **Lesson Interface**: AI-generated content with examples and quizzes
3. **Chat Interface**: Real-time conversation with AI tutor
4. **Avatar Display**: Visual AI tutor with speech bubble interactions
5. **Progress Tracking**: User achievement and study streak monitoring
6. **Voice Synthesis**: Text-to-speech for AI responses

### AI Integration
- **Google Gemini AI**: Powers lesson content generation and tutoring responses
- **Content Generation**: Creates structured lessons with examples and quizzes using Gemini 1.5 Flash
- **Conversational AI**: Provides contextual help and explanations using Gemini 2.5 Pro
- **Fallback System**: Static educational content when API quotas are exceeded

## Data Flow

1. **User selects subject** → Frontend fetches subject data from `/api/subjects`
2. **Lesson loading** → Backend retrieves or generates lesson content via OpenAI
3. **Chat interaction** → Messages sent to `/api/users/{id}/lessons/{id}/chat`
4. **AI processing** → OpenAI generates contextual responses
5. **Voice synthesis** → Browser TTS reads AI responses aloud
6. **Progress updates** → User completion tracked in database

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection
- **drizzle-orm**: Database ORM and query builder
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **openai**: GPT API integration

### Development Tools
- **vite**: Frontend build tool and dev server
- **tsx**: TypeScript execution for development
- **esbuild**: Production backend bundling
- **drizzle-kit**: Database migration management

## Deployment Strategy

### Environment Configuration
- **Development**: `npm run dev` - Hot reload with tsx
- **Production**: `npm run build && npm run start`
- **Database**: `npm run db:push` for schema updates

### Replit Integration
- **Modules**: Node.js 20, Web, PostgreSQL 16
- **Auto-deployment**: Configured for Replit's autoscale deployment
- **Port mapping**: Internal 5000 → External 80
- **Development tools**: Replit-specific Vite plugins for enhanced DX

### Build Process
1. Frontend assets built with Vite to `dist/public`
2. Backend bundled with esbuild to `dist/index.js`
3. Static file serving from build output
4. Environment variables for database and OpenAI API

## Changelog
- January 23, 2025. Project migration completed - Database connected, all dependencies installed
- January 23, 2025. Expanded curriculum - Added 40 comprehensive high school lessons across all subjects
- January 23, 2025. Fixed UI issues - Resolved nested anchor tag warnings in authentication pages
- January 23, 2025. Enhanced navigation - Fixed "Start Learning" button to properly navigate with subject pre-selection

## User Preferences

Preferred communication style: Simple, everyday language.

## WordPress Integration Options

The user has expressed interest in implementing this AI tutoring platform in WordPress. Key integration approaches documented for future reference:

1. **Plugin Development**: Convert the React frontend into a WordPress plugin with custom post types for subjects/lessons
2. **Headless WordPress**: Use WordPress as content management backend with React frontend
3. **Embedded Integration**: Iframe embedding of the Replit-hosted application into WordPress pages
4. **REST API Bridge**: Create WordPress endpoints that communicate with the existing Node.js backend