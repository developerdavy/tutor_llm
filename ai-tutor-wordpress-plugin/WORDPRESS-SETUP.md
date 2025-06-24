# WordPress AI Tutor Plugin Setup Guide

## Step-by-Step Installation

### 1. Install Plugin Files
Copy the entire `ai-tutor-wordpress-plugin` folder to your WordPress plugins directory:
- Local WordPress: `wp-content/plugins/`
- Example path: `C:\xampp\htdocs\yoursite\wp-content\plugins\ai-tutor-wordpress-plugin\`

### 2. Activate Plugin
1. Go to WordPress Admin → Plugins
2. Find "AI Tutor - Interactive Learning Platform"
3. Click "Activate"

### 3. Create Learning Page
1. WordPress Admin → Pages → Add New
2. Title: "Learning Dashboard"
3. Content: `[ai_tutor_dashboard]`
4. Publish

### 4. Test Installation
Visit your new page. You should see:
- AI Tutor navigation bar
- Subject cards (Math, Chemistry, Physics, Literature)
- AI avatar with speech bubble
- Progress tracker

## Troubleshooting

### If subjects don't appear:
1. Check browser console (F12) for JavaScript errors
2. Verify plugin is activated
3. Try refreshing the page
4. Check if shortcode is properly placed

### If styling looks wrong:
1. Clear any caching plugins
2. Check theme compatibility
3. Inspect CSS conflicts

### If functionality doesn't work:
1. Open browser console (F12)
2. Look for "AI Tutor initializing..." message
3. Check for any red error messages
4. Ensure no other JavaScript conflicts

## Debug Mode
Add this to a test page to debug:
```php
<?php echo do_shortcode('[ai_tutor_dashboard]'); ?>
<script>
console.log('Debug: AiTutorReact available:', typeof window.AiTutorReact);
console.log('Debug: App instance:', window.aiTutorApp);
</script>
```

## Features Available
- Subject selection with progress tracking
- Interactive lessons with difficulty levels
- AI chat with contextual responses
- Voice synthesis for AI responses
- Progress persistence in browser storage
- Mobile-responsive design

## Browser Requirements
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

The plugin creates the exact same interface and functionality as the original React application, fully integrated into WordPress.