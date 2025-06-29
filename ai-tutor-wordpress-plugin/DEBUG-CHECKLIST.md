# WordPress 400 Error Debug Checklist

## Step-by-Step Debugging Process

### Step 1: Basic WordPress Environment Check

1. **Copy `wp-debug-simple.html` to your WordPress root directory**
   - Place it next to wp-config.php
   - Access via: `http://your-site.com/wp-debug-simple.html`

2. **Check the results:**
   - ✅ 200 status = WordPress AJAX working
   - ❌ 400 status = Request rejected (most common)
   - ❌ 404 status = WordPress not found at that URL
   - ❌ Network error = Server/connection issue

### Step 2: Verify WordPress Configuration

**Check these WordPress files exist:**
```
your-wordpress-folder/
├── wp-config.php
├── wp-admin/
│   └── admin-ajax.php
├── wp-content/
│   └── plugins/
│       └── ai-tutor-wordpress-plugin/
└── wp-includes/
```

**WordPress URL Structure:**
- Standard: `http://localhost/wordpress/`
- Subfolder: `http://localhost/your-site/`
- Root: `http://localhost/`

### Step 3: Plugin Verification

1. **Check Plugin Activation:**
   - Go to WordPress Admin → Plugins
   - Look for "AI Tutor - Interactive Learning Platform"
   - Status should be "Active"

2. **Check Plugin Files:**
   ```
   wp-content/plugins/ai-tutor-wordpress-plugin/
   ├── ai-tutor.php (main file)
   ├── includes/
   │   └── class-api.php (AJAX handlers)
   └── assets/js/
       └── ai-tutor-navigation.js
   ```

### Step 4: Enable WordPress Debug Mode

Add to wp-config.php (before "That's all, stop editing!"):
```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

**Check debug log:**
- Location: `wp-content/debug.log`
- Look for "AI Tutor:" entries
- Check for PHP errors

### Step 5: Test AJAX Manually

**Method 1: Browser Network Tab**
1. Open browser Developer Tools (F12)
2. Go to Network tab
3. Try clicking a subject in the plugin
4. Look for admin-ajax.php request
5. Check the response details

**Method 2: Direct AJAX Test**
Use browser console (F12 → Console):
```javascript
fetch('/wordpress/wp-admin/admin-ajax.php', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: 'action=ai_tutor_get_subjects&nonce=test'
}).then(r => r.text()).then(console.log)
```

### Step 6: Common 400 Error Solutions

**Issue: Invalid Nonce**
- Solution: Hard refresh page (Ctrl+F5)
- Clear browser cache
- Check if user is logged in

**Issue: Action Not Found**
- Check plugin is activated
- Verify ai-tutor.php loads correctly
- Check for PHP errors in debug log

**Issue: Wrong WordPress URL**
- Update wpUrl in wp-debug-simple.html
- Common paths: `/wordpress/`, `/`, `/wp/`

**Issue: Permissions**
- Ensure WordPress files are readable
- Check web server permissions
- Verify .htaccess isn't blocking requests

### Step 7: Alternative Solutions

**Option A: Use Replit Backend**
1. Go to WordPress Admin → AI Tutor → Settings
2. Set Backend URL to your Replit app URL
3. Click "Test Connection"

**Option B: Use Fallback Mode**
- The plugin automatically provides basic functionality
- Limited features but no AJAX dependency

## Quick Fixes to Try

1. **Deactivate and reactivate the plugin**
2. **Clear all caches** (browser + WordPress plugins)
3. **Hard refresh** the page (Ctrl+F5 or Cmd+Shift+R)
4. **Check WordPress is updated** to latest version
5. **Disable other plugins temporarily** to check for conflicts

## Getting Help

If none of these steps work, gather this information:
- WordPress version
- Plugin activation status
- Contents of wp-content/debug.log
- Results from wp-debug-simple.html test
- Browser console errors (F12 → Console)
- Network tab details (F12 → Network)

## Success Indicators

✅ wp-debug-simple.html shows 200 status
✅ No errors in WordPress debug log
✅ Plugin shows as "Active" in WordPress admin
✅ Browser console shows no JavaScript errors
✅ Subject cards are clickable without 400 errors