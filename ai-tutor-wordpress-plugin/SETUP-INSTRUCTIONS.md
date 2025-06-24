# AI Tutor WordPress Plugin Setup Instructions

## Quick Setup Steps

### 1. Install and Activate Plugin
1. Upload the `ai-tutor-wordpress-plugin` folder to `/wp-content/plugins/`
2. Go to WordPress Admin > Plugins
3. Find "AI Tutor - Interactive Learning Platform"
4. Click "Activate"

### 2. Configure Settings
1. Go to **AI Tutor > Settings** in WordPress admin
2. Add your Google API key (get free key from https://aistudio.google.com/)
3. Save settings

### 3. Create Content (Choose Option A or B)

#### Option A: Create Sample Data (Recommended)
1. After activating the plugin, you'll see a notice in the admin
2. Click "create sample data" to automatically generate:
   - 3 subjects (Mathematics, Chemistry, Literature)
   - Multiple lessons for each subject
   - Proper metadata and relationships

#### Option B: Create Manual Content
1. Go to **AI Subjects > Add New**
   - Title: "Mathematics"
   - Content: "Learn math concepts"
   - Icon: 📐 (emoji)
   - Color: Choose a color
   - Save

2. Go to **AI Lessons > Add New**
   - Title: "Basic Algebra"
   - Content: "Introduction to algebra"
   - Subject: Select "Mathematics"
   - Difficulty: Beginner
   - Duration: 30 minutes
   - Order: 1
   - Save

### 4. Test the Plugin
Create a new page/post and add shortcodes:

**Dashboard:**
```
[ai_tutor_dashboard]
```

**Subjects with lessons:**
```
[ai_tutor_subjects]
```

**Individual lesson:**
```
[ai_tutor_lesson lesson_id="1"]
```

**AI-powered lesson with chat:**
```
[ai_tutor_ai_lesson lesson_id="1"]
```

### 5. Verify Everything Works
- Dashboard shows subjects with lesson counts
- Subject cards show available lessons (not "NO LESSONS AVAILABLE")
- Clicking on lessons opens interactive interfaces
- AI chat works with Google API key configured

## Troubleshooting

### Still Seeing "NO LESSONS AVAILABLE"?
1. Check that lessons are published (not draft)
2. Verify lessons have a subject assigned in the lesson meta box
3. Try creating sample data via the admin notice

### Plugin Not Working?
1. Make sure you're logged in (lessons require login)
2. Check WordPress error logs for PHP errors
3. Verify correct lesson IDs in shortcodes

### AI Features Not Working?
1. Add Google API key in settings
2. Test with simple questions first
3. Check browser console for JavaScript errors

The plugin creates a complete AI-powered learning platform that works entirely within WordPress without requiring external deployment.