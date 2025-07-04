<?php

class AI_Tutor_API {
    
    private $ai_backend_url;
    private $direct_ai;
    
    public function __construct() {
        // Configure AI backend URL using config class
        $this->ai_backend_url = AI_Tutor_Config::get_backend_url();
        $this->direct_ai = new AI_Tutor_Direct_AI();
    }
    
    public function init() {
        add_action('rest_api_init', array($this, 'register_routes'));
        // Chat and content generation
        add_action('wp_ajax_ai_tutor_chat', array($this, 'handle_chat'));
        add_action('wp_ajax_nopriv_ai_tutor_chat', array($this, 'handle_chat'));
        add_action('wp_ajax_ai_tutor_generate_content', array($this, 'generate_lesson_content'));
        add_action('wp_ajax_ai_tutor_generate_questions', array($this, 'generate_questions'));
        add_action('wp_ajax_ai_tutor_generate_examples', array($this, 'generate_examples'));
        add_action('wp_ajax_ai_tutor_evaluate_answer', array($this, 'evaluate_answer'));
        
        // Navigation endpoints
        add_action('wp_ajax_ai_tutor_get_subjects', array($this, 'ajax_get_subjects'));
        add_action('wp_ajax_nopriv_ai_tutor_get_subjects', array($this, 'ajax_get_subjects'));
        add_action('wp_ajax_ai_tutor_get_subject', array($this, 'ajax_get_subject'));
        add_action('wp_ajax_nopriv_ai_tutor_get_subject', array($this, 'ajax_get_subject'));
        add_action('wp_ajax_ai_tutor_get_subject_details', array($this, 'ajax_get_subject')); // Alias for compatibility
        add_action('wp_ajax_nopriv_ai_tutor_get_subject_details', array($this, 'ajax_get_subject'));
        add_action('wp_ajax_ai_tutor_get_subject_lessons', array($this, 'ajax_get_subject_lessons'));
        add_action('wp_ajax_nopriv_ai_tutor_get_subject_lessons', array($this, 'ajax_get_subject_lessons'));
        add_action('wp_ajax_ai_tutor_get_lesson', array($this, 'ajax_get_lesson'));
        add_action('wp_ajax_nopriv_ai_tutor_get_lesson', array($this, 'ajax_get_lesson'));
        
        // Progress and testing
        add_action('wp_ajax_ai_tutor_progress', array($this, 'update_progress'));
        add_action('wp_ajax_ai_tutor_test_connection', array($this, 'test_connection'));
    }
    
    public function register_routes() {
        register_rest_route('ai-tutor/v1', '/subjects', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_subjects'),
            'permission_callback' => '__return_true'
        ));
        
