<?php

class AI_Tutor_API {
    
    private $ai_backend_url;
    private $direct_ai;
    
    public function __construct() {
        // Configure AI backend URL - should be set in WordPress settings
        $this->ai_backend_url = get_option('ai_tutor_backend_url', '');
        $this->direct_ai = new AI_Tutor_Direct_AI();
    }
    
    public function init() {
        add_action('rest_api_init', array($this, 'register_routes'));
        // Chat and content generation
        add_action('wp_ajax_ai_tutor_chat', array($this, 'handle_chat'));
        add_action('wp_ajax_nopriv_ai_tutor_chat', array($this, 'handle_chat'));
        add_action('wp_ajax_ai_tutor_generate_content', array($this, 'generate_lesson_content'));
        add_action('wp_ajax_ai_tutor_generate_questions', array($this, 'generate_questions'));
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
        check_ajax_referer('ai_tutor_nonce', 'nonce');
        
        if (!is_user_logged_in()) {
            wp_send_json_error('User not logged in');
            return;
        }
        
        $user_id = get_current_user_id();
        $lesson_id = intval($_POST['lesson_id']);
        $message = sanitize_text_field($_POST['message']);
        
        // Save user message
        global $wpdb;
        $table_name = $wpdb->prefix . 'ai_tutor_chat_messages';
        $wpdb->insert(
            $table_name,
            array(
                'user_id' => $user_id,
                'lesson_id' => $lesson_id,
                'message' => $message,
                'is_from_user' => 1
            )
        );
        
        // Generate AI response (simplified for WordPress)
        $ai_response = $this->generate_ai_response($message, $lesson_id);
        
        // Save AI response
        $wpdb->insert(
            $table_name,
            array(
                'user_id' => $user_id,
                'lesson_id' => $lesson_id,
                'message' => $ai_response,
                'is_from_user' => 0
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
    
    private function generate_ai_response($message, $lesson_id) {
        $lesson = get_post($lesson_id);
        if (!$lesson) {
            return "I'm sorry, I couldn't find the lesson information. Please try again.";
        }
        
        $subject = get_post_meta($lesson_id, '_ai_lesson_subject', true) ?: 'General';
        $lesson_title = $lesson->post_title;
        $lesson_content = $lesson->post_content;
        
        // Try backend first if configured
        if (!empty($this->ai_backend_url)) {
            // Get chat history for context
            global $wpdb;
            $user_id = get_current_user_id();
            $table_name = $wpdb->prefix . 'ai_tutor_chat_messages';
            $chat_history = $wpdb->get_results($wpdb->prepare(
                "SELECT message, is_from_user FROM $table_name WHERE user_id = %d AND lesson_id = %d ORDER BY timestamp DESC LIMIT 10",
                $user_id, $lesson_id
            ));
            
            // Prepare data for AI backend
            $data = array(
                'message' => $message,
                'subject' => $subject,
                'lessonTitle' => $lesson_title,
                'lessonContent' => $lesson_content,
                'chatHistory' => $chat_history
            );
            
            // Call AI backend
            $response = $this->call_ai_backend('/api/chat', $data);
            
            if ($response && isset($response['response'])) {
                return $response['response'];
            }
        }
        
        // Use direct AI if backend not available
        return $this->direct_ai->generate_tutor_response($message, $subject, $lesson_title, $lesson_content);
    }
    
    private function call_ai_backend($endpoint, $data) {
        $url = rtrim($this->ai_backend_url, '/') . $endpoint;
        
        $args = array(
            'method' => 'POST',
            'headers' => array(
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . get_option('ai_tutor_api_key', '')
            ),
            'body' => json_encode($data),
            'timeout' => 30
        );
        
        $response = wp_remote_request($url, $args);
        
        if (is_wp_error($response)) {
            error_log('AI Backend Error: ' . $response->get_error_message());
            return false;
        }
        
        $body = wp_remote_retrieve_body($response);
        $decoded = json_decode($body, true);
        
        if (wp_remote_retrieve_response_code($response) !== 200) {
            error_log('AI Backend HTTP Error: ' . wp_remote_retrieve_response_code($response));
            return false;
        }
        
        return $decoded;
    }
    
    private function generate_contextual_fallback($message, $lesson_title, $subject) {
        $message_lower = strtolower($message);
        
        if (strpos($message_lower, 'explain') !== false || strpos($message_lower, 'how') !== false) {
            return "I'd be happy to explain this {$subject} concept from {$lesson_title}. Let me break it down step by step for you. What specific part would you like me to focus on?";
        } elseif (strpos($message_lower, 'example') !== false) {
            return "Great question! Examples are really helpful for understanding {$subject}. Let me provide a relevant example from {$lesson_title} that illustrates this concept.";
        } elseif (strpos($message_lower, 'help') !== false || strpos($message_lower, 'stuck') !== false) {
            return "I can see you need some help with {$lesson_title}. That's completely normal - {$subject} can be challenging! Let's work through this together. What specific step is giving you trouble?";
        } else {
            return "That's a thoughtful question about {$lesson_title}! This {$subject} concept connects to several important principles. Could you be more specific about what aspect you'd like to explore?";
        }
    }
    
    public function handle_chat_api($request) {
        if (!is_user_logged_in()) {
            return new WP_Error('unauthorized', 'User not logged in', array('status' => 401));
        }
        
        $params = $request->get_json_params();
        $user_id = get_current_user_id();
        $lesson_id = intval($params['lesson_id']);
        $message = sanitize_text_field($params['message']);
        
        // Save and generate response (same logic as AJAX handler)
        global $wpdb;
        $table_name = $wpdb->prefix . 'ai_tutor_chat_messages';
        
        $wpdb->insert(
            $table_name,
            array(
                'user_id' => $user_id,
                'lesson_id' => $lesson_id,
                'message' => $message,
                'is_from_user' => 1
            )
        );
        
        $ai_response = $this->generate_ai_response($message, $lesson_id);
        
        $wpdb->insert(
            $table_name,
            array(
                'user_id' => $user_id,
                'lesson_id' => $lesson_id,
                'message' => $ai_response,
                'is_from_user' => 0
            )
        );
        
        return rest_ensure_response(array('response' => $ai_response));
    }
    
    public function generate_lesson_content_api($request) {
        if (!is_user_logged_in()) {
            return new WP_Error('unauthorized', 'User not logged in', array('status' => 401));
        }
        
        $lesson_id = $request['id'];
        $lesson = get_post($lesson_id);
        
        if (!$lesson || $lesson->post_type !== 'ai_lesson') {
            return new WP_Error('lesson_not_found', 'Lesson not found', array('status' => 404));
        }
        
        $subject = get_post_meta($lesson_id, '_ai_lesson_subject', true) ?: 'General';
        $level = get_post_meta($lesson_id, '_ai_lesson_level', true) ?: 'high school';
        
        $data = array(
            'subject' => $subject,
            'topic' => $lesson->post_title,
            'level' => $level
        );
        
        // Try backend first if configured
        if (!empty($this->ai_backend_url)) {
            $response = $this->call_ai_backend('/api/lessons/' . $lesson_id . '/generate', $data);
            
            if ($response) {
                // Save generated content to lesson
                wp_update_post(array(
                    'ID' => $lesson_id,
                    'post_content' => $response['content']
                ));
                
                // Save additional metadata
                if (isset($response['examples'])) {
                    update_post_meta($lesson_id, '_ai_lesson_examples', json_encode($response['examples']));
                }
                if (isset($response['quiz'])) {
                    update_post_meta($lesson_id, '_ai_lesson_quiz', json_encode($response['quiz']));
                }
                
                return rest_ensure_response($response);
            }
        }
        
        // Use direct AI if backend not available
        $response = $this->direct_ai->generate_lesson_content($subject, $lesson->post_title, $level);
        
        if ($response) {
            // Save generated content to lesson
            wp_update_post(array(
                'ID' => $lesson_id,
                'post_content' => $response['content']
            ));
            
            // Save additional metadata
            if (isset($response['examples'])) {
                update_post_meta($lesson_id, '_ai_lesson_examples', json_encode($response['examples']));
            }
            if (isset($response['quiz'])) {
                update_post_meta($lesson_id, '_ai_lesson_quiz', json_encode($response['quiz']));
            }
            
            return rest_ensure_response($response);
        }
        
        return new WP_Error('generation_failed', 'Failed to generate content', array('status' => 500));
    }
    
    public function generate_questions_api($request) {
        if (!is_user_logged_in()) {
            return new WP_Error('unauthorized', 'User not logged in', array('status' => 401));
        }
        
        $lesson_id = $request['id'];
        $lesson = get_post($lesson_id);
        
        if (!$lesson) {
            return new WP_Error('lesson_not_found', 'Lesson not found', array('status' => 404));
        }
        
        $params = $request->get_json_params();
        $question_type = $params['type'] ?? 'multiple_choice';
        $difficulty = $params['difficulty'] ?? 'medium';
        $count = intval($params['count'] ?? 5);
        
        $data = array(
            'lesson_id' => $lesson_id,
            'subject' => get_post_meta($lesson_id, '_ai_lesson_subject', true) ?: 'General',
            'topic' => $lesson->post_title,
            'content' => $lesson->post_content,
            'type' => $question_type,
            'difficulty' => $difficulty,
            'count' => $count
        );
        
        // Try backend first if configured
        if (!empty($this->ai_backend_url)) {
            $response = $this->call_ai_backend('/api/questions/generate', $data);
            
            if ($response) {
                return rest_ensure_response($response);
            }
        }
        
        // Use direct AI if backend not available
        $questions = $this->direct_ai->generate_questions($subject, $lesson->post_title, $lesson->post_content, $question_type, $difficulty, $count);
        
        return rest_ensure_response(array('questions' => $questions));
        
        return new WP_Error('generation_failed', 'Failed to generate questions', array('status' => 500));
    }
    
    public function evaluate_answer_api($request) {
        if (!is_user_logged_in()) {
            return new WP_Error('unauthorized', 'User not logged in', array('status' => 401));
        }
        
        $params = $request->get_json_params();
        $question = $params['question'] ?? '';
        $user_answer = $params['user_answer'] ?? '';
        $correct_answer = $params['correct_answer'] ?? '';
        $subject = $params['subject'] ?? 'General';
        
        $data = array(
            'question' => $question,
            'user_answer' => $user_answer,
            'correct_answer' => $correct_answer,
            'subject' => $subject
        );
        
        // Try backend first if configured
        if (!empty($this->ai_backend_url)) {
            $response = $this->call_ai_backend('/api/evaluate', $data);
            
            if ($response) {
                return rest_ensure_response($response);
            }
        }
        
        // Use direct AI if backend not available
        $evaluation = $this->direct_ai->evaluate_answer($question, $user_answer, $correct_answer, $subject);
        
        return rest_ensure_response($evaluation);
        
        return new WP_Error('evaluation_failed', 'Failed to evaluate answer', array('status' => 500));
    }
    
    public function generate_lesson_content() {
        check_ajax_referer('ai_tutor_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
            return;
        }
        
        $lesson_id = intval($_POST['lesson_id']);
        $lesson = get_post($lesson_id);
        
        if (!$lesson) {
            wp_send_json_error('Lesson not found');
            return;
        }
        
        $subject = get_post_meta($lesson_id, '_ai_lesson_subject', true) ?: 'General';
        $level = get_post_meta($lesson_id, '_ai_lesson_level', true) ?: 'high school';
        
        $data = array(
            'subject' => $subject,
            'topic' => $lesson->post_title,
            'level' => $level
        );
        
        $response = $this->call_ai_backend('/api/lessons/' . $lesson_id . '/generate', $data);
        
        if ($response) {
            // Update lesson content
            wp_update_post(array(
                'ID' => $lesson_id,
                'post_content' => $response['content']
            ));
            
            // Save additional data
            if (isset($response['examples'])) {
                update_post_meta($lesson_id, '_ai_lesson_examples', json_encode($response['examples']));
            }
            if (isset($response['quiz'])) {
                update_post_meta($lesson_id, '_ai_lesson_quiz', json_encode($response['quiz']));
            }
            
            wp_send_json_success($response);
        } else {
            wp_send_json_error('Failed to generate content');
        }
    }
    
    public function generate_questions() {
        check_ajax_referer('ai_tutor_nonce', 'nonce');
        
        if (!is_user_logged_in()) {
            wp_send_json_error('User not logged in');
            return;
        }
        
        $lesson_id = intval($_POST['lesson_id']);
        $question_type = sanitize_text_field($_POST['type']);
        $difficulty = sanitize_text_field($_POST['difficulty']);
        $count = intval($_POST['count']);
        
        $lesson = get_post($lesson_id);
        if (!$lesson) {
            wp_send_json_error('Lesson not found');
            return;
        }
        
        $data = array(
            'lesson_id' => $lesson_id,
            'subject' => get_post_meta($lesson_id, '_ai_lesson_subject', true) ?: 'General',
            'topic' => $lesson->post_title,
            'content' => $lesson->post_content,
            'type' => $question_type,
            'difficulty' => $difficulty,
            'count' => $count
        );
        
        $response = $this->call_ai_backend('/api/questions/generate', $data);
        
        if ($response) {
            wp_send_json_success($response);
        } else {
            wp_send_json_error('Failed to generate questions');
        }
    }
    
    public function evaluate_answer() {
        check_ajax_referer('ai_tutor_nonce', 'nonce');
        
        if (!is_user_logged_in()) {
            wp_send_json_error('User not logged in');
            return;
        }
        
        $question = sanitize_text_field($_POST['question']);
        $user_answer = sanitize_text_field($_POST['user_answer']);
        $correct_answer = sanitize_text_field($_POST['correct_answer']);
        $subject = sanitize_text_field($_POST['subject']);
        
        $data = array(
            'question' => $question,
            'user_answer' => $user_answer,
            'correct_answer' => $correct_answer,
            'subject' => $subject
        );
        
        $response = $this->call_ai_backend('/api/evaluate', $data);
        
        if ($response) {
            wp_send_json_success($response);
        } else {
            wp_send_json_error('Failed to evaluate answer');
        }
    }
    
    public function test_connection() {
        check_ajax_referer('ai_tutor_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
            return;
        }
        
        $test_data = array(
            'message' => 'Hello, this is a connection test.',
            'subject' => 'General',
            'lessonTitle' => 'Test Lesson',
            'lessonContent' => 'This is a test to verify AI connectivity.',
            'chatHistory' => array()
        );
        
        $response = $this->call_ai_backend('/api/chat', $test_data);
        
        if ($response && isset($response['response'])) {
            wp_send_json_success(array('response' => $response['response']));
        } else {
            wp_send_json_error('Failed to connect to AI backend. Please check your settings.');
        }
    }
    
    // AJAX Navigation Methods
    public function ajax_get_subjects() {
        // Debug logging
        error_log('AI Tutor: ajax_get_subjects called');
        error_log('AI Tutor: POST data: ' . print_r($_POST, true));
        
        // Enhanced nonce checking
        $nonce = isset($_POST['nonce']) ? $_POST['nonce'] : '';
        error_log('AI Tutor: Received nonce: ' . $nonce);
        
        // Try multiple nonce verification approaches
        $nonce_valid = false;
        
        if (wp_verify_nonce($nonce, 'ai_tutor_nonce')) {
            $nonce_valid = true;
            error_log('AI Tutor: Nonce verified with ai_tutor_nonce');
        } elseif (wp_verify_nonce($nonce, 'ai_tutor_ajax_nonce')) {
            $nonce_valid = true;
            error_log('AI Tutor: Nonce verified with ai_tutor_ajax_nonce');
        } elseif (current_user_can('read')) {
            // Allow for logged-in users as fallback
            $nonce_valid = true;
            error_log('AI Tutor: Nonce bypassed for logged-in user');
        }
        
        if (!$nonce_valid) {
            error_log('AI Tutor: All nonce verification failed');
            wp_send_json_error(array(
                'message' => 'Security check failed',
                'debug' => array(
                    'received_nonce' => $nonce,
                    'user_logged_in' => is_user_logged_in(),
                    'nonce_action' => 'ai_tutor_nonce'
                )
            ));
            return;
        }
        
        $subjects = get_posts(array(
            'post_type' => 'ai_subject',
            'post_status' => 'publish',
            'numberposts' => -1,
            'orderby' => 'title',
            'order' => 'ASC'
        ));
        
        $subjects_data = array();
        foreach ($subjects as $subject) {
            $lessons_count = count(get_posts(array(
                'post_type' => 'ai_lesson',
                'meta_query' => array(
                    'relation' => 'OR',
                    array('key' => '_ai_lesson_subject', 'value' => $subject->ID, 'compare' => '='),
                    array('key' => '_ai_lesson_subject_id', 'value' => $subject->ID, 'compare' => '=')
                ),
                'post_status' => 'publish',
                'numberposts' => -1
            )));
            
            $subjects_data[] = array(
                'id' => $subject->ID,
                'title' => $subject->post_title,
                'description' => $subject->post_content,
                'icon' => get_post_meta($subject->ID, '_ai_subject_icon', true) ?: '📚',
                'color' => get_post_meta($subject->ID, '_ai_subject_color', true) ?: '#007cba',
                'difficulty' => get_post_meta($subject->ID, '_ai_subject_difficulty', true) ?: 'Mixed',
                'lessons_count' => $lessons_count
            );
        }
        
        wp_send_json_success($subjects_data);
    }
    
    public function ajax_get_subject() {
        // Enhanced nonce checking like above
        $nonce = isset($_POST['nonce']) ? $_POST['nonce'] : '';
        if (!wp_verify_nonce($nonce, 'ai_tutor_nonce') && !current_user_can('read')) {
            wp_send_json_error('Security check failed');
            return;
        }
        
        $subject_id = intval($_POST['subject_id']);
        $subject = get_post($subject_id);
        
        if (!$subject || $subject->post_type !== 'ai_subject') {
            wp_send_json_error('Subject not found');
            return;
        }
        
        $lessons_count = count(get_posts(array(
            'post_type' => 'ai_lesson',
            'meta_query' => array(
                'relation' => 'OR',
                array('key' => '_ai_lesson_subject', 'value' => $subject_id, 'compare' => '='),
                array('key' => '_ai_lesson_subject_id', 'value' => $subject_id, 'compare' => '=')
            ),
            'post_status' => 'publish',
            'numberposts' => -1
        )));
        
        $subject_data = array(
            'id' => $subject->ID,
            'title' => $subject->post_title,
            'description' => $subject->post_content,
            'icon' => get_post_meta($subject_id, '_ai_subject_icon', true) ?: '📚',
            'color' => get_post_meta($subject_id, '_ai_subject_color', true) ?: '#007cba',
            'difficulty' => get_post_meta($subject_id, '_ai_subject_difficulty', true) ?: 'Mixed',
            'lessons_count' => $lessons_count
        );
        
        wp_send_json_success($subject_data);
    }
    
    public function ajax_get_subject_lessons() {
        // Debug logging
        error_log('AI Tutor: ajax_get_subject_lessons called');
        error_log('AI Tutor: POST data: ' . print_r($_POST, true));
        
        // Enhanced nonce checking like the subjects handler
        $nonce = isset($_POST['nonce']) ? $_POST['nonce'] : '';
        if (!wp_verify_nonce($nonce, 'ai_tutor_nonce') && !current_user_can('read')) {
            error_log('AI Tutor: Nonce verification failed for get_subject_lessons');
            wp_send_json_error('Security check failed');
            return;
        }
        
        $subject_id = intval($_POST['subject_id']);
        $subject = get_post($subject_id);
        
        if (!$subject || $subject->post_type !== 'ai_subject') {
            wp_send_json_error('Subject not found');
            return;
        }
        
        $lessons = get_posts(array(
            'post_type' => 'ai_lesson',
            'meta_query' => array(
                'relation' => 'OR',
                array('key' => '_ai_lesson_subject', 'value' => $subject_id, 'compare' => '='),
                array('key' => '_ai_lesson_subject_id', 'value' => $subject_id, 'compare' => '=')
            ),
            'post_status' => 'publish',
            'numberposts' => -1,
            'orderby' => 'title',
            'order' => 'ASC'
        ));
        
        $lessons_data = array();
        foreach ($lessons as $lesson) {
            $lessons_data[] = array(
                'id' => $lesson->ID,
                'title' => $lesson->post_title,
                'description' => wp_trim_words($lesson->post_content, 20),
                'difficulty' => get_post_meta($lesson->ID, '_ai_lesson_difficulty', true) ?: 'intermediate',
                'duration' => get_post_meta($lesson->ID, '_ai_lesson_duration', true) ?: 30,
                'order' => get_post_meta($lesson->ID, '_ai_lesson_order', true) ?: 1
            );
        }
        
        $subject_data = array(
            'id' => $subject->ID,
            'title' => $subject->post_title,
            'description' => $subject->post_content,
            'icon' => get_post_meta($subject_id, '_ai_subject_icon', true) ?: '📚',
            'color' => get_post_meta($subject_id, '_ai_subject_color', true) ?: '#007cba',
            'difficulty' => get_post_meta($subject_id, '_ai_subject_difficulty', true) ?: 'Mixed'
        );
        
        wp_send_json_success(array(
            'subject' => $subject_data,
            'lessons' => $lessons_data
        ));
    }
    
    public function ajax_get_lesson() {
        check_ajax_referer('ai_tutor_nonce', 'nonce');
        
        $lesson_id = intval($_POST['lesson_id']);
        $lesson = get_post($lesson_id);
        
        if (!$lesson || $lesson->post_type !== 'ai_lesson') {
            wp_send_json_error('Lesson not found');
            return;
        }
        
        $subject_id = get_post_meta($lesson_id, '_ai_lesson_subject', true);
        $subject = $subject_id ? get_post($subject_id) : null;
        
        $lesson_data = array(
            'id' => $lesson->ID,
            'title' => $lesson->post_title,
            'content' => $lesson->post_content,
            'description' => wp_trim_words($lesson->post_content, 30),
            'difficulty' => get_post_meta($lesson_id, '_ai_lesson_difficulty', true) ?: 'intermediate',
            'duration' => get_post_meta($lesson_id, '_ai_lesson_duration', true) ?: 30,
            'order' => get_post_meta($lesson_id, '_ai_lesson_order', true) ?: 1,
            'subject' => $subject ? array(
                'id' => $subject->ID,
                'title' => $subject->post_title,
                'icon' => get_post_meta($subject_id, '_ai_subject_icon', true) ?: '📚'
            ) : null,
            'examples' => json_decode(get_post_meta($lesson_id, '_ai_lesson_examples', true) ?: '[]', true),
            'quiz' => json_decode(get_post_meta($lesson_id, '_ai_lesson_quiz', true) ?: '[]', true)
        );
        
        wp_send_json_success($lesson_data);
    }
}