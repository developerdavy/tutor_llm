<?php

class AI_Tutor_Settings {
    
    public function init() {
        add_action('admin_menu', array($this, 'add_settings_page'));
        add_action('admin_init', array($this, 'init_settings'));
    }
    
    public function add_settings_page() {
        add_submenu_page(
            'edit.php?post_type=ai_subject',
            'AI Settings',
            'AI Settings',
            'manage_options',
            'ai-tutor-settings',
            array($this, 'settings_page')
        );
    }
    
    public function init_settings() {
        register_setting('ai_tutor_settings', 'ai_tutor_backend_url');
        register_setting('ai_tutor_settings', 'ai_tutor_api_key');
        register_setting('ai_tutor_settings', 'google_api_key');
        register_setting('ai_tutor_settings', 'openai_api_key');
        
        add_settings_section(
            'ai_tutor_backend_section',
            'AI Backend Configuration',
            array($this, 'backend_section_callback'),
            'ai_tutor_settings'
        );
        
        add_settings_field(
            'ai_tutor_backend_url',
            'AI Backend URL',
            array($this, 'backend_url_callback'),
            'ai_tutor_settings',
            'ai_tutor_backend_section'
        );
        
        add_settings_field(
            'ai_tutor_api_key',
            'API Key (if required)',
            array($this, 'api_key_callback'),
            'ai_tutor_settings',
            'ai_tutor_backend_section'
        );
        
        add_settings_section(
            'ai_tutor_direct_section',
            'Direct AI API Configuration (Optional)',
            array($this, 'direct_section_callback'),
            'ai_tutor_settings'
        );
        
        add_settings_field(
            'google_api_key',
            'Google Gemini API Key',
            array($this, 'google_api_key_callback'),
            'ai_tutor_settings',
            'ai_tutor_direct_section'
        );
        
        add_settings_field(
            'openai_api_key',
            'OpenAI API Key',
            array($this, 'openai_api_key_callback'),
            'ai_tutor_settings',
            'ai_tutor_direct_section'
        );
    }
    
    public function settings_page() {
        ?>
        <div class="wrap">
            <h1>AI Tutor Settings</h1>
            <form method="post" action="options.php">
                <?php
                settings_fields('ai_tutor_settings');
                do_settings_sections('ai_tutor_settings');
                submit_button();
                ?>
            </form>
            
            <div class="ai-tutor-test-section" style="margin-top: 30px; padding: 15px; border: 1px solid #ddd; background: #f9f9f9;">
                <h3>Test AI Connection</h3>
                <button type="button" id="test-ai-connection" class="button button-secondary">Test Connection</button>
                <div id="test-results" style="margin-top: 10px;"></div>
            </div>
        </div>
        
        <script>
        jQuery(document).ready(function($) {
            $('#test-ai-connection').click(function() {
                var button = $(this);
                var results = $('#test-results');
                
                button.prop('disabled', true).text('Testing...');
                results.html('');
                
                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    data: {
                        action: 'ai_tutor_test_connection',
                        nonce: '<?php echo wp_create_nonce('ai_tutor_nonce'); ?>'
                    },
                    success: function(response) {
                        if (response.success) {
                            results.html('<div style="color: green;">✓ Connection successful! Response: ' + response.data.response + '</div>');
                        } else {
                            results.html('<div style="color: red;">✗ Connection failed: ' + response.data + '</div>');
                        }
                    },
                    error: function() {
                        results.html('<div style="color: red;">✗ Connection test failed</div>');
                    },
                    complete: function() {
                        button.prop('disabled', false).text('Test Connection');
                    }
                });
            });
        });
        </script>
        <?php
    }
    
    public function backend_section_callback() {
        echo '<p>Configure your AI backend service URL. This should point to your Replit AI service.</p>';
    }
    
    public function direct_section_callback() {
        echo '<p>Optional: Configure direct API keys if not using the backend service.</p>';
    }
    
    public function backend_url_callback() {
        $value = get_option('ai_tutor_backend_url', '');
        echo '<input type="url" name="ai_tutor_backend_url" value="' . esc_attr($value) . '" class="regular-text" placeholder="https://your-app.replit.app" />';
        echo '<p class="description">Enter the URL of your AI Tutor backend service</p>';
    }
    
    public function api_key_callback() {
        $value = get_option('ai_tutor_api_key', '');
        echo '<input type="password" name="ai_tutor_api_key" value="' . esc_attr($value) . '" class="regular-text" />';
        echo '<p class="description">API key for backend authentication (if required)</p>';
    }
    
    public function google_api_key_callback() {
        $value = get_option('google_api_key', '');
        echo '<input type="password" name="google_api_key" value="' . esc_attr($value) . '" class="regular-text" />';
        echo '<p class="description">Google Gemini API key for direct integration</p>';
    }
    
    public function openai_api_key_callback() {
        $value = get_option('openai_api_key', '');
        echo '<input type="password" name="openai_api_key" value="' . esc_attr($value) . '" class="regular-text" />';
        echo '<p class="description">OpenAI API key for direct integration</p>';
    }
}