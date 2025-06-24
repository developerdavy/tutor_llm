# AI Tutor WordPress Plugin - Installation Guide

## Quick Installation

### Step 1: Install Plugin
1. Download the `ai-tutor-wordpress-plugin` folder
2. Upload it to your WordPress `/wp-content/plugins/` directory
3. Go to WordPress Admin > Plugins
4. Find "AI Tutor - Interactive Learning Platform"
5. Click "Activate"

### Step 2: Access Settings
You can find the settings in **two locations**:
- **AI Tutor > Settings** (main menu)
- **Settings > AI Tutor** (WordPress settings menu)

### Step 3: Configure Google API Key
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key" 
4. Create a new API key
5. Copy the key
6. In WordPress, go to **AI Tutor > Settings**
7. Paste the key in "Google API Key" field
8. Click "Save Changes"

### Step 4: Test the Plugin
1. Go to **AI Tutor** in the WordPress admin menu
2. Create a new Subject:
   - Go to **AI Subjects > Add New**
   - Title: "Mathematics"
   - Description: "Math lessons and tutorials"
   - Save
3. Create a new Lesson:
   - Go to **AI Lessons > Add New**
   - Title: "Basic Algebra"
   - Select the Mathematics subject
   - Save
4. Test in a post/page:
   - Create a new post
   - Add the shortcode: `[ai_tutor_ai_lesson lesson_id="1"]`
   - Publish and view

## Troubleshooting

### Can't Find AI Tutor Settings?
Check these locations:
- **AI Tutor > Settings** (left sidebar)
- **Settings > AI Tutor** (under Settings)

### AI Features Not Working?
1. Verify Google API key is entered correctly
2. Check the status indicator on settings page
3. Ensure your API key has Gemini API access enabled

### Shortcode Not Displaying?
1. Make sure the plugin is activated
2. Verify the lesson ID exists
3. Check if the lesson has a valid subject assigned

### Permission Issues?
- Only users with "manage_options" capability can access settings
- Ensure you're logged in as an administrator

## Advanced Configuration

### Custom Post Types
The plugin creates:
- **AI Subjects**: Educational subjects/categories
- **AI Lessons**: Individual lessons within subjects

### Database Tables
Automatically created:
- `wp_ai_tutor_user_progress`: Tracks student progress
- `wp_ai_tutor_chat_messages`: Stores chat conversations

### External Backend (Optional)
If you have a deployed Replit backend:
1. Enter the URL in "AI Backend URL" field
2. Add API key if required
3. The plugin will use both local and external AI features

## Usage Examples

### Basic Lesson Display
```
[ai_tutor_lesson lesson_id="1"]
```

### AI-Powered Lesson (Full Features)
```
[ai_tutor_ai_lesson lesson_id="1"]
```

### Subject Listing
```
[ai_tutor_subjects]
```

### Student Dashboard
```
[ai_tutor_dashboard]
```

## Security Notes

- API keys are stored securely in WordPress options
- All forms use nonce verification
- Input is sanitized and validated
- Only administrators can access settings

## Need Help?

1. Check the status indicators on the settings page
2. Verify your Google API key is valid
3. Ensure proper WordPress permissions
4. Test with simple shortcodes first

The plugin includes fallback responses when AI is unavailable, so basic functionality always works.