# Local WordPress Setup for AI Tutor Plugin

Based on your screenshot, you have WordPress running locally. Here's how to add the AI Tutor:

## Step 1: Install the Plugin

1. **Find your WordPress folder** - looks like it's running at `portfolio` 
2. **Copy the plugin folder** `ai-tutor-wordpress-plugin` to:
   - `[your-wordpress-path]/wp-content/plugins/`
   
   For example, if your WordPress is at:
   - `C:\xampp\htdocs\portfolio\wp-content\plugins\`
   - Or wherever your local WordPress files are located

## Step 2: Activate in WordPress Admin

1. **Go to WordPress Admin** (the admin bar is visible in your screenshot)
2. **Click on the WordPress logo** → Dashboard
3. **Navigate to:** Plugins → Installed Plugins
4. **Find:** "AI Tutor - Interactive Learning Platform"
5. **Click:** "Activate"

## Step 3: Create AI Tutor Page

Since you already have a "Dashboard" page, you can either:

**Option A: Add to existing Dashboard page**
1. Go to Pages → All Pages
2. Edit your "Dashboard" page
3. Add this shortcode: `[ai_tutor_dashboard]`
4. Update the page

**Option B: Create new dedicated page**
1. Pages → Add New
2. Title: "AI Learning"
3. Content: `[ai_tutor_dashboard]`
4. Publish

## Step 4: View the AI Tutor

Visit your page:
- If added to Dashboard: `http://localhost/portfolio/dashboard/`
- If new page: `http://localhost/portfolio/ai-learning/`

The AI Tutor interface will appear embedded in your WordPress page.

## What You'll See

The AI Tutor includes:
- Subject selection (Math, Chemistry, Physics, Literature)
- Interactive lessons with AI chat
- Progress tracking
- Voice-enabled responses
- Responsive design matching your theme

## Testing Without API Keys

The plugin works without API keys - it uses fallback responses for the AI chat, so you can test all functionality immediately.