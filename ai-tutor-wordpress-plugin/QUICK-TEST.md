# Quick Test Guide for AI Tutor WordPress Plugin

## Testing the Plugin

### 1. Basic Setup Test
1. Install and activate the plugin
2. Go to **AI Tutor > Settings**
3. Add your Google API key
4. Save settings

### 2. Create Test Content
1. Go to **AI Subjects > Add New**
   - Title: "Mathematics"
   - Content: "Learn math concepts with AI assistance"
   - Save

2. Go to **AI Lessons > Add New**
   - Title: "Basic Algebra"
   - Content: "Introduction to algebraic concepts"
   - Select "Mathematics" as subject
   - Save and note the lesson ID (usually 1 for first lesson)

### 3. Test Shortcodes
Create a new page/post and test these shortcodes:

**Dashboard:**
```
[ai_tutor_dashboard]
```

**Subjects:**
```
[ai_tutor_subjects]
```

**Basic Lesson:**
```
[ai_tutor_lesson lesson_id="1"]
```

**AI-Powered Lesson:**
```
[ai_tutor_ai_lesson lesson_id="1"]
```

### 4. Expected Results
- No PHP errors or warnings
- Templates load properly
- AI features work with Google API key
- Chat interface appears in AI lesson
- Content generation buttons work

### 5. Troubleshooting
If you see errors:
1. Check that lesson_id exists
2. Verify user is logged in (required for lessons)
3. Ensure Google API key is configured
4. Check WordPress error logs

### 6. API Key Setup
Get your free Google API key:
1. Go to https://aistudio.google.com/
2. Sign in with Google account
3. Click "Get API Key"
4. Create new API key
5. Copy and paste into WordPress settings

The plugin now works entirely locally without needing any external deployment.