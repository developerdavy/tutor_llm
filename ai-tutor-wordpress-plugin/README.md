# AI Tutor WordPress Plugin

An AI-powered educational plugin for WordPress that provides intelligent tutoring, content generation, and interactive learning experiences.

## Features

- **AI-Powered Chat**: Real-time conversations with an AI tutor
- **Content Generation**: Automatic lesson creation with examples and quizzes
- **Question Generation**: Dynamic assessment creation
- **Progress Tracking**: Student learning analytics
- **Multiple Deployment Options**: Works locally or with external backend

## Installation

1. Download the plugin files
2. Upload to `/wp-content/plugins/ai-tutor-wordpress-plugin/`
3. Activate the plugin through the 'Plugins' menu in WordPress
4. Configure settings in **AI Tutor > Settings** or **Settings > AI Tutor**

## Setup

### Option 1: Local Setup (Recommended)
1. Get a free Google API key from [Google AI Studio](https://aistudio.google.com/)
2. Go to **AI Tutor > Settings** in WordPress admin
3. Enter your Google API key
4. Save settings

### Option 2: External Backend (Optional)
1. Deploy your Replit backend
2. Enter the backend URL in settings
3. Configure API key if needed

## Usage

### Creating Content
1. Create subjects using **AI Subjects** post type
2. Create lessons using **AI Lessons** post type
3. Use shortcodes in posts/pages

### Available Shortcodes
- `[ai_tutor_dashboard]` - Main dashboard
- `[ai_tutor_subjects]` - Subject listing
- `[ai_tutor_lesson lesson_id="123"]` - Basic lesson display
- `[ai_tutor_ai_lesson lesson_id="123"]` - AI-powered lesson with full features

### AI Features
- **Content Generation**: Click "Generate AI Content" on lessons
- **Real-time Chat**: Interactive AI tutor conversations
- **Question Generation**: Create custom quizzes automatically
- **Answer Evaluation**: Intelligent feedback on student responses

## Post Types

### AI Subjects
- **Name**: Subject title
- **Description**: Brief description
- **Icon**: Icon identifier
- **Color**: Theme color

### AI Lessons
- **Title**: Lesson name
- **Content**: Lesson material
- **Subject**: Associated subject
- **Difficulty**: Beginner/Intermediate/Advanced
- **Duration**: Estimated time in minutes
- **Order**: Sequence within subject

## Database Tables

The plugin creates these tables:
- `wp_ai_tutor_user_progress` - Learning progress tracking
- `wp_ai_tutor_chat_messages` - Chat conversation history

## Requirements

- WordPress 5.0+
- PHP 7.4+
- MySQL 5.6+
- Google API key (for AI features)

## Security

- Input sanitization on all forms
- Nonce verification for admin actions
- Capability checks for admin functions
- Secure API communication

## Support

For issues or questions, check the settings page for configuration help and status indicators.

## License

GPL v2 or later