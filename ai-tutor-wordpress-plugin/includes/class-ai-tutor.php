<?php

class AI_Tutor {
    
    public function init() {
        add_action('init', array($this, 'register_post_types'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_styles'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        
        // Initialize API endpoints
        $api = new AI_Tutor_API();
        $api->init();
        
        // Initialize shortcodes
        $shortcodes = new AI_Tutor_Shortcodes();
        $shortcodes->init();
    }
    
    public function register_post_types() {
        // Register Subject post type
        register_post_type('ai_subject', array(
            'labels' => array(
                'name' => 'Subjects',
                'singular_name' => 'Subject',
                'add_new' => 'Add New Subject',
                'add_new_item' => 'Add New Subject',
                'edit_item' => 'Edit Subject',
                'new_item' => 'New Subject',
                'view_item' => 'View Subject',
                'search_items' => 'Search Subjects',
                'not_found' => 'No subjects found',
                'not_found_in_trash' => 'No subjects found in trash',
            ),
            'public' => true,
            'has_archive' => true,
            'supports' => array('title', 'editor', 'thumbnail'),
            'menu_icon' => 'dashicons-book-alt',
            'show_in_rest' => true,
        ));
        
        // Register Lesson post type
        register_post_type('ai_lesson', array(
            'labels' => array(
                'name' => 'Lessons',
                'singular_name' => 'Lesson',
                'add_new' => 'Add New Lesson',
                'add_new_item' => 'Add New Lesson',
                'edit_item' => 'Edit Lesson',
                'new_item' => 'New Lesson',
                'view_item' => 'View Lesson',
                'search_items' => 'Search Lessons',
                'not_found' => 'No lessons found',
                'not_found_in_trash' => 'No lessons found in trash',
            ),
            'public' => true,
            'has_archive' => true,
            'supports' => array('title', 'editor', 'thumbnail'),
            'menu_icon' => 'dashicons-welcome-learn-more',
            'show_in_rest' => true,
        ));
        
        // Add meta boxes
        add_action('add_meta_boxes', array($this, 'add_meta_boxes'));
        add_action('save_post', array($this, 'save_meta_boxes'));
    }
    
    public function add_meta_boxes() {
        // Subject meta box
        add_meta_box(
            'ai_subject_meta',
            'Subject Details',
            array($this, 'subject_meta_box_callback'),
            'ai_subject',
            'normal',
            'high'
        );
        
        // Lesson meta box
        add_meta_box(
            'ai_lesson_meta',
            'Lesson Details',
            array($this, 'lesson_meta_box_callback'),
            'ai_lesson',
            'normal',
            'high'
        );
    }
    
    public function subject_meta_box_callback($post) {
        wp_nonce_field('ai_subject_meta_nonce', 'ai_subject_meta_nonce');
        
        $icon = get_post_meta($post->ID, '_ai_subject_icon', true);
        $color = get_post_meta($post->ID, '_ai_subject_color', true);
        $description = get_post_meta($post->ID, '_ai_subject_description', true);
        
        echo '<table class="form-table">';
        echo '<tr><td><label for="ai_subject_icon">Icon:</label></td>';
        echo '<td><input type="text" id="ai_subject_icon" name="ai_subject_icon" value="' . esc_attr($icon) . '" /></td></tr>';
        echo '<tr><td><label for="ai_subject_color">Color:</label></td>';
        echo '<td><input type="color" id="ai_subject_color" name="ai_subject_color" value="' . esc_attr($color) . '" /></td></tr>';
        echo '<tr><td><label for="ai_subject_description">Description:</label></td>';
        echo '<td><textarea id="ai_subject_description" name="ai_subject_description" rows="3" cols="50">' . esc_textarea($description) . '</textarea></td></tr>';
        echo '</table>';
    }
    
    public function lesson_meta_box_callback($post) {
        wp_nonce_field('ai_lesson_meta_nonce', 'ai_lesson_meta_nonce');
        
        $subject_id = get_post_meta($post->ID, '_ai_lesson_subject_id', true);
        $order = get_post_meta($post->ID, '_ai_lesson_order', true);
        $difficulty = get_post_meta($post->ID, '_ai_lesson_difficulty', true);
        $duration = get_post_meta($post->ID, '_ai_lesson_duration', true);
        
        // Get subjects for dropdown
        $subjects = get_posts(array('post_type' => 'ai_subject', 'numberposts' => -1));
        
        echo '<table class="form-table">';
        echo '<tr><td><label for="ai_lesson_subject_id">Subject:</label></td>';
        echo '<td><select id="ai_lesson_subject_id" name="ai_lesson_subject_id">';
        echo '<option value="">Select Subject</option>';
        foreach ($subjects as $subject) {
            $selected = ($subject_id == $subject->ID) ? 'selected' : '';
            echo '<option value="' . $subject->ID . '" ' . $selected . '>' . $subject->post_title . '</option>';
        }
        echo '</select></td></tr>';
        echo '<tr><td><label for="ai_lesson_order">Order:</label></td>';
        echo '<td><input type="number" id="ai_lesson_order" name="ai_lesson_order" value="' . esc_attr($order) . '" /></td></tr>';
        echo '<tr><td><label for="ai_lesson_difficulty">Difficulty:</label></td>';
        echo '<td><select id="ai_lesson_difficulty" name="ai_lesson_difficulty">';
        $difficulties = array('Beginner', 'Intermediate', 'Advanced');
        foreach ($difficulties as $diff) {
            $selected = ($difficulty == $diff) ? 'selected' : '';
            echo '<option value="' . $diff . '" ' . $selected . '>' . $diff . '</option>';
        }
        echo '</select></td></tr>';
        echo '<tr><td><label for="ai_lesson_duration">Duration (minutes):</label></td>';
        echo '<td><input type="number" id="ai_lesson_duration" name="ai_lesson_duration" value="' . esc_attr($duration) . '" /></td></tr>';
        echo '</table>';
    }
    
    public function save_meta_boxes($post_id) {
        // Subject meta
        if (isset($_POST['ai_subject_meta_nonce']) && wp_verify_nonce($_POST['ai_subject_meta_nonce'], 'ai_subject_meta_nonce')) {
            if (isset($_POST['ai_subject_icon'])) {
                update_post_meta($post_id, '_ai_subject_icon', sanitize_text_field($_POST['ai_subject_icon']));
            }
            if (isset($_POST['ai_subject_color'])) {
                update_post_meta($post_id, '_ai_subject_color', sanitize_hex_color($_POST['ai_subject_color']));
            }
            if (isset($_POST['ai_subject_description'])) {
                update_post_meta($post_id, '_ai_subject_description', sanitize_textarea_field($_POST['ai_subject_description']));
            }
        }
        
        // Lesson meta
        if (isset($_POST['ai_lesson_meta_nonce']) && wp_verify_nonce($_POST['ai_lesson_meta_nonce'], 'ai_lesson_meta_nonce')) {
            if (isset($_POST['ai_lesson_subject_id'])) {
                update_post_meta($post_id, '_ai_lesson_subject_id', intval($_POST['ai_lesson_subject_id']));
            }
            if (isset($_POST['ai_lesson_order'])) {
                update_post_meta($post_id, '_ai_lesson_order', intval($_POST['ai_lesson_order']));
            }
            if (isset($_POST['ai_lesson_difficulty'])) {
                update_post_meta($post_id, '_ai_lesson_difficulty', sanitize_text_field($_POST['ai_lesson_difficulty']));
            }
            if (isset($_POST['ai_lesson_duration'])) {
                update_post_meta($post_id, '_ai_lesson_duration', intval($_POST['ai_lesson_duration']));
            }
        }
    }
    
    public function enqueue_scripts() {
        // Core AI Tutor functionality - using only the working navigation system
        wp_enqueue_script('ai-tutor-realtime', AI_TUTOR_PLUGIN_URL . 'assets/js/ai-tutor-realtime.js', array('jquery'), AI_TUTOR_VERSION, true);
        wp_enqueue_script('ai-tutor-navigation', AI_TUTOR_PLUGIN_URL . 'assets/js/ai-tutor-navigation.js', array('jquery', 'ai-tutor-realtime'), AI_TUTOR_VERSION, true);
        
        // Localize scripts with AJAX data
        $localize_data = array(
            'ajaxurl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('ai_tutor_nonce'),
            'rest_url' => rest_url('ai-tutor/v1/'),
            'rest_nonce' => wp_create_nonce('wp_rest'),
            'backend_url' => get_option('ai_tutor_backend_url', ''),
            'api_key' => get_option('ai_tutor_api_key', ''),
            'google_api_key' => get_option('ai_tutor_google_api_key', '')
        );
        
        wp_localize_script('ai-tutor-realtime', 'aiTutorAjax', $localize_data);
        wp_localize_script('ai-tutor-navigation', 'aiTutorAjax', $localize_data);
    }
    
    public function enqueue_styles() {
        wp_enqueue_style('ai-tutor-css', AI_TUTOR_PLUGIN_URL . 'assets/css/ai-tutor.css', array(), AI_TUTOR_VERSION);
    }
    
    public function add_admin_menu() {
        // Main AI Tutor menu
        add_menu_page(
            'AI Tutor',
            'AI Tutor',
            'manage_options',
            'ai-tutor',
            array($this, 'admin_page'),
            'dashicons-graduation-cap',
            30
        );
        
        // Settings submenu
        add_submenu_page(
            'ai-tutor',
            'AI Tutor Settings',
            'Settings',
            'manage_options',
            'ai-tutor-settings',
            array($this, 'settings_page')
        );
        
        // Also add under Settings menu for easier access
        add_options_page(
            'AI Tutor Settings',
            'AI Tutor',
            'manage_options',
            'ai-tutor-options',
            array($this, 'settings_page')
        );
    }
    
    public function admin_page() {
        include AI_TUTOR_PLUGIN_PATH . 'admin/admin-page.php';
    }
    
    public function settings_page() {
        if (isset($_POST['submit']) && wp_verify_nonce($_POST['ai_tutor_settings_nonce'], 'ai_tutor_settings')) {
            update_option('ai_tutor_backend_url', sanitize_url($_POST['backend_url']));
            update_option('ai_tutor_api_key', sanitize_text_field($_POST['api_key']));
            update_option('ai_tutor_google_api_key', sanitize_text_field($_POST['google_api_key']));
            echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
        }
        
        $backend_url = get_option('ai_tutor_backend_url', '');
        $api_key = get_option('ai_tutor_api_key', '');
        $google_api_key = get_option('ai_tutor_google_api_key', '');
        ?>
        <div class="wrap">
            <h1>AI Tutor Settings</h1>
            <form method="post" action="">
                <?php wp_nonce_field('ai_tutor_settings', 'ai_tutor_settings_nonce'); ?>
                
                <h2>Local AI Setup (Recommended)</h2>
                <table class="form-table">
                    <tr>
                        <th scope="row">Google API Key</th>
                        <td>
                            <input type="password" name="google_api_key" value="<?php echo esc_attr($google_api_key); ?>" class="regular-text" />
                            <p class="description">
                                Get your free API key from <a href="https://aistudio.google.com/" target="_blank">Google AI Studio</a>. 
                                This enables AI content generation directly in WordPress without needing external servers.
                            </p>
                        </td>
                    </tr>
                </table>
                
                <h2>External Backend (Optional)</h2>
                <table class="form-table">
                    <tr>
                        <th scope="row">AI Backend URL</th>
                        <td>
                            <input type="url" name="backend_url" value="<?php echo esc_attr($backend_url); ?>" class="regular-text" placeholder="https://your-replit-url.replit.app" />
                            <p class="description">Optional: If you have a deployed Replit backend, enter the URL here</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Backend API Key</th>
                        <td>
                            <input type="password" name="api_key" value="<?php echo esc_attr($api_key); ?>" class="regular-text" />
                            <p class="description">Optional API key for backend authentication</p>
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
            
            <h2>Setup Instructions</h2>
            <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #0073aa; margin: 20px 0;">
                <h3>Quick Setup (No Deployment Required)</h3>
                <ol>
                    <li>Get a free Google API key from <a href="https://aistudio.google.com/" target="_blank">Google AI Studio</a></li>
                    <li>Enter the API key in the "Google API Key" field above</li>
                    <li>Save settings</li>
                    <li>Create subjects and lessons using the WordPress admin</li>
                    <li>Use <code>[ai_tutor_ai_lesson lesson_id="123"]</code> in your posts/pages</li>
                </ol>
                <p><strong>That's it!</strong> The plugin will generate AI content directly from WordPress.</p>
            </div>
            
            <h3>Available Shortcodes:</h3>
            <ul>
                <li><code>[ai_tutor_dashboard]</code> - Main dashboard</li>
                <li><code>[ai_tutor_subjects]</code> - Subject listing</li>
                <li><code>[ai_tutor_lesson lesson_id="123"]</code> - Basic lesson display</li>
                <li><code>[ai_tutor_ai_lesson lesson_id="123"]</code> - AI-powered lesson with chat and generation features</li>
            </ul>
            
            <h3>Current Status:</h3>
            <div style="background: <?php echo $google_api_key ? '#dff0d8' : '#f2dede'; ?>; padding: 10px; border-radius: 4px; margin: 15px 0;">
                <?php if ($google_api_key): ?>
                    <strong>✓ Google API Key configured</strong> - AI features are enabled
                <?php else: ?>
                    <strong>⚠ Google API Key missing</strong> - Add your key above to enable AI features
                <?php endif; ?>
            </div>
            
            <h3>How It Works:</h3>
            <p>The plugin first tries to use your external backend (if configured), then falls back to direct Google AI integration. This means you get AI functionality even without deploying anything!</p>
        </div>
        <?php
    }
}