        register_rest_route('ai-tutor/v1', '/subjects/(?P<id>\d+)/lessons', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_lessons_by_subject'),
            'permission_callback' => '__return_true'
        ));
        
        register_rest_route('ai-tutor/v1', '/lessons/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_lesson'),
            'permission_callback' => '__return_true'
        ));
        
        register_rest_route('ai-tutor/v1', '/user/progress', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_user_progress'),
            'permission_callback' => 'is_user_logged_in'
        ));
        
        register_rest_route('ai-tutor/v1', '/chat', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_chat_api'),
            'permission_callback' => 'is_user_logged_in'
        ));
        
        register_rest_route('ai-tutor/v1', '/lessons/(?P<id>\d+)/generate', array(
            'methods' => 'POST',
            'callback' => array($this, 'generate_lesson_content_api'),
            'permission_callback' => 'is_user_logged_in'
        ));
        
        register_rest_route('ai-tutor/v1', '/lessons/(?P<id>\d+)/questions', array(
            'methods' => 'POST',
            'callback' => array($this, 'generate_questions_api'),
            'permission_callback' => 'is_user_logged_in'
        ));
        
        register_rest_route('ai-tutor/v1', '/evaluate', array(
            'methods' => 'POST',
            'callback' => array($this, 'evaluate_answer_api'),
            'permission_callback' => 'is_user_logged_in'
        ));
    }
    
    public function get_subjects($request) {
        $subjects = get_posts(array(
            'post_type' => 'ai_subject',
            'numberposts' => -1,
            'post_status' => 'publish'
        ));
        
        $result = array();
        foreach ($subjects as $subject) {
            $result[] = array(
                'id' => $subject->ID,
                'name' => $subject->post_title,
                'description' => get_post_meta($subject->ID, '_ai_subject_description', true),
                'icon' => get_post_meta($subject->ID, '_ai_subject_icon', true),
                'color' => get_post_meta($subject->ID, '_ai_subject_color', true)
            );
        }
        
        return rest_ensure_response($result);
    }
    
    public function get_lessons_by_subject($request) {
        $subject_id = $request['id'];
        
        $lessons = get_posts(array(
            'post_type' => 'ai_lesson',
            'numberposts' => -1,
            'post_status' => 'publish',
            'meta_query' => array(
                array(
                    'key' => '_ai_lesson_subject_id',
                    'value' => $subject_id,
                    'compare' => '='
                )
            ),
            'meta_key' => '_ai_lesson_order',
            'orderby' => 'meta_value_num',
            'order' => 'ASC'
        ));
        
        $result = array();
        foreach ($lessons as $lesson) {
            $result[] = array(
                'id' => $lesson->ID,
                'subjectId' => intval(get_post_meta($lesson->ID, '_ai_lesson_subject_id', true)),
                'title' => $lesson->post_title,
                'description' => $lesson->post_content,
                'content' => $lesson->post_content,
                'order' => intval(get_post_meta($lesson->ID, '_ai_lesson_order', true)),
                'difficulty' => get_post_meta($lesson->ID, '_ai_lesson_difficulty', true),
                'estimatedDuration' => intval(get_post_meta($lesson->ID, '_ai_lesson_duration', true))
            );
        }
        
        return rest_ensure_response($result);
    }
    
    public function get_lesson($request) {
        $lesson_id = $request['id'];
        $lesson = get_post($lesson_id);
        
        if (!$lesson || $lesson->post_type !== 'ai_lesson') {
            return new WP_Error('lesson_not_found', 'Lesson not found', array('status' => 404));
        }
        
        $result = array(
            'id' => $lesson->ID,
            'subjectId' => intval(get_post_meta($lesson->ID, '_ai_lesson_subject_id', true)),
            'title' => $lesson->post_title,
            'description' => $lesson->post_content,
            'content' => $lesson->post_content,
            'order' => intval(get_post_meta($lesson->ID, '_ai_lesson_order', true)),
            'difficulty' => get_post_meta($lesson->ID, '_ai_lesson_difficulty', true),
            'estimatedDuration' => intval(get_post_meta($lesson->ID, '_ai_lesson_duration', true))
        );
        
        return rest_ensure_response($result);
    }
    
    public function get_user_progress($request) {
        global $wpdb;
        $user_id = get_current_user_id();
        
        $table_name = $wpdb->prefix . 'ai_tutor_user_progress';
        $progress = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table_name WHERE user_id = %d",
            $user_id
        ));
        
        return rest_ensure_response($progress);
    }
    
    public function handle_chat() {
        // Check nonce
        if (!wp_verify_nonce($_POST['nonce'], 'ai_tutor_nonce')) {
            wp_send_json_error('Invalid nonce');
            return;
        }
        
        $user_id = get_current_user_id();
        $lesson_id = intval($_POST['lesson_id']);
        $message = sanitize_text_field($_POST['message']);
        
        if (empty($message)) {
            wp_send_json_error('Message cannot be empty');
            return;
        }
        
        // Get lesson and subject info for context
        $lesson = get_post($lesson_id);
        $subject_id = get_post_meta($lesson_id, '_ai_lesson_subject', true);
        $subject = get_post($subject_id);
        
        // Get chat history for context
        global $wpdb;
        $chat_table = $wpdb->prefix . 'ai_tutor_chat_messages';
        $recent_messages = $wpdb->get_results($wpdb->prepare(
            "SELECT message, is_user FROM $chat_table WHERE user_id = %d AND lesson_id = %d ORDER BY timestamp DESC LIMIT 10",
            $user_id, $lesson_id
        ));
        
        // Format chat history
        $chat_history = array();
        foreach (array_reverse($recent_messages) as $msg) {
            $chat_history[] = array(
                'message' => $msg->message,
                'isUser' => (bool)$msg->is_user
            );
        }
        
        // Save user message
        $wpdb->insert(
            $chat_table,
            array(
                'user_id' => $user_id,
                'lesson_id' => $lesson_id,
                'message' => $message,
                'is_user' => 1,
                'timestamp' => current_time('mysql')
            )
        );
        
        // Generate AI response using backend or direct AI
        try {
            $ai_response = $this->generate_tutor_response($message, $lesson, $subject, $chat_history);
        } catch (Exception $e) {
            error_log('AI Tutor Chat Error: ' . $e->getMessage());
            $ai_response = "I'm experiencing technical difficulties. Please try again in a moment.";
        }
        
        // Save AI response
        $wpdb->insert(
            $chat_table,
            array(
                'user_id' => $user_id,
                'lesson_id' => $lesson_id,
                'message' => $ai_response,
                'is_user' => 0,
                'timestamp' => current_time('mysql')
            )
        );
        
        wp_send_json_success(array('response' => $ai_response));
    }
    
    public function update_progress() {
        check_ajax_referer('ai_tutor_nonce', 'nonce');
        
        if (!is_user_logged_in()) {
            wp_send_json_error('User not logged in');
            return;
        }
        
        $user_id = get_current_user_id();
        $subject_id = intval($_POST['subject_id']);
        $lesson_id = intval($_POST['lesson_id']);
        $progress = intval($_POST['progress']);
        $completed = intval($_POST['completed']);
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'ai_tutor_user_progress';
        
        // Check if progress exists
        $existing = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table_name WHERE user_id = %d AND lesson_id = %d",
            $user_id, $lesson_id
        ));
        
        if ($existing) {
            // Update existing progress
            $wpdb->update(
                $table_name,
                array(
                    'progress' => $progress,
                    'completed' => $completed,
                    'last_accessed' => current_time('mysql')
                ),
                array('user_id' => $user_id, 'lesson_id' => $lesson_id)
            );
        } else {
            // Insert new progress
            $wpdb->insert(
                $table_name,
                array(
                    'user_id' => $user_id,
                    'subject_id' => $subject_id,
                    'lesson_id' => $lesson_id,
                    'progress' => $progress,
                    'completed' => $completed
                )
            );
        }
        
        wp_send_json_success('Progress updated');
    }
    
    /**
     * Generate AI tutor response using backend or direct AI
     */
    private function generate_tutor_response($message, $lesson, $subject, $chat_history = array()) {
        // Try backend API first if configured
        if (!empty($this->ai_backend_url)) {
            try {
                return $this->call_backend_chat($message, $lesson, $subject, $chat_history);
            } catch (Exception $e) {
                error_log('Backend chat failed: ' . $e->getMessage());
                // Fall through to direct AI
            }
        }
        
        // Use direct AI as fallback
        $subject_name = $subject ? $subject->post_title : 'General';
        return $this->direct_ai->generate_tutor_response($message, $subject_name, $chat_history);
    }
    
    /**
     * Call backend API for chat
     */
    private function call_backend_chat($message, $lesson, $subject, $chat_history) {
        $backend_url = rtrim($this->ai_backend_url, '/');
        $endpoint = $backend_url . '/api/chat';
        
        $payload = array(
            'message' => $message,
            'lessonId' => $lesson->ID,
            'subject' => $subject ? $subject->post_title : 'General',
            'chatHistory' => $chat_history
        );
        
        $response = wp_remote_post($endpoint, array(
            'body' => json_encode($payload),
            'headers' => array(
                'Content-Type' => 'application/json'
            ),
            'timeout' => 30
        ));
        
        if (is_wp_error($response)) {
            throw new Exception('Backend API error: ' . $response->get_error_message());
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if (!$data || !isset($data['response'])) {
            throw new Exception('Invalid backend response');
        }
        
        return $data['response'];
    }
    
    /**
     * Call backend API for content generation
     */
    private function call_backend_generate_content($lesson, $subject) {
        $backend_url = rtrim($this->ai_backend_url, '/');
        $endpoint = $backend_url . '/api/lessons/' . $lesson->ID . '/generate';
        
        $payload = array(
            'subject' => $subject ? $subject->post_title : 'General',
            'topic' => $lesson->post_title,
            'level' => 'intermediate'
        );
        
        $response = wp_remote_post($endpoint, array(
            'body' => json_encode($payload),
            'headers' => array(
                'Content-Type' => 'application/json'
            ),
            'timeout' => 30
        ));
        
        if (is_wp_error($response)) {
            throw new Exception('Backend API error: ' . $response->get_error_message());
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if (!$data) {
            throw new Exception('Invalid backend response');
        }
        
        return $data;
    }
    
    /**
     * Generate lesson content using AI
     */
    public function generate_lesson_content() {
        if (!wp_verify_nonce($_POST['nonce'], 'ai_tutor_generate_content')) {
            wp_send_json_error('Invalid nonce');
            return;
        }
        
        if (!is_user_logged_in()) {
            wp_send_json_error('User not logged in');
            return;
        }
        
        $lesson_id = intval($_POST['lesson_id']);
        $lesson = get_post($lesson_id);
        
        if (!$lesson) {
            wp_send_json_error('Lesson not found');
            return;
        }
        
        $subject_id = get_post_meta($lesson_id, '_ai_lesson_subject', true);
        $subject = get_post($subject_id);
        
        try {
            if (!empty($this->ai_backend_url)) {
                $content = $this->call_backend_generate_content($lesson, $subject);
            } else {
                $subject_name = $subject ? $subject->post_title : 'General';
                $content = $this->direct_ai->generate_lesson_content($subject_name, $lesson->post_title, 'high school');
            }
            
            wp_send_json_success($content);
        } catch (Exception $e) {
            error_log('Content generation error: ' . $e->getMessage());
            wp_send_json_error('Failed to generate content. Please try again.');
        }
    }
    
    /**
     * Generate questions using AI
     */
    public function generate_questions() {
        if (!wp_verify_nonce($_POST['nonce'], 'ai_tutor_nonce')) {
            wp_send_json_error('Invalid nonce');
            return;
        }
        
        $lesson_id = intval($_POST['lesson_id']);
        $type = sanitize_text_field($_POST['type'] ?? 'multiple_choice');
        $difficulty = sanitize_text_field($_POST['difficulty'] ?? 'intermediate');
        $count = intval($_POST['count'] ?? 5);
        
        $lesson = get_post($lesson_id);
        if (!$lesson) {
            wp_send_json_error('Lesson not found');
            return;
        }
        
        $subject_id = get_post_meta($lesson_id, '_ai_lesson_subject', true);
        $subject = get_post($subject_id);
        $subject_name = $subject ? $subject->post_title : 'General';
        
        try {
            $questions = $this->direct_ai->generate_questions($subject_name, $lesson->post_title, $count, $type, $difficulty);
            wp_send_json_success($questions);
        } catch (Exception $e) {
            error_log('Questions generation error: ' . $e->getMessage());
            wp_send_json_error('Failed to generate questions. Please try again.');
        }
    }
    
    public function generate_examples() {
        if (!wp_verify_nonce($_POST['nonce'], 'ai_tutor_nonce')) {
            wp_send_json_error('Invalid nonce');
            return;
        }
        
        $lesson_id = intval($_POST['lesson_id']);
        $count = intval($_POST['count'] ?? 3);
        
        $lesson = get_post($lesson_id);
        if (!$lesson) {
            wp_send_json_error('Lesson not found');
            return;
        }
        
        $subject_id = get_post_meta($lesson_id, '_ai_lesson_subject', true);
        $subject = get_post($subject_id);
        $subject_name = $subject ? $subject->post_title : 'General';
        
        try {
            $examples = $this->direct_ai->generate_examples($subject_name, $lesson->post_title, $count);
            wp_send_json_success($examples);
        } catch (Exception $e) {
            error_log('Examples generation error: ' . $e->getMessage());
            wp_send_json_error('Failed to generate examples. Please try again.');
        }
    }
    
    public function evaluate_answer() {
        if (!wp_verify_nonce($_POST['nonce'], 'ai_tutor_nonce')) {
            wp_send_json_error('Invalid nonce');
            return;
        }
        
        $question = sanitize_text_field($_POST['question']);
        $student_answer = sanitize_text_field($_POST['student_answer']);
        $correct_answer = sanitize_text_field($_POST['correct_answer'] ?? '');
        $subject = sanitize_text_field($_POST['subject'] ?? '');
        
        try {
            $evaluation = $this->direct_ai->evaluate_answer($question, $student_answer, $correct_answer, $subject);
            wp_send_json_success($evaluation);
        } catch (Exception $e) {
            error_log('Answer evaluation error: ' . $e->getMessage());
            wp_send_json_error('Failed to evaluate answer. Please try again.');
        }
    }
    
    // AJAX handlers for navigation
    public function ajax_get_subjects() {
        if (!wp_verify_nonce($_POST['nonce'], 'ai_tutor_nonce')) {
            wp_send_json_error('Invalid nonce');
            return;
        }
        
        $subjects = get_posts(array(
            'post_type' => 'ai_subject',
            'numberposts' => -1,
            'post_status' => 'publish'
        ));
        
        $result = array();
        foreach ($subjects as $subject) {
            $result[] = array(
                'id' => $subject->ID,
                'name' => $subject->post_title,
                'description' => get_post_meta($subject->ID, '_ai_subject_description', true),
                'icon' => get_post_meta($subject->ID, '_ai_subject_icon', true),
                'color' => get_post_meta($subject->ID, '_ai_subject_color', true)
            );
        }
        
        wp_send_json_success($result);
    }
    
    public function ajax_get_subject() {
        if (!wp_verify_nonce($_POST['nonce'], 'ai_tutor_nonce')) {
            wp_send_json_error('Invalid nonce');
            return;
        }
        
        $subject_id = intval($_POST['subject_id']);
        $subject = get_post($subject_id);
        
        if (!$subject || $subject->post_type !== 'ai_subject') {
            wp_send_json_error('Subject not found');
            return;
        }
        
        $result = array(
            'id' => $subject->ID,
            'name' => $subject->post_title,
            'description' => get_post_meta($subject->ID, '_ai_subject_description', true),
            'icon' => get_post_meta($subject->ID, '_ai_subject_icon', true),
            'color' => get_post_meta($subject->ID, '_ai_subject_color', true)
        );
        
        wp_send_json_success($result);
    }
    
    public function ajax_get_subject_lessons() {
        if (!wp_verify_nonce($_POST['nonce'], 'ai_tutor_nonce')) {
            wp_send_json_error('Invalid nonce');
            return;
        }
        
        $subject_id = intval($_POST['subject_id']);
        
        $lessons = get_posts(array(
            'post_type' => 'ai_lesson',
            'numberposts' => -1,
            'post_status' => 'publish',
            'meta_query' => array(
                array(
                    'key' => '_ai_lesson_subject_id',
                    'value' => $subject_id,
                    'compare' => '='
                )
            ),
            'meta_key' => '_ai_lesson_order',
            'orderby' => 'meta_value_num',
            'order' => 'ASC'
        ));
        
        $result = array();
        foreach ($lessons as $lesson) {
            $result[] = array(
                'id' => $lesson->ID,
                'subjectId' => intval(get_post_meta($lesson->ID, '_ai_lesson_subject_id', true)),
                'title' => $lesson->post_title,
                'description' => $lesson->post_content,
                'content' => $lesson->post_content,
                'order' => intval(get_post_meta($lesson->ID, '_ai_lesson_order', true)),
                'difficulty' => get_post_meta($lesson->ID, '_ai_lesson_difficulty', true),
                'duration' => intval(get_post_meta($lesson->ID, '_ai_lesson_duration', true))
            );
        }
        
        wp_send_json_success($result);
    }
    
    public function ajax_get_lesson() {
        if (!wp_verify_nonce($_POST['nonce'], 'ai_tutor_nonce')) {
            wp_send_json_error('Invalid nonce');
            return;
        }
        
        $lesson_id = intval($_POST['lesson_id']);
        $lesson = get_post($lesson_id);
        
        if (!$lesson || $lesson->post_type !== 'ai_lesson') {
            wp_send_json_error('Lesson not found');
            return;
        }
        
        $result = array(
            'id' => $lesson->ID,
            'subjectId' => intval(get_post_meta($lesson->ID, '_ai_lesson_subject_id', true)),
            'title' => $lesson->post_title,
            'description' => $lesson->post_content,
            'content' => $lesson->post_content,
            'order' => intval(get_post_meta($lesson->ID, '_ai_lesson_order', true)),
            'difficulty' => get_post_meta($lesson->ID, '_ai_lesson_difficulty', true),
            'duration' => intval(get_post_meta($lesson->ID, '_ai_lesson_duration', true))
        );
        
        wp_send_json_success($result);
    }
    
    public function test_connection() {
        if (!wp_verify_nonce($_POST['nonce'], 'ai_tutor_nonce')) {
            wp_send_json_error('Invalid nonce');
            return;
        }
        
        $tests = array();
        
        // Test Google API
        if (!empty(get_option('ai_tutor_google_api_key', ''))) {
            $tests['google_api'] = $this->direct_ai->is_available() ? 'Available' : 'Not configured';
        } else {
            $tests['google_api'] = 'Not configured';
        }
        
        // Test backend API
        if (!empty($this->ai_backend_url)) {
            try {
                $response = wp_remote_get($this->ai_backend_url . '/api/subjects', array('timeout' => 10));
                $tests['backend_api'] = is_wp_error($response) ? 'Connection failed' : 'Available';
            } catch (Exception $e) {
                $tests['backend_api'] = 'Connection failed';
            }
        } else {
            $tests['backend_api'] = 'Not configured';
        }
        
        wp_send_json_success($tests);
    }
}
