# WordPress Plugin Troubleshooting Guide

## Common Issues and Solutions

### 1. AJAX 400 Error (Bad Request)

**Error:** `POST http://localhost/wordpress/wp-admin/admin-ajax.php 400 (Bad Request)`

**Causes and Solutions:**

1. **WordPress Environment Not Properly Configured**
   - Ensure WordPress is installed and running
   - Verify the URL structure matches your WordPress installation
   - Check that `wp-admin/admin-ajax.php` is accessible

2. **Plugin Not Activated**
   - Go to WordPress Admin → Plugins
   - Activate "AI Tutor - Interactive Learning Platform"

3. **Nonce Security Issues**
   - Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)
   - Clear browser cache
   - Check if user is logged in to WordPress

4. **JavaScript Caching Issues**
   - Clear browser cache completely
   - Disable any caching plugins temporarily
   - Hard refresh the page multiple times

### 2. JavaScript Errors

**Error:** `TypeError: this.showSubjectDetails is not a function`

**Solution:**
- Clear browser cache and hard refresh
- Deactivate and reactivate the plugin
- Check browser console for additional errors

### 3. Missing AJAX Variables

**Error:** `WordPress AJAX variables not available`

**Solution:**
- Ensure you're viewing the page on a WordPress site
- Check that the shortcode is properly implemented
- Verify the plugin is activated

## Setup Instructions

### 1. Plugin Installation
1. Copy the `ai-tutor-wordpress-plugin` folder to your WordPress `wp-content/plugins/` directory
2. Go to WordPress Admin → Plugins
3. Activate "AI Tutor - Interactive Learning Platform"

### 2. Basic Configuration
1. Go to WordPress Admin → AI Tutor → Settings
2. Configure your AI backend URL (optional - uses local mode if not set)
3. Add Google API key for enhanced AI features (optional)

### 3. Using Shortcodes
Add these shortcodes to your WordPress pages or posts:

- `[ai_tutor_subjects]` - Display all available subjects
- `[ai_tutor_dashboard]` - Student dashboard (requires login)
- `[ai_tutor_ai_lesson lesson_id="123"]` - Specific AI-powered lesson

### 4. Creating Content
1. Go to WordPress Admin → Subjects → Add New
2. Create subjects with titles, descriptions, and metadata
3. Go to WordPress Admin → Lessons → Add New
4. Create lessons and assign them to subjects

## Testing the Plugin

### 1. Basic Test
1. Create a test page in WordPress
2. Add the shortcode `[ai_tutor_subjects]`
3. View the page on the frontend
4. Check browser console for any errors

### 2. AI Features Test
1. Go to AI Tutor → Settings
2. Click "Test Connection" to verify AI functionality
3. If using backend mode, ensure the Replit backend is running

## Development Notes

- The plugin works in two modes:
  - **Local Mode**: Uses Google AI directly (requires Google API key)
  - **Backend Mode**: Connects to Replit backend (requires backend URL)
- Always check browser console for detailed error messages
- Plugin version 1.0.1 includes improved error handling and debugging

## Support

If issues persist:
1. Check WordPress error logs
2. Enable WordPress debug mode
3. Verify all plugin dependencies are met
4. Ensure proper WordPress user permissions