# AI Tutor WordPress Plugin - Installation Guide

## Quick Setup Instructions

### Step 1: Install the Plugin
1. Download the `ai-tutor-wordpress-plugin` folder from this project
2. Upload it to your WordPress site's `/wp-content/plugins/` directory
3. Go to your WordPress admin → Plugins → Installed Plugins
4. Find "AI Tutor - Interactive Learning Platform" and click "Activate"

### Step 2: Configure the Plugin
1. In WordPress admin, go to **AI Tutor → Settings**
2. Add your API keys (optional for basic functionality):
   - OpenAI API Key for advanced chat features
   - Google Gemini API Key for content generation
3. Click "Save Changes"

### Step 3: Create Content
The plugin automatically creates sample subjects and lessons, but you can add more:

1. Go to **AI Tutor → Add New Subject**
   - Title: e.g., "Mathematics"
   - Description: e.g., "Algebra, Geometry, Calculus"
   - Icon: e.g., "📊" (emoji or text)
   - Color: Choose a hex color like #1E88E5

2. Go to **AI Tutor → Add New Lesson**
   - Title: e.g., "Algebraic Expressions"
   - Assign to a Subject
   - Set Order, Difficulty, Duration
   - Add lesson content

### Step 4: Display on Your Site
Create pages in WordPress and add these shortcodes:

#### Main Learning Dashboard Page
1. Create a new page: **Pages → Add New**
2. Title: "Learning Dashboard" 
3. Content: `[ai_tutor_dashboard]`
4. Publish the page

#### Subjects Overview Page
1. Create a new page: **Pages → Add New**
2. Title: "Subjects"
3. Content: `[ai_tutor_subjects]`
4. Publish the page

### Step 5: Access Your AI Tutor
Visit the pages you created:
- `yoursite.com/learning-dashboard` (or whatever you named the page)
- `yoursite.com/subjects`

## Important Notes

✅ **Correct Usage:** Access through WordPress pages with shortcodes
❌ **Incorrect:** Trying to access as a separate website/domain

The AI Tutor runs WITHIN your existing WordPress site, not as a standalone application.

## Troubleshooting

### "This site can't be reached" Error
This means you're trying to access the wrong URL. The AI Tutor is not a separate website - it's embedded in your WordPress pages.

**Solution:** 
1. Go to your WordPress site
2. Visit the page where you added the `[ai_tutor_dashboard]` shortcode
3. The AI Tutor interface will appear on that page

### Plugin Not Showing
1. Verify the plugin is activated in WordPress admin
2. Check that you've added the shortcode to a published page
3. Ensure your theme supports shortcodes

### No Subjects/Lessons Appearing
1. Go to **AI Tutor → Dashboard** in WordPress admin
2. Check if default content was created
3. Manually add subjects and lessons if needed

## Sample Page Setup

Here's exactly what to do:

1. **WordPress Admin → Pages → Add New**
2. **Title:** "AI Learning Platform"
3. **Content:** 
   ```
   Welcome to our AI Learning Platform!
   
   [ai_tutor_dashboard]
   ```
4. **Click Publish**
5. **Visit the page** - this is where your AI Tutor will be

The AI Tutor interface will appear embedded within your WordPress page, using your site's theme and styling.