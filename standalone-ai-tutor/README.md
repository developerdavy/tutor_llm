# AI Tutor - Standalone Application

A complete standalone version of the AI tutoring platform with the exact same UI/UX and functionality as the original React application, but packaged as simple HTML/CSS/JavaScript files that can be hosted anywhere.

## Features

- 📚 **Complete Subject Library**: Mathematics, Chemistry, Physics, and Literature with detailed lessons
- 🤖 **Interactive AI Chat**: Contextual responses based on selected lessons and topics
- 📊 **Progress Tracking**: Local storage-based progress tracking with visual indicators
- 🔊 **Voice Features**: Text-to-speech for AI responses (browser-based)
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- 💾 **Offline Storage**: All progress and chat history saved locally
- 🎨 **Modern UI**: Clean, professional interface matching the original React design

## Quick Start

1. **Download Files**: Copy all files from the `standalone-ai-tutor` folder
2. **Host Locally**: Open `index.html` in any web browser
3. **Or Upload**: Upload all files to any web hosting service
4. **Start Learning**: Select a subject and begin your learning journey!

## File Structure

```
standalone-ai-tutor/
├── index.html              # Main application file
├── assets/
│   ├── css/
│   │   └── styles.css      # All styling and animations
│   └── js/
│       ├── data.js         # Subjects, lessons, and learning content
│       └── app.js          # Main application logic
└── README.md               # This file
```

## Hosting Options

### 1. Local Development
Simply open `index.html` in your web browser - no server required!

### 2. Simple Web Hosting
Upload all files to any web hosting service:
- Netlify (drag & drop the folder)
- Vercel (connect to GitHub repo)
- GitHub Pages (push to repository)
- Any traditional web host (FTP upload)

### 3. Local Server
For development with live reload:
```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

## Content Structure

### Subjects Available
- **Mathematics**: Algebra, Functions, Trigonometry
- **Chemistry**: Atomic Theory, Chemical Bonding
- **Physics**: Kinematics, Forces and Motion
- **Literature**: Literary Analysis, Poetry

### Each Lesson Includes
- Detailed overview and learning objectives
- Key topics breakdown
- Worked examples with explanations
- Interactive chat support
- Progress tracking
- Difficulty indicators

## Features in Detail

### AI Chat System
- Context-aware responses based on current lesson
- Helpful explanations and examples
- Encouragement and learning guidance
- Keyword-based intelligent responses

### Progress Tracking
- Individual lesson completion
- Subject-wise progress bars
- Overall learning statistics
- Persistent data storage

### Voice Features
- Toggle voice responses on/off
- Browser-based text-to-speech
- Visual indicators during speech
- Adjustable speech settings

## Customization

### Adding New Subjects/Lessons
Edit `assets/js/data.js` to add new content:

```javascript
SUBJECTS_DATA.push({
    id: 5,
    name: "New Subject",
    description: "Subject description",
    icon: "📖",
    color: "#FF6B6B",
    lessons: [
        {
            id: 10,
            title: "New Lesson",
            description: "Lesson description",
            difficulty: "beginner",
            estimatedDuration: 30,
            order: 1,
            content: {
                overview: "Lesson overview",
                topics: ["Topic 1", "Topic 2"],
                examples: [
                    {
                        problem: "Example problem",
                        solution: "Solution",
                        explanation: "Explanation"
                    }
                ]
            }
        }
    ]
});
```

### Styling Customization
Edit `assets/css/styles.css` to modify colors, fonts, layout, etc.

### AI Response Customization
Edit the `AI_RESPONSES` object in `assets/js/data.js` to customize chat responses.

## Technical Notes

- **No Build Process**: Pure HTML/CSS/JavaScript - no compilation needed
- **Modern Browser Support**: Uses ES6+ features, works in all modern browsers
- **Local Storage**: All data persisted in browser's localStorage
- **Responsive**: Mobile-first design with Tailwind CSS classes
- **Accessible**: Semantic HTML and proper ARIA labels

## Performance

- **Fast Loading**: Minimal dependencies, optimized CSS/JS
- **Smooth Animations**: CSS-based transitions and animations
- **Efficient Storage**: Compact JSON data structure
- **Memory Efficient**: No memory leaks, proper cleanup

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Data Storage

All user data is stored locally in the browser:
- `ai_tutor_user_progress`: Lesson completion tracking
- `ai_tutor_chat_history`: Chat conversation history
- `ai_tutor_voice_enabled`: Voice preference setting

## Future Enhancements

Easily extensible for:
- Server-based progress synchronization
- Real AI API integration (OpenAI, Google Gemini)
- Additional subjects and content
- Advanced quiz functionality
- User authentication system

This standalone version provides the complete AI tutoring experience with the exact same polished interface and functionality as the original React application, but with the simplicity of static files that can be hosted anywhere.