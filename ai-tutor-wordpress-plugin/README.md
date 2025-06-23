# AI Tutor WordPress Plugin

An interactive AI tutoring platform for WordPress with personalized learning experiences, AI-generated lesson content, and real-time chat functionality.

## Features

- 📚 **Subject Management**: Create and organize learning subjects with custom icons and colors
- 📖 **Lesson System**: Build comprehensive lessons with difficulty levels and estimated duration
- 🤖 **AI Chat Integration**: Real-time chat with AI tutors using OpenAI or Google Gemini
- 📊 **Progress Tracking**: Monitor user learning progress and completion rates
- 🔊 **Voice Features**: Text-to-speech for AI responses (optional)
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices
- 🎨 **Customizable**: Easy to style and integrate with any WordPress theme

## Installation

1. Download the plugin files
2. Upload the `ai-tutor-wordpress-plugin` folder to your `/wp-content/plugins/` directory
3. Activate the plugin through the 'Plugins' menu in WordPress
4. Configure your API keys in the AI Tutor settings page

## Configuration

### API Keys Setup

1. Go to **AI Tutor > Settings** in your WordPress admin
2. Add your API keys:
   - **OpenAI API Key**: For chat functionality ([Get your key](https://platform.openai.com/api-keys))
   - **Google Gemini API Key**: For content generation ([Get your key](https://makersuite.google.com/app/apikey))

### Creating Content

1. **Add Subjects**: Go to **AI Tutor > Add New Subject**
   - Set title, description, icon, and color
   - Icons can be emojis or text (e.g., 📊, 🧪, ⚛️, 📚)

2. **Add Lessons**: Go to **AI Tutor > Add New Lesson**
   - Assign to a subject
   - Set order, difficulty, and estimated duration
   - Add lesson content and description

## Usage

### Shortcodes

Display the AI Tutor on your pages using these shortcodes:

#### Full Dashboard
```
[ai_tutor_dashboard]
```
Shows the complete learning interface with subjects, lessons, chat, and progress tracking.

#### Subjects Grid
```
[ai_tutor_subjects show_progress="true"]
```
Displays all subjects in a grid layout with optional progress indicators.

#### Individual Lesson
```
[ai_tutor_lesson lesson_id="123"]
```
Shows a specific lesson with its content and chat interface.

### Page Setup Examples

**Main Learning Page**
Create a new page and add:
```
[ai_tutor_dashboard]
```

**Subjects Overview**
Create a page for subject browsing:
```
[ai_tutor_subjects]
```

**Direct Lesson Access**
Link to specific lessons:
```
[ai_tutor_lesson lesson_id="123"]
```

## Customization

### CSS Classes

Override these CSS classes to match your theme:

- `.ai-tutor-container` - Main container
- `.ai-tutor-card` - Content cards
- `.ai-tutor-btn` - Buttons
- `.ai-tutor-subject-card` - Subject cards
- `.lesson-item` - Individual lessons
- `.chat-message` - Chat messages

### JavaScript Events

Extend functionality using these events:

```javascript
// Subject selection
document.addEventListener('ai_tutor_subject_selected', function(e) {
    console.log('Subject selected:', e.detail.subjectId);
});

// Lesson completion
document.addEventListener('ai_tutor_lesson_completed', function(e) {
    console.log('Lesson completed:', e.detail.lessonId);
});

// Chat interaction
document.addEventListener('ai_tutor_chat_message', function(e) {
    console.log('Chat message:', e.detail.message);
});
```

## Database Structure

The plugin creates two custom tables:

### `wp_ai_tutor_user_progress`
- Tracks user progress through lessons
- Stores completion status and progress percentage
- Links users to subjects and lessons

### `wp_ai_tutor_chat_messages`
- Stores chat conversation history
- Separates user messages from AI responses
- Links conversations to specific lessons

## Requirements

- WordPress 5.0 or higher
- PHP 7.4 or higher
- MySQL 5.6 or higher
- cURL extension for API calls
- JSON extension for data handling

## Support

For support and documentation, visit the plugin admin page at **AI Tutor > Dashboard** in your WordPress admin.

## License

This plugin is licensed under the GPL v2 or later.

## Changelog

### Version 1.0.0
- Initial release
- Subject and lesson management
- AI chat integration
- Progress tracking
- Responsive design
- Shortcode support