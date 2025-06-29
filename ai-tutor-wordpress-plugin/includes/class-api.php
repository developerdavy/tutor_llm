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
        // Check nonce with proper name
        if (!wp_verify_nonce($_POST['nonce'], 'ai_tutor_chat')) {
            wp_send_json_error('Invalid nonce');
            return;
        }
        
        if (!is_user_logged_in()) {
            wp_send_json_error('User not logged in');
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
        return $this->direct_ai->generate_tutor_response($message, $lesson, $subject, $chat_history);
    }
    
    /**
     * Call backend API for chat
     */
    private function call_backend_chat($message, $lesson, $subject, $chat_history) {
        $backend_url = rtrim($this->ai_backend_url, '/');
        $endpoint = $backend_url . '/api/tutor/chat';
        
        $payload = array(
            'message' => $message,
            'lesson' => array(
                'id' => $lesson->ID,
                'title' => $lesson->post_title,
                'content' => $lesson->post_content,
                'subject' => $subject ? $subject->post_title : 'General'
            ),
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
                $content = $this->direct_ai->generate_lesson_content($lesson, $subject);
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
        if (!wp_verify_nonce($_POST['nonce'], 'ai_tutor_generate_questions')) {
            wp_send_json_error('Invalid nonce');
            return;
        }
        
        if (!is_user_logged_in()) {
            wp_send_json_error('User not logged in');
            return;
        }
        
        $lesson_id = intval($_POST['lesson_id']);
        $question_type = sanitize_text_field($_POST['type'] ?? 'multiple_choice');
        $difficulty = sanitize_text_field($_POST['difficulty'] ?? 'intermediate');
        $count = min(intval($_POST['count'] ?? 5), 10); // Max 10 questions
        
        $lesson = get_post($lesson_id);
        if (!$lesson) {
            wp_send_json_error('Lesson not found');
            return;
        }
        
        $subject_id = get_post_meta($lesson_id, '_ai_lesson_subject', true);
        $subject = get_post($subject_id);
        
        try {
            if (!empty($this->ai_backend_url)) {
                $questions = $this->call_backend_generate_questions($lesson, $subject, $question_type, $difficulty, $count);
            } else {
                $questions = $this->direct_ai->generate_questions($lesson, $subject, $question_type, $difficulty, $count);
            }
            
            wp_send_json_success($questions);
        } catch (Exception $e) {
            error_log('Questions generation error: ' . $e->getMessage());
            wp_send_json_error('Failed to generate questions. Please try again.');
        }
    }
    
    /**
     * Evaluate student answer using AI
     */
    public function evaluate_answer() {
        if (!wp_verify_nonce($_POST['nonce'], 'ai_tutor_evaluate_answer')) {
            wp_send_json_error('Invalid nonce');
            return;
        }
        
        if (!is_user_logged_in()) {
            wp_send_json_error('User not logged in');
            return;
        }
        
        $lesson_id = intval($_POST['lesson_id']);
        $question = sanitize_text_field($_POST['question']);
        $answer = sanitize_text_field($_POST['answer']);
        $correct_answer = sanitize_text_field($_POST['correct_answer'] ?? '');
        
        $lesson = get_post($lesson_id);
        if (!$lesson) {
            wp_send_json_error('Lesson not found');
            return;
        }
        
        try {
            if (!empty($this->ai_backend_url)) {
                $evaluation = $this->call_backend_evaluate_answer($lesson, $question, $answer, $correct_answer);
            } else {
                $evaluation = $this->direct_ai->evaluate_answer($lesson, $question, $answer, $correct_answer);
            }
            
            wp_send_json_success($evaluation);
        } catch (Exception $e) {
            error_log('Answer evaluation error: ' . $e->getMessage());
            wp_send_json_error('Failed to evaluate answer. Please try again.');
        }
    }
    
    /**
     * Call backend API for content generation
     */
    private function call_backend_generate_content($lesson, $subject) {
        $backend_url = rtrim($this->ai_backend_url, '/');
        $endpoint = $backend_url . '/api/lessons/generate';
        
        $payload = array(
            'subject' => $subject ? $subject->post_title : 'General',
            'topic' => $lesson->post_title
        );
        
        $response = wp_remote_post($endpoint, array(
            'body' => json_encode($payload),
            'headers' => array('Content-Type' => 'application/json'),
            'timeout' => 60
        ));
        
        if (is_wp_error($response)) {
            throw new Exception('Backend API error: ' . $response->get_error_message());
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if (!$data || !isset($data['content'])) {
            throw new Exception('Invalid backend response for content generation');
        }
        
        return $data['content'];
    }
    
    /**
     * Call backend API for questions generation
     */
    private function call_backend_generate_questions($lesson, $subject, $type, $difficulty, $count) {
        $backend_url = rtrim($this->ai_backend_url, '/');
        $endpoint = $backend_url . '/api/questions/generate';
        
        $payload = array(
            'subject' => $subject ? $subject->post_title : 'General',
            'topic' => $lesson->post_title,
            'type' => $type,
            'difficulty' => $difficulty,
            'count' => $count
        );
        
        $response = wp_remote_post($endpoint, array(
            'body' => json_encode($payload),
            'headers' => array('Content-Type' => 'application/json'),
            'timeout' => 45
        ));
        
        if (is_wp_error($response)) {
            throw new Exception('Backend API error: ' . $response->get_error_message());
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if (!$data || !isset($data['questions'])) {
            throw new Exception('Invalid backend response for questions generation');
        }
        
        return $data['questions'];
    }
    
    /**
     * Call backend API for answer evaluation
     */
    private function call_backend_evaluate_answer($lesson, $question, $answer, $correct_answer) {
        $backend_url = rtrim($this->ai_backend_url, '/');
        $endpoint = $backend_url . '/api/answers/evaluate';
        
        $payload = array(
            'question' => $question,
            'answer' => $answer,
            'correctAnswer' => $correct_answer,
            'context' => $lesson->post_title
        );
        
        $response = wp_remote_post($endpoint, array(
            'body' => json_encode($payload),
            'headers' => array('Content-Type' => 'application/json'),
            'timeout' => 30
        ));
        
        if (is_wp_error($response)) {
            throw new Exception('Backend API error: ' . $response->get_error_message());
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if (!$data || !isset($data['evaluation'])) {
            throw new Exception('Invalid backend response for answer evaluation');
        }
        
        return $data['evaluation'];
    }
    
    /**
     * AJAX handlers for navigation functionality
     */
    public function ajax_get_subjects() {
        try {
            $subjects = get_posts(array(
                'post_type' => 'ai_subject',
                'numberposts' => -1,
                'post_status' => 'publish',
                'orderby' => 'title',
                'order' => 'ASC'
            ));
            
            $result = array();
            foreach ($subjects as $subject) {
                // Get lessons count
                $lessons = get_posts(array(
                    'post_type' => 'ai_lesson',
                    'meta_query' => array(
                        'relation' => 'OR',
                        array(
                            'key' => '_ai_lesson_subject',
                            'value' => $subject->ID,
                            'compare' => '='
                        ),
                        array(
                            'key' => '_ai_lesson_subject_id',
                            'value' => $subject->ID,
                            'compare' => '='
                        )
                    ),
                    'post_status' => 'publish',
                    'numberposts' => -1
                ));
                
                $result[] = array(
                    'id' => $subject->ID,
                    'name' => $subject->post_title,
                    'description' => $subject->post_content,
                    'icon' => get_post_meta($subject->ID, '_ai_subject_icon', true) ?: '📚',
                    'color' => get_post_meta($subject->ID, '_ai_subject_color', true) ?: '#007cba',
                    'lessons_count' => count($lessons)
                );
            }
            
            wp_send_json_success($result);
        } catch (Exception $e) {
            wp_send_json_error('Failed to load subjects: ' . $e->getMessage());
        }
    }
    
    public function ajax_get_subject() {
        $subject_id = intval($_POST['subject_id']);
        $subject = get_post($subject_id);
        
        if (!$subject || $subject->post_type !== 'ai_subject') {
            wp_send_json_error('Subject not found');
            return;
        }
        
        // Get lessons for this subject
        $lessons = get_posts(array(
            'post_type' => 'ai_lesson',
            'meta_query' => array(
                'relation' => 'OR',
                array(
                    'key' => '_ai_lesson_subject',
                    'value' => $subject_id,
                    'compare' => '='
                ),
                array(
                    'key' => '_ai_lesson_subject_id',
                    'value' => $subject_id,
                    'compare' => '='
                )
            ),
            'post_status' => 'publish',
            'numberposts' => -1,
            'orderby' => 'menu_order',
            'order' => 'ASC'
        ));
        
        $lessons_data = array();
        foreach ($lessons as $lesson) {
            $lessons_data[] = array(
                'id' => $lesson->ID,
                'title' => $lesson->post_title,
                'description' => wp_trim_words($lesson->post_content, 20),
                'difficulty' => get_post_meta($lesson->ID, '_ai_lesson_difficulty', true) ?: 'Intermediate',
                'duration' => get_post_meta($lesson->ID, '_ai_lesson_duration', true) ?: 30
            );
        }
        
        $subject_data = array(
            'id' => $subject->ID,
            'name' => $subject->post_title,
            'description' => $subject->post_content,
            'icon' => get_post_meta($subject->ID, '_ai_subject_icon', true) ?: '📚',
            'color' => get_post_meta($subject->ID, '_ai_subject_color', true) ?: '#007cba',
            'lessons' => $lessons_data
        );
        
        wp_send_json_success($subject_data);
    }
    
    public function ajax_get_subject_lessons() {
        $subject_id = intval($_POST['subject_id']);
        
        $lessons = get_posts(array(
            'post_type' => 'ai_lesson',
            'meta_query' => array(
                'relation' => 'OR',
                array(
                    'key' => '_ai_lesson_subject',
                    'value' => $subject_id,
                    'compare' => '='
                ),
                array(
                    'key' => '_ai_lesson_subject_id',
                    'value' => $subject_id,
                    'compare' => '='
                )
            ),
            'post_status' => 'publish',
            'numberposts' => -1,
            'orderby' => 'menu_order',
            'order' => 'ASC'
        ));
        
        $result = array();
        foreach ($lessons as $lesson) {
            $result[] = array(
                'id' => $lesson->ID,
                'title' => $lesson->post_title,
                'description' => wp_trim_words($lesson->post_content, 20),
                'difficulty' => get_post_meta($lesson->ID, '_ai_lesson_difficulty', true) ?: 'Intermediate',
                'duration' => get_post_meta($lesson->ID, '_ai_lesson_duration', true) ?: 30
            );
        }
        
        wp_send_json_success($result);
    }
    
    public function ajax_get_lesson() {
        $lesson_id = intval($_POST['lesson_id']);
        $lesson = get_post($lesson_id);
        
        if (!$lesson || $lesson->post_type !== 'ai_lesson') {
            wp_send_json_error('Lesson not found');
            return;
        }
        
        $lesson_data = array(
            'id' => $lesson->ID,
            'title' => $lesson->post_title,
            'content' => $lesson->post_content,
            'difficulty' => get_post_meta($lesson->ID, '_ai_lesson_difficulty', true) ?: 'Intermediate',
            'duration' => get_post_meta($lesson->ID, '_ai_lesson_duration', true) ?: 30,
            'subject_id' => get_post_meta($lesson->ID, '_ai_lesson_subject', true)
        );
        
        wp_send_json_success($lesson_data);
    }
    
    public function test_connection() {
        wp_send_json_success(array(
            'message' => 'WordPress AI Tutor is working properly!',
            'timestamp' => current_time('mysql'),
            'backend_url' => $this->ai_backend_url ?: 'Direct AI mode',
            'user_logged_in' => is_user_logged_in()
        ));
    }
}
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