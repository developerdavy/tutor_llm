<?php
// Settings page template

// Handle form submission
if (isset($_POST['submit']) && wp_verify_nonce($_POST['ai_tutor_settings_nonce'], 'ai_tutor_settings')) {
    update_option('ai_tutor_openai_api_key', sanitize_text_field($_POST['openai_api_key']));
    update_option('ai_tutor_gemini_api_key', sanitize_text_field($_POST['gemini_api_key']));
    update_option('ai_tutor_voice_enabled', isset($_POST['voice_enabled']) ? 1 : 0);
    update_option('ai_tutor_auto_generate_content', isset($_POST['auto_generate_content']) ? 1 : 0);
    
    echo '<div class="notice notice-success"><p>Settings saved successfully!</p></div>';
}

// Get current settings
$openai_api_key = get_option('ai_tutor_openai_api_key', '');
$gemini_api_key = get_option('ai_tutor_gemini_api_key', '');
$voice_enabled = get_option('ai_tutor_voice_enabled', 1);
$auto_generate_content = get_option('ai_tutor_auto_generate_content', 0);
?>

<div class="wrap">
    <h1>AI Tutor - Settings</h1>
    
    <form method="post" action="">
        <?php wp_nonce_field('ai_tutor_settings', 'ai_tutor_settings_nonce'); ?>
        
        <table class="form-table">
            <tbody>
                <tr>
                    <th scope="row">
                        <label for="openai_api_key">OpenAI API Key</label>
                    </th>
                    <td>
                        <input type="password" id="openai_api_key" name="openai_api_key" 
                               value="<?php echo esc_attr($openai_api_key); ?>" class="regular-text" />
                        <p class="description">
                            Enter your OpenAI API key for AI-powered chat responses. 
                            <a href="https://platform.openai.com/api-keys" target="_blank">Get your API key here</a>
                        </p>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="gemini_api_key">Google Gemini API Key</label>
                    </th>
                    <td>
                        <input type="password" id="gemini_api_key" name="gemini_api_key" 
                               value="<?php echo esc_attr($gemini_api_key); ?>" class="regular-text" />
                        <p class="description">
                            Enter your Google Gemini API key for lesson content generation. 
                            <a href="https://makersuite.google.com/app/apikey" target="_blank">Get your API key here</a>
                        </p>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">Voice Features</th>
                    <td>
                        <fieldset>
                            <label for="voice_enabled">
                                <input type="checkbox" id="voice_enabled" name="voice_enabled" value="1" 
                                       <?php checked($voice_enabled, 1); ?> />
                                Enable text-to-speech for AI responses
                            </label>
                            <p class="description">
                                When enabled, AI responses will be read aloud using the browser's speech synthesis.
                            </p>
                        </fieldset>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">Content Generation</th>
                    <td>
                        <fieldset>
                            <label for="auto_generate_content">
                                <input type="checkbox" id="auto_generate_content" name="auto_generate_content" value="1" 
                                       <?php checked($auto_generate_content, 1); ?> />
                                Automatically generate lesson content with AI
                            </label>
                            <p class="description">
                                When enabled, lessons without content will automatically generate AI-powered educational material.
                            </p>
                        </fieldset>
                    </td>
                </tr>
            </tbody>
        </table>
        
        <h2>Integration Instructions</h2>
        
        <div class="ai-tutor-instructions">
            <div class="instruction-section">
                <h3>🎯 Getting Started</h3>
                <ol>
                    <li>Configure your API keys above for AI functionality</li>
                    <li>Create subjects using the <a href="<?php echo admin_url('post-new.php?post_type=ai_subject'); ?>">Add New Subject</a> page</li>
                    <li>Add lessons to each subject using the <a href="<?php echo admin_url('post-new.php?post_type=ai_lesson'); ?>">Add New Lesson</a> page</li>
                    <li>Use shortcodes to display the AI Tutor on your pages</li>
                </ol>
            </div>
            
            <div class="instruction-section">
                <h3>📝 Page Setup Examples</h3>
                
                <h4>Main Learning Dashboard Page</h4>
                <p>Create a new page and add this shortcode:</p>
                <code>[ai_tutor_dashboard]</code>
                
                <h4>Subjects Overview Page</h4>
                <p>Create a page to show all subjects:</p>
                <code>[ai_tutor_subjects show_progress="true"]</code>
                
                <h4>Individual Lesson Page</h4>
                <p>Link to specific lessons using:</p>
                <code>[ai_tutor_lesson lesson_id="123"]</code>
            </div>
            
            <div class="instruction-section">
                <h3>🔧 Advanced Configuration</h3>
                
                <h4>Custom CSS</h4>
                <p>Add custom styling to match your theme by overriding these CSS classes:</p>
                <ul>
                    <li><code>.ai-tutor-container</code> - Main container</li>
                    <li><code>.ai-tutor-card</code> - Content cards</li>
                    <li><code>.ai-tutor-btn</code> - Buttons</li>
                    <li><code>.subject-item</code> - Subject selection items</li>
                </ul>
                
                <h4>JavaScript Hooks</h4>
                <p>Extend functionality using these JavaScript events:</p>
                <ul>
                    <li><code>ai_tutor_subject_selected</code> - Fired when user selects a subject</li>
                    <li><code>ai_tutor_lesson_completed</code> - Fired when user completes a lesson</li>
                    <li><code>ai_tutor_chat_message</code> - Fired when user sends a chat message</li>
                </ul>
            </div>
        </div>
        
        <?php submit_button(); ?>
    </form>
</div>

<style>
.ai-tutor-instructions {
    background: #f9f9f9;
    padding: 20px;
    border-radius: 8px;
    margin-top: 20px;
}

.instruction-section {
    margin-bottom: 30px;
}

.instruction-section h3 {
    color: #0073aa;
    border-bottom: 2px solid #0073aa;
    padding-bottom: 5px;
}

.instruction-section h4 {
    color: #333;
    margin-top: 20px;
}

.instruction-section code {
    background: #f1f1f1;
    padding: 3px 6px;
    border-radius: 3px;
    font-family: monospace;
}

.instruction-section ol, .instruction-section ul {
    margin-left: 20px;
}

.instruction-section li {
    margin-bottom: 8px;
}
</style>