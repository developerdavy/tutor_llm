# AI Tutor WordPress Plugin - Local Setup Guide

## Quick Setup (Recommended for Local Testing)

The "Backend connection failed" error is **normal and expected** when running WordPress locally. Here's how to set it up properly:

### Step 1: Install Plugin
1. Copy the `ai-tutor-wordpress-plugin` folder to your WordPress `/wp-content/plugins/` directory
2. Go to **WordPress Admin → Plugins** → Activate "AI Tutor - Interactive Learning Platform"

### Step 2: Configure Direct AI Mode (Recommended)
1. Go to **WordPress Admin → AI Subjects → AI Settings**
2. **Leave "AI Backend URL" EMPTY** (this enables Direct AI mode)
3. **Add your Google API Key** in the "Google Gemini API Key" field
4. Click **Save Changes**

### Step 3: Get Google API Key
1. Visit: https://aistudio.google.com/
2. Sign in with your Google account
3. Click "Get API Key" 
4. Copy the key and paste it in WordPress settings

### Step 4: Test the Setup
1. Go to **WordPress Admin → AI Subjects → Add New**
2. Create a subject (e.g., "Mathematics")
3. Go to **AI Lessons → Add New** 
4. Create a lesson and assign it to your subject
5. Add this shortcode to any post/page: `[ai_tutor_ai_lesson lesson_id="1"]`

## Why This Works Better Than Backend Mode

**Direct AI Mode Benefits:**
- ✅ No need to keep Replit server running
- ✅ Works entirely within your local WordPress
- ✅ Faster responses (direct API calls)
- ✅ Simpler configuration
- ✅ Perfect for testing and development

**Backend Mode** (when Backend URL is set):
- ❌ Requires deployed server
- ❌ Network connectivity issues
- ❌ More complex setup
- ✅ Advanced features like progress tracking

## Troubleshooting

**"Backend connection failed" Error:**
- This is normal! Just use Direct AI mode instead
- Leave Backend URL empty in settings

**"No API key found" Error:**
- Add your Google API key in WordPress settings
- Make sure you saved the settings

**"Content generation failed" Error:**
- Check your Google API key is valid
- Ensure you have API credits/quota available

## Usage Examples

Once configured, you can use these shortcodes:

```
[ai_tutor_ai_lesson lesson_id="1"]          - Full AI lesson interface
[ai_tutor_dashboard]                        - Student dashboard  
[ai_tutor_subjects]                         - Browse subjects
```

The plugin will automatically generate AI content, handle chat conversations, and create interactive quizzes - all using your Google API key directly.