<?php

class AI_Tutor_Shortcodes {
    
    public function init() {
        add_shortcode('ai_tutor_dashboard', array($this, 'dashboard_shortcode'));
        add_shortcode('ai_tutor_subjects', array($this, 'subjects_shortcode'));
        add_shortcode('ai_tutor_lesson', array($this, 'lesson_shortcode'));
    }
    
    public function dashboard_shortcode($atts) {
        if (!is_user_logged_in()) {
            return '<p>Please <a href="' . wp_login_url() . '">log in</a> to access the AI Tutor.</p>';
        }
        
        $atts = shortcode_atts(array(
            'subject_id' => '',
        ), $atts);
        
        ob_start();
        include AI_TUTOR_PLUGIN_PATH . 'templates/dashboard.php';
        return ob_get_clean();
    }
    
    public function subjects_shortcode($atts) {
        $atts = shortcode_atts(array(
            'show_progress' => 'true',
        ), $atts);
        
        ob_start();
        include AI_TUTOR_PLUGIN_PATH . 'templates/subjects.php';
        return ob_get_clean();
    }
    
    public function lesson_shortcode($atts) {
        if (!is_user_logged_in()) {
            return '<p>Please <a href="' . wp_login_url() . '">log in</a> to access lessons.</p>';
        }
        
        $atts = shortcode_atts(array(
            'lesson_id' => '',
        ), $atts);
        
        if (empty($atts['lesson_id'])) {
            return '<p>Lesson ID is required.</p>';
        }
        
        ob_start();
        include AI_TUTOR_PLUGIN_PATH . 'templates/lesson.php';
        return ob_get_clean();
    }
}