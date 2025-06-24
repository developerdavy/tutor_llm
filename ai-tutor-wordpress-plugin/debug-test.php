<?php
/**
 * Debug Test Page for AI Tutor Plugin
 * Add this to test the plugin functionality
 */

// Simple test page to verify plugin is working
?>
<!DOCTYPE html>
<html>
<head>
    <title>AI Tutor Debug Test</title>
    <?php wp_head(); ?>
</head>
<body>
    <h1>AI Tutor Debug Test</h1>
    
    <div style="background: #f0f0f0; padding: 20px; margin: 20px 0;">
        <h2>Plugin Status</h2>
        <p>Plugin Active: <?php echo is_plugin_active('ai-tutor-wordpress-plugin/ai-tutor.php') ? 'Yes' : 'No'; ?></p>
        <p>Scripts Enqueued: Check browser console</p>
        <p>CSS Loaded: Check page source</p>
    </div>
    
    <div style="background: #e0f7ff; padding: 20px; margin: 20px 0;">
        <h2>AI Tutor Dashboard Test</h2>
        <?php echo do_shortcode('[ai_tutor_dashboard]'); ?>
    </div>
    
    <script>
        console.log('Debug: Page loaded');
        console.log('Debug: AiTutorReact available:', typeof window.AiTutorReact);
        console.log('Debug: aiTutorApp instance:', window.aiTutorApp);
        
        // Test if elements exist
        console.log('Debug: ai-tutor-app element:', document.getElementById('ai-tutor-app'));
        console.log('Debug: subjects-list element:', document.getElementById('subjects-list'));
        console.log('Debug: voice-toggle element:', document.getElementById('voice-toggle'));
    </script>
    
    <?php wp_footer(); ?>
</body>
</html>