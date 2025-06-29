<?php
/**
 * Quick Setup Script for AI Tutor Plugin
 * Add this to WordPress theme's functions.php or run directly
 */

// Quick function to create sample data
function ai_tutor_create_sample_data() {
    // Create sample subjects with lessons
    $subjects_with_lessons = array(
        array(
            'title' => 'Mathematics',
            'description' => 'Learn fundamental and advanced mathematical concepts with interactive AI tutoring.',
            'icon' => '🔢',
            'color' => '#e74c3c',
            'difficulty' => 'Beginner to Advanced',
            'lessons' => array(
                array('title' => 'Basic Arithmetic', 'description' => 'Master addition, subtraction, multiplication, and division with step-by-step guidance.'),
                array('title' => 'Algebra Fundamentals', 'description' => 'Learn variables, equations, and expressions through interactive examples.'),
                array('title' => 'Geometry Basics', 'description' => 'Explore shapes, angles, and measurements with visual demonstrations.')
            )
        ),
        array(
            'title' => 'Science',
            'description' => 'Explore the wonders of physics, chemistry, and biology with AI-powered explanations.',
            'icon' => '🔬',
            'color' => '#3498db',
            'difficulty' => 'Intermediate',
            'lessons' => array(
                array('title' => 'Physics Introduction', 'description' => 'Understand forces, motion, and energy through interactive simulations.'),
                array('title' => 'Chemistry Basics', 'description' => 'Discover atoms, molecules, and chemical reactions with virtual labs.'),
                array('title' => 'Biology Overview', 'description' => 'Study cells, organisms, and ecosystems with detailed explanations.')
            )
        )
    );
    
    foreach ($subjects_with_lessons as $subject_data) {
        // Create subject
        $subject_id = wp_insert_post(array(
            'post_title' => $subject_data['title'],
            'post_content' => $subject_data['description'],
            'post_type' => 'ai_subject',
            'post_status' => 'publish'
        ));
        
        if ($subject_id && !is_wp_error($subject_id)) {
            // Add subject metadata
            update_post_meta($subject_id, '_ai_subject_icon', $subject_data['icon']);
            update_post_meta($subject_id, '_ai_subject_color', $subject_data['color']);
            update_post_meta($subject_id, '_ai_subject_difficulty', $subject_data['difficulty']);
            
            // Create lessons for this subject
            foreach ($subject_data['lessons'] as $lesson_data) {
                $lesson_id = wp_insert_post(array(
                    'post_title' => $lesson_data['title'],
                    'post_content' => $lesson_data['description'],
                    'post_type' => 'ai_lesson',
                    'post_status' => 'publish'
                ));
                
                if ($lesson_id && !is_wp_error($lesson_id)) {
                    // Link lesson to subject
                    update_post_meta($lesson_id, '_ai_lesson_subject_id', $subject_id);
                    update_post_meta($lesson_id, '_ai_lesson_subject', $subject_id); // Both meta keys for compatibility
                    update_post_meta($lesson_id, '_ai_lesson_description', $lesson_data['description']);
                    update_post_meta($lesson_id, '_ai_lesson_difficulty', 'Beginner');
                    update_post_meta($lesson_id, '_ai_lesson_duration', '15 min');
                }
            }
        }
    }
    
    return "Sample data created successfully!";
}

// AJAX handler to create sample data
add_action('wp_ajax_create_ai_tutor_sample_data', 'handle_create_sample_data');
function handle_create_sample_data() {
    if (!current_user_can('manage_options')) {
        wp_send_json_error('Insufficient permissions');
        return;
    }
    
    $result = ai_tutor_create_sample_data();
    wp_send_json_success($result);
}

// Add admin notice with setup button
add_action('admin_notices', 'ai_tutor_setup_notice');
function ai_tutor_setup_notice() {
    $screen = get_current_screen();
    if ($screen && ($screen->post_type === 'ai_subject' || $screen->post_type === 'ai_lesson' || $screen->id === 'toplevel_page_ai-tutor-settings')) {
        echo '<div class="notice notice-info is-dismissible">';
        echo '<p><strong>AI Tutor:</strong> Need sample data for testing? ';
        echo '<button type="button" class="button button-primary" onclick="createSampleData()">Create Sample Data</button></p>';
        echo '</div>';
        
        echo '<script>
        function createSampleData() {
            if (confirm("This will create sample Mathematics and Science subjects with lessons. Continue?")) {
                jQuery.post(ajaxurl, {
                    action: "create_ai_tutor_sample_data",
                    nonce: "' . wp_create_nonce('create_sample_data') . '"
                }, function(response) {
                    if (response.success) {
                        alert("Sample data created! Refresh the page to see the new subjects and lessons.");
                        location.reload();
                    } else {
                        alert("Error: " + (response.data || "Unknown error"));
                    }
                });
            }
        }
        </script>';
    }
}
?>