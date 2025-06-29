<?php
/**
 * Quick Nonce Fix for AI Tutor Plugin
 * Add this to your WordPress theme's functions.php file temporarily
 */

// Temporary fix for nonce validation issues
add_action('wp_ajax_ai_tutor_get_subjects', 'ai_tutor_quick_fix_subjects', 1);
add_action('wp_ajax_nopriv_ai_tutor_get_subjects', 'ai_tutor_quick_fix_subjects', 1);

function ai_tutor_quick_fix_subjects() {
    // Simple logged-in user check instead of nonce
    if (!is_user_logged_in()) {
        wp_send_json_error('Please log in to access this feature');
        return;
    }
    
    // Get subjects data
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
    exit; // Prevent other handlers from running
}

// Quick fix for lessons
add_action('wp_ajax_ai_tutor_get_subject_lessons', 'ai_tutor_quick_fix_lessons', 1);
add_action('wp_ajax_nopriv_ai_tutor_get_subject_lessons', 'ai_tutor_quick_fix_lessons', 1);

function ai_tutor_quick_fix_lessons() {
    if (!is_user_logged_in()) {
        wp_send_json_error('Please log in to access this feature');
        return;
    }
    
    $subject_id = intval($_POST['subject_id']);
    
    $lessons = get_posts(array(
        'post_type' => 'ai_lesson',
        'meta_query' => array(
            'relation' => 'OR',
            array('key' => '_ai_lesson_subject', 'value' => $subject_id, 'compare' => '='),
            array('key' => '_ai_lesson_subject_id', 'value' => $subject_id, 'compare' => '=')
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
            'description' => get_post_meta($lesson->ID, '_ai_lesson_description', true) ?: substr($lesson->post_content, 0, 150),
            'difficulty' => get_post_meta($lesson->ID, '_ai_lesson_difficulty', true) ?: 'Beginner',
            'duration' => get_post_meta($lesson->ID, '_ai_lesson_duration', true) ?: '15 min',
            'icon' => get_post_meta($lesson->ID, '_ai_lesson_icon', true) ?: '📖'
        );
    }
    
    wp_send_json_success($lessons_data);
    exit;
}
?>