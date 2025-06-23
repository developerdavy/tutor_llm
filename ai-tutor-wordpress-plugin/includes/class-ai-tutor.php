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
        wp_enqueue_script('ai-tutor-js', AI_TUTOR_PLUGIN_URL . 'assets/js/ai-tutor.js', array('jquery'), AI_TUTOR_VERSION, true);
        wp_localize_script('ai-tutor-js', 'ai_tutor_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('ai_tutor_nonce')
        ));
    }
    
    public function enqueue_styles() {
        wp_enqueue_style('ai-tutor-css', AI_TUTOR_PLUGIN_URL . 'assets/css/ai-tutor.css', array(), AI_TUTOR_VERSION);
    }
    
    public function add_admin_menu() {
        add_menu_page(
            'AI Tutor',
            'AI Tutor',
            'manage_options',
            'ai-tutor',
            array($this, 'admin_page'),
            'dashicons-graduation-cap',
            30
        );
        
        add_submenu_page(
            'ai-tutor',
            'Settings',
            'Settings',
            'manage_options',
            'ai-tutor-settings',
            array($this, 'settings_page')
        );
    }
    
    public function admin_page() {
        include AI_TUTOR_PLUGIN_PATH . 'admin/admin-page.php';
    }
    
    public function settings_page() {
        include AI_TUTOR_PLUGIN_PATH . 'admin/settings-page.php';
    }
